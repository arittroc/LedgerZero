import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function debug() {
  console.log("🛠️ Database Debug Stats:");
  try {
    const totalInvoices = await prisma.invoice.count();
    const unpaidInvoices = await prisma.invoice.count({
      where: { status: "UNPAID" },
    });
    const paidInvoices = await prisma.invoice.count({
      where: { status: "PAID" },
    });
    const totalTxns = await prisma.bankTransaction.count();
    const totalRecs = await prisma.reconciliation.count();

    console.log(` - Total Invoices: ${totalInvoices}`);
    console.log(` - Unpaid Invoices: ${unpaidInvoices}`);
    console.log(` - Paid Invoices: ${paidInvoices}`);
    console.log(` - Bank Transactions: ${totalTxns}`);
    console.log(` - Reconciliation Records: ${totalRecs}`);

    if (totalInvoices > 0) {
      const sample = await prisma.invoice.findFirst();
      console.log(
        `\nSample Invoice ID: ${sample?.id}, Status: ${sample?.status}`,
      );
    }
  } catch (error) {
    console.error("❌ Debug failed:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

debug();
