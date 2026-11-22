import { useT } from '../i18n/useI18n';
import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Inbox, X } from 'lucide-react';
import { initials } from '../lib/utils';
import { useI18n } from '../i18n/useI18n';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'normal' | 'small'; icon?: ReactNode };

export function Button({ children, variant = 'secondary', size = 'normal', icon, className = '', ...props }: ButtonProps) {
  return <button className={`btn btn-${variant} btn-${size} ${className}`} {...props}>{icon}{children}</button>;
}

export function IconButton({ children, label, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; label: string }) {
  return <button className={`icon-button ${className}`} title={label} aria-label={label} {...props}>{children}</button>;
}

export function Avatar({ name, size = 'normal' }: { name: string; size?: 'normal' | 'large' }) {
  const styles = ['purple', 'blue', 'mint', 'amber', 'pink'];
  const index = [...name].reduce((acc, item) => acc + item.charCodeAt(0), 0) % styles.length;
  return <span className={`avatar avatar-${styles[index]} ${size === 'large' ? 'avatar-large' : ''}`} aria-hidden="true">{initials(name)}</span>;
}

export function StatusPill({ status }: { status: string }) {
  const t = useT();
  return <span className={`status-pill status-${status.toLowerCase().replace(/\s+/g, '-')}`}><span className="status-dot" />{t(status)}</span>;
}

export function SectionHeading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="section-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>;
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action && <div className="page-actions">{action}</div>}</div>;
}

export function MetricCard({ title, value, change, sub, icon, tone = 'purple' }: { title: string; value: string; change?: number | null; sub?: string; icon: ReactNode; tone?: 'purple' | 'blue' | 'mint' | 'orange' }) {
  const t = useT();
  return <div className="metric-card"><div className="metric-head"><span className={`metric-icon tone-${tone}`}>{icon}</span><span className="metric-menu">{t("Last period")}</span></div><span className="metric-label">{title}</span><div className="metric-value">{value}</div><div className="metric-foot">{typeof change === 'number' && <span className={`metric-trend ${change >= 0 ? 'trend-up' : 'trend-down'}`}>{change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {Math.abs(change).toFixed(1)}%</span>}{sub && <span>{sub}</span>}</div></div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon"><Inbox size={24} /></div><strong>{title}</strong><p>{description}</p>{action}</div>;
}

export function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (value: number) => void }) {
  const t = useT();
  const { number } = useI18n();
  const max = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  return <div className="pagination"><span>{t("Showing ")}<strong>{number(from)}–{number(to)}</strong> {t("of ")}<strong>{number(total)}</strong></span><div><button disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label={t("Previous page")}><ChevronLeft size={17} /></button><span>{t("Page ")}{number(page)} {t("of ")}{number(max)}</span><button disabled={page >= max} onClick={() => onChange(page + 1)} aria-label={t("Next page")}><ChevronRight size={17} /></button></div></div>;
}

export function Modal({ open, onClose, title, description, children, wide = false }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; wide?: boolean }) {
  const t = useT();
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    const prior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = prior; };
  }, [open, onClose]);
  if (!open) return null;
  return <div className="overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><div role="dialog" aria-modal="true" aria-label={title} className={`modal ${wide ? 'modal-wide' : ''}`}><div className="dialog-head"><div><h2>{title}</h2>{description && <p>{description}</p>}</div><IconButton label={t("Close dialog")} onClick={onClose}><X size={19} /></IconButton></div>{children}</div></div>;
}

export function Drawer({ open, onClose, title, description, children }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode }) {
  const t = useT();
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);
  if (!open) return null;
  return <div className="overlay drawer-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><aside className="drawer" role="dialog" aria-modal="true" aria-label={title}><div className="dialog-head"><div><h2>{title}</h2>{description && <p>{description}</p>}</div><IconButton label={t("Close details")} onClick={onClose}><X size={19} /></IconButton></div><div className="drawer-content">{children}</div></aside></div>;
}

export function TrendLabel({ value }: { value: number | null }) {
  const t = useT();
  if (value === null) return <span className="muted">{t("No comparison available")}</span>;
  return <span className={`trend-label ${value >= 0 ? 'positive' : 'negative'}`}>{value >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {Math.abs(value).toFixed(1)}{t("% vs previous period")}</span>;
}

export function PeriodSelect({ value, onChange }: { value: 6 | 12; onChange: (value: 6 | 12) => void }) {
  const t = useT();
  return <div className="period-select" aria-label={t("Chart period")}><button className={value === 6 ? 'active' : ''} onClick={() => onChange(6)}>{t("6 months")}</button><button className={value === 12 ? 'active' : ''} onClick={() => onChange(12)}>{t("12 months")}</button></div>;
}

export function InlineLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button className="inline-link" onClick={onClick}>{children} <ArrowRight size={15} /></button>;
}

export function useDelayedSearch(value: string, delay = 160) {
  const [result, setResult] = useState(value);
  useEffect(() => {
    const timeout = window.setTimeout(() => setResult(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);
  return result;
}

