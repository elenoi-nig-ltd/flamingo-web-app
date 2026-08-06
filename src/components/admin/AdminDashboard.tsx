'use client';

import { useState, type ReactNode } from 'react';
import {
  FaArrowDown,
  FaArrowUp,
  FaBullhorn,
  FaCalendarCheck,
  FaChartLine,
  FaExclamationTriangle,
  FaShoppingBag,
  FaSyncAlt,
  FaUsers,
  FaWarehouse,
} from 'react-icons/fa';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import {
  AnalyticsFilters,
  ExecutiveAnalytics,
  OperationsAnalytics,
  useExecutiveAnalytics,
  useOperationsAnalytics,
} from '@/hooks/useAnalytics';
import { DashboardSkeleton } from '../ui/SkeletonLoader';

type RangeKey = '7d' | '30d' | '90d' | 'month' | 'custom';

const money = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat('en-NG');

const compactMoney = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  notation: 'compact',
  maximumFractionDigits: 1,
});

function lagosDate(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function lagosDayStart(date: string) {
  return new Date(`${date}T00:00:00+01:00`);
}

function getRange(key: RangeKey): AnalyticsFilters {
  const to = new Date();
  const today = lagosDate(to);
  const from = lagosDayStart(key === 'month' ? `${today.slice(0, 8)}01` : today);
  if (key !== 'month' && key !== 'custom') from.setUTCDate(from.getUTCDate() - Number(key.replace('d', '')) + 1);
  return { from: from.toISOString(), to: to.toISOString(), timezone: 'Africa/Lagos', granularity: key === '90d' ? 'week' : 'day' };
}

function endDateInput(to: string) {
  const date = new Date(to);
  const isExclusiveDayBoundary = date.getUTCHours() === 23 && date.getUTCMinutes() === 0;
  if (isExclusiveDayBoundary) date.setUTCDate(date.getUTCDate() - 1);
  return lagosDate(date);
}

const panelClass = 'rounded-2xl border border-gray-200/70 bg-white/95 p-5 shadow-sm dark:border-gray-700/70 dark:bg-gray-800/95';

function MetricCard({
  label,
  value,
  note,
  icon,
  accent = 'orange',
}: {
  label: string;
  value: string;
  note: string;
  icon: ReactNode;
  accent?: 'orange' | 'green' | 'blue' | 'violet';
}) {
  const colors = {
    orange: 'bg-orange-50 text-[#f47a45] dark:bg-orange-950/40',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40',
  };
  return (
    <div className={`${panelClass} min-w-0`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{note}</p>
        </div>
        <span className={`rounded-xl p-3 text-xl ${colors[accent]}`}>{icon}</span>
      </div>
    </div>
  );
}

function formatPeriod(period: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    return new Date(`${period}T00:00:00+01:00`).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      timeZone: 'Africa/Lagos',
    });
  }
  return period.replace('-W', ' W');
}

function ChartTooltip({
  active,
  payload,
  label,
  valueLabel,
  currency = false,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number | string }>;
  label?: string | number;
  valueLabel: string;
  currency?: boolean;
}) {
  if (!active || !payload?.length) return null;
  const value = Number(payload[0]?.value ?? 0);
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{formatPeriod(String(label ?? ''))}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
        {valueLabel}: {currency ? money.format(value) : number.format(value)}
      </p>
    </div>
  );
}

