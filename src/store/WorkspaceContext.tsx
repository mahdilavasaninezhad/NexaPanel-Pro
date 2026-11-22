import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useReducer, type ReactNode } from 'react';
import { createDemoWorkspace } from '../data/demo';
import type { Activity, Customer, CustomerInput, Preferences, Transaction, TransactionInput, TransactionStatus, Workspace } from '../types';

type Action =
  | { type: 'customer/add'; customer: Customer; activity: Activity }
  | { type: 'customer/update'; customer: Customer; activity: Activity }
  | { type: 'transaction/add'; transaction: Transaction; activity: Activity }
  | { type: 'transaction/status'; id: string; status: TransactionStatus; activity: Activity }
  | { type: 'preferences/update'; preferences: Partial<Preferences>; activity?: Activity }
  | { type: 'notifications/read'; ids: string[] }
  | { type: 'reset'; workspace: Workspace };

type WorkspaceContextValue = {
  data: Workspace;
  addCustomer: (input: CustomerInput) => void;
  updateCustomer: (customer: Customer) => void;
  addTransaction: (input: TransactionInput) => void;
  setTransactionStatus: (id: string, status: TransactionStatus) => void;
  updatePreferences: (preferences: Partial<Preferences>) => void;
  markNotificationsRead: (ids: string[]) => void;
  reset: () => void;
};

const storageKey = 'nexapanel-pro-workspace-v2';
const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function createActivity(title: string, detail: string, kind: Activity['kind']): Activity {
  return { id: crypto.randomUUID(), title, detail, kind, createdAt: new Date().toISOString() };
}

function reducer(state: Workspace, action: Action): Workspace {
  if (action.type === 'customer/add') {
    return { ...state, customers: [action.customer, ...state.customers], activity: [action.activity, ...state.activity] };
  }
  if (action.type === 'customer/update') {
    return { ...state, customers: state.customers.map(item => item.id === action.customer.id ? action.customer : item), activity: [action.activity, ...state.activity] };
  }
  if (action.type === 'transaction/add') {
    return { ...state, transactions: [action.transaction, ...state.transactions], activity: [action.activity, ...state.activity] };
  }
  if (action.type === 'transaction/status') {
    const target = state.transactions.find(item => item.id === action.id);
    if (!target || target.status === action.status) return state;
    return { ...state, transactions: state.transactions.map(item => item.id === action.id ? { ...item, status: action.status } : item), activity: [action.activity, ...state.activity] };
  }
  if (action.type === 'preferences/update') {
    return { ...state, preferences: { ...state.preferences, ...action.preferences }, activity: action.activity ? [action.activity, ...state.activity] : state.activity };
  }
  if (action.type === 'notifications/read') {
    return { ...state, readNotificationIds: [...new Set([...state.readNotificationIds, ...action.ids])] };
  }
  if (action.type === 'reset') return action.workspace;
  return state;
}

function initialState(): Workspace {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        const state = parsed as Workspace;
        if (Array.isArray(state.customers) && Array.isArray(state.transactions) && Array.isArray(state.activity) && Array.isArray(state.readNotificationIds) && state.preferences && typeof state.preferences.workspaceName === 'string') return state;
      }
    }
  } catch {
    return createDemoWorkspace();
  }
  return createDemoWorkspace();
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, initialState);
  useEffect(() => {
    try { window.localStorage.setItem(storageKey, JSON.stringify(data)); } catch { return; }
  }, [data]);
  useLayoutEffect(() => { document.documentElement.dataset.theme = data.preferences.theme; }, [data.preferences.theme]);
  useLayoutEffect(() => { document.documentElement.lang = data.preferences.language === 'fa' ? 'fa' : 'en'; document.documentElement.dir = data.preferences.language === 'fa' ? 'rtl' : 'ltr'; }, [data.preferences.language]);
  const value = useMemo<WorkspaceContextValue>(() => ({
    data,
    addCustomer: input => {
      const customer: Customer = { ...input, id: `CUS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, joinedAt: new Date().toISOString() };
      dispatch({ type: 'customer/add', customer, activity: createActivity('New customer added', `${customer.name} · ${customer.company}`, 'customer') });
    },
    updateCustomer: customer => dispatch({ type: 'customer/update', customer, activity: createActivity('Customer profile updated', `${customer.name} · ${customer.company}`, 'customer') }),
    addTransaction: input => {
      const transaction: Transaction = { ...input, id: `NX-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, issuedAt: new Date().toISOString() };
      const customer = data.customers.find(item => item.id === transaction.customerId);
      dispatch({ type: 'transaction/add', transaction, activity: createActivity('Transaction created', `${transaction.id} · ${customer?.company ?? 'Unknown customer'}`, 'transaction') });
    },
    setTransactionStatus: (id, status) => {
      const current = data.transactions.find(item => item.id === id);
      if (!current || current.status === status) return;
      dispatch({ type: 'transaction/status', id, status, activity: createActivity('Transaction status changed', `${id} · ${current.status} → ${status}`, 'transaction') });
    },
    updatePreferences: preferences => {
      const current = data.preferences as unknown as Record<string, unknown>;
      const visibleChange = Object.entries(preferences).some(([key, value]) => key !== 'period' && current[key] !== value);
      dispatch({ type: 'preferences/update', preferences, activity: visibleChange ? createActivity('Workspace preferences updated', 'Display and workspace settings changed', 'settings') : undefined });
    },
    markNotificationsRead: ids => dispatch({ type: 'notifications/read', ids }),
    reset: () => dispatch({ type: 'reset', workspace: createDemoWorkspace() })
  }), [data]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('WorkspaceProvider is required');
  return context;
}
