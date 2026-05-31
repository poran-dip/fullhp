"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function PatientLoginButton() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/patients/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "myra@gmail.com",
          password: "myrakapoor",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.patientId) {
          localStorage.setItem("patientId", data.patientId);
        }
        router.push("/dashboard");
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
      className="w-full bg-white hover:bg-green-50"
      onClick={handleLogin}
    >
      One-Click Login
    </Button>
  );
}
