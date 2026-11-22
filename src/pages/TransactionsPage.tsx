import { useI18n } from '../i18n/useI18n';
import { Download, Eye, Plus, Receipt, Search, SlidersHorizontal, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Avatar, Button, Drawer, EmptyState, IconButton, Modal, PageHeading, Pagination, StatusPill, useDelayedSearch } from '../components/UI';
import { plans } from '../data/demo';
import { downloadCsv } from '../lib/utils';
import { useWorkspace } from '../store/WorkspaceContext';
import { useAppActions } from '../app/App';
import type { PlanId, TransactionInput, TransactionStatus } from '../types';

const statuses: TransactionStatus[] = ['Paid', 'Pending', 'Refunded', 'Failed'];
const blank: TransactionInput = { customerId: '', plan: 'growth', amount: 149, status: 'Pending', method: 'Card' };

function TransactionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const { data, addTransaction } = useWorkspace();
  const { toast } = useAppActions();
  const [form, setForm] = useState<TransactionInput>(blank);
  const [error, setError] = useState('');
  useEffect(() => { if (open) { setForm({ ...blank, customerId: data.customers[0]?.id ?? '' }); setError(''); } }, [open, data.customers]);
  function save(event: FormEvent) {
    event.preventDefault();
    if (!data.customers.some(item => item.id === form.customerId) || !Number.isFinite(form.amount) || form.amount <= 0 || form.amount > 1000000) { setError(t('Select a customer and enter a valid amount between $1 and $1,000,000.')); return; }
    addTransaction(form);
    toast(t('Sample transaction created'));
    onClose();
  }
  return <Modal open={open} onClose={onClose} title={t("New transaction")} description={t("Create a sample billing transaction.")} wide><form onSubmit={save}><div className="form-grid"><label className="field field-span"><span>{t("Customer *")}</span><select required value={form.customerId} onChange={event => setForm({ ...form, customerId: event.target.value })}>{data.customers.map(item => <option key={item.id} value={item.id}>{item.company} — {t(item.name)}</option>)}</select></label><label className="field"><span>{t("Subscription plan")}</span><select value={form.plan} onChange={event => { const value = event.target.value as PlanId; setForm({ ...form, plan: value, amount: plans.find(item => item.id === value)?.price ?? 49 }); }}>{plans.map(item => <option key={item.id} value={item.id}>{t(item.name)}</option>)}</select></label><label className="field"><span>{t("Amount (USD) *")}</span><input type="number" required min="1" max="1000000" step="0.01" value={form.amount} onChange={event => setForm({ ...form, amount: Number(event.target.value) })} /></label><label className="field"><span>{t("Payment status")}</span><select value={form.status} onChange={event => setForm({ ...form, status: event.target.value as TransactionStatus })}>{statuses.map(item => <option key={item} value={item}>{t(item)}</option>)}</select></label><label className="field"><span>{t("Payment method")}</span><select value={form.method} onChange={event => setForm({ ...form, method: event.target.value as TransactionInput['method'] })}><option value="Card">{t("Card")}</option><option value="Bank transfer">{t("Bank transfer")}</option></select></label></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><Button type="button" onClick={onClose}>{t("Cancel")}</Button><Button variant="primary" type="submit">{t("Create transaction")}</Button></div></form></Modal>;
}

