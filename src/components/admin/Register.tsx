'use client'

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';

export default function AdminRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('staff');
  const { register, loading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    await register(name, email, password, role);
  };

  return (
    <div className="min-h-screen mt-20 flex flex-col md:flex-row bg-gradient-to-b from-[#f58c55]/95 via-[#f47a45]/90 to-[#f58c55]/80 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Head>
        <title>Admin Registration | Flamingo</title>
      </Head>
      
      {/* Mobile: Full-screen centered form */}
      <div className="md:hidden w-full flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-white dark:text-gray-100 text-2xl sm:text-3xl font-bold mb-2">
              REGISTER
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

            {/* Name Input - Icons on Right */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-white dark:text-gray-200 mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full pl-4 pr-10 py-3 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 focus:border-[#f58c55]/40 dark:focus:border-[#f7a16b]/30 transition-all duration-300 text-sm"
                  placeholder="Enter your full name"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Email Input - Icons on Right */}
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

            {/* Password Input - Icons on Right */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white dark:text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-4 pr-10 py-3 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 focus:border-[#f58c55]/40 dark:focus:border-[#f7a16b]/30 transition-all duration-300 text-sm"
                  placeholder="Create a password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Confirm Password Input - Icons on Right */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white dark:text-gray-200 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full pl-4 pr-10 py-3 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 focus:border-[#f58c55]/40 dark:focus:border-[#f7a16b]/30 transition-all duration-300 text-sm"
                  placeholder="Confirm your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Role Select - Dropdown arrow on Right */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-white dark:text-gray-200 mb-2">
                Role
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 focus:border-[#f58c55]/40 dark:focus:border-[#f7a16b]/30 transition-all duration-300 text-sm pr-10"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Register Button - Mobile */}
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
                    Registering...
                  </div>
                ) : (
                  'REGISTER'
                )}
              </button>
            </div>

            {/* Login Link - Mobile */}
            <div className="text-center text-sm text-white/80 dark:text-gray-300 pt-4">
              Already have an account?{' '}
              <Link 
                href="/admin/login" 
                className="font-semibold text-white/90 dark:text-[#f7a16b] hover:text-white dark:hover:text-[#f58c55] hover:underline transition-colors"
              >
                Login here
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Desktop: Form section (icons moved to right) */}
      <div className="hidden md:flex md:w-1/3 bg-gradient-to-b from-[#f58c55]/95 via-[#f47a45]/90 to-[#f58c55]/80 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center items-center p-6 sm:p-8 md:p-10">
        <div className="w-full max-w-xs sm:max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-white dark:text-gray-100 text-3xl sm:text-4xl font-bold mb-2">
              REGISTER
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

            {/* Desktop form fields - Icons on Right */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-white dark:text-gray-200 mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full pl-4 pr-10 py-3 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 focus:border-[#f58c55]/40 dark:focus:border-[#f7a16b]/30 transition-all duration-300 text-sm sm:text-base"
                  placeholder="Enter your full name"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

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
                  className="appearance-none block w-full pl-4 pr-10 py-3 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 focus:border-[#f58c55]/40 dark:focus:border-[#f7a16b]/30 transition-all duration-300 text-sm sm:text-base"
                  placeholder="Enter your email"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9-9m4.5 7.5a2.5 2.5 0 01-5 0m0 0a2.5 2.5 0 115 0m-5 0a2.5 2.5 0 00-5 0m5 0V18a2 2 0 002 2h2m-6 0a2 2 0 100-4m0 4a2 2 0 110 4m0-4V5.5A2.5 2.5 0 016.5 3h0" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white dark:text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-4 pr-10 py-3 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 focus:border-[#f58c55]/40 dark:focus:border-[#f7a16b]/30 transition-all duration-300 text-sm sm:text-base"
                  placeholder="Create a password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white dark:text-gray-200 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full pl-4 pr-10 py-3 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 focus:border-[#f58c55]/40 dark:focus:border-[#f7a16b]/30 transition-all duration-300 text-sm sm:text-base"
                  placeholder="Confirm your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-white dark:text-gray-200 mb-2">
                Role
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 focus:border-[#f58c55]/40 dark:focus:border-[#f7a16b]/30 transition-all duration-300 text-sm sm:text-base pr-10"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
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
                    Registering...
                  </div>
                ) : (
                  'REGISTER'
                )}
              </button>
            </div>

            <div className="text-center text-sm text-white/80 dark:text-gray-300 pt-4">
              Already have an account?{' '}
              <Link 
                href="/admin/login" 
                className="font-semibold text-white/90 dark:text-[#f7a16b] hover:text-white dark:hover:text-[#f58c55] hover:underline transition-colors"
              >
                Login here
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
        <div className="absolute inset-0 bg-gradient-to-r from-[#f58c55]/10 via-transparent to-transparent dark:from-gray-900/80 dark:via-gray-800/60 dark:to-gray-900/80"></div>
        
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