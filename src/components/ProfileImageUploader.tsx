// components/ProfileImageUploader.tsx

import { createClient } from "@supabase/supabase-js";
import NextImage from "next/image";
import type React from "react";
import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

// Define your Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing supabase credentials");
}

interface ProfileImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
}

// Function to create an image from a file
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

// Function to get cropped image as a blob
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Set canvas size to the crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  // Get the data as a blob
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) throw new Error("Canvas is empty");
        resolve(blob);
      },
      "image/jpeg",
      0.95,
    );
  });
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  currentImageUrl,
  onImageUploaded,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    const file = e.target.files[0];
    setSelectedFile(file);

    // Create a preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsCropping(true);

    // Reset crop and zoom
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const onCropComplete = useCallback((croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Upload the cropped image
  const uploadCroppedImage = async () => {
    if (!selectedFile || !croppedAreaPixels || !previewUrl) return;

    setIsLoading(true);

    try {
      // Generate the cropped image
      const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels);

      // Create a new File from the blob
      const croppedFile = new File(
        [croppedBlob],
        `cropped-${selectedFile.name}`,
        { type: "image/jpeg" },
      );

      // Upload to Supabase Storage
      const filePath = `${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, croppedFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Call the callback with the new image URL
      onImageUploaded(publicUrlData.publicUrl);

      // Update preview and exit cropping mode
      setPreviewUrl(publicUrlData.publicUrl);
      setIsCropping(false);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelCropping = () => {
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
    } else {
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    setIsCropping(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {previewUrl && !isCropping && (
          <div className="rounded-full overflow-hidden w-16 h-16">
            <NextImage
              src={previewUrl}
              alt="Current profile"
              height={64}
              width={64}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {isCropping && previewUrl && (
        <Dialog
          open={isCropping}
          onOpenChange={(open) => {
            if (!open) cancelCropping();
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogTitle>Crop Your Image</DialogTitle>
            <div
              className="relative w-full rounded-lg overflow-hidden"
              style={{ height: "300px" }}
            >
              <Cropper
                image={previewUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
                showGrid={false}
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="zoom"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Zoom: {zoom.toFixed(1)}x
              </label>
              <input
                type="range"
                id="zoom"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={cancelCropping}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={uploadCroppedImage}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isLoading ? "Uploading..." : "Save"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProfileImageUploader;
