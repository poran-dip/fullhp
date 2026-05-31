"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoginDialog from "@/components/login-dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Navbar() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedStatus = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(storedStatus === "true");
  }, []);

  const handleOpenApp = () => {
    router.push("/dashboard");
  };

  return (
    <header className="w-full border-b bg-white">
      <div className="container max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile: Menu on left, Logo on right */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-gray-100 transition-colors duration-200"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col h-full">
              <div className="flex items-center py-2 mb-2">
                <Link href="/" className="flex items-center group">
                  <Image
                    src="/logo.jpg"
                    alt="Eazydoc Logo"
                    width={24}
                    height={24}
                    className="h-6 w-auto mr-2 object-contain group-hover:scale-110 transition-transform duration-200"
                  />
                  <span className="font-bold text-base group-hover:scale-105 transition-transform duration-200">
                    Eazydoc
                  </span>
                </Link>
              </div>
              <nav className="grid gap-0 text-lg font-medium">
                <Link
                  href="/features"
                  className="py-3 px-2 hover:bg-gray-50 transition-all duration-200 border-t border-gray-100 flex items-center"
                >
                  Features
                </Link>
                <Link
                  href="/about"
                  className="py-3 px-2 hover:bg-gray-50 transition-all duration-200 border-t border-gray-100 flex items-center"
                >
                  About Us
                </Link>
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Link
                        href="/docs/login"
                        className="py-3 px-2 hover:bg-gray-50 transition-all duration-200 border-t border-gray-100 flex items-center"
                      >
                        For Doctors
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Sign in as a doctor</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Link
                        href="/ambulances"
                        className="py-3 px-2 hover:bg-gray-50 transition-all duration-200 border-t border-gray-100 flex items-center"
                      >
                        For Ambulances
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Sign in as a driver</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Link
                        href="/admin/login"
                        className="py-3 px-2 hover:bg-gray-50 transition-all duration-200 border-t border-gray-100 flex items-center"
                      >
                        For Admins
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Sign in as admin</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </nav>
              <div className="mt-auto pb-6 pt-4">
                {isLoggedIn ? (
                  <Button
                    onClick={handleOpenApp}
                    className="w-full hover:bg-gray-800 transition-colors duration-200"
                  >
                    Open App
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowLoginDialog(true)}
                    className="w-full hover:bg-gray-100 transition-colors duration-200"
                  >
                    Login
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop: Logo on left, nav in center */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center text-lg font-semibold group"
          >
            <Image
              src="/logo.jpg"
              alt="Eazydoc Logo"
              width={32}
              height={32}
              className="h-8 w-auto mr-2 object-contain group-hover:scale-110 transition-transform duration-200"
            />
            <span className="font-bold group-hover:scale-105 transition-transform duration-200">
              Eazydoc
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 ml-4">
          <Link
            href="/features"
            className="text-sm font-medium hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-200"
          >
            Features
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-200"
          >
            About Us
          </Link>
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Link
                  href="/docs/login"
                  className="text-sm font-medium hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-200"
                >
                  For Doctors
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign in as a doctor</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Link
                  href="/ambulances"
                  className="text-sm font-medium hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-200"
                >
                  For Ambulances
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign in as a driver</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/login"
                  className="text-sm font-medium hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-200"
                >
                  For Admins
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign in as admin</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>

        {/* Desktop: Login/Open App button on right */}
        <div className="hidden md:flex items-center gap-2">
          {isLoggedIn ? (
            <Button
              onClick={handleOpenApp}
              className="hover:bg-gray-800 transition-colors duration-200"
            >
              Open App
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowLoginDialog(true)}
              className="hover:bg-gray-100 transition-colors duration-200"
            >
              Login
            </Button>
          )}
        </div>

        {/* Mobile: Logo on far right */}
        <div className="md:hidden flex justify-end">
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo.jpg"
              alt="Eazydoc Logo"
              width={28}
              height={28}
              className="h-7 w-auto object-contain group-hover:scale-110 transition-transform duration-200"
            />
          </Link>
        </div>
      </div>
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </header>
  );
}
