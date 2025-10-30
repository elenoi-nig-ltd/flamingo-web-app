'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const DataPrivacy = () => {
  return (
    <div className="container mt-20 mx-auto p-6 bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
      <motion.h1
        className="text-4xl font-bold bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] bg-clip-text text-transparent mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Data Protection and Privacy Policy
      </motion.h1>

      <motion.div
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full border border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <section className="mb-8">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            At <span className="font-medium">flamingo.com.ng</span>, we prioritize the protection of your personal data and privacy. This policy outlines how we collect, use, and safeguard your information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            1. Information We Collect
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>
              <span className="font-medium">Personal Data:</span> Name, email address, phone number, and other contact information.
            </li>
            <li>
              <span className="font-medium">Payment Information:</span> Credit/debit card details, billing address, and payment history.
            </li>
            <li>
              <span className="font-medium">Usage Data:</span> IP address, browser type, device information, and browsing behavior.
            </li>
            <li>
              <span className="font-medium">Order Information:</span> Products/services purchased, order history, and delivery details.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>
              <span className="font-medium">Order Processing:</span> To fulfill orders, process payments, and deliver products/services.
            </li>
            <li>
              <span className="font-medium">Customer Support:</span> To respond to inquiries, resolve issues, and improve customer experience.
            </li>
            <li>
              <span className="font-medium">Marketing:</span> To send promotional materials, newsletters, and updates (with your consent).
            </li>
            <li>
              <span className="font-medium">Analytics:</span> To analyze website usage, improve functionality, and optimize services.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            3. Data Sharing
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>
              <span className="font-medium">Service Providers:</span> We share data with trusted third-party vendors and service providers to facilitate our services.
            </li>
            <li>
              <span className="font-medium">Payment Processors:</span> We share payment information with payment processors to facilitate transactions.
            </li>
            <li>
              <span className="font-medium">Legal Requirements:</span> We may disclose data to comply with legal obligations, protect our rights, or respond to law enforcement requests.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            4. Data Security
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>
              <span className="font-medium">Encryption:</span> We use industry-standard encryption to protect sensitive data.
            </li>
            <li>
              <span className="font-medium">Access Controls:</span> We limit access to authorized personnel and implement robust security measures.
            </li>
            <li>
              <span className="font-medium">Data Storage:</span> We store data in secure, access-controlled environments.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            5. Your Rights
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>
              <span className="font-medium">Access:</span> You can request access to your personal data.
            </li>
            <li>
              <span className="font-medium">Correction:</span> You can request corrections to inaccurate data.
            </li>
            <li>
              <span className="font-medium">Deletion:</span> You can request data deletion (subject to legal requirements).
            </li>
            <li>
              <span className="font-medium">Opt-out:</span> You can opt-out of marketing communications.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            6. Cookies and Tracking
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>
              <span className="font-medium">Cookies:</span> We use cookies to enhance user experience, track website usage, and personalize content.
            </li>
            <li>
              <span className="font-medium">Tracking:</span> We may use third-party tracking tools to analyze website usage and improve services.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            7. Changes to this Policy
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>We reserve the right to modify this policy without notice.</li>
            <li>Changes will be effective immediately upon posting.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            8. Contact Us
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
          By using our platform, you acknowledge that you have read, understood, and agree to this Data Protection and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default DataPrivacy;