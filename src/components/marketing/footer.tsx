import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";

const footerLinks = {
  Platform: [
    { label: "Home", href: "/" },
    { label: "Doctors", href: "/doctors" },
    { label: "About", href: "/about" },
  ],
  Legal: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ],
};

export default async function Footer() {
  const session = await auth();

  return (
    <footer className="bg-neutral-950 text-neutral-400">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        {/* Main grid */}
        <div className="py-14 grid grid-cols-1 gap-10 md:grid-cols-[1fr_auto_auto]">
          {/* Brand col */}
          <div className="flex flex-col gap-4 max-w-xs">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <span className="font-bold text-xl text-white tracking-tight group-hover:text-neutral-300 transition-colors">
                FullHP
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Healthcare at your fingertips. Find specialists, book
              appointments, and manage your health — all in one place.
            </p>
            <div className="pt-1">
              <Button
                asChild
                size="sm"
                className="bg-white text-neutral-950 hover:bg-neutral-200 font-medium"
              >
                <Link href={session?.user ? "/dashboard" : "/login"}>
                  {session?.user ? "Open App" : "Get Started"}
                </Link>
              </Button>
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading} className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                {heading}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="bg-neutral-800" />

        {/* Bottom bar */}
        <div className="py-6 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-neutral-600">
            © {new Date().getFullYear()} Cosmic Titans. All rights reserved.
          </p>
          <p className="text-sm text-neutral-600">
            FullHP — Built by Cosmic Titans.
          </p>
        </div>
      </div>
    </footer>
  );
}
