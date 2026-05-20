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
          invoiceId: "INV-001",
          transactionId: "TXN-991",
          userId: user.id,
        },
      }),
      prisma.invoice.update({
        where: { id: "INV-001" },
        data: { status: "PAID" },
      }),
    ]);
    console.log("✅ Success: INV-001 matched with TXN-991");
  } catch (error: any) {
    console.error("❌ Failed:", error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();
