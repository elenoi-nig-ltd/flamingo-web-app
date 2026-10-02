import Link from 'next/link';
import { Utensils, Wifi, ShoppingBag, ArrowRight } from 'lucide-[#f47a45]'; // standard lucide icons
import { Utensils as FoodIcon, Wifi as WifiIcon, Armchair, ChevronRight } from 'lucide-react';
import SectionHeading from './SectionHeading';

const ECOMMERCE_VERTICALS = [
  {
    title: 'Food & Dining',
    subtitle: 'Order delicious meals, fast food & snacks around campus and Minna.',
    badge: 'Fast Delivery',
    icon: FoodIcon,
    href: '/food',
    gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
    borderColor: 'border-amber-200 dark:border-amber-900/40',
    accentColor: 'text-amber-600 dark:text-amber-400',
    buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white',
    items: ['Local Dishes', 'Fast Food & Grills', 'Campus Meals', 'Pastries & Drinks'],
  },
  {
    title: 'Campus WiFi & Data Vouchers',
    subtitle: 'Instant high-speed internet data vouchers for FUT Minna lodges.',
    badge: 'Instant Delivery',
    icon: WifiIcon,
    href: '/internet',
    gradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
    borderColor: 'border-blue-200 dark:border-blue-900/40',
    accentColor: 'text-blue-600 dark:text-blue-400',
    buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white',
    items: ['Daily Data Bundles', 'Weekly Hotspot Pass', 'Monthly Student Unlimited', 'Lodge WiFi Refill'],
  },
  {
    title: 'Home & Household Items',
    subtitle: 'Shop furniture, kitchenware & essential appliances for your lodge.',
    badge: 'Verified Items',
    icon: Armchair,
    href: '/home-items',
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    borderColor: 'border-emerald-200 dark:border-emerald-900/40',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    items: ['Student Furniture', 'Kitchen Utensils', 'Electronics & Fans', 'Bedding & Decor'],
  },
];

export default function FeaturedServices() {
  return (
    <section>
      <SectionHeading
        title="Marketplace Services & Essentials"
        subtitle="Explore instant food delivery, internet data passes, and student home items."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {ECOMMERCE_VERTICALS.map((vertical) => {
          const IconComponent = vertical.icon;
          return (
            <div
              key={vertical.title}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border ${vertical.borderColor} bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800`}
            >
              {/* Background gradient decoration */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${vertical.gradient} pointer-events-none opacity-60 transition-opacity group-hover:opacity-100`}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl bg-gray-100 p-3 dark:bg-gray-700 ${vertical.accentColor}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    {vertical.badge}
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  {vertical.title}
                </h3>
                <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
                  {vertical.subtitle}
                </p>

                <ul className="mt-4 space-y-2">
                  {vertical.items.map((item) => (
                    <li key={item} className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-300">
                      <ChevronRight className={`mr-1.5 h-3.5 w-3.5 shrink-0 ${vertical.accentColor}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/60">
                <Link
                  href={vertical.href}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${vertical.buttonBg}`}
                >
                  Explore {vertical.title.split(' ')[0]}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
