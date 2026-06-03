import Link from "next/link";
import Footer from "@/components/marketing/footer";
import Navbar from "@/components/marketing/navbar";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-blue-50 px-4 py-16 relative">
        <div className="text-center max-w-xl mx-auto z-10 relative">
          <div className="relative mb-8">
            <h1 className="text-[25vh] md:text-[60vh] font-bold text-blue-500 opacity-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none -z-10 pointer-events-none">
              404
            </h1>

            <h2 className="text-3xl font-bold mb-4 relative z-20">
              Welcome, curious adventurer! Have a seat!
            </h2>

            <p className="text-lg text-muted-foreground mb-6 relative z-20">
              You wandered too far into the void and found the legendary 404
              page. Few have made it here... Fewer have returned.
            </p>

            <div className="flex justify-center space-x-4 relative z-20">
              <Button asChild variant="outline">
                <Link href="/">Back to Home</Link>
              </Button>
              <Button asChild>
                <Link href="/features">Explore Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
