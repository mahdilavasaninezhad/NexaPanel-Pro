export type Page = 'overview' | 'analytics' | 'customers' | 'transactions' | 'plans' | 'activity' | 'settings';
export type PlanId = 'starter' | 'growth' | 'scale' | 'enterprise';
export type CustomerStatus = 'Active' | 'Trial' | 'Inactive';
export type TransactionStatus = 'Paid' | 'Pending' | 'Refunded' | 'Failed';
export type Channel = 'Organic' | 'Direct' | 'Referral' | 'Social';
export type Period = 6 | 12;

export type Customer = {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: PlanId;
  status: CustomerStatus;
  channel: Channel;
  country: string;
  joinedAt: string;
};

export type Transaction = {
  id: string;
  customerId: string;
  plan: PlanId;
  amount: number;
  status: TransactionStatus;
  issuedAt: string;
  method: 'Card' | 'Bank transfer';
};

export type Activity = {
  id: string;
  title: string;
  detail: string;
  kind: 'customer' | 'transaction' | 'settings';
  createdAt: string;
};

export type Preferences = {
  workspaceName: string;
  ownerName: string;
  theme: 'light' | 'dark';
  language: 'en' | 'fa';
  compact: boolean;
  notifications: boolean;
  period: Period;
};

export type Workspace = {
  customers: Customer[];
  transactions: Transaction[];
  activity: Activity[];
  preferences: Preferences;
  readNotificationIds: string[];
};

export type CustomerInput = Omit<Customer, 'id' | 'joinedAt'>;
export type TransactionInput = Omit<Transaction, 'id' | 'issuedAt'>;
