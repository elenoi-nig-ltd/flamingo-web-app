'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import Header from '../Header';

const Login = () => {
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData.email, formData.password);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 font-sans">
      <Header />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-6 py-16 flex justify-center"
      >
        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">Landlord Login</h2>
          {error && <p className="text-red-500 dark:text-red-400 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <FaEnvelope className="absolute top-3 left-3 text-orange-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div className="relative">
              <FaLock className="absolute top-3 left-3 text-orange-500" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-semibold shadow-lg disabled:opacity-50 hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
            >
              {loading ? 'Logging in...' : 'Login'}
            </motion.button>
          </form>
          <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <a href="/landlord/register" className="text-orange-500 hover:underline">
              Register
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;