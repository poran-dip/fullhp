import { embed, profileText } from "../src/lib/medbot/embedding";
import { prisma } from "../src/lib/prisma";

async function refresh() {
  for (;;) {
    const batch = await prisma.$queryRaw<
      { id: string; department: string; specialization: string }[]
    >`
      SELECT id, department, specialization FROM doctors
      WHERE status = 'Active' AND medbot_embedding IS NULL ORDER BY id LIMIT 50`;
    if (!batch.length) return;
    for (const d of batch) {
      const vector = await embed(profileText(d), "RETRIEVAL_DOCUMENT");
      await prisma.$executeRaw`UPDATE doctors SET medbot_embedding = ${vector}::float8[]
        WHERE id = ${d.id} AND department = ${d.department} AND specialization = ${d.specialization}
        AND medbot_embedding IS NULL`;
    }
  }
}
refresh()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