function TimeSeriesChart({
  data,
  valueKey,
  emptyMessage,
  currency = false,
}: {
  data: Array<Record<string, string | number>>;
  valueKey: string;
  emptyMessage: string;
  currency?: boolean;
}) {
  const values = data.map((point) => Number(point[valueKey] ?? 0));
  const max = Math.max(...values, 0);
  if (!data.length || max === 0) {
    return <div className="flex h-64 items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">{emptyMessage}</div>;
  }

  return (
    <div className="h-72 w-full" role="img" aria-label={`${currency ? 'Collected order revenue' : 'Order volume'} over the selected period`}>
      <ResponsiveContainer width="100%" height="100%">
        {currency ? (
          <AreaChart data={data} margin={{ top: 12, right: 8, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="collectedRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f47a45" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f47a45" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d1d5db" opacity={0.45} />
            <XAxis dataKey="period" tickFormatter={formatPeriod} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} minTickGap={24} />
            <YAxis tickFormatter={(value) => compactMoney.format(Number(value))} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} width={66} />
            <Tooltip content={<ChartTooltip valueLabel="Collected order revenue" currency />} cursor={{ stroke: '#f47a45', strokeDasharray: '4 4' }} />
            <Area type="monotone" dataKey={valueKey} stroke="#f47a45" strokeWidth={3} fill="url(#collectedRevenueGradient)" activeDot={{ r: 5, fill: '#f47a45', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d1d5db" opacity={0.45} />
            <XAxis dataKey="period" tickFormatter={formatPeriod} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} minTickGap={24} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} width={34} />
            <Tooltip content={<ChartTooltip valueLabel="Orders" />} cursor={{ fill: '#f47a45', opacity: 0.08 }} />
            <Bar dataKey={valueKey} fill="#f47a45" radius={[6, 6, 0, 0]} maxBarSize={42} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function StatusChart({ items, emptyMessage }: { items: Array<{ label: string; value: number; color: string }>; emptyMessage: string }) {
  if (!items.some((item) => item.value > 0)) {
    return <div className="flex h-64 items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">{emptyMessage}</div>;
  }
  return (
    <div className="h-64 w-full" role="img" aria-label="Status distribution">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={items} layout="vertical" margin={{ top: 0, right: 22, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#d1d5db" opacity={0.4} />
          <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
          <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} width={76} />
          <Tooltip content={<ChartTooltip valueLabel="Count" />} cursor={{ fill: '#f47a45', opacity: 0.06 }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={18}>
            {items.map((item) => <Cell key={item.label} fill={item.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function InventoryChart({ inStock, lowStock, outOfStock }: { inStock: number; lowStock: number; outOfStock: number }) {
  const data = [
    { name: 'In stock', value: inStock, color: '#10b981' },
    { name: 'Low stock', value: lowStock, color: '#f59e0b' },
    { name: 'Out of stock', value: outOfStock, color: '#ef4444' },
  ];
  const total = inStock + lowStock + outOfStock;
  if (total === 0) {
    return <div className="flex h-52 items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">No inventory records</div>;
  }
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
      <div className="relative h-52 min-w-0" role="img" aria-label="Inventory health distribution">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="58%" outerRadius="82%" paddingAngle={3} stroke="none">
              {data.map((item) => <Cell key={item.name} fill={item.color} />)}
            </Pie>
            <Tooltip content={<ChartTooltip valueLabel="Records" />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{number.format(total)}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">records</span>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-gray-500 dark:text-gray-400">{item.name}</span>
            <span className="ml-auto font-semibold text-gray-900 dark:text-white">{number.format(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="m-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/60 dark:bg-red-950/30">
      <FaExclamationTriangle className="mx-auto mb-3 text-2xl text-red-500" />
      <p className="font-semibold text-red-800 dark:text-red-300">Analytics could not be loaded</p>
      <p className="mt-1 text-sm text-red-700 dark:text-red-400">{message}</p>
      <button onClick={retry} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Try again</button>
    </div>
  );
}

function DashboardContent({ operations, executive, isAdmin }: { operations: OperationsAnalytics; executive: ExecutiveAnalytics | null; isAdmin: boolean }) {
  const hasFinancialAnalytics = isAdmin && executive !== null;
  const orderStatuses = [
    { label: 'Pending', value: operations.orders.pending, color: '#f59e0b' },
    { label: 'Processing', value: operations.orders.processing, color: '#3b82f6' },
    { label: 'Shipped', value: operations.orders.shipped, color: '#8b5cf6' },
    { label: 'Delivered', value: operations.orders.delivered, color: '#10b981' },
    { label: 'Cancelled', value: operations.orders.cancelled, color: '#ef4444' },
    { label: 'Expired', value: operations.orders.expired, color: '#6b7280' },
  ];
  const bookingStatuses = [
    { label: 'Pending', value: operations.bookings.pending, color: '#f59e0b' },
    { label: 'Confirmed', value: operations.bookings.confirmed, color: '#3b82f6' },
    { label: 'Completed', value: operations.bookings.completed, color: '#10b981' },
    { label: 'Cancelled', value: operations.bookings.cancelled, color: '#ef4444' },
    { label: 'Expired', value: operations.bookings.expired, color: '#6b7280' },
  ];
  const change = executive?.summary.revenueChangePercentage;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {hasFinancialAnalytics ? (
          <MetricCard label="Collected revenue" value={money.format(executive.summary.collectedRevenue)} note={change === null ? 'No comparable prior-period revenue' : `${change >= 0 ? '+' : ''}${change.toFixed(1)}% against the previous period`} icon={change !== null && change < 0 ? <FaArrowDown /> : <FaArrowUp />} accent={change !== null && change < 0 ? 'orange' : 'green'} />
        ) : (
          <MetricCard label="Orders" value={number.format(operations.orders.total)} note="Created during this period" icon={<FaShoppingBag />} />
        )}
        <MetricCard label={hasFinancialAnalytics ? 'Paid orders' : 'New users'} value={number.format(hasFinancialAnalytics ? executive.summary.paidOrderCount : operations.users.createdInPeriod)} note={hasFinancialAnalytics ? 'Provider-confirmed order payments' : 'Registered during this period'} icon={hasFinancialAnalytics ? <FaChartLine /> : <FaUsers />} accent="blue" />
        <MetricCard label={hasFinancialAnalytics ? 'Average order value' : 'Open fulfillment'} value={hasFinancialAnalytics ? money.format(executive.summary.averageOrderValue) : number.format(operations.orders.pending + operations.orders.processing + operations.orders.shipped)} note={hasFinancialAnalytics ? 'Across paid orders' : 'Pending, processing, and shipped'} icon={<FaShoppingBag />} accent="violet" />
        <MetricCard label="Stock risks" value={number.format(operations.inventory.lowStock + operations.inventory.outOfStock)} note={`${number.format(operations.inventory.catalogProductsOutOfStock + operations.inventory.catalogHomeItemsOutOfStock)} unavailable catalogue items`} icon={<FaWarehouse />} accent="orange" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <section className={`${panelClass} xl:col-span-2`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{hasFinancialAnalytics ? 'Collected order revenue' : 'Order volume'}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{hasFinancialAnalytics ? 'Provider-confirmed order payments' : 'Orders created during the selected period'}</p>
            </div>
            <FaChartLine className="text-[#f47a45]" />
          </div>
          <TimeSeriesChart data={(hasFinancialAnalytics ? executive.revenueSeries : operations.orders.series) as Array<Record<string, string | number>>} valueKey={hasFinancialAnalytics ? 'total' : 'count'} emptyMessage={`No ${hasFinancialAnalytics ? 'collected order revenue' : 'orders'} in this period`} currency={hasFinancialAnalytics} />
        </section>
        <section className={panelClass}>
          <h2 className="mb-1 font-semibold text-gray-900 dark:text-white">Order pipeline</h2>
          <p className="mb-5 text-xs text-gray-500 dark:text-gray-400">Current status of orders created in the period</p>
          <StatusChart items={orderStatuses} emptyMessage="No orders in this period" />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <section className={panelClass}>
          <div className="mb-5 flex items-center justify-between">
            <div><h2 className="font-semibold text-gray-900 dark:text-white">Booking pipeline</h2><p className="text-xs text-gray-500 dark:text-gray-400">{number.format(operations.bookings.total)} bookings in period</p></div>
            <FaCalendarCheck className="text-blue-500" />
          </div>
          <StatusChart items={bookingStatuses} emptyMessage="No bookings in this period" />
        </section>
        <section className={panelClass}>
          <div className="mb-5 flex items-center justify-between">
            <div><h2 className="font-semibold text-gray-900 dark:text-white">Inventory health</h2><p className="text-xs text-gray-500 dark:text-gray-400">Current inventory snapshot</p></div>
            <FaWarehouse className="text-amber-500" />
          </div>
          <InventoryChart inStock={operations.inventory.inStock} lowStock={operations.inventory.lowStock} outOfStock={operations.inventory.outOfStock} />
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">Catalogue availability is tracked separately: {number.format(operations.inventory.catalogProductsOutOfStock)} food products and {number.format(operations.inventory.catalogHomeItemsOutOfStock)} home items are unavailable or out of stock.</p>
        </section>
        <section className={panelClass}>
          <div className="mb-5 flex items-center justify-between">
            <div><h2 className="font-semibold text-gray-900 dark:text-white">Advertisements</h2><p className="text-xs text-gray-500 dark:text-gray-400">Current cumulative engagement</p></div>
            <FaBullhorn className="text-violet-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900/50"><p className="text-xl font-bold text-gray-900 dark:text-white">{number.format(operations.advertisements.active)}</p><p className="text-xs text-gray-500">Active ads</p></div>
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900/50"><p className="text-xl font-bold text-gray-900 dark:text-white">{(operations.advertisements.clickThroughRate * 100).toFixed(2)}%</p><p className="text-xs text-gray-500">Click-through rate</p></div>
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900/50"><p className="text-lg font-bold text-gray-900 dark:text-white">{number.format(operations.advertisements.impressions)}</p><p className="text-xs text-gray-500">Impressions</p></div>
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900/50"><p className="text-lg font-bold text-gray-900 dark:text-white">{number.format(operations.advertisements.clicks)}</p><p className="text-xs text-gray-500">Clicks</p></div>
          </div>
        </section>
      </div>

      {isAdmin && executive && (
        <section className={`${panelClass} border-amber-200 dark:border-amber-900/60`}>
          <div className="flex gap-3"><FaExclamationTriangle className="mt-0.5 shrink-0 text-amber-500" /><div><h2 className="font-semibold text-gray-900 dark:text-white">Revenue coverage</h2><p className="mt-1 text-sm text-gray-600 dark:text-gray-300">The headline currently includes provider-confirmed order payments only. Booking, internet, and advertisement revenue are excluded until those payment records consistently store amount, currency, and immutable provider confirmation.</p>{executive.advertisements.paystackLabeledPaymentCount > 0 && <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">{money.format(executive.advertisements.paystackLabeledRevenue)} across {executive.advertisements.paystackLabeledPaymentCount} Paystack-labeled ad payments is available for reconciliation but excluded from collected revenue.</p>}{executive.advertisements.manuallyConfirmedPaymentCount > 0 && <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">{money.format(executive.advertisements.manuallyConfirmedRevenue)} across {executive.advertisements.manuallyConfirmedPaymentCount} manually confirmed ad payments is also excluded.</p>}</div></div>
        </section>
      )}

      <section className={`${panelClass} overflow-hidden p-0`}>
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700"><div><h2 className="font-semibold text-gray-900 dark:text-white">Recent orders</h2><p className="text-xs text-gray-500 dark:text-gray-400">Latest orders in the selected period</p></div><span className="text-sm font-semibold text-[#f47a45]">{number.format(operations.orders.total)} total</span></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900/50 dark:text-gray-400"><tr><th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Payment</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Date</th></tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {operations.orders.recent.map((order) => <tr key={order._id} className="text-gray-600 dark:text-gray-300"><td className="px-5 py-3 font-medium text-gray-900 dark:text-white">#{order._id.slice(-6).toUpperCase()}</td><td className="px-5 py-3">{order.customerName || 'Guest'}</td><td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${order.paymentConfirmed ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}`}>{order.paymentConfirmed ? 'Paid' : 'Unpaid'}</span></td><td className="px-5 py-3 capitalize">{order.status}</td><td className="px-5 py-3">{new Date(order.orderDate).toLocaleDateString('en-NG')}</td></tr>)}
              {!operations.orders.recent.length && <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-500">No orders in this period</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [rangeKey, setRangeKey] = useState<RangeKey>('30d');
  const [filters, setFilters] = useState<AnalyticsFilters>(() => getRange('30d'));
  const operations = useOperationsAnalytics(filters, Boolean(user));
  const executive = useExecutiveAnalytics(filters, isAdmin);

  const selectRange = (key: RangeKey) => {
    setRangeKey(key);
    setFilters(getRange(key));
  };
  const setCustomDate = (field: 'from' | 'to', value: string) => {
    if (!value) return;
    setRangeKey('custom');
    const date = lagosDayStart(value);
    if (field === 'to') date.setUTCDate(date.getUTCDate() + 1);
    setFilters((current) => ({ ...current, [field]: date.toISOString() }));
  };
  const refresh = () => {
    operations.refetch();
    if (isAdmin) executive.refetch();
  };

  if (authLoading || (operations.loading && !operations.data) || (isAdmin && executive.loading && !executive.data)) return <DashboardSkeleton />;
  if (operations.error && !operations.data) return <AnalyticsError message={operations.error} retry={operations.refetch} />;
  if (!operations.data) return null;

  return (
    <main className="min-h-screen bg-gray-50/70 px-4 py-6 dark:bg-gray-900/60 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#f47a45]">Business intelligence</p><h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Performance overview</h1><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{isAdmin ? 'Collected revenue and operational health across Flamingo.' : 'Operational health and activity across Flamingo.'}</p></div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">{([['7d', '7 days'], ['30d', '30 days'], ['90d', '90 days'], ['month', 'This month']] as Array<[RangeKey, string]>).map(([key, label]) => <button key={key} onClick={() => selectRange(key)} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${rangeKey === key ? 'bg-[#f47a45] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>{label}</button>)}</div>
            <button onClick={refresh} disabled={operations.loading || executive.loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-[#f47a45] hover:text-[#f47a45] disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"><FaSyncAlt className={operations.loading || executive.loading ? 'animate-spin' : ''} /> Refresh</button>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200/70 bg-white/80 px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-800/80"><span className="font-medium text-gray-600 dark:text-gray-300">Custom dates</span><input type="date" value={lagosDate(new Date(filters.from))} max={endDateInput(filters.to)} onChange={(event) => setCustomDate('from', event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200" /><span className="text-gray-400">to</span><input type="date" value={endDateInput(filters.to)} min={lagosDate(new Date(filters.from))} max={lagosDate(new Date())} onChange={(event) => setCustomDate('to', event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200" /><span className="ml-auto text-xs text-gray-400">Updated {new Date(operations.data.period.generatedAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</span></div>

        {executive.error && isAdmin && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">Financial analytics are temporarily unavailable. Operational analytics remain current. <button onClick={executive.refetch} className="ml-1 font-semibold underline">Retry</button></div>}
        <DashboardContent operations={operations.data} executive={executive.data} isAdmin={isAdmin} />
      </div>
    </main>
  );
}
