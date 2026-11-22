import { useT } from '../i18n/useI18n';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Activity, ArrowRight, Bell, Command, CreditCard, Languages, LayoutDashboard, LifeBuoy, Menu, Moon, Search, Settings2, Sun, Users, WalletCards, X } from 'lucide-react';
import { IconButton, Avatar } from '../components/UI';
import { useWorkspace } from '../store/WorkspaceContext';
import { useI18n } from '../i18n/useI18n';
import { OverviewPage } from '../pages/OverviewPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { CustomersPage } from '../pages/CustomersPage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { PlansPage } from '../pages/PlansPage';
import { ActivityPage } from '../pages/ActivityPage';
import { SettingsPage } from '../pages/SettingsPage';
import type { Page } from '../types';

const items: Array<{ id: Page; title: string; icon: typeof LayoutDashboard; group: 'Workspace' | 'Management' }> = [
  { id: 'overview', title: 'Overview', icon: LayoutDashboard, group: 'Workspace' },
  { id: 'analytics', title: 'Analytics', icon: Activity, group: 'Workspace' },
  { id: 'customers', title: 'Customers', icon: Users, group: 'Management' },
  { id: 'transactions', title: 'Transactions', icon: WalletCards, group: 'Management' },
  { id: 'plans', title: 'Plans & billing', icon: CreditCard, group: 'Management' },
  { id: 'activity', title: 'Activity log', icon: Command, group: 'Management' },
  { id: 'settings', title: 'Settings', icon: Settings2, group: 'Management' }
];

function getPage(): Page {
  const current = window.location.hash.replace(/^#\/?/, '').split('?')[0] as Page;
  return items.some(item => item.id === current) ? current : 'overview';
}

const AppActions = createContext<{ navigate: (page: Page) => void; toast: (message: string) => void }>({ navigate: () => undefined, toast: () => undefined });
export const useAppActions = () => useContext(AppActions);

function Sidebar({ page, onNavigate, close }: { page: Page; onNavigate: (next: Page) => void; close: () => void }) {
  const t = useT();
  const { data } = useWorkspace();
  return <><div className="sidebar-logo"><div className="brand-mark"><span /><span /><span /><span /></div><div><strong>{t("NexaPanel")}<span className="brand-dot">.</span></strong><small>{t("PRO WORKSPACE")}</small></div></div><div className="workspace-switch"><div className="workspace-avatar">{data.preferences.workspaceName.slice(0, 1).toUpperCase()}</div><div className="workspace-name"><strong>{data.preferences.workspaceName}</strong><small>{t("Demo workspace")}</small></div></div><div className="sidebar-sections">{(['Workspace', 'Management'] as const).map(group => <div className="nav-group" key={group}><div className="nav-heading">{t(group)}</div>{items.filter(item => item.group === group).map(item => <button key={item.id} className={`nav-item ${page === item.id ? 'nav-active' : ''}`} onClick={() => { onNavigate(item.id); close(); }} aria-current={page === item.id ? 'page' : undefined}><item.icon size={18} strokeWidth={1.8} /><span>{t(item.title)}</span>{page === item.id && <span className="nav-current" />}</button>)}</div>)}</div><div className="sidebar-bottom"><div className="demo-info"><div className="demo-info-top"><span className="demo-glow" /> <strong>{t("Portfolio demo")}</strong></div><p>{t("Explore the workspace using sample data. Your changes stay in this browser.")}</p><button onClick={() => { onNavigate('settings'); close(); }}>{t("Manage demo ")}<ArrowRight size={14} /></button></div><div className="sidebar-support"><LifeBuoy size={17} /><span>{t("Sample environment")}</span></div></div></>;
}

function Notifications({ close }: { close: () => void }) {
  const t = useT();
  const { data, markNotificationsRead } = useWorkspace();
  const { currency, date, number } = useI18n();
  const pending = useMemo(() => data.transactions.filter(t => t.status === 'Pending' && new Date(t.issuedAt).getTime() > Date.now() - 90 * 86400000).slice(0, 5), [data.transactions]);
  const unread = pending.filter(t => !data.readNotificationIds.includes(t.id));
  return <div className="notification-popover"><div className="notification-head"><div><strong>{t("Notifications")}</strong><p>{number(unread.length)} {t("unread payment updates")}</p></div><IconButton label={t("Close notifications")} onClick={close}><X size={17} /></IconButton></div>{pending.length === 0 ? <div className="notification-empty">{t("You're all caught up.")}</div> : pending.map(transaction => <div className={`notification-item ${!data.readNotificationIds.includes(transaction.id) ? 'unread' : ''}`} key={transaction.id}><span className="notification-icon"><WalletCards size={16} /></span><div><strong>{t("Payment awaiting review")}</strong><p>{transaction.id} · {currency(transaction.amount)}</p><small>{date(transaction.issuedAt)}</small></div></div>)}{pending.length > 0 && <button className="notification-read" onClick={() => { markNotificationsRead(pending.map(item => item.id)); close(); }}>{t("Mark all as read")}</button>}</div>;
}

function CommandDialog({ onClose, onNavigate }: { onClose: () => void; onNavigate: (page: Page) => void }) {
  const t = useT();
  const [query, setQuery] = useState('');
  const filtered = items.filter(item => t(item.title).toLowerCase().includes(query.toLowerCase()));
  useEffect(() => { const handler = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }; document.addEventListener('keydown', handler); return () => document.removeEventListener('keydown', handler); }, [onClose]);
  return <div className="overlay command-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><div className="command-dialog" role="dialog" aria-modal="true" aria-label={t("Quick navigation")}><div className="command-input"><Search size={20} /><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder={t("Search pages...")} aria-label={t("Search pages")} /><button onClick={onClose}>{t("ESC")}</button></div><div className="command-results"><div className="nav-heading">{t("Quick navigation")}</div>{filtered.length === 0 ? <p className="command-no-results">{t("No pages found")}</p> : filtered.map(item => <button key={item.id} onClick={() => { onNavigate(item.id); onClose(); }}><item.icon size={18} /><span>{t(item.title)}</span><ArrowRight size={16} /></button>)}</div><div className="command-footer">{t("Navigate your demo workspace faster with ")}<kbd>{t("⌘ K")}</kbd></div></div></div>;
}

