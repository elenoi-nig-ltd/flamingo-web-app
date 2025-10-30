'use client'

import { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = 'Dashboard' }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) {
    router.push('/admin/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{title} | Flamingo Admin</title>
      </Head>

      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Flamingo Admin</h1>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/admin/dashboard">
                  <a className={`border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/admin/dashboard' ? 'border-blue-500' : 'border-transparent hover:border-gray-300 hover:text-gray-700'}`}>
                    Dashboard
                  </a>
                </Link>
                <Link href="/admin/products">
                  <a className={`border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/admin/products' ? 'border-blue-500' : 'border-transparent hover:border-gray-300 hover:text-gray-700'}`}>
                    Products
                  </a>
                </Link>
                <Link href="/admin/users">
                  <a className={`border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/admin/users' ? 'border-blue-500' : 'border-transparent hover:border-gray-300 hover:text-gray-700'}`}>
                    Users
                  </a>
                </Link>
              </nav>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
}