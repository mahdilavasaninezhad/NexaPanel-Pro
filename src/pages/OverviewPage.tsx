import { useI18n } from '../i18n/useI18n';
import { ArrowRight, BadgeDollarSign, CreditCard, Download, MoreHorizontal, Sparkles, TrendingUp, Users } from 'lucide-react';
import { useMemo } from 'react';
import { DonutChart, RevenueChart } from '../components/Charts';
import { Avatar, Button, InlineLink, MetricCard, PageHeading, PeriodSelect, SectionHeading, StatusPill } from '../components/UI';
import { plans } from '../data/demo';
import { getMonthlyRevenue, getPeriodTransactions, percentChange, revenueByPlan } from '../lib/utils';
import { useWorkspace } from '../store/WorkspaceContext';
import { useAppActions } from '../app/App';

export function OverviewPage() {
  const { t, language, currency, date, number, shortCurrency, planName, monthLabel } = useI18n();
  const { data, updatePreferences } = useWorkspace();
  const { navigate, toast } = useAppActions();
  const period = data.preferences.period;
  const metrics = useMemo(() => {
    const current = getPeriodTransactions(data.transactions, period);
    const previous = getPeriodTransactions(data.transactions, period, period);
    const revenue = current.filter(item => item.status === 'Paid').reduce((sum, item) => sum + item.amount, 0);
    const previousRevenue = previous.filter(item => item.status === 'Paid').reduce((sum, item) => sum + item.amount, 0);
    const paid = current.filter(item => item.status === 'Paid');
    const previousPaid = previous.filter(item => item.status === 'Paid');
    return { current, revenue, revenueGrowth: percentChange(revenue, previousRevenue), paid: paid.length, transactionsGrowth: percentChange(paid.length, previousPaid.length), average: paid.length ? revenue / paid.length : 0, previousAverage: previousPaid.length ? previousRevenue / previousPaid.length : 0 };
  }, [data.transactions, period]);
  const monthly = useMemo(() => getMonthlyRevenue(data.transactions, period).map(item => ({ ...item, label: monthLabel(item.key) })), [data.transactions, period, monthLabel]);
  const planRevenue = useMemo(() => revenueByPlan(metrics.current), [metrics.current]);
  const chartData = plans.map(plan => ({ name: t(plan.name), value: planRevenue[plan.id], color: plan.accent }));
  const ordered = [...data.transactions].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)).slice(0, 5);
  const customersById = new Map(data.customers.map(item => [item.id, item]));
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const exportSummary = () => {
    const content = ['Metric,Value', `Period,${period} months`, `Revenue,${metrics.revenue}`, `Paid transactions,${metrics.paid}`, `Average paid transaction,${metrics.average.toFixed(2)}`, `Active customers,${data.customers.filter(item => item.status === 'Active').length}`].join('\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'nexapanel-overview.csv';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
    toast(t('Overview summary exported'));
  };
  return <>
    <PageHeading eyebrow={t("DASHBOARD / OVERVIEW")} title={`${t(greeting)}${language === 'fa' ? '، ' : ', '}${data.preferences.ownerName.split(' ')[0]} 👋`} description={t("Here's what's happening with your workspace. All values are sample data.")} action={<Button icon={<Download size={16} />} onClick={exportSummary}>{t("Export summary")}</Button>} />
    <div className="welcome-banner"><div className="banner-body"><div className="banner-kicker"><Sparkles size={15} /> {t("YOUR WORKSPACE AT A GLANCE")}</div><h2>{t("Understand your business.")}<br />{t("Make every decision count.")}</h2><p>{t("Review sales activity, customer trends, and performance in one place.")}</p><button onClick={() => navigate('analytics')}>{t("Explore analytics ")}<ArrowRight size={17} /></button></div><div className="banner-art" aria-hidden="true"><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="art-card art-card-back"><TrendingUp size={19} /><span>{t("Insights")}</span></div><div className="art-card art-card-front"><div className="art-wave"><span /><span /><span /><span /><span /><span /><span /></div><strong>{shortCurrency(metrics.revenue)}</strong><small>{t("Sample revenue")}</small></div></div></div>
    <div className="stats-grid"><MetricCard title={t("Revenue")} value={currency(metrics.revenue)} change={metrics.revenueGrowth} sub={`${t('vs previous period')} · ${number(period)} ${t('months')}`} icon={<BadgeDollarSign size={21} />} tone="purple" /><MetricCard title={t("Paid transactions")} value={number(metrics.paid)} change={metrics.transactionsGrowth} sub="completed payments" icon={<CreditCard size={21} />} tone="blue" /><MetricCard title={t("Active customers")} value={number(data.customers.filter(customer => customer.status === 'Active').length)} sub="current customer accounts" icon={<Users size={21} />} tone="mint" /><MetricCard title={t("Avg. transaction")} value={currency(metrics.average)} change={percentChange(metrics.average, metrics.previousAverage)} sub="paid orders only" icon={<TrendingUp size={21} />} tone="orange" /></div>
    <div className="insight-grid"><section className="surface-panel revenue-panel"><SectionHeading title={t("Revenue overview")} description={t("Revenue from paid sample transactions")} action={<PeriodSelect value={period} onChange={value => updatePreferences({ period: value })} />} /><div className="revenue-header"><strong>{currency(metrics.revenue)}</strong><span>{t("Last ")}{number(period)} {t('months')}</span></div><RevenueChart data={monthly} /><div className="chart-legend"><span className="legend-dot" /> {t("Paid transaction revenue")}</div></section><section className="surface-panel allocation-panel"><SectionHeading title={t("Revenue by plan")} description={`${t('Distribution over')} ${number(period)} ${t('months')}`} action={<button className="subtle-icon" aria-label={t("View plans")} onClick={() => navigate('plans')}><MoreHorizontal size={20} /></button>} /><DonutChart data={chartData} middle={shortCurrency(metrics.revenue)} sub="total revenue" /><div className="legend-grid">{chartData.map(item => <div key={item.name}><span><i style={{ background: item.color }} />{item.name}</span><strong>{metrics.revenue ? ((item.value / metrics.revenue) * 100).toFixed(0) : 0}%</strong></div>)}</div></section></div>
    <div className="insight-grid bottom-grid"><section className="surface-panel recent-panel"><SectionHeading title={t("Recent transactions")} description={t("Latest activity across your customers")} action={<InlineLink onClick={() => navigate('transactions')}>{t("View all")}</InlineLink>} /><div className="table-overflow"><table className="data-table"><thead><tr><th>{t("Customer")}</th><th>{t("Plan")}</th><th>{t("Amount")}</th><th>{t("Status")}</th></tr></thead><tbody>{ordered.map(item => { const customer = customersById.get(item.customerId); return <tr key={item.id}><td><div className="person-cell"><Avatar name={customer?.name ?? 'Customer'} /><div><strong>{customer?.company ?? 'Unknown'}</strong><small>{item.id} · {date(item.issuedAt)}</small></div></div></td><td>{planName(item.plan)}</td><td className="cell-primary">{currency(item.amount)}</td><td><StatusPill status={item.status} /></td></tr>; })}</tbody></table></div></section><section className="surface-panel activity-panel"><SectionHeading title={t("Recent activity")} description={t("Updates to your workspace")} action={<InlineLink onClick={() => navigate('activity')}>{t("View all")}</InlineLink>} /><div className="mini-activity">{[...data.activity].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map(item => <div className="activity-row" key={item.id}><span className={`activity-marker activity-${item.kind}`}><span /></span><div><strong>{t(item.title)}</strong><p>{t(item.detail)}</p><small>{date(item.createdAt)}</small></div></div>)}</div></section></div>
  </>;
}
