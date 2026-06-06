"use client";

import {
  Building2,
  CalendarPlus,
  Loader2,
  Send,
  Stethoscope,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApi } from "@/lib/api";

interface MedbotResult {
  department: string;
  doctorSlug: string;
  doctorName: string;
  reason: string;
  avgRating: number | null;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(Math.max(rating - (star - 1), 0), 1);
        const fillPercent = Math.round(fill * 100);
        return (
          <span
            key={star}
            className="relative inline-block text-gray-200 text-base leading-none"
          >
            ★
            <span
              className="absolute inset-0 overflow-hidden text-amber-400"
              style={{ width: `${fillPercent}%` }}
            >
              ★
            </span>
          </span>
        );
      })}
      <span className="text-xs text-muted-foreground ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function MedbotPage() {
  const { apiFetch } = useApi();

  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState<MedbotResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!symptoms.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await apiFetch("/api/medbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError("Too many requests. Please try again later.");
        } else if (res.status === 503) {
          setError(
            "Medbot is currently unavailable. Please try again later or browse our doctors instead.",
          );
        } else {
          setError("We had issues processing that, try again later.");
        }
        return;
      }

      setResult(data);
    } catch {
      setError("We had issues processing that, try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {!result && !loading && !error && (
            <div className="text-center space-y-3 mb-8">
              <div className="h-16 w-16 rounded-2xl bg-black flex items-center justify-center mx-auto">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                What brings you in today?
              </h1>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Describe your symptoms and MedBot will recommend the right
                department and doctor for you.
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="mb-6 rounded-xl border bg-white px-5 py-8 flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-black" />
              <p className="text-sm">Analyzing your symptoms…</p>
            </div>
          )}

          {/* Result card */}
          {result && (
            <div className="mb-6 rounded-xl border bg-white shadow-sm overflow-hidden">
              <div className="bg-black px-5 py-4">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
                  Recommendation
                </p>
              </div>
              <div className="px-5 py-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="font-medium text-sm">{result.department}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Recommended Doctor
                    </p>
                    <p className="font-medium text-sm">{result.doctorName}</p>
                    {result.avgRating !== null ? (
                      <StarRating rating={result.avgRating} />
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No ratings yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Reason */}
                <p className="text-xs text-muted-foreground italic border-t pt-3">
                  {result.reason}
                </p>
                <Link
                  href={`/patient/book?doctor=${result.doctorSlug}&department=${encodeURIComponent(result.department)}`}
                >
                  <Button className="w-full bg-black text-white hover:bg-gray-800 mt-1">
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Book with {result.doctorName}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t px-4 py-4">
        <div className="container max-w-2xl mx-auto space-y-2">
          <div className="flex gap-2 items-center">
            <Textarea
              ref={textareaRef}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. I've had a persistent headache and blurred vision for two days…"
              className="flex-1 resize-none min-h-11 max-h-32"
              rows={1}
            />
            <Button
              onClick={handleSubmit}
              disabled={!symptoms.trim() || loading}
              className="bg-black text-white hover:bg-gray-800 shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            MedBot provides general guidance only. Always consult a healthcare
            professional for medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
