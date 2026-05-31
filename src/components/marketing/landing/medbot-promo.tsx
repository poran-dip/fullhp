import { Bot, Check, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MedbotPromoSection() {
  return (
    <section id="medbot" className="py-16 md:py-20 bg-white">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row bg-white rounded-lg overflow-hidden border shadow-sm">
          <div className="bg-black text-white p-6 md:p-10 md:w-1/2">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="h-6 w-6" />
              <h2 className="text-xl font-bold">MedBot Assistant</h2>
            </div>
            <p className="text-base mb-6 max-w-xl">
              Not sure which specialist you need? Chat with MedBot to get
              personalized doctor recommendations based on your symptoms and
              health concerns.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 mt-0.5 shrink-0" />
                <p>Describe your symptoms in everyday language</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 mt-0.5 shrink-0" />
                <p>Get specialist recommendations tailored to your needs</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 mt-0.5 shrink-0" />
                <p>Book appointments directly from the chat</p>
              </div>
            </div>
            <div className="mt-8">
              <Button asChild className="bg-white text-black hover:bg-gray-100">
                <Link href="/medbot">
                  Chat with MedBot
                  <MessageSquare className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="bg-blue-50 p-6 md:p-10 md:w-1/2 flex items-center justify-center">
            <div className="max-w-xs w-full">
              <div className="rounded-lg bg-white p-4 mb-4 shadow-sm">
                <p className="text-sm text-gray-700">
                  I&apos;ve been having headaches and dizziness for the past
                  week.
                </p>
              </div>
              <div className="rounded-lg bg-black text-white p-4 mb-4 shadow-sm">
                <p className="text-sm">
                  Based on your symptoms, I recommend consulting with a
                  neurologist. Would you like me to find specialists near you?
                </p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-700">
                  Yes, please show me available neurologists.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
