'use client'

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-b from-[#f58c55]/95 via-[#f47a45]/90 to-[#f58c55]/80 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Head>
        <title>Admin Login | Flamingo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      {/* Mobile: Full-screen centered form */}
      <div className="md:hidden w-full flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-white dark:text-gray-100 text-2xl sm:text-3xl font-bold mb-2">
              ADMIN
            </h1>
            <div className="w-20 h-1 bg-white/30 dark:bg-gray-400/30 mx-auto rounded-full"></div>
          </div>
          
          <form className="space-y-6 w-full bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm rounded-3xl p-6 border border-white/20 dark:border-gray-600/30" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-100/90 dark:bg-red-900/30 border border-red-200/50 dark:border-red-700/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-red-200/80 dark:bg-red-800/40 rounded-full">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Email Input - Icon on Right */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white dark:text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-4 pr-10 py-3 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 focus:border-[#f58c55]/40 dark:focus:border-[#f7a16b]/30 transition-all duration-300 text-sm"
                  placeholder="Enter your email"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9-9m4.5 7.5a2.5 2.5 0 01-5 0m0 0a2.5 2.5 0 115 0m-5 0a2.5 2.5 0 00-5 0m5 0V18a2 2 0 002 2h2m-6 0a2 2 0 100-4m0 4a2 2 0 110 4m0-4V5.5A2.5 2.5 0 016.5 3h0" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Input - Icon on Right */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white dark:text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-4 pr-20 py-3 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 focus:border-[#f58c55]/40 dark:focus:border-[#f7a16b]/30 transition-all duration-300 text-sm"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pr-3 pl-2 h-full flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  <div className="pr-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Button - Mobile */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold transition-all duration-300 ${
                  loading 
                    ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-70 text-gray-500 dark:text-gray-400' 
                    : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-[#f58c55]/25 hover:scale-[1.02] active:scale-[0.98] text-[#f58c55] dark:text-[#f7a16b]'
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#f58c55]/50 dark:border-[#f7a16b]/50 border-t-[#f58c55] dark:border-t-[#f7a16b] rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  'LOGIN'
                )}
              </button>
            </div>

            {/* Register Link - Mobile */}
            {/* <div className="text-center text-sm text-white/80 dark:text-gray-300 pt-4">
              Don&apos;t have an account?{' '}
              <Link 
                href="/admin/register" 
                className="font-semibold text-white/90 dark:text-[#f7a16b] hover:text-white dark:hover:text-[#f58c55] hover:underline transition-colors"
              >
                Register here
              </Link>
            </div> */}
          </form>
        </div>
      </div>

      {/* Desktop: Left panel with form (icons moved to right) */}
      <div className="hidden md:flex md:w-1/3 bg-gradient-to-b from-[#f58c55]/95 via-[#f47a45]/90 to-[#f58c55]/80 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center items-center p-6 md:p-10">
        <div className="w-full max-w-xs">
          <div className="text-center mb-8">
            <h1 className="text-white dark:text-gray-100 text-3xl font-bold mb-2">
              ADMIN
            </h1>
            <div className="w-20 h-1 bg-white/30 dark:bg-gray-400/30 mx-auto rounded-full"></div>
          </div>
          
          <form className="space-y-6 w-full" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-red-200 dark:bg-red-800/30 rounded-full">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Email Input - Icon on Right */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white dark:text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-4 pr-10 py-3 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 focus:border-[#f58c55]/40 dark:focus:border-[#f7a16b]/30 transition-all duration-300 sm:text-sm"
                  placeholder="Enter your email"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9-9m4.5 7.5a2.5 2.5 0 01-5 0m0 0a2.5 2.5 0 115 0m-5 0a2.5 2.5 0 00-5 0m5 0V18a2 2 0 002 2h2m-6 0a2 2 0 100-4m0 4a2 2 0 110 4m0-4V5.5A2.5 2.5 0 016.5 3h0" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Input - Icon on Right */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white dark:text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-4 pr-20 py-3 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 focus:border-[#f58c55]/40 dark:focus:border-[#f7a16b]/30 transition-all duration-300 sm:text-sm"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pr-3 pl-2 h-full flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  <div className="pr-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold transition-all duration-300 ${
                  loading 
                    ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-70 text-gray-500 dark:text-gray-400' 
                    : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-[#f58c55]/25 hover:scale-[1.02] active:scale-[0.98] text-[#f58c55] dark:text-[#f7a16b]'
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#f58c55]/50 dark:border-[#f7a16b]/50 border-t-[#f58c55] dark:border-t-[#f7a16b] rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  'LOGIN'
                )}
              </button>
            </div>

            <div className="text-center text-sm text-white/80 dark:text-gray-300 pt-4">
              Don&apos;t have an account?{' '}
              <Link 
                href="/admin/register" 
                className="font-semibold text-white/90 dark:text-[#f7a16b] hover:text-white dark:hover:text-[#f58c55] hover:underline transition-colors"
              >
                Register here
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Desktop: Right side with centralized content (unchanged) */}
      <div className="hidden md:flex md:w-2/3 flex-col justify-center items-center relative overflow-hidden bg-gray-50 dark:bg-gray-900 px-4">
        <img
          src="/assets/images/hero-section.jpg"
          alt="Flamingo Background"
          className="absolute inset-0 w-full h-full object-cover opacity-40 dark:opacity-20"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f58c55]/10 via-transparent to-transparent dark:from-gray-900/80 dark:via-gray-800/60 dark:to-gray-900/80"></div>
        
        {/* Centralized content */}
        <div className="text-center relative z-10 max-w-3xl w-full">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 dark:border-gray-700/50">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4 bg-gradient-to-r from-[#f58c55]/80 via-transparent to-[#f58c55]/80 dark:from-[#f7a16b]/70 bg-clip-text text-transparent">
              Welcome to Flamingo
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-600 dark:text-gray-200 mb-6">
              Your One-Stop Solution
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              Flamingo brings together dynamic branches, each dedicated to enhancing your lifestyle with delicious meals to essential household goods, seamless internet connectivity, and real estate services. We cater to all your needs.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="w-16 h-1 bg-gradient-to-r from-[#f58c55]/50 dark:from-[#f7a16b]/40 to-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}