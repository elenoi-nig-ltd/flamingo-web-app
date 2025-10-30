'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const CookiePolicy = () => {
  return (
    <div className="container mt-20 mx-auto p-6 bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
      <motion.h1
        className="text-4xl font-bold bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] bg-clip-text text-transparent mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Cookie Policy
      </motion.h1>

      <motion.div
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full border border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <section className="mb-8">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            At <span className="font-medium">flamingo.com.ng</span>, we use cookies and similar technologies to enhance your shopping experience, personalize content, and improve our services. This Cookie Policy explains how we use cookies and your choices regarding their use.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            What are Cookies?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Cookies are small text files stored on your device (computer, smartphone, or tablet) when you visit our website. They allow us to recognize your device and remember your preferences.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Types of Cookies We Use
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>
              <span className="font-medium">Essential Cookies:</span> Necessary for website functionality, such as login, cart management, and payment processing.
            </li>
            <li>
              <span className="font-medium">Performance Cookies:</span> Help us understand website usage, track performance, and improve user experience.
            </li>
            <li>
              <span className="font-medium">Functional Cookies:</span> Remember your preferences, such as language and region, to personalize your experience.
            </li>
            <li>
              <span className="font-medium">Targeting/Advertising Cookies:</span> Used to deliver personalized ads and content based on your interests and behavior.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            How We Use Cookies
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>
              <span className="font-medium">Session Cookies:</span> Temporary cookies deleted when you close your browser.
            </li>
            <li>
              <span className="font-medium">Persistent Cookies:</span> Stored on your device for a specified period or until you delete them.
            </li>
            <li>
              <span className="font-medium">First-Party Cookies:</span> Placed by our website.
            </li>
            <li>
              <span className="font-medium">Third-Party Cookies:</span> Placed by third-party services, such as analytics or advertising providers.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Your Cookie Choices
          </h2>
          <ul className="list-disc list-inside text-gray-7
System: 00 dark:text-gray-300 leading-relaxed">
            <li>
              <span className="font-medium">Browser Settings:</span> You can manage cookie preferences through your browser settings.
            </li>
            <li>
              <span className="font-medium">Opt-out Tools:</span> You can opt-out of certain cookies using tools provided by us or third-party services.
            </li>
            <li>
              <span className="font-medium">Cookie Consent:</span> You can provide or withdraw consent for cookie use through our cookie banner.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Cookie Retention Period
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>
              <span className="font-medium">Essential Cookies:</span> Typically retained for the duration of your session or a specified period necessary for website functionality.
            </li>
            <li>
              <span className="font-medium">Other Cookies:</span> Retained for varying periods, depending on their purpose, up to 12 months.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Changes to this Policy
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>We may update this Cookie Policy to reflect changes in our practices or applicable laws.</li>
            <li>Changes will be effective immediately upon posting.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Contact Us
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            For any questions or concerns, please contact us at{' '}
            <Link href="tel:+2348026968067" className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] underline transition-all duration-300">
              +234 8026968067
            </Link>
            ,{' '}
            <Link href="tel:+2348068357194" className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] underline transition-all duration-300">
              +234 8068357194
            </Link>
            ,{' '}
            <Link href="mailto:flamingo@gmail.com" className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] underline transition-all duration-300">
              flamingo@gmail.com
            </Link>
            , or via our live chat.
          </p>
        </section>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">
          By using our website, you acknowledge that you have read and understood this Cookie Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default CookiePolicy;