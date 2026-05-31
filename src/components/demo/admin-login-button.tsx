"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLoginButton() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "porandip@gmail.com",
          password: "Password@1",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.adminId) {
          localStorage.setItem("adminId", data.adminId);
        }
        router.push("/admin/patients");
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
      className="w-full bg-white hover:bg-purple-50"
      onClick={handleLogin}
    >
      One-Click Login
    </Button>
  );
}
