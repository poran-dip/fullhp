"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const navLinks = (
    <>
      <Link
        href="/#features"
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        Features
      </Link>
      <Link
        href="/about"
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        About
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 w-full border-b bg-white z-50">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.jpg"
            alt="FullHP Logo"
            width={32}
            height={32}
            className="h-8 w-auto object-contain"
          />
          <span className="font-bold text-lg">FullHP</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks}
          {session?.user ? (
            <Button onClick={() => router.push("/dashboard")}>Open App</Button>
          ) : (
            <Button onClick={() => router.push("/login")}>Login</Button>
          )}
        </nav>

        {/* Mobile */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col h-full px-2">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Navigate across the platform</SheetDescription>
              <Link href="/" className="flex items-center gap-2 pt-4">
                <Image
                  src="/logo.jpg"
                  alt="FullHP Logo"
                  width={24}
                  height={24}
                  className="h-6 w-auto object-contain"
                />
                <span className="font-bold">FullHP</span>
              </Link>
              <nav className="flex flex-col gap-1 mt-4">
                <Link
                  href="/#features"
                  className="py-3 px-2 text-sm font-medium hover:bg-gray-50 rounded transition-colors border-t border-gray-100"
                >
                  Features
                </Link>
                <Link
                  href="/about"
                  className="py-3 px-2 text-sm font-medium hover:bg-gray-50 rounded transition-colors border-t border-gray-100"
                >
                  About
                </Link>
              </nav>
              <div className="mt-auto pb-6 pt-4">
                {session?.user ? (
                  <Button
                    className="w-full"
                    onClick={() => router.push("/dashboard")}
                  >
                    Open App
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => router.push("/login")}
                  >
                    Login
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
