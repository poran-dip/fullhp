// rating-generate.mjs
// run with node prisma/rating-generate.mjs

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/client";

// Initialize Prisma client
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function generateRandomRatings() {
  try {
    // Get all doctors
    const doctors = await prisma.doctor.findMany();

    console.log(
      `Found ${doctors.length} doctors. Generating random ratings...`,
    );

    // Update each doctor with a random rating between 4.15 and 4.95
    for (const doctor of doctors) {
      // Generate a random number between 4.15 and 4.95
      const randomRating = (Math.random() * (4.95 - 4.15) + 4.15).toFixed(2);

      // Update the doctor record
      await prisma.doctor.update({
        where: {
          id: doctor.id,
        },
        data: {
          rating: randomRating,
        },
      });

      console.log(
        `Updated Dr. ${doctor.name || doctor.id} with rating: ${randomRating}`,
      );
    }

    console.log("Random rating generation completed successfully!");
  } catch (error) {
    console.error("Error generating random ratings:", error);
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
  }
}

// Execute the function
generateRandomRatings();
