'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import Header from '../Header';

const Register = () => {
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'landlord',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(formData.name, formData.email, formData.password, formData.role);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <Header />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-6 py-16 flex justify-center"
      >
        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">Landlord Registration</h2>
          
          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4 flex items-start"
            >
              <FaExclamationCircle className="text-red-500 dark:text-red-400 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium">Registration failed</p>
                <p className="text-sm">{error}</p>
              </div>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <FaUser className="absolute top-3 left-3 text-orange-500" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            
            <div className="relative">
              <FaEnvelope className="absolute top-3 left-3 text-orange-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={loading}
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
                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            
            <input type="hidden" name="role" value="landlord" />
            
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:from-orange-600 hover:to-amber-600"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Registering...
                </div>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>
          
          <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <a 
              href="/landlord/login" 
              className="text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 font-medium transition duration-200"
            >
              Sign in here
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;