import { useI18n } from '../i18n/useI18n';
import { Activity, Download, Search, Settings2, UserRound, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button, EmptyState, PageHeading, Pagination, useDelayedSearch } from '../components/UI';
import { downloadCsv } from '../lib/utils';
import { useWorkspace } from '../store/WorkspaceContext';
import { useAppActions } from '../app/App';
import type { Activity as ActivityRecord } from '../types';

const iconMap = { customer: UserRound, transaction: WalletCards, settings: Settings2 };

export function ActivityPage() {
  const { t, date, time, number } = useI18n();
  const { data } = useWorkspace();
  const { toast } = useAppActions();
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('all');
  const [page, setPage] = useState(1);
  const query = useDelayedSearch(search);
  const records = useMemo(() => data.activity.filter(row => (kind === 'all' || row.kind === kind) && `${row.title} ${row.detail}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [data.activity, kind, query]);
  useEffect(() => setPage(1), [query, kind]);
  const perPage = 10;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(records.length / perPage)));
  const rows = records.slice((currentPage - 1) * perPage, currentPage * perPage);
  const download = () => { downloadCsv('nexapanel-activity.csv', [['Date', 'Type', 'Action', 'Details'], ...records.map(item => [item.createdAt, item.kind, item.title, item.detail])]); toast(t('Activity log exported')); };
  const render = (item: ActivityRecord) => { const Icon = iconMap[item.kind]; return <div key={item.id} className="log-entry"><div className={`log-icon log-${item.kind}`}><Icon size={18} /></div><div className="log-copy"><strong>{t(item.title)}</strong><p>{t(item.detail)}</p><small>{date(item.createdAt)} · {time(item.createdAt)}</small></div><span className="log-kind">{t(item.kind)}</span></div>; };
  return <><PageHeading eyebrow={t("MANAGEMENT / ACTIVITY")} title={t("Activity log")} description={t("A local record of demo data changes and recent sample transactions.")} action={<Button icon={<Download size={16} />} onClick={download}>{t("Export log")}</Button>} /><div className="activity-summary"><div><span className="summary-icon tone-purple"><Activity size={22} /></span><div><strong>{number(data.activity.length)} {t('total events')}</strong><p>{t("Edits and new entries are tracked in this browser.")}</p></div></div></div><section className="surface-panel listing-panel"><div className="listing-header"><div><h2>{t("Workspace activity")}</h2><p>{t("Explore operational updates across your sample account.")}</p></div></div><div className="filters-row"><label className="search-input"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={t("Search activity...")} aria-label={t("Search activity log")} /></label><select aria-label={t("Filter activity type")} value={kind} onChange={event => setKind(event.target.value)}><option value="all">{t("All activity")}</option><option value="customer">{t("Customers")}</option><option value="transaction">{t("Transactions")}</option><option value="settings">{t("Settings")}</option></select></div>{rows.length === 0 ? <EmptyState title={t("No activity found")} description={t("Try another filter or make an update to a customer record.")} /> : <div className="activity-log">{rows.map(render)}</div>}<Pagination page={currentPage} total={records.length} perPage={perPage} onChange={setPage} /></section></>;
}
