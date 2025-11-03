'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const CancellationPolicy = () => {
  return (
    <div className="container mt-20 mx-auto p-6 bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
      <motion.h1
        className="text-4xl font-bold bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] bg-clip-text text-transparent mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Cancellation, Return & Warranty Policy
      </motion.h1>

      <motion.div
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full border border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <section className="mb-8">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            At <span className="font-medium">flamingo.com.ng</span>, we strive to provide a seamless shopping experience. This policy outlines the procedures and guidelines for cancelling orders, returns, refunds, and warranty coverage.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            1. Order Cancellation
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>
              <span className="font-medium">Cancellation Window:</span> Food orders cannot be cancelled after they are placed. However, you can cancel orders for any other items as long as you have not been contacted that the delivery is on its way.
            </li>
            <li>
              <span className="font-medium">Cancellation Process:</span> To cancel an order, please contact our customer support team via{' '}
              <Link href="tel:+2348068357194" className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] underline transition-all duration-300">
                +234 8068357194
              </Link>
              ,{' '}
              <Link href="mailto:flamingotechteam@gmail.com" className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] underline transition-all duration-300">
                flamingotechteam@gmail.com
              </Link>
              ,{' '}
              <Link href="mailto:elenoi.nig.ltd@gmail.com" className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] underline transition-all duration-300">
                elenoi.nig.ltd@gmail.com
              </Link>
              , or via our live chat.
            </li>
            <li>
              <span className="font-medium">Order Status:</span> If your order has already been processed or shipped, we may not be able to cancel it.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            2. Return Policy
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>
              <span className="font-medium">Return Window:</span> Because we are both an offline and online store, you are to return any product you wish to return to our store or pick up point nearest to you within 48 hours of delivery.
            </li>
            <li>
              <span className="font-medium">Return Conditions:</span> Products must be in their original packaging, unused, and in the same condition as received.
            </li>
            <li>
              <span className="font-medium">Return Process:</span> To initiate a return, please contact our customer support team via{' '}
              <Link href="tel:+2348026968067" className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] underline transition-all duration-300">
                +234 8026968067
              </Link>
              ,{' '}
              <Link href="tel:+2348068357194" className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] underline transition-all duration-300">
                +234 8068357194
              </Link>
              ,{' '}
              <Link href="mailto:flamingotechteam@gmail.com" className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] underline transition-all duration-300">
                flamingotechteam@gmail.com
              </Link>
              ,{' '}
              <Link href="mailto:elenoi.nig.ltd@gmail.com" className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] underline transition-all duration-300">
                elenoi.nig.ltd@gmail.com
              </Link>
              , or via our live chat.
            </li>
            <li>
              <span className="font-medium">Return Shipping:</span> You may be responsible for return shipping costs, depending on the reason for return.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            3. Refund Policy
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>
              <span className="font-medium">Refund Eligibility:</span> Refunds will be issued for products returned within the return window.
            </li>
            <li>
              <span className="font-medium">Refund Method:</span> All refunds will be made to the original account from which the money was paid in the first place.
            </li>
            <li>
              <span className="font-medium">Refund Timeframe:</span> Refunds will be processed within 48 hours of receiving the returned product.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            4. Exceptions
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>
              <span className="font-medium">Non-Returnable Items:</span> Certain products, such as food, perishable items, or custom-made products may not be eligible for returns or refunds.
            </li>
            <li>
              <span className="font-medium">Damaged or Defective Products:</span> Products damaged after delivery are not eligible for return. Please contact our customer support team for assistance.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            5. Warranty Coverage
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Flamingo does not offer warranty for any product sold in its stores. However, some manufacturers offer warranty for certain grades of their products.
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>
              <span className="font-medium">Coverage:</span> Not all products are covered by the manufacturer's warranty. Products covered by the manufacturer's warranty shall be specified as part of the detailed description of the product.
            </li>
            <li>
              <span className="font-medium">Warranty Period:</span> The warranty period varies by product and manufacturer. The warranty period will always be specified.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            6. Warranty Claims
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>
              <span className="font-medium">Claim Process:</span> To file a warranty claim, please contact our customer support team.
            </li>
            <li>
              <span className="font-medium">Required Information:</span> Please provide proof of purchase, product serial number, and a detailed description of the issue.
            </li>
            <li>
              <span className="font-medium">Exclusions:</span> Physical damage caused by accidents, misuse, or neglect is not covered under warranty.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            7. Customer Support
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>
              <span className="font-medium">Support Availability:</span> Our customer support team is available via{' '}
              <Link href="tel:+2348026968067" className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] underline transition-all duration-300">
                +234 8026968067
              </Link>
              ,{' '}
              <Link href="tel:+2348068357194" className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] underline transition-all duration-300">
                +234 8068357194
              </Link>
              ,{' '}
              <Link href="mailto:flamingotechteam@gmail.com" className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] underline transition-all duration-300">
                flamingotechteam@gmail.com
              </Link>
              ,{' '}
              <Link href="mailto:elenoi.nig.ltd@gmail.com" className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] underline transition-all duration-300">
                elenoi.nig.ltd@gmail.com
              </Link>
              , or via our live chat to assist with product inquiries, technical issues, and warranty claims.
            </li>
            <li>
              <span className="font-medium">Support Hours:</span> Our support team is available 8am to 10pm, Mondays to Saturdays.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            8. Contact Us
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            For questions or concerns about our Cancellation, Return & Warranty Policy, please contact us at{' '}
            <Link href="tel:+2348026968067" className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] underline transition-all duration-300">
              +234 8026968067
            </Link>
            ,{' '}
            <Link href="tel:+2348068357194" className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] underline transition-all duration-300">
              +234 8068357194
            </Link>
            ,{' '}
            <Link href="mailto:flamingotechteam@gmail.com" className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] underline transition-all duration-300">
              flamingotechteam@gmail.com
            </Link>
            ,{' '}
            <Link href="mailto:elenoi.nig.ltd@gmail.com" className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] underline transition-all duration-300">
              elenoi.nig.ltd@gmail.com
            </Link>
            , or via our live chat.
          </p>
        </section>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">
          By shopping with us, you acknowledge that you have read, understood, and agree to this Cancellation, Return & Warranty Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default CancellationPolicy;