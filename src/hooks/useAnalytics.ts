import { useEffect, useState } from 'react';

export function useOrdersAnalytics({ startDate, endDate }: { startDate?: string; endDate?: string } = {}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let url = '/api/orders/analytics';
    const params = [];
    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
    if (params.length) url += `?${params.join('&')}`;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return res.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  return { data, loading, error };
}

export function useProductsAnalytics({ startDate, endDate }: { startDate?: string; endDate?: string } = {}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let url = '/api/products/analytics';
    const params = [];
    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
    if (params.length) url += `?${params.join('&')}`;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return res.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  return { data, loading, error };
}

export function useHomeItemsAnalytics({ startDate, endDate }: { startDate?: string; endDate?: string } = {}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let url = '/api/home-items/analytics';
    const params = [];
    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
    if (params.length) url += `?${params.join('&')}`;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return res.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  return { data, loading, error };
}

export function useInternetAnalytics({ startDate, endDate }: { startDate?: string; endDate?: string } = {}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let url = '/api/internet/analytics';
    const params = [];
    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
    if (params.length) url += `?${params.join('&')}`;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return res.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  return { data, loading, error };
}

export function useAdvertsAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/admin/advertisements/analytics')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return res.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
