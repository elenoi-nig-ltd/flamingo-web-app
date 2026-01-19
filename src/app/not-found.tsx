'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaHome, FaSearch, FaArrowLeft } from 'react-icons/fa';

const NotFound = () => {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Floating animation for background elements
  const floatingAnimation = {
    y: [0, -20, 0],
    rotate: [0, 5, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  // Eye following mouse
  const eyeX = (mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth : 0) / 2) / 50;
  const eyeY = (mousePosition.y - (typeof window !== 'undefined' ? window.innerHeight : 0) / 2) / 50;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f58c55]/10 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 overflow-hidden relative flex items-center justify-center px-4 py-8">
      {/* Animated Background Shapes */}
      <motion.div
        animate={floatingAnimation}
        className="absolute top-10 left-10 w-20 h-20 md:w-32 md:h-32 bg-[#f58c55]/20 dark:bg-[#f58c55]/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          ...floatingAnimation,
          transition: { ...floatingAnimation.transition, delay: 0.5 }
        }}
        className="absolute bottom-20 right-20 w-24 h-24 md:w-40 md:h-40 bg-purple-300/30 dark:bg-purple-600/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          ...floatingAnimation,
          transition: { ...floatingAnimation.transition, delay: 1 }
        }}
        className="absolute top-1/2 right-10 w-16 h-16 md:w-28 md:h-28 bg-blue-300/30 dark:bg-blue-600/20 rounded-full blur-2xl"
      />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Cartoon Character */}
          <motion.div
            className="relative inline-block mb-8"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Character Body */}
            <motion.div className="relative">
              {/* Main Circle Face */}
              <motion.div
                className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-[#f58c55] to-[#f47a45] rounded-full mx-auto relative shadow-2xl"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Eyes Container */}
                <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-4 md:space-x-6">
                  {/* Left Eye */}
                  <motion.div className="relative">
                    <div className="w-8 h-10 md:w-12 md:h-14 bg-white rounded-full relative overflow-hidden shadow-inner">
                      <motion.div
                        animate={{ x: eyeX * 2, y: eyeY * 2 }}
                        className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 md:w-6 md:h-6 bg-gray-900 dark:bg-gray-800 rounded-full"
                      >
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full" />
                      </motion.div>
                    </div>
                    {/* Eyebrow */}
                    <motion.div
                      animate={{ rotate: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      className="absolute -top-2 md:-top-3 left-0 w-8 md:w-12 h-1 md:h-1.5 bg-gray-700 dark:bg-gray-600 rounded-full"
                    />
                  </motion.div>

                  {/* Right Eye */}
                  <motion.div className="relative">
                    <div className="w-8 h-10 md:w-12 md:h-14 bg-white rounded-full relative overflow-hidden shadow-inner">
                      <motion.div
                        animate={{ x: eyeX * 2, y: eyeY * 2 }}
                        className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 md:w-6 md:h-6 bg-gray-900 dark:bg-gray-800 rounded-full"
                      >
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full" />
                      </motion.div>
                    </div>
                    {/* Eyebrow */}
                    <motion.div
                      animate={{ rotate: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      className="absolute -top-2 md:-top-3 left-0 w-8 md:w-12 h-1 md:h-1.5 bg-gray-700 dark:bg-gray-600 rounded-full"
                    />
                  </motion.div>
                </div>

                {/* Mouth - Sad */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute bottom-6 md:bottom-10 left-1/2 transform -translate-x-1/2 w-12 md:w-16 h-8 md:h-10 border-b-4 border-gray-700 dark:border-gray-600 rounded-b-full"
                />

                {/* Tear Drops */}
                <motion.div
                  animate={{ y: [0, 40, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="absolute top-1/3 left-6 md:left-8 w-2 h-3 md:w-3 md:h-4 bg-blue-400 rounded-full opacity-80"
                />
                <motion.div
                  animate={{ y: [0, 40, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, delay: 0.5 }}
                  className="absolute top-1/3 right-6 md:right-8 w-2 h-3 md:w-3 md:h-4 bg-blue-400 rounded-full opacity-80"
                />
              </motion.div>

              {/* Arms */}
              <motion.div
                animate={{ rotate: [0, -20, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute top-1/2 -left-8 md:-left-12 w-6 h-16 md:w-8 md:h-24 bg-[#f58c55] rounded-full origin-top"
                style={{ transform: 'rotate(-45deg)' }}
              />
              <motion.div
                animate={{ rotate: [0, 20, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute top-1/2 -right-8 md:-right-12 w-6 h-16 md:w-8 md:h-24 bg-[#f58c55] rounded-full origin-top"
                style={{ transform: 'rotate(45deg)' }}
              />
            </motion.div>
          </motion.div>

          {/* 404 Text */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-6"
          >
            <motion.h1
              className="text-6xl md:text-9xl font-black text-[#f58c55] dark:text-[#f7a16b] mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              404
            </motion.h1>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">
              Oops! Page Not Found
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto px-4">
              The page you're looking for seems to have wandered off. 
              Don't worry, even the best explorers get lost sometimes!
            </p>
          </motion.div>

          {/* Floating Elements */}
          <div className="relative h-24 md:h-32 mb-8">
            <motion.div
              animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-0 md:left-10 top-0"
            >
              <FaSearch className="text-3xl md:text-5xl text-[#f58c55]/40 dark:text-[#f7a16b]/40" />
            </motion.div>
            <motion.div
              animate={{ x: [0, -100, 0], y: [0, 30, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute right-0 md:right-10 top-5"
            >
              <span className="text-4xl md:text-6xl opacity-30">🔍</span>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(245, 140, 85, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#f58c55] to-[#f47a45] hover:from-[#f47a45] hover:to-[#f58c55] text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold shadow-lg transition-all duration-300 w-full sm:w-auto"
            >
              <FaHome className="text-lg md:text-xl" />
              <span className="text-base md:text-lg">Go Home</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(139, 92, 246, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="flex items-center space-x-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-[#f58c55] dark:hover:border-[#f7a16b] px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold shadow-lg transition-all duration-300 w-full sm:w-auto"
            >
              <FaArrowLeft className="text-lg md:text-xl" />
              <span className="text-base md:text-lg">Go Back</span>
            </motion.button>
          </motion.div>

          {/* Fun Fact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-12 md:mt-16 px-4"
          >
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                <span className="font-bold text-[#f58c55] dark:text-[#f7a16b]">Fun Fact:</span> The 404 error
                code comes from Room 404 at CERN where the original web servers were located! 🌐
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Stars */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut"
          }}
          className="absolute text-2xl md:text-4xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
};

export default NotFound;
