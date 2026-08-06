'use client';

import { useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarCheck,
  CalendarRange,
  DollarSign,
  Eye,
  Megaphone,
  Package,
  RefreshCw,
  ShieldAlert,
  ShoppingBag,
  TrendingUp,
  Users,
  Warehouse,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
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

type RangeKey = 'today' | '7d' | '30d' | '90d' | 'month' | 'custom';

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
  if (key !== 'month' && key !== 'custom' && key !== 'today') from.setUTCDate(from.getUTCDate() - Number(key.replace('d', '')) + 1);
  return { from: from.toISOString(), to: to.toISOString(), timezone: 'Africa/Lagos', granularity: key === '90d' ? 'week' : 'day' };
}

function endDateInput(to: string) {
  const date = new Date(to);
  const isExclusiveDayBoundary = date.getUTCHours() === 23 && date.getUTCMinutes() === 0;
  if (isExclusiveDayBoundary) date.setUTCDate(date.getUTCDate() - 1);
  return lagosDate(date);
}

function getCustomerInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'G';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getOrderStatusBadge(status: string) {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case 'delivered':
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400';
    case 'processing':
    case 'confirmed':
      return 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400';
    case 'shipped':
      return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400';
    case 'pending':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400';
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400';
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  }
}

const panelClass = 'rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900';

