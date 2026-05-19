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

  console.log("🌱 Seeding Invoices...");
  await prisma.invoice.createMany({
    data: [
      {
        id: "INV-001",
        clientName: "Acme Corp",
        amount: 1250.00,
        status: "UNPAID",
        date: new Date("2026-05-01"),
      },
      {
        id: "INV-002",
        clientName: "Stark Industries",
        amount: 450.00,
        status: "UNPAID",
        date: new Date("2026-05-02"),
      },
      {
        id: "INV-003",
        clientName: "Wayne Tech",
        amount: 3200.00,
        status: "UNPAID",
        date: new Date("2026-05-03"),
      },
    ],
  });

  console.log("🌱 Seeding Bank Transactions...");
  await prisma.bankTransaction.createMany({
    data: [
      {
        id: "TXN-991",
        description: "WIRE IN ACME CORP",
        amount: 1250.00,
        date: new Date("2026-05-06"),
      },
      {
        id: "TXN-992",
        description: "STRIPE PAYOUT WT",
        amount: 3200.00,
        date: new Date("2026-05-06"),
      },
      {
        id: "TXN-993",
        description: "ACH DEP FAST NET",
        amount: -89.99,
        date: new Date("2026-05-07"),
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