function Header({ page, toggleSidebar, openSearch }: { page: Page; toggleSidebar: () => void; openSearch: () => void }) {
  const t = useT();
  const { data, updatePreferences } = useWorkspace();
  const { language } = useI18n();
  const [open, setOpen] = useState(false);
  const unread = data.preferences.notifications ? data.transactions.filter(t => t.status === 'Pending' && new Date(t.issuedAt).getTime() > Date.now() - 90 * 86400000 && !data.readNotificationIds.includes(t.id)).slice(0, 5).length : 0;
  const title = items.find(item => item.id === page)?.title;
  return <header className="topbar"><div className="topbar-left"><IconButton label={t("Open navigation")} onClick={toggleSidebar} className="mobile-nav-toggle"><Menu size={21} /></IconButton><span className="topbar-breadcrumb">{t("Workspace")}</span><span className="breadcrumb-separator">/</span><strong>{t(title ?? '')}</strong></div><div className="topbar-actions"><button className="top-search" onClick={openSearch}><Search size={17} /><span>{t("Search anything...")}</span><kbd>{t("⌘ K")}</kbd></button><button type="button" className="language-switch" aria-label={t('Switch language')} title={t('Switch language')} onClick={() => updatePreferences({ language: language === 'fa' ? 'en' : 'fa' })}><Languages size={17} /><span>{language === 'fa' ? 'EN' : 'فا'}</span></button><IconButton label={t("Toggle dark mode")} onClick={() => updatePreferences({ theme: data.preferences.theme === 'light' ? 'dark' : 'light' })}>{data.preferences.theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</IconButton><div className="notify-anchor"><IconButton label={t("Notifications")} onClick={() => setOpen(previous => !previous)}><Bell size={19} />{unread > 0 && <span className="notify-dot" />}</IconButton>{open && <Notifications close={() => setOpen(false)} />}</div><div className="header-divider" /><div className="profile"><Avatar name={data.preferences.ownerName} /><div><strong>{data.preferences.ownerName}</strong><small>{t("Workspace admin")}</small></div></div></div></header>;
}

export default function App() {
  const t = useT();
  const [page, setPage] = useState<Page>(getPage);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useCallback((next: Page) => { window.location.hash = next; setPage(next); window.scrollTo({ top: 0, behavior: 'auto' }); }, []);
  const toast = useCallback((message: string) => setToastMessage(message), []);
  useEffect(() => { const update = () => setPage(getPage()); window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update); }, []);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setCommandOpen(open => !open); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
  useEffect(() => { if (!toastMessage) return; const timeout = window.setTimeout(() => setToastMessage(''), 3500); return () => window.clearTimeout(timeout); }, [toastMessage]);
  const content: Record<Page, ReactNode> = { overview: <OverviewPage />, analytics: <AnalyticsPage />, customers: <CustomersPage />, transactions: <TransactionsPage />, plans: <PlansPage />, activity: <ActivityPage />, settings: <SettingsPage /> };
  return <AppActions.Provider value={{ navigate, toast }}><div className="app-shell"><aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}><Sidebar page={page} onNavigate={navigate} close={() => setSidebarOpen(false)} /></aside>{sidebarOpen && <button className="sidebar-backdrop" aria-label={t("Close navigation")} onClick={() => setSidebarOpen(false)} />}<div className="app-main"><Header page={page} toggleSidebar={() => setSidebarOpen(true)} openSearch={() => setCommandOpen(true)} /><main className="main-content">{content[page]}<footer className="main-footer"><span>© {new Date().getFullYear()} {t("NexaPanel Pro · Portfolio project")}</span><span><span className="green-dot" /> {t("Local demo data · No live financial services")}</span></footer></main></div></div>{commandOpen && <CommandDialog onClose={() => setCommandOpen(false)} onNavigate={navigate} />} {toastMessage && <div className="toast" role="status"><span className="toast-dot" />{t(toastMessage)}<button aria-label={t("Dismiss notification")} onClick={() => setToastMessage('')}><X size={15} /></button></div>}</AppActions.Provider>;
}
