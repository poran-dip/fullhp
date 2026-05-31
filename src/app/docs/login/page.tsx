// src/app/docs/login/page.tsx
"use client";

import {
  AlertCircle,
  ArrowLeft,
  Lock,
  LogIn,
  LogOut,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DoctorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);
  const [existingRole, setExistingRole] = useState<string | null>(null);

  const router = useRouter();
  const [queryParams, setQueryParams] = useState<{
    [key: string]: string | null;
  }>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQueryParams({
      redirect: params.get("redirect"),
      from: params.get("from"),
      refer: params.get("refer"),
      unauthorized: params.get("unauthorized"),
      wrongRole: params.get("wrongRole"),
    });
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    localStorage.removeItem("doctorId");
    localStorage.removeItem("patientId");
    localStorage.removeItem("ambulanceId");
    localStorage.removeItem("adminId");

    setExistingRole(null);
    router.push("/docs/login");
  };

  useEffect(() => {
    const redirect = queryParams.redirect;
    const from = queryParams.from;
    const refer = queryParams.refer;
    const unauthorized = queryParams.unauthorized;
    const wrongRole = queryParams.wrongRole;

    if (redirect === "dashboard" || from === "dashboard") {
      setRedirectMessage("Please log in to access the doctor dashboard");
    } else if (unauthorized === "true") {
      setRedirectMessage("Your session has expired. Please log in again");
    } else if (wrongRole === "patient") {
      setRedirectMessage(
        "You are logged in as a patient. Please use doctor credentials",
      );
    } else if (redirect || from || refer) {
      setRedirectMessage("Please log in to continue");
    }

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const doctorId = localStorage.getItem("doctorId");
    const role = localStorage.getItem("role");

    if (isLoggedIn) {
      if (role && role !== "doctor") {
        setExistingRole(role);
      } else if (doctorId && role === "doctor") {
        router.push("/docs");
      }
    }
  }, [router, queryParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/doctors/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("doctorId", data.doctorId);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", "doctor");

        const redirectTo = queryParams.redirect || "/docs";
        router.push(redirectTo.startsWith("/") ? redirectTo : "/docs");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  if (existingRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Eazydoc Home
          </Link>

          <Card className="w-full shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Session Conflict
              </CardTitle>
              <CardDescription className="text-center">
                You need to sign out before accessing the doctor portal
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert className="bg-amber-50 border-amber-200">
                <User className="h-4 w-4 text-amber-600 mr-2" />
                <AlertDescription>
                  You&aps;re currently logged in as a{" "}
                  <span className="font-semibold capitalize">
                    {existingRole}
                  </span>
                  . To access the doctor portal, you need to sign out first.
                </AlertDescription>
              </Alert>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Would you like to sign out of your current session?
                </p>
                <Button
                  onClick={handleSignOut}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button variant="outline" asChild>
                <Link href="/">Return to Homepage</Link>
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Eazydoc. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Eazydoc Home
        </Link>

        {redirectMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{redirectMessage}</AlertDescription>
          </Alert>
        )}

        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Doctor Login
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your doctor portal
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-address">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email-address"
                    name="email"
                    type="email"
                    required
                    className="pl-10"
                    placeholder="doctor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="pl-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/docs/reset-password"
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign in
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  Don&apos;t have an account?
                </span>
              </div>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/docs/register">Register as a Doctor</Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Eazydoc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
