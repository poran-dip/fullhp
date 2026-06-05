import { Building2, Check, Star, Stethoscope, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MedbotPromoSection() {
  return (
    <section id="medbot" className="py-16 md:py-20 bg-white">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row bg-white rounded-lg overflow-hidden border shadow-sm">
          <div className="bg-black text-white p-6 md:p-10 md:w-1/2">
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope className="h-6 w-6" />
              <h2 className="text-xl font-bold">MedBot Assistant</h2>
            </div>
            <p className="text-base mb-6 max-w-xl">
              Not sure which specialist you need? Describe your symptoms and
              MedBot will instantly recommend the right doctor and department
              for you.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 mt-0.5 shrink-0" />
                <p>Describe your symptoms in everyday language</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 mt-0.5 shrink-0" />
                <p>Get an instant doctor and department recommendation</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 mt-0.5 shrink-0" />
                <p>Book directly with your recommended doctor in one click</p>
              </div>
            </div>
            <div className="mt-8">
              <Button asChild className="bg-white text-black hover:bg-gray-100">
                <Link href="/medbot">
                  Try MedBot
                  <Stethoscope className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Mock result card */}
          <div className="bg-gray-50 p-6 md:p-10 md:w-1/2 flex items-center justify-center">
            <div className="max-w-xs w-full space-y-3">
              {/* Symptom input mock */}
              <div className="rounded-lg bg-white border px-4 py-3 shadow-sm">
                <p className="text-sm text-gray-400">
                  I've had persistent headaches and blurred vision for two days…
                </p>
              </div>

              {/* Result card mock */}
              <div className="rounded-lg bg-white border shadow-sm overflow-hidden">
                <div className="bg-black px-4 py-2.5">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
                    Recommendation
                  </p>
                </div>
                <div className="px-4 py-4 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                      <Building2 className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Department</p>
                      <p className="text-sm font-medium">Neurology</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                      <User className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">
                        Recommended Doctor
                      </p>
                      <p className="text-sm font-medium">Dr. Sharma</p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3 w-3 ${s <= 4 ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}`}
                          />
                        ))}
                        <span className="text-xs text-gray-400 ml-1">4.0</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 italic border-t pt-2">
                    Dr. Sharma is an excellent choice for neurological symptoms
                    like yours.
                  </p>
                  <div className="rounded-md bg-black text-white text-xs text-center py-2 font-medium">
                    Book with Dr. Sharma
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
