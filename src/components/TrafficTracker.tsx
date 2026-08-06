'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BASEURL } from '@/config/api/contants';

const SESSION_TIMEOUT = 30 * 60 * 1000;

function createId() {
  return crypto.randomUUID();
}

function getVisitorId() {
  const existing = localStorage.getItem('flamingo_visitor_id');
  if (existing) return existing;
  const visitorId = createId();
  localStorage.setItem('flamingo_visitor_id', visitorId);
  return visitorId;
}

function getSessionId() {
  const now = Date.now();
  const stored = localStorage.getItem('flamingo_traffic_session');
  if (stored) {
    try {
      const session = JSON.parse(stored) as { id: string; lastActivity: number };
      if (session.id && now - session.lastActivity < SESSION_TIMEOUT) {
        localStorage.setItem('flamingo_traffic_session', JSON.stringify({ ...session, lastActivity: now }));
        return session.id;
      }
    } catch {
      localStorage.removeItem('flamingo_traffic_session');
    }
  }

  const id = createId();
  localStorage.setItem('flamingo_traffic_session', JSON.stringify({ id, lastActivity: now }));
  return id;
}

export default function TrafficTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname === '/admin' || pathname.startsWith('/admin/')) return;

    const eventKey = `${pathname}:${performance.timeOrigin}`;
    if (sessionStorage.getItem('flamingo_last_page_view') === eventKey) return;
    sessionStorage.setItem('flamingo_last_page_view', eventKey);

    fetch(`${BASEURL}/admin/analytics/traffic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: getVisitorId(), sessionId: getSessionId(), path: pathname }),
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
