export interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  date: string;
}

export interface BankFeedItem {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface MatchedPair {
  id: string;
  invoice: Invoice;
  bankItem: BankFeedItem;
  amount: number;
}

export interface ReconciliationResult {
  matchedPairs: MatchedPair[];
  unmatchedInvoices: Invoice[];
  unmatchedBankItems: BankFeedItem[];
}

/**
 * Pairs invoices and bank entries based on matching exact amounts.
 */
export function reconcileLedger(
  invoices: Invoice[],
  bankFeed: BankFeedItem[],
): ReconciliationResult {
  const matchedPairs: MatchedPair[] = [];
  const matchedInvoiceIds = new Set<string>();
  const matchedBankItemIds = new Set<string>();

  // Sort to ensure deterministic matching if multiple items have same amount
  const sortedInvoices = [...invoices].sort((a, b) => a.id.localeCompare(b.id));
  const sortedBankFeed = [...bankFeed].sort((a, b) => a.id.localeCompare(b.id));

  for (const invoice of sortedInvoices) {
    const match = sortedBankFeed.find(
      (item) =>
        !matchedBankItemIds.has(item.id) && item.amount === invoice.amount,
    );

    if (match) {
      matchedPairs.push({
        id: `match-${invoice.id}-${match.id}`,
        invoice,
        bankItem: match,
        amount: invoice.amount,
      });
      matchedInvoiceIds.add(invoice.id);
      matchedBankItemIds.add(match.id);
    }
  }

  const unmatchedInvoices = invoices.filter(
    (invoice) => !matchedInvoiceIds.has(invoice.id),
  );

  const unmatchedBankItems = bankFeed.filter(
    (item) => !matchedBankItemIds.has(item.id),
  );

  return {
    matchedPairs,
    unmatchedInvoices,
    unmatchedBankItems,
  };
}
