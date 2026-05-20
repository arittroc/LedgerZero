import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verify() {
  console.log("🔍 Starting Database Verification...\n");

  try {
    // 1. Fetch PAID invoices
    const paidInvoices = await prisma.invoice.findMany({
      where: { status: "PAID" },
      orderBy: { updatedAt: "desc" },
    });

    console.log(`✅ Found ${paidInvoices.length} PAID Invoices:`);
    if (paidInvoices.length > 0) {
      paidInvoices.forEach((inv) => {
        console.log(
          ` - [${inv.id}] ${inv.clientName}: $${inv.amount} (Updated: ${inv.updatedAt})`,
        );
      });
    } else {
      console.log(" - No paid invoices found.");
    }

    console.log("");

    // 2. Fetch all Reconciliation records
    const reconciliations = await prisma.reconciliation.findMany({
      include: {
        invoice: {
          select: { clientName: true, amount: true },
        },
        transaction: {
          select: { description: true, amount: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`✅ Found ${reconciliations.length} Reconciliation Records:`);
    if (reconciliations.length > 0) {
      reconciliations.forEach((rec) => {
        console.log(
          ` - Match: Invoice ${rec.invoiceId} (${rec.invoice.clientName}) <-> Transaction ${rec.transactionId}`,
        );
        console.log(
          `   Amount: $${rec.invoice.amount} | Date: ${rec.createdAt}`,
        );
      });
    } else {
      console.log(" - No reconciliation records found.");
    }
  } catch (error) {
    console.error("❌ Verification failed:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

verify();
