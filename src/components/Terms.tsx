'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const Terms = () => {
  return (
    <div className="container mt-20 mx-auto p-6 bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
      <motion.h1
        className="text-4xl font-bold bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] bg-clip-text text-transparent mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Terms of Use
      </motion.h1>

      <motion.div
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full border border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            1. Introduction
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Welcome to <span className="font-medium">flamingo.com.ng</span>, a platform offering retail services for household items, food, properties, internet bundles, and more. By accessing or using our website, you agree to these Terms of Use.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
            These Terms of Use (the “Terms”) constitute a binding and enforceable legal contract between flamingo.com.ng, affiliated companies (together, the “Administrator”, “we”, “us”) and you. You are advised to read these Terms carefully because your access and use of the flamingo.com.ng website and mobile applications, as well as any service, content, and data available via them (together, the “Service” or the “Platform”), are governed by these Terms.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
            If you do not agree with any part of these Terms, or if you are not eligible or authorized to be bound by the Terms, then do not access or use the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            2. Definitions
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Flamingo French Fries is a registered trademark of ELENOI NIG LTD, hereafter referred to as "the mother company".
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
            <li>
              <span className="font-medium">"Website"</span> refers to flamingo.com.ng and its associated services.
            </li>
            <li>
              <span className="font-medium">"User"</span> refers to anyone accessing or using the website.
            </li>
            <li>
              <span className="font-medium">"Products/Services"</span> include household items, food, properties, and internet bundles.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            3. Use of the Website
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>Users must be at least 18 years old to use the website.</li>
            <li>Users are responsible for maintaining the confidentiality of their account information.</li>
            <li>Users agree to use the website for lawful purposes only.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            4. Product/Services Information
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>Product descriptions and prices are subject to change without notice.</li>
            <li>Availability and pricing of products/services may vary.</li>
            <li>Users are responsible for ensuring the accuracy of their orders.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            5. Payment and Billing
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>Payment terms and methods will be specified during the checkout process.</li>
            <li>Users agree to pay for all products/services ordered.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            6. Delivery and Shipping
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>Delivery terms and shipping policies will be specified during the checkout process.</li>
            <li>Users are responsible for ensuring someone is available to receive deliveries.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            7. Returns and Refunds
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>Return and refund policies will be specified on the website.</li>
            <li>Users must comply with the return and refund process.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            8. Intellectual Property
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>All content on the website is the property of flamingo.com.ng or its licensors.</li>
            <li>Users may not reproduce, distribute, or modify website content without permission.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            9. Liability and Indemnification
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>
              flamingo.com.ng or the mother company is not liable for any damages or losses resulting from the use of the website or products/services.
            </li>
            <li>Users agree to indemnify flamingo.com.ng or the mother company against any claims or losses.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            10. Governing Law
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>These Terms of Use are governed by the laws of the Federal Republic of Nigeria.</li>
            <li>Any disputes will be resolved through discussion and negotiation or legal due process.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            11. Changes to Terms
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>flamingo.com.ng reserves the right to modify these Terms of Use without notice.</li>
            <li>Users are responsible for regularly reviewing the Terms of Use.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            12. Contact Us
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
          By using our website, you acknowledge that you have read, understood, and agree to these Terms of Use.
        </p>
      </motion.div>
    </div>
  );
};

export default Terms;