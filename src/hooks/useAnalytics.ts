import { useEffect, useState } from 'react';
import { BASEURL } from '@/config/api/contants';
import { clearAuthSession, getAuthHeaders } from '@/utils/auth';

export type AnalyticsGranularity = 'day' | 'week' | 'month';

export interface AnalyticsFilters {
  from: string;
  to: string;
  timezone?: string;
  granularity?: AnalyticsGranularity;
}

interface AnalyticsPeriod {
  from: string;
  to: string;
  timezone: string;
  granularity: AnalyticsGranularity;
  generatedAt: string;
}

export interface RecentAnalyticsOrder {
  _id: string;
  customerName: string;
  status: string;
  paymentConfirmed: boolean;
  orderDate: string;
}

export interface OperationsAnalytics {
  period: AnalyticsPeriod;
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    expired: number;
    series: Array<{ period: string; count: number }>;
    recent: RecentAnalyticsOrder[];
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    expired: number;
  };
  inventory: {
    records: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    catalogProductsOutOfStock: number;
    catalogHomeItemsOutOfStock: number;
  };
  catalogue?: {
    food: { total: number; healthy: number; low: number; outOfStock: number };
    homeItems: { total: number; healthy: number; low: number; outOfStock: number };
  };
  advertisements: {
    total: number;
    pending: number;
    approved: number;
    active: number;
    paused: number;
    expired: number;
    rejected: number;
    impressions: number;
    clicks: number;
    clickThroughRate: number;
  };
  internet: {
    plans: number;
    vouchersAvailable: number;
    vouchersReserved: number;
    vouchersUsed: number;
  };
  users: {
    total: number;
    createdInPeriod: number;
    byRole: Record<'admin' | 'staff' | 'customer' | 'landlord', number>;
  };
  traffic?: {
    uniqueVisitors: number;
    sessions: number;
    pageViews: number;
    viewsPerSession: number;
    series: Array<{ period: string; uniqueVisitors: number; sessions: number; pageViews: number }>;
    topPages: Array<{ path: string; pageViews: number }>;
  };
}

export interface ExecutiveAnalytics {
  period: AnalyticsPeriod & { currency: 'NGN' };
  summary: {
    collectedRevenue: number;
    previousCollectedRevenue: number;
    revenueChangePercentage: number | null;
    paidOrderCount: number;
    previousPaidOrderCount: number;
    averageOrderValue: number;
  };
  revenueSeries: Array<{
    period: string;
    orders: number;
    advertisements: number;
    total: number;
  }>;
  advertisements: {
    paystackLabeledRevenue: number;
    paystackLabeledPaymentCount: number;
    manuallyConfirmedRevenue: number;
    manuallyConfirmedPaymentCount: number;
    includedInCollectedRevenue: false;
  };
  bookings: {
    paidCount: number;
    knownPaidAmount: number;
    unknownAmountCount: number;
    includedInCollectedRevenue: false;
  };
  dataQuality: {
    partialRefundsSupported: false;
    bookingRevenueIncluded: false;
    internetRevenueIncluded: false;
    warnings: string[];
  };
}

interface AnalyticsState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useAnalyticsRequest<T>(
  endpoint: 'operations' | 'executive',
  filters: AnalyticsFilters,
  enabled = true,
) {
  const [state, setState] = useState<AnalyticsState<T>>({ data: null, loading: enabled, error: null });
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      from: filters.from,
      to: filters.to,
      timezone: filters.timezone ?? 'Africa/Lagos',
      granularity: filters.granularity ?? 'day',
      _t: Date.now().toString(),
    });

    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetch(`${BASEURL}/admin/analytics/${endpoint}?${params}`, {
      cache: 'no-store',
      headers: getAuthHeaders(),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 401) {
          clearAuthSession();
          window.location.assign('/admin/login');
          throw new Error('Your session has expired. Please sign in again.');
        }
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          const message = Array.isArray(payload?.message) ? payload.message.join(', ') : payload?.message;
          throw new Error(message || `Unable to load ${endpoint} analytics`);
        }
        return response.json() as Promise<T>;
      })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error: Error) => {
        if (error.name !== 'AbortError') {
          setState((prev) => ({ ...prev, loading: false, error: error.message }));
        }
      });

    return () => controller.abort();
  }, [enabled, endpoint, filters.from, filters.to, filters.timezone, filters.granularity, requestVersion]);

  return { ...state, refetch: () => setRequestVersion((version) => version + 1) };
}

export function useOperationsAnalytics(filters: AnalyticsFilters, enabled = true) {
  return useAnalyticsRequest<OperationsAnalytics>('operations', filters, enabled);
}

export function useExecutiveAnalytics(filters: AnalyticsFilters, enabled = true) {
  return useAnalyticsRequest<ExecutiveAnalytics>('executive', filters, enabled);
}
