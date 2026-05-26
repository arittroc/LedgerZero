import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  console.log("🚀 Running Manual Reconciliation...");
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      throw new Error("No user found. Please run seed first.");
    }

    await prisma.$transaction([
      prisma.reconciliation.create({
        data: {
          invoiceId: "550e8400-e29b-41d4-a716-446655440001",
          transactionId: "550e8400-e29b-41d4-a716-446655440991",
          userId: user.id,
        },
      }),
      prisma.invoice.update({
        where: { id: "550e8400-e29b-41d4-a716-446655440001" },
        data: { status: "PAID" },
      }),
    ]);
    console.log("✅ Success: 550e8400-e29b-41d4-a716-446655440001 matched with 550e8400-e29b-41d4-a716-446655440991");
  } catch (error: any) {
    console.error("❌ Failed:", error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();
