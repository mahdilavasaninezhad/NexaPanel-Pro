import type { Customer, PlanId, Transaction, TransactionStatus } from '../types';

export const currency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
export const shortCurrency = (value: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1, style: 'currency', currency: 'USD' }).format(value);
export const number = (value: number) => new Intl.NumberFormat('en-US').format(value);
export const date = (value: string) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
export const shortDate = (value: string) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export const monthKey = (value: string | Date) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
export const initials = (name: string) => name.trim().split(/\s+/).map(item => item[0]).slice(0, 2).join('').toUpperCase();
export const planName = (value: PlanId) => value.charAt(0).toUpperCase() + value.slice(1);
export const isPaid = (value: Transaction) => value.status === 'Paid';
export const percentChange = (current: number, previous: number) => previous === 0 ? null : ((current - previous) / previous) * 100;

export function getMonthlyRevenue(transactions: Transaction[], length: number, until = new Date()) {
  const result: { key: string; label: string; revenue: number; orders: number; refunded: number }[] = [];
  for (let offset = length - 1; offset >= 0; offset -= 1) {
    const stamp = new Date(until.getFullYear(), until.getMonth() - offset, 1);
    result.push({ key: monthKey(stamp), label: stamp.toLocaleDateString('en-US', { month: 'short' }), revenue: 0, orders: 0, refunded: 0 });
  }
  const map = new Map(result.map(row => [row.key, row]));
  for (const transaction of transactions) {
    const row = map.get(monthKey(transaction.issuedAt));
    if (!row) continue;
    row.orders += 1;
    if (transaction.status === 'Paid') row.revenue += transaction.amount;
    if (transaction.status === 'Refunded') row.refunded += transaction.amount;
  }
  return result;
}

export function getPeriodTransactions(transactions: Transaction[], length: number, offset = 0, until = new Date()) {
  const start = new Date(until.getFullYear(), until.getMonth() - length - offset + 1, 1).getTime();
  const end = new Date(until.getFullYear(), until.getMonth() - offset + 1, 1).getTime();
  return transactions.filter(transaction => {
    const stamp = new Date(transaction.issuedAt).getTime();
    return stamp >= start && stamp < end;
  });
}

export function customerRevenue(customer: Customer, transactions: Transaction[]) {
  return transactions.reduce((sum, transaction) => sum + (transaction.customerId === customer.id && isPaid(transaction) ? transaction.amount : 0), 0);
}

export function revenueByPlan(transactions: Transaction[]) {
  const result: Record<PlanId, number> = { starter: 0, growth: 0, scale: 0, enterprise: 0 };
  for (const transaction of transactions) if (isPaid(transaction)) result[transaction.plan] += transaction.amount;
  return result;
}

export function countStatuses(transactions: Transaction[]) {
  return transactions.reduce<Record<TransactionStatus, number>>((acc, row) => {
    acc[row.status] += 1;
    return acc;
  }, { Paid: 0, Pending: 0, Refunded: 0, Failed: 0 });
}

export function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}
