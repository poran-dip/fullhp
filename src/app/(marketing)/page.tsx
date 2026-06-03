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
      <DoctorSearchSection doctors={doctors} />
      <MedbotPromoSection />
      <FeaturesSection />
      <FeaturedDoctorsSection doctors={doctors} error={error} />
    </main>
  );
}
