export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
}

export function generateInvoiceNumber(invoicesCount: number): string {
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const nextNumber = (invoicesCount + 1).toString().padStart(4, '0');
  return `INV-${currentYear}-${nextNumber}`;
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
}