function MetricCard({
  label,
  value,
  note,
  icon,
  accent = 'orange',
  change,
}: {
  label: string;
  value: string;
  note: string;
  icon: ReactNode;
  accent?: 'orange' | 'green' | 'blue' | 'violet';
  change?: number | null;
}) {
  const colors = {
    orange: 'bg-orange-500/10 text-[#f47a45] dark:bg-orange-500/15 ring-1 ring-orange-500/20',
    green: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 ring-1 ring-emerald-500/20',
    blue: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400 ring-1 ring-sky-500/20',
    violet: 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400 ring-1 ring-violet-500/20',
  };

  return (
    <div className={`${panelClass} min-w-0`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="truncate text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {value}
            </span>
            {change !== undefined && change !== null && (
              <span
                className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium shrink-0 ${
                  change >= 0
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                }`}
              >
                {change >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 shrink-0" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 shrink-0" />
                )}
                {change >= 0 ? '+' : ''}
                {change.toFixed(1)}%
              </span>
            )}
          </div>
          <p className="mt-1.5 truncate text-xs text-slate-400 dark:text-slate-500">
            {note}
          </p>
        </div>
        <div className={`shrink-0 rounded-lg p-2.5 ${colors[accent]}`}>
          {icon}
        </div>
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
  payload?: ReadonlyArray<{ value?: number | string; name?: string; color?: string }>;
  label?: string | number;
  valueLabel?: string;
  currency?: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[130px] sm:min-w-[150px] rounded-xl border border-slate-200/80 bg-white/95 p-2.5 sm:p-3 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95 text-xs">
      <p className="font-medium text-slate-400">
        {formatPeriod(String(label ?? ''))}
      </p>
      {payload.map((entry, idx) => {
        const val = Number(entry.value ?? 0);
        const name = valueLabel || entry.name || 'Value';
        return (
          <div key={idx} className="mt-1 flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
              {entry.color && (
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
              )}
              <span className="truncate">{name}</span>
            </span>
            <span className="font-semibold text-slate-900 dark:text-white shrink-0">
              {currency ? money.format(val) : number.format(val)}
            </span>
          </div>
        );
      })}
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
    return (
      <div className="flex h-56 sm:h-64 items-center justify-center rounded-xl bg-slate-50/50 p-4 text-center text-xs font-medium text-slate-400 dark:bg-slate-800/30">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="h-60 sm:h-72 w-full" role="img" aria-label={`${currency ? 'Collected order revenue' : 'Order volume'} over the selected period`}>
      <ResponsiveContainer width="100%" height="100%">
        {currency ? (
          <AreaChart data={data} margin={{ top: 12, right: 4, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="collectedRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f47a45" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#f47a45" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/60" strokeOpacity={0.6} />
            <XAxis dataKey="period" tickFormatter={formatPeriod} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} minTickGap={20} />
            <YAxis tickFormatter={(value) => compactMoney.format(Number(value))} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={54} />
            <Tooltip content={<ChartTooltip valueLabel="Collected revenue" currency />} cursor={{ stroke: '#f47a45', strokeDasharray: '4 4', strokeWidth: 1 }} />
            <Area type="monotone" dataKey={valueKey} stroke="#f47a45" strokeWidth={2.5} fill="url(#collectedRevenueGradient)" activeDot={{ r: 5, fill: '#f47a45', stroke: '#ffffff', strokeWidth: 2 }} />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 12, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/60" strokeOpacity={0.6} />
            <XAxis dataKey="period" tickFormatter={formatPeriod} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} minTickGap={20} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={32} />
            <Tooltip content={<ChartTooltip valueLabel="Orders" />} cursor={{ fill: '#f47a45', opacity: 0.06 }} />
            <Bar dataKey={valueKey} fill="#f47a45" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function TrafficChart({ data }: { data: Array<{ period: string; uniqueVisitors: number; pageViews: number }> }) {
  if (!data.length) {
    return (
      <div className="flex h-56 sm:h-64 items-center justify-center rounded-xl bg-slate-50/50 p-4 text-center text-xs font-medium text-slate-400 dark:bg-slate-800/30">
        No visits recorded in this period
      </div>
    );
  }

  return (
    <div className="h-60 sm:h-72 w-full" role="img" aria-label="Site visitors and page views over the selected period">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="trafficViewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f47a45" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#f47a45" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="trafficVisitorsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/60" strokeOpacity={0.6} />
          <XAxis dataKey="period" tickFormatter={formatPeriod} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} minTickGap={20} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={32} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="pageViews" name="Page views" stroke="#f47a45" fill="url(#trafficViewsGradient)" strokeWidth={2} activeDot={{ r: 4 }} />
          <Area type="monotone" dataKey="uniqueVisitors" name="Unique visitors" stroke="#3b82f6" fill="url(#trafficVisitorsGradient)" strokeWidth={2} activeDot={{ r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatusChart({
  items,
  emptyMessage,
}: {
  items: Array<{ label: string; value: number; color: string }>;
  emptyMessage: string;
}) {
  const total = items.reduce((acc, item) => acc + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-48 sm:h-56 items-center justify-center rounded-xl bg-slate-50/50 p-4 text-center text-xs font-medium text-slate-400 dark:bg-slate-800/30">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 pt-1">
      {/* Combined Horizontal Progress Bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 dark:bg-slate-800">
        {items.map((item) => {
          if (item.value === 0) return null;
          const percentage = (item.value / total) * 100;
          return (
            <div
              key={item.label}
              style={{ width: `${percentage}%`, backgroundColor: item.color }}
              className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full hover:opacity-85"
              title={`${item.label}: ${item.value} (${percentage.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Individual status breakdown list */}
      <div className="space-y-2 sm:space-y-2.5">
        {items.map((item) => {
          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
          return (
            <div key={item.label} className="group flex items-center justify-between gap-2 text-xs">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="font-medium text-xs text-slate-900 dark:text-white">
                  {number.format(item.value)}
                </span>
                <span className="w-8 text-right text-[11px] text-slate-400">
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CatalogueStockCard({
  label,
  total,
  healthy,
  low,
  outOfStock,
}: {
  label: string;
  total: number;
  healthy: number;
  low: number;
  outOfStock: number;
}) {
  const states = [
    {
      label: 'Healthy Stock',
      value: healthy,
      color: 'bg-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-400',
    },
    {
      label: 'Low Stock',
      value: low,
      color: 'bg-amber-500',
      text: 'text-amber-700 dark:text-amber-400',
    },
    {
      label: 'Out of Stock',
      value: outOfStock,
      color: 'bg-rose-500',
      text: 'text-rose-700 dark:text-rose-400',
    },
  ];

  return (
    <section className={panelClass}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{label}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {number.format(total)} catalogue items
          </p>
        </div>
        <div className="shrink-0 rounded-lg bg-orange-500/10 p-2 text-[#f47a45] dark:bg-orange-500/15">
          <Package className="h-4 w-4" />
        </div>
      </div>

      <div className="mb-4 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        {states.map((st) => {
          if (st.value === 0 || total === 0) return null;
          const pct = (st.value / total) * 100;
          return (
            <div
              key={st.label}
              style={{ width: `${pct}%` }}
              className={`h-full ${st.color}`}
              title={`${st.label}: ${st.value}`}
            />
          );
        })}
      </div>

      <div className="space-y-2 sm:space-y-2.5">
        {states.map((state) => (
          <div key={state.label} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${state.color}`} />
              <span className={`truncate font-medium ${state.text}`}>{state.label}</span>
            </div>
            <span className="font-medium text-slate-900 dark:text-white shrink-0">
              {number.format(state.value)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function AnalyticsError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900/60 dark:bg-rose-950/40">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-200">Analytics could not be loaded</h3>
      <p className="mt-1.5 text-xs text-rose-700 dark:text-rose-400">{message}</p>
      <button
        onClick={retry}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-rose-700"
      >
        <RefreshCw className="h-3.5 w-3.5" /> Try again
      </button>
    </div>
  );
}

function DashboardContent({ operations, executive, isAdmin }: { operations: OperationsAnalytics; executive: ExecutiveAnalytics | null; isAdmin: boolean }) {
  const hasFinancialAnalytics = isAdmin && executive !== null;
  const traffic = operations.traffic ?? { uniqueVisitors: 0, sessions: 0, pageViews: 0, viewsPerSession: 0, series: [], topPages: [] };
  const catalogue = operations.catalogue ?? {
    food: { total: operations.inventory.catalogProductsOutOfStock, healthy: 0, low: 0, outOfStock: operations.inventory.catalogProductsOutOfStock },
    homeItems: { total: operations.inventory.catalogHomeItemsOutOfStock, healthy: 0, low: 0, outOfStock: operations.inventory.catalogHomeItemsOutOfStock },
  };
  const orderStatuses = [
    { label: 'Pending', value: operations.orders.pending, color: '#f59e0b' },
    { label: 'Processing', value: operations.orders.processing, color: '#0284c7' },
    { label: 'Shipped', value: operations.orders.shipped, color: '#6366f1' },
    { label: 'Delivered', value: operations.orders.delivered, color: '#10b981' },
    { label: 'Cancelled', value: operations.orders.cancelled, color: '#f43f5e' },
    { label: 'Expired', value: operations.orders.expired, color: '#64748b' },
  ];
  const bookingStatuses = [
    { label: 'Pending', value: operations.bookings.pending, color: '#f59e0b' },
    { label: 'Confirmed', value: operations.bookings.confirmed, color: '#0284c7' },
    { label: 'Completed', value: operations.bookings.completed, color: '#10b981' },
    { label: 'Cancelled', value: operations.bookings.cancelled, color: '#f43f5e' },
    { label: 'Expired', value: operations.bookings.expired, color: '#64748b' },
  ];
  const change = executive?.summary.revenueChangePercentage;

  return (
    <>
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {hasFinancialAnalytics ? (
          <MetricCard
            label="Collected revenue"
            value={money.format(executive.summary.collectedRevenue)}
            note={change === null ? 'No comparable prior-period revenue' : 'against the previous period'}
            change={change}
            icon={<DollarSign className="h-5 w-5" />}
            accent={change !== null && change < 0 ? 'orange' : 'green'}
          />
        ) : (
          <MetricCard
            label="Orders"
            value={number.format(operations.orders.total)}
            note="Created during this period"
            icon={<ShoppingBag className="h-5 w-5" />}
          />
        )}
        <MetricCard
          label={hasFinancialAnalytics ? 'Paid orders' : 'New users'}
          value={number.format(hasFinancialAnalytics ? executive.summary.paidOrderCount : operations.users.createdInPeriod)}
          note={hasFinancialAnalytics ? 'Provider-confirmed order payments' : 'Registered during this period'}
          icon={hasFinancialAnalytics ? <TrendingUp className="h-5 w-5" /> : <Users className="h-5 w-5" />}
          accent="blue"
        />
        <MetricCard
          label={hasFinancialAnalytics ? 'Average order value' : 'Open fulfillment'}
          value={hasFinancialAnalytics ? money.format(executive.summary.averageOrderValue) : number.format(operations.orders.pending + operations.orders.processing + operations.orders.shipped)}
          note={hasFinancialAnalytics ? 'Across paid orders' : 'Pending, processing, and shipped'}
          icon={<ShoppingBag className="h-5 w-5" />}
          accent="violet"
        />
        <MetricCard
          label="Stock risks"
          value={number.format(catalogue.food.low + catalogue.food.outOfStock + catalogue.homeItems.low + catalogue.homeItems.outOfStock)}
          note={`${number.format(catalogue.food.outOfStock + catalogue.homeItems.outOfStock)} unavailable catalogue items`}
          icon={<Warehouse className="h-5 w-5" />}
          accent="orange"
        />
      </div>

      {/* Site Traffic Section */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Site Traffic</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Public-page activity in the selected period</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Unique visitors" value={number.format(traffic.uniqueVisitors)} note="Distinct anonymous browsers" icon={<Users className="h-5 w-5" />} accent="blue" />
          <MetricCard label="Sessions" value={number.format(traffic.sessions)} note="30-minute activity windows" icon={<BarChart3 className="h-5 w-5" />} accent="violet" />
          <MetricCard label="Page views" value={number.format(traffic.pageViews)} note="Public pages viewed" icon={<Eye className="h-5 w-5" />} accent="orange" />
          <MetricCard label="Pages per visit" value={traffic.viewsPerSession.toFixed(2)} note="Avg. pages looked at per visit" icon={<BarChart3 className="h-5 w-5" />} accent="green" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-3">
          <section className={`${panelClass} xl:col-span-2 overflow-hidden`}>
            <div className="mb-3">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">Traffic Trend</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Unique visitors and page views by period</p>
            </div>
            <div className="overflow-hidden">
              <TrafficChart data={traffic.series} />
            </div>
          </section>
          <section className={panelClass}>
            <div className="mb-3 sm:mb-4">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">Top Pages</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Most viewed public routes</p>
            </div>
            <div className="space-y-2">
              {traffic.topPages.map((page, index) => (
                <div
                  key={page.path}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-0 dark:border-slate-800 text-xs"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="text-slate-400 shrink-0 tabular-nums w-4 text-right">{index + 1}</span>
                    <span className="truncate text-slate-700 dark:text-slate-300">
                      {page.path}
                    </span>
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white shrink-0">
                    {number.format(page.pageViews)}
                  </span>
                </div>
              ))}
              {!traffic.topPages.length && (
                <div className="flex h-40 sm:h-48 items-center justify-center text-xs text-slate-400">
                  No page views recorded
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      {/* Revenue & Order Pipeline Section */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-3">
        <section className={`${panelClass} xl:col-span-2 overflow-hidden`}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                {hasFinancialAnalytics ? 'Collected Order Revenue' : 'Order Volume'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {hasFinancialAnalytics ? 'Provider-confirmed order payments' : 'Orders created during the selected period'}
              </p>
            </div>
            <div className="rounded-lg bg-orange-500/10 p-2 text-[#f47a45] dark:bg-orange-500/15 shrink-0">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="overflow-hidden">
            <TimeSeriesChart
              data={(hasFinancialAnalytics ? executive.revenueSeries : operations.orders.series) as Array<Record<string, string | number>>}
              valueKey={hasFinancialAnalytics ? 'total' : 'count'}
              emptyMessage={`No ${hasFinancialAnalytics ? 'collected order revenue' : 'orders'} in this period`}
              currency={hasFinancialAnalytics}
            />
          </div>
        </section>
        <section className={panelClass}>
          <h2 className="mb-0.5 text-sm font-semibold text-slate-900 dark:text-white">Order Pipeline</h2>
          <p className="mb-3 sm:mb-4 text-xs text-slate-500 dark:text-slate-400">Status breakdown of all orders</p>
          <StatusChart items={orderStatuses} emptyMessage="No orders in this period" />
        </section>
      </div>

      {/* Bookings, Catalogue & Ad Panels Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <section className={panelClass}>
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Booking Pipeline</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{number.format(operations.bookings.total)} total bookings</p>
            </div>
            <div className="rounded-lg bg-sky-500/10 p-2 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400 shrink-0">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <StatusChart items={bookingStatuses} emptyMessage="No bookings in this period" />
        </section>
        <CatalogueStockCard label="Food Catalogue" {...catalogue.food} />
        <CatalogueStockCard label="Home Items Catalogue" {...catalogue.homeItems} />
        <section className={panelClass}>
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Advertisements</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Current cumulative ad engagement</p>
            </div>
            <div className="rounded-lg bg-violet-500/10 p-2 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400 shrink-0">
              <Megaphone className="h-4 w-4" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                {number.format(operations.advertisements.active)}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Active ads</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                {(operations.advertisements.clickThroughRate * 100).toFixed(2)}%
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Click-through rate</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="text-base font-semibold text-slate-900 dark:text-white truncate">
                {number.format(operations.advertisements.impressions)}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Impressions</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="text-base font-semibold text-slate-900 dark:text-white truncate">
                {number.format(operations.advertisements.clicks)}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Clicks</p>
            </div>
          </div>
        </section>
      </div>

      {/* Revenue Coverage Notice Banner */}
      {isAdmin && executive && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">Revenue Coverage Notice</h2>
              <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                The headline currently includes provider-confirmed order payments only. Booking, internet, and advertisement revenue are excluded until those payment records consistently store amount, currency, and immutable provider confirmation.
              </p>
              {executive.advertisements.paystackLabeledPaymentCount > 0 && (
                <p className="mt-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  {money.format(executive.advertisements.paystackLabeledRevenue)} across {executive.advertisements.paystackLabeledPaymentCount} Paystack-labeled ad payments is available for reconciliation but excluded from collected revenue.
                </p>
              )}
              {executive.advertisements.manuallyConfirmedPaymentCount > 0 && (
                <p className="mt-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  {money.format(executive.advertisements.manuallyConfirmedRevenue)} across {executive.advertisements.manuallyConfirmedPaymentCount} manually confirmed ad payments is also excluded.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Shopify-Caliber Recent Orders Table */}
      <section className={`${panelClass} overflow-hidden p-0`}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 sm:px-6 py-3 sm:py-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Orders</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Latest orders in the selected period</p>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {number.format(operations.orders.total)} total
          </span>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[650px] text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-4 sm:px-6 py-3 font-medium">Order</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Customer</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Payment</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Status</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {operations.orders.recent.map((order) => {
                const customerName = order.customerName || 'Guest Customer';
                const initials = getCustomerInitials(customerName);
                return (
                  <tr
                    key={order._id}
                    className="group text-slate-600 transition-colors duration-150 hover:bg-slate-50/50 dark:text-slate-300 dark:hover:bg-slate-800/30"
                  >
                    <td className="px-3 py-3 text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-3.5">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] sm:text-xs font-semibold text-slate-700 ring-1 ring-slate-200/60 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                          {initials}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white truncate max-w-[130px] sm:max-w-none">
                          {customerName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium ${
                          order.paymentConfirmed
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            order.paymentConfirmed ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        {order.paymentConfirmed ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${getOrderStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(order.orderDate).toLocaleDateString('en-NG', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                );
              })}
              {!operations.orders.recent.length && (
                <tr>
                  <td colSpan={5} className="px-4 sm:px-6 py-10 sm:py-12 text-center text-xs text-slate-400">
                    No orders recorded in this period
                  </td>
                </tr>
              )}
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
    <main className="min-h-screen overflow-x-hidden bg-slate-50/70 px-3 py-5 sm:px-6 sm:py-8 dark:bg-slate-950/80">
      <div className="mx-auto max-w-[1500px] space-y-4 sm:space-y-6">
        {/* Header Section */}
        <header className="flex flex-col justify-between gap-4 sm:gap-6 xl:flex-row xl:items-start">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Analytics
            </h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {isAdmin
                ? 'Revenue and operational metrics across Flamingo'
                : 'Operational metrics and activity across Flamingo'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full xl:w-auto">
            {/* Segmented Control */}
            <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800 overflow-x-auto scrollbar-none w-full sm:w-auto">
              {([
                ['today', 'Today'],
                ['7d', '7d'],
                ['30d', '30d'],
                ['90d', '90d'],
                ['month', 'Month'],
              ] as Array<[RangeKey, string]>).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => selectRange(key)}
                  className={`flex-1 min-w-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150 whitespace-nowrap ${
                    rangeKey === key
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={refresh}
              disabled={operations.loading || executive.loading}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-900 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white shrink-0"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  operations.loading || executive.loading ? 'animate-spin' : ''
                }`}
              />
              Refresh
            </button>
          </div>
        </header>

        {/* Date Selector Group */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 sm:px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 shrink-0">
              <CalendarRange className="h-3.5 w-3.5" />
              <span className="font-medium">Date range</span>
            </div>
            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-none">
              <input
                type="date"
                value={lagosDate(new Date(filters.from))}
                max={endDateInput(filters.to)}
                onChange={(event) => setCustomDate('from', event.target.value)}
                className="flex-1 min-w-0 sm:w-auto rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 focus:border-[#f47a45] focus:outline-none focus:ring-1 focus:ring-[#f47a45] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
              <span className="text-slate-300 dark:text-slate-600 shrink-0">–</span>
              <input
                type="date"
                value={endDateInput(filters.to)}
                min={lagosDate(new Date(filters.from))}
                max={lagosDate(new Date())}
                onChange={(event) => setCustomDate('to', event.target.value)}
                className="flex-1 min-w-0 sm:w-auto rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 focus:border-[#f47a45] focus:outline-none focus:ring-1 focus:ring-[#f47a45] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 self-end sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Updated {new Date(operations.data.period.generatedAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {executive.error && isAdmin && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
            Financial analytics are temporarily unavailable. Operational analytics remain current.{' '}
            <button onClick={executive.refetch} className="ml-1 font-semibold underline">
              Retry
            </button>
          </div>
        )}

        <DashboardContent operations={operations.data} executive={executive.data} isAdmin={isAdmin} />
      </div>
    </main>
  );
}


