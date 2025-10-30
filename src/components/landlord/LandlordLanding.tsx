'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaUserPlus, FaCheckCircle, FaBuilding } from 'react-icons/fa';
import Header from '@/components/Header';

const steps = [
  {
    icon: <FaUserPlus className="text-4xl text-orange-500" />,
    title: 'Sign Up',
    description: 'Create your landlord account in minutes with our simple registration process.',
  },
  {
    icon: <FaCheckCircle className="text-4xl text-green-600" />,
    title: 'Verify Properties',
    description: 'Upload property documents for verification to ensure trust and authenticity.',
  },
  {
    icon: <FaBuilding className="text-4xl text-orange-500" />,
    title: 'List Properties',
    description: 'Add your properties to our platform and reach potential buyers or renters.',
  },
  {
    icon: <FaHome className="text-4xl text-green-600" />,
    title: 'Manage & Earn',
    description: 'Track your listings, communicate with clients, and manage your earnings.',
  },
];

const LandlordLanding = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 font-sans">
      <Header />
      <main className="container mx-auto px-6 py-16">
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
                List your properties, reach millions of buyers and renters, and manage your portfolio with ease.
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Become a Landlord with <span className="text-green-600 dark:text-green-400">Flourish Real Estate</span>
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-semibold shadow-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
            onClick={() => window.location.href = '/landlord/login'}
          >
            Login
          </motion.button>
        </motion.section>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-300 text-center mb-10">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center"
              >
                <div className="mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="bg-green-600 dark:bg-green-700 text-white py-16 px-6 rounded-lg text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to List Your Properties?</h2>
          <p className="text-lg max-w-xl mx-auto mb-6">
            Join thousands of landlords who trust Flourish Real Estate to connect with buyers and renters.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-semibold shadow-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
            onClick={() => window.location.href = '/landlord/register'}
          >
            Join Now
          </motion.button>
        </motion.section>
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default LandlordLanding;