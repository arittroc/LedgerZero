import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("⏳ Clearing existing data...");
  await prisma.reconciliation.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.bankTransaction.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("🌱 Creating default user...");
  const user = await prisma.user.create({
    data: {
      email: "demo@ledgerzero.com",
      passwordHash:
        "$2b$10$ukCOiHiSuvwyWk7.dq/VqubM6zPZZKNm7zCCUysCPeRZdRco9LHDa", // password
    },
  });

  console.log("🌱 Seeding Invoices...");
  await prisma.invoice.createMany({
    data: [
      {
        id: "INV-001",
        clientName: "Acme Corp",
        amount: 1250.0,
        status: "UNPAID",
        date: new Date("2026-05-01"),
        userId: user.id,
      },
      {
        id: "INV-002",
        clientName: "Stark Industries",
        amount: 450.0,
        status: "UNPAID",
        date: new Date("2026-05-02"),
        userId: user.id,
      },
      {
        id: "INV-003",
        clientName: "Wayne Tech",
        amount: 3200.0,
        status: "UNPAID",
        date: new Date("2026-05-03"),
        userId: user.id,
      },
    ],
  });

  console.log("🌱 Seeding Bank Transactions...");
  await prisma.bankTransaction.createMany({
    data: [
      {
        id: "TXN-991",
        description: "WIRE IN ACME CORP",
        amount: 1250.0,
        date: new Date("2026-05-06"),
        userId: user.id,
      },
      {
        id: "TXN-992",
        description: "STRIPE PAYOUT WT",
        amount: 3200.0,
        date: new Date("2026-05-06"),
        userId: user.id,
      },
      {
        id: "TXN-993",
        description: "ACH DEP FAST NET",
        amount: -89.99,
        date: new Date("2026-05-07"),
        userId: user.id,
      },
    ],
  });

  console.log("✅ Database successfully seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
