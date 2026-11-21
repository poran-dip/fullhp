import { Info } from "lucide-react";
import DoctorSearchSection from "@/components/marketing/landing/doctor-search";
import FeaturedDoctorsSection from "@/components/marketing/landing/featured-doctors";
import FeaturesSection from "@/components/marketing/landing/features";
import MedbotPromoSection from "@/components/marketing/landing/medbot-promo";
import { getDoctors } from "@/services/doctor";

export const revalidate = 86400;

export default async function Home() {
  const { doctors, error } = await getDoctors();

  return (
    <main className="flex-1">
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
        <div className="mx-auto flex max-w-6xl items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            <span className="font-medium">Demo only:</span> the doctors and
            reviews on FullHP are mock data and not real. FullHP is not
            affiliated with any real hospital.
          </p>
        </div>
      </div>
      <DoctorSearchSection doctors={doctors} />
      <MedbotPromoSection />
      <FeaturesSection />
      <FeaturedDoctorsSection doctors={doctors} error={error} />
    </main>
  );
}
