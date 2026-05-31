import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.admin.create({
    data: {
      email: "porandip@gmail.com",
      password: await bcrypt.hash("Password@1", 10),
      name: "Poran Dip",
    },
  });

  await prisma.patient.createMany({
    data: [
      {
        email: "dikshayn@gmail.com",
        password: await bcrypt.hash("dikku", 10),
        name: "Dikshayn Chakroborty",
        age: 22,
        gender: "Male",
        image: "https://randomuser.me/api/portraits/men/1.jpg",
      },
      {
        email: "rajdeep@gmail.com",
        password: await bcrypt.hash("rajdeep", 10),
        name: "Rajdeep Choudhary",
        age: 21,
        gender: "Male",
        image: "https://randomuser.me/api/portraits/men/2.jpg",
      },
      {
        email: "pooja@gmail.com",
        password: await bcrypt.hash("pooja", 10),
        name: "Pooja Basumatary",
        age: 18,
        gender: "Female",
        image: "https://randomuser.me/api/portraits/women/2.jpg",
      },
    ],
  });

  await prisma.doctor.createMany({
    data: [
      {
        email: "sosangkar@gmail.com",
        password: await bcrypt.hash("sosangkar", 10),
        name: "Dr. Sosangkar Saikia",
        specialization: "Neurology",
        status: "AVAILABLE",
        image: "https://randomuser.me/api/portraits/men/3.jpg",
        location: "Guwahati, AS",
        rating: 4.95,
      },
      {
        email: "kristina@gmail.com",
        password: await bcrypt.hash("kristina", 10),
        name: "Dr. Kristina Deka",
        specialization: "Psychiatry",
        status: "UNAVAILABLE",
        image: "https://randomuser.me/api/portraits/women/3.jpg",
        location: "Nalbari, AS",
        rating: 4.48,
      },
      {
        email: "kabyashree@gmail.com",
        password: await bcrypt.hash("kabyashree", 10),
        name: "Dr. Kabyashree Hazarika",
        specialization: "Pediatrics",
        status: "AVAILABLE",
        image: "https://randomuser.me/api/portraits/women/4.jpg",
        location: "Kolkata, WB",
        rating: 4.99,
      },
      {
        email: "john@gmail.com",
        password: await bcrypt.hash("kabyashree", 10),
        name: "Dr. John Kalita",
        specialization: "Neurology",
        status: "AVAILABLE",
        image: "https://randomuser.me/api/portraits/men/9.jpg",
        location: "Kolkata, WB",
        rating: 4.99,
      },
    ],
  });

  await prisma.ambulance.createMany({
    data: [
      {
        email: "dishita@gmail.com",
        password: await bcrypt.hash("dishita", 10),
        name: "Dishita Deka",
        status: "AVAILABLE",
        image: "https://randomuser.me/api/portraits/women/6.jpg",
        rating: 4.72,
      },
      {
        email: "ruhan@gmail.com",
        password: await bcrypt.hash("ruhan", 10),
        name: "Md Ruhan Roushan Islam",
        status: "ON_DUTY",
        image: "https://randomuser.me/api/portraits/men/6.jpg",
        rating: 4.15,
      },
    ],
  });

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
