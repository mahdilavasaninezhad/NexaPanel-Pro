import { useI18n } from '../i18n/useI18n';
import { ArrowRight, Check, CreditCard, Sparkles, Users } from 'lucide-react';
import { useMemo } from 'react';
import { Button, PageHeading, SectionHeading } from '../components/UI';
import { plans } from '../data/demo';
import { getPeriodTransactions, revenueByPlan } from '../lib/utils';
import { useWorkspace } from '../store/WorkspaceContext';
import type { PlanId } from '../types';

export function PlansPage() {
  const { t, currency, number } = useI18n();
  const { data } = useWorkspace();
  const period = data.preferences.period;
  const recent = useMemo(() => getPeriodTransactions(data.transactions, period), [data.transactions, period]);
  const revenue = useMemo(() => revenueByPlan(recent), [recent]);
  const customers = data.customers;
  const total = Object.values(revenue).reduce((sum, amount) => sum + amount, 0);
  const viewCustomers = (plan: PlanId) => { window.location.hash = `customers?plan=${plan}`; };
  return <><PageHeading eyebrow={t("MANAGEMENT / PLANS")} title={t("Plans & billing")} description={t("An overview of your product tiers and their sample revenue contribution.")} /><div className="plans-intro"><div><span><Sparkles size={16} /> {t("REVENUE OPERATIONS")}</span><h2>{t("Four plans. One clear overview.")}</h2><p>{t("Compare subscription tiers, customer distribution, and paid revenue over your selected reporting period.")}</p></div><div className="plans-intro-stat"><strong>{currency(total)}</strong><small>{t("Paid revenue · Last ")}{period} {t("months")}</small></div></div><div className="plans-grid">{plans.map(plan => { const members = customers.filter(customer => customer.plan === plan.id); const active = members.filter(customer => customer.status === 'Active'); return <article className={`plan-card ${plan.id === 'growth' ? 'featured-plan' : ''}`} key={plan.id}><div className="plan-card-head"><div className="plan-mark" style={{ background: plan.accent }}><CreditCard size={18} /></div>{plan.id === 'growth' && <span className="popular-plan">{t("POPULAR TIER")}</span>}</div><h2>{t(plan.name)}</h2><p>{t(plan.description)}</p><div className="plan-price"><strong>{currency(plan.price)}</strong><span>{t("/ month")}</span></div><div className="plan-benefits">{plan.perks.map(perk => <div key={perk}><Check size={16} />{t(perk)}</div>)}</div><div className="plan-card-footer"><div><span><Users size={16} /> {number(members.length)} {t('customers')}</span><small>{number(active.length)} {t('active subscriptions')}</small></div><Button onClick={() => viewCustomers(plan.id)}>{t("View customers ")}<ArrowRight size={15} /></Button></div></article>; })}</div><section className="surface-panel plan-report"><SectionHeading title={t("Plan revenue breakdown")} description={`${t('Paid transactions')} · ${number(period)} ${t('months')}`} /><div className="plan-report-list">{plans.map(plan => <div className="plan-report-row" key={plan.id}><div className="plan-report-label"><span style={{ background: plan.accent }} /><strong>{t(plan.name)}</strong></div><div className="plan-report-track"><span style={{ background: plan.accent, width: `${total ? revenue[plan.id] / total * 100 : 0}%` }} /></div><strong>{currency(revenue[plan.id])}</strong><small>{total ? (revenue[plan.id] / total * 100).toFixed(1) : '0.0'}%</small></div>)}</div></section><p className="data-disclaimer">{t("Plan prices and features are fictional demo catalog data, not a live billing configuration. Updating a customer's plan changes their account profile, but does not retroactively modify previous transactions.")}</p></>;
}
