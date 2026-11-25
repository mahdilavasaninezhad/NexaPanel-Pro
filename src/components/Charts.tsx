import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useI18n } from '../i18n/useI18n';

export type RevenuePoint = { key: string; label: string; revenue: number; orders: number; refunded: number };

const tooltipStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', boxShadow: '0 16px 45px rgba(16,23,42,.12)', fontSize: 12 };

export function RevenueChart({ data, detailed = false }: { data: RevenuePoint[]; detailed?: boolean }) {
  const { t, currency, shortCurrency } = useI18n();
  return <div className={detailed ? 'chart-area chart-area-large' : 'chart-area'}><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 12, right: 8, bottom: 2, left: -18 }}><defs><linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#277ce7" stopOpacity={0.24} /><stop offset="100%" stopColor="#277ce7" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="4 6" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} dy={11} /><YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={shortCurrency} width={55} /><Tooltip contentStyle={tooltipStyle} formatter={value => currency(Number(value ?? 0))} cursor={{ stroke: '#69a5ee', strokeDasharray: '4 4' }} /><Area type="monotone" dataKey="revenue" name={t("Revenue")} stroke="#277ce7" strokeWidth={3} fill="url(#revenueGradient)" activeDot={{ r: 6, fill: '#277ce7', stroke: '#fff', strokeWidth: 3 }} /></AreaChart></ResponsiveContainer></div>;
}

export function OrdersChart({ data }: { data: RevenuePoint[] }) {
  const { t, number } = useI18n();
  return <div className="chart-area chart-area-medium"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 10, right: 4, bottom: 0, left: -22 }}><CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="4 6" /><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} dy={10} /><YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} /><Tooltip contentStyle={tooltipStyle} formatter={value => number(Number(value ?? 0))} cursor={{ fill: 'var(--hover)' }} /><Bar dataKey="orders" name={t("Transactions")} fill="#1973e2" maxBarSize={30} radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></div>;
}

export function DonutChart({ data, middle, sub }: { data: Array<{ name: string; value: number; color: string }>; middle?: string; sub?: string }) {
  const { t, number } = useI18n();
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return <div className="donut-container"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" innerRadius="70%" outerRadius="91%" startAngle={90} endAngle={-270} paddingAngle={3} stroke="none">{data.map(item => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} formatter={value => number(Number(value ?? 0))} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{middle ?? number(total)}</strong><span>{sub ? t(sub) : t('Total')}</span></div></div>;
}
