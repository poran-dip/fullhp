import BookAppointment from "@/components/protected/patient/book";
import { getBookingData } from "@/services/book-appointment";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ doctorId?: string }>;
}) {
  const params = await searchParams;
  const { doctors, preselectedDoctor, error } = await getBookingData(
    params.doctorId,
  );
  return (
    <BookAppointment
      doctors={doctors}
      preselectedDoctor={preselectedDoctor}
      error={error}
    />
  );
}
