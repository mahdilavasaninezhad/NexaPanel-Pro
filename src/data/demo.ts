import type { Channel, Customer, Preferences, Transaction, Workspace } from '../types';

export const plans = [
  { id: 'starter', name: 'Starter', price: 49, description: 'For individuals building their first workflow.', accent: '#2c80ee', perks: ['3 team members', 'Basic reporting', 'Email support'] },
  { id: 'growth', name: 'Growth', price: 149, description: 'For growing teams that need better visibility.', accent: '#0fb19c', perks: ['10 team members', 'Advanced analytics', 'Priority support'] },
  { id: 'scale', name: 'Scale', price: 349, description: 'For established teams running at scale.', accent: '#eeb35f', perks: ['Unlimited workflows', 'Team roles', 'Advanced integrations'] },
  { id: 'enterprise', name: 'Enterprise', price: 799, description: 'For businesses with tailored requirements.', accent: '#7388aa', perks: ['Custom onboarding', 'Dedicated support', 'Custom agreements'] }
] as const;

const people = [
  ['Olivia Rhye', 'Layers', 'olivia@example.com', 'United States'],
  ['Phoenix Baker', 'Catalog Studio', 'phoenix@example.com', 'Canada'],
  ['Lana Steiner', 'Sisyphus', 'lana@example.com', 'Germany'],
  ['Demi Wilkinson', 'Orbit Labs', 'demi@example.com', 'United Kingdom'],
  ['Candice Wu', 'Circooles', 'candice@example.com', 'United States'],
  ['Natali Craig', 'Quotient', 'natali@example.com', 'Australia'],
  ['Drew Cano', 'Magnolia', 'drew@example.com', 'France'],
  ['Andi Lane', 'Pulse Digital', 'andi@example.com', 'United States'],
  ['Kate Morrison', 'Arcade', 'kate@example.com', 'Netherlands'],
  ['Sarah Chen', 'Northstar', 'sarah@example.com', 'Singapore'],
  ['Jordan Lee', 'Mono Studio', 'jordan@example.com', 'Canada'],
  ['Mateo Silva', 'Meridian', 'mateo@example.com', 'Brazil'],
  ['Grace Kim', 'Vercelix', 'grace@example.com', 'South Korea'],
  ['Noah Williams', 'Form & Function', 'noah@example.com', 'United Kingdom'],
  ['Ava Thompson', 'Kinetic', 'ava@example.com', 'United States'],
  ['Lucas Martin', 'Parcel', 'lucas@example.com', 'France'],
  ['Emily Davis', 'Subtle', 'emily@example.com', 'Australia'],
  ['Amir Hassan', 'Openframe', 'amir@example.com', 'United Arab Emirates'],
  ['Sofia Rossi', 'Modular', 'sofia@example.com', 'Italy'],
  ['Ethan Brooks', 'Clearspace', 'ethan@example.com', 'United States'],
  ['Maya Patel', 'Framework', 'maya@example.com', 'India'],
  ['Leo Fischer', 'Motive', 'leo@example.com', 'Germany'],
  ['Isla Roberts', 'Northbound', 'isla@example.com', 'United Kingdom'],
  ['Yuki Tanaka', 'Studio Eight', 'yuki@example.com', 'Japan'],
  ['Zoe Walker', 'Daylight', 'zoe@example.com', 'Canada'],
  ['Theo Laurent', 'District', 'theo@example.com', 'France'],
  ['Nina Petrova', 'Flowmark', 'nina@example.com', 'Estonia'],
  ['Oscar Reed', 'Vector', 'oscar@example.com', 'United States']
] as const;

const planIds = ['starter', 'growth', 'scale', 'enterprise'] as const;
const channels: Channel[] = ['Organic', 'Direct', 'Referral', 'Social'];

function demoCustomers(): Customer[] {
  const now = new Date();
  return people.map(([name, company, email, country], index) => ({
    id: `CUS-${String(index + 101).padStart(3, '0')}`,
    name,
    company,
    email,
    country,
    plan: planIds[(index * 7 + 1) % planIds.length],
    status: index % 11 === 0 ? 'Inactive' : index % 8 === 0 ? 'Trial' : 'Active',
    channel: channels[(index * 3 + 1) % channels.length],
    joinedAt: new Date(now.getFullYear() - 2, now.getMonth() - (index % 8), 5 + index % 20).toISOString()
  }));
}

function demoTransactions(customers: Customer[]): Transaction[] {
  const now = new Date();
  const transactions: Transaction[] = [];
  for (let monthOffset = 23; monthOffset >= 0; monthOffset -= 1) {
    for (let index = 0; index < 12 + ((23 - monthOffset) % 8); index += 1) {
      const customer = customers[(index * 7 + monthOffset * 3) % customers.length];
      const plan = planIds[(index + monthOffset * 2) % planIds.length];
      const price = plans.find(item => item.id === plan)?.price ?? 49;
      const ordinal = transactions.length + 1001;
      const day = 2 + ((index * 2 + 3) % 22);
      const proposed = new Date(now.getFullYear(), now.getMonth() - monthOffset, monthOffset === 0 ? Math.min(now.getDate(), day) : day, 10 + (index % 8));
      const stamp = proposed.getTime() > now.getTime() ? new Date(now.getTime() - 3600000 - index * 1000) : proposed;
      transactions.push({
        id: `NX-${ordinal}`,
        customerId: customer.id,
        plan,
        amount: price * (index % 7 === 0 ? 2 : 1),
        status: index % 17 === 0 ? 'Refunded' : index % 13 === 0 ? 'Pending' : index % 11 === 0 ? 'Failed' : 'Paid',
        issuedAt: stamp.toISOString(),
        method: index % 4 === 0 ? 'Bank transfer' : 'Card'
      });
    }
  }
  return transactions.reverse();
}

export const defaultPreferences: Preferences = {
  workspaceName: 'Acme Studio',
  ownerName: 'Alex Morgan',
  theme: 'light',
  language: 'en',
  compact: false,
  notifications: true,
  period: 12
};

export function createDemoWorkspace(): Workspace {
  const customers = demoCustomers();
  const transactions = demoTransactions(customers);
  const activity = transactions.slice(0, 12).map(transaction => ({
    id: `A-${transaction.id}`,
    title: transaction.status === 'Paid' ? 'Payment received' : 'Transaction updated',
    detail: `${transaction.id} · ${customers.find(item => item.id === transaction.customerId)?.company ?? 'Customer'}`,
    kind: 'transaction' as const,
    createdAt: transaction.issuedAt
  }));
  return { customers, transactions, activity, preferences: { ...defaultPreferences }, readNotificationIds: [] };
}
