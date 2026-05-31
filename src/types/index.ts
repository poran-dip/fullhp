import type {
  AppointmentStatus,
  DoctorStatus,
} from "@/generated/prisma/client";

export type DoctorWithUser = {
  id: string;
  specialization: string;
  department: string;
  status: DoctorStatus;
  avgRating: number | null;
  user: {
    name: string | null;
    image: string | null;
  };
  appointments: {
    id: string;
    status: AppointmentStatus;
  }[];
};
