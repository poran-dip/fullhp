"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DoctorLoginButton() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/doctors/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "sosangkar@gmail.com",
          password: "sosangkar",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.doctorId) {
          localStorage.setItem("doctorId", data.doctorId);
        }
        router.push("/docs");
      } else {
        console.error("Login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full bg-white hover:bg-blue-50"
      onClick={handleLogin}
    >
      One-Click Login
    </Button>
  );
}
