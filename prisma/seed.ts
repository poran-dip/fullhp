import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import {
  DoctorStatus,
  DriverStatus,
  PrismaClient,
  Role,
} from "@/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$transaction([
    prisma.user.create({
      data: {
        name: "Poran",
        email: "poran@example.com",
        emailVerified: new Date(),
        password: await bcrypt.hash("admin", 10),
        role: Role.Admin,
        admin: {
          create: {},
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Dikshyan",
        email: "dikshyan@example.com",
        emailVerified: new Date(),
        password: await bcrypt.hash("patient123", 10),
        role: Role.Patient,
        patient: {
          create: {
            dob: new Date("2003-1-1"),
            gender: "Male",
            phoneNo: "123",
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Rajdeep",
        email: "rajdeep@example.com",
        password: await bcrypt.hash("patient456", 10),
        role: Role.Patient,
        patient: {
          create: {
            dob: new Date("2004-1-1"),
            gender: "Male",
            phoneNo: "456",
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Pooja",
        email: "pooja@example.com",
        emailVerified: new Date(),
        password: await bcrypt.hash("patient789", 10),
        role: Role.Patient,
        patient: {
          create: {
            dob: new Date("2005-1-1"),
            gender: "Female",
            phoneNo: "789",
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Dr. Sosangkar",
        email: "sosangkar@example.com",
        emailVerified: new Date(),
        password: await bcrypt.hash("doctor0", 10),
        role: Role.Doctor,
        image: "https://randomuser.me/api/portraits/men/3.jpg",
        doctor: {
          create: {
            phoneNo: "000",
            department: "Neurology",
            specialization: "Cognitive & Behavioral Neurology",
            status: DoctorStatus.Active,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Dr. Kristina",
        email: "kristina@example.com",
        emailVerified: new Date(),
        password: await bcrypt.hash("doctor1", 10),
        role: Role.Doctor,
        image: "https://randomuser.me/api/portraits/women/3.jpg",
        doctor: {
          create: {
            phoneNo: "111",
            department: "Psychiatry",
            specialization: "Child & Adolescent Psychiatry",
            status: DoctorStatus.OnLeave,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Dr. Kundil",
        email: "kundil@example.com",
        emailVerified: new Date(),
        password: await bcrypt.hash("doctor2", 10),
        role: Role.Doctor,
        image: "https://randomuser.me/api/portraits/men/9.jpg",
        doctor: {
          create: {
            phoneNo: "222",
            department: "Pediatrics",
            specialization: "Developmental-Behavioral Pediatrics",
            status: DoctorStatus.Active,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Dr. Anu",
        email: "anu@example.com",
        emailVerified: new Date(),
        password: await bcrypt.hash("doctor9", 10),
        role: Role.Doctor,
        image: "https://randomuser.me/api/portraits/women/4.jpg",
        doctor: {
          create: {
            phoneNo: "999",
            department: "Neurology",
            specialization: "Epilepsy (Epileptology)",
            status: DoctorStatus.Inactive,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Dishita",
        email: "dishita@example.com",
        emailVerified: new Date(),
        password: await bcrypt.hash("driver11", 10),
        role: Role.Driver,
        image: "https://randomuser.me/api/portraits/women/6.jpg",
        driver: {
          create: {
            status: DriverStatus.Available,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Ruhan",
        email: "ruhan@example.com",
        emailVerified: new Date(),
        password: await bcrypt.hash("driver99", 10),
        role: Role.Driver,
        image: "https://randomuser.me/api/portraits/men/6.jpg",
        driver: {
          create: {
            status: DriverStatus.Available,
          },
        },
      },
    }),
  ]);

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