export function TransactionsPage() {
  const { t, currency, date, planName, number } = useI18n();
  const { data, setTransactionStatus } = useWorkspace();
  const { toast } = useAppActions();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [range, setRange] = useState('all');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const query = useDelayedSearch(search);
  const customerMap = useMemo(() => new Map(data.customers.map(item => [item.id, item])), [data.customers]);
  const filtered = useMemo(() => data.transactions.filter(item => {
    const customer = customerMap.get(item.customerId);
    const found = `${item.id} ${customer?.name ?? ''} ${customer?.company ?? ''}`.toLowerCase().includes(query.trim().toLowerCase());
    const withinRange = range === 'all' || new Date(item.issuedAt).getTime() >= Date.now() - Number(range) * 86400000;
    return found && (status === 'all' || item.status === status) && withinRange;
  }).sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)), [data.transactions, customerMap, query, status, range]);
  const perPage = data.preferences.compact ? 15 : 10;
  useEffect(() => setPage(1), [query, status, range, perPage]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / perPage)));
  const rows = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const selected = data.transactions.find(item => item.id === selectedId) ?? null;
  const selectedCustomer = selected ? customerMap.get(selected.customerId) : undefined;
  const totals = { paid: filtered.filter(item => item.status === 'Paid').reduce((sum, item) => sum + item.amount, 0), pending: filtered.filter(item => item.status === 'Pending').reduce((sum, item) => sum + item.amount, 0) };
  const exportCsv = () => { downloadCsv('nexapanel-transactions.csv', [['Invoice', 'Customer', 'Company', 'Plan', 'Amount USD', 'Status', 'Method', 'Date'], ...filtered.map(item => [item.id, customerMap.get(item.customerId)?.name ?? '', customerMap.get(item.customerId)?.company ?? '', planName(item.plan), item.amount, item.status, item.method, item.issuedAt])]); toast(`${number(filtered.length)} ${t('Transactions exported')}`); };
  const changeStatus = (id: string, value: TransactionStatus) => { setTransactionStatus(id, value); toast(`${id} · ${t('Status updated')}: ${t(value)}`); };
  return <><PageHeading eyebrow={t("MANAGEMENT / TRANSACTIONS")} title={t("Transactions")} description={t("Review sample invoices and track payment statuses.")} action={<><Button icon={<Download size={16} />} onClick={exportCsv}>{t("Export CSV")}</Button><Button variant="primary" icon={<Plus size={17} />} onClick={() => setOpen(true)}>{t("New transaction")}</Button></>} /><div className="summary-strip"><div><span className="summary-icon tone-purple"><Receipt size={20} /></span><div><strong>{number(filtered.length)}</strong><small>{t("Matching transactions")}</small></div></div><div><span className="summary-icon tone-mint"><WalletCards size={20} /></span><div><strong>{currency(totals.paid)}</strong><small>{t("Paid revenue")}</small></div></div><div><span className="summary-icon tone-orange"><span className="summary-symbol">◷</span></span><div><strong>{currency(totals.pending)}</strong><small>{t("Pending payment value")}</small></div></div></div><section className="surface-panel listing-panel"><div className="listing-header"><div><h2>{t("Transaction history ")}<span className="count-badge">{filtered.length}</span></h2><p>{t("Use filters to find an invoice or change its status.")}</p></div><span className="filter-tag"><SlidersHorizontal size={15} /> {t("Filters")}</span></div><div className="filters-row"><label className="search-input"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={t("Search invoice, customer...")} aria-label={t("Search transactions")} /></label><select value={status} onChange={event => setStatus(event.target.value)} aria-label={t("Filter transaction status")}><option value="all">{t("All statuses")}</option>{statuses.map(item => <option key={item} value={item}>{t(item)}</option>)}</select><select value={range} onChange={event => setRange(event.target.value)} aria-label={t("Filter transaction dates")}><option value="all">{t("All time")}</option><option value="30">{t("Last 30 days")}</option><option value="90">{t("Last 90 days")}</option><option value="365">{t("Last 12 months")}</option></select></div>{rows.length === 0 ? <EmptyState title={t("No transactions found")} description={t("Try broadening your search or creating a sample invoice.")} action={<Button onClick={() => { setSearch(''); setStatus('all'); setRange('all'); }}>{t("Clear filters")}</Button>} /> : <div className="table-overflow"><table className={`data-table large-table ${data.preferences.compact ? 'compact-table' : ''}`}><thead><tr><th>{t("Invoice")}</th><th>{t("Customer")}</th><th>{t("Subscription")}</th><th>{t("Date")}</th><th>{t("Amount")}</th><th>{t("Status")}</th><th className="align-right">{t("Details")}</th></tr></thead><tbody>{rows.map(item => { const customer = customerMap.get(item.customerId); return <tr key={item.id}><td className="cell-primary">{item.id}</td><td><div className="person-cell"><Avatar name={customer?.name ?? 'Customer'} /><div><strong>{customer?.company ?? 'Unknown'}</strong><small>{customer?.name ?? 'Missing customer'}</small></div></div></td><td>{planName(item.plan)}</td><td>{date(item.issuedAt)}</td><td className="cell-primary">{currency(item.amount)}</td><td><StatusPill status={item.status} /></td><td><div className="row-actions"><IconButton label={`${t('View invoice')} ${item.id}`} onClick={() => setSelectedId(item.id)}><Eye size={18} /></IconButton></div></td></tr>; })}</tbody></table></div>}<Pagination page={currentPage} total={filtered.length} perPage={perPage} onChange={setPage} /></section><TransactionDialog open={open} onClose={() => setOpen(false)} /><Drawer open={!!selected} onClose={() => setSelectedId(null)} title={selected?.id ?? 'Invoice details'} description={t("Billing transaction overview")}>{selected && <><div className="invoice-banner"><Receipt size={30} /><strong>{currency(selected.amount)}</strong><StatusPill status={selected.status} /></div><div className="detail-list"><div><span>{t("Customer")}</span><strong>{selectedCustomer?.name ?? 'Unknown'}</strong></div><div><span>{t("Company")}</span><strong>{selectedCustomer?.company ?? 'Unknown'}</strong></div><div><span>{t("Subscription")}</span><strong>{planName(selected.plan)}</strong></div><div><span>{t("Invoice date")}</span><strong>{date(selected.issuedAt)}</strong></div><div><span>{t("Payment method")}</span><strong>{t(selected.method)}</strong></div><div><span>{t("Invoice reference")}</span><strong>{selected.id}</strong></div></div><label className="field drawer-status"><span>{t("Update payment status")}</span><select value={selected.status} onChange={event => changeStatus(selected.id, event.target.value as TransactionStatus)}>{statuses.map(item => <option key={item} value={item}>{t(item)}</option>)}</select></label><p className="drawer-note">{t("Changes to invoice statuses affect the sample revenue reports immediately. No real payment is processed.")}</p></>}</Drawer></>;
}
