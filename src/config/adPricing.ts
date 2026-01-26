// Advertisement pricing configuration
export const AD_LOCATIONS = {
  LANDING_PAGE_HERO: {
    id: 'landing_page_hero',
    name: 'Landing Page Featured',
    description: 'Premium featured position on homepage',
    basePrice: 500,
    icon: '🏆',
    multiplier: 3.0,
  },
  PRODUCT_LISTINGS: {
    id: 'product_listings',
    name: 'Product Listings',
    description: 'Display alongside product listings',
    basePrice: 200,
    icon: '🛍️',
    multiplier: 1.5,
  },
  PROPERTY_LISTINGS: {
    id: 'property_listings',
    name: 'Property Listings',
    description: 'Display alongside property listings',
    basePrice: 250,
    icon: '🏠',
    multiplier: 1.8,
  },
  CHECKOUT_PAGE: {
    id: 'checkout_page',
    name: 'Checkout Page',
    description: 'Show during checkout process',
    basePrice: 150,
    icon: '💳',
    multiplier: 1.2,
  },
};

export const AD_DURATIONS = [
  { days: 7, label: '1 Week', discount: 0 },
  { days: 14, label: '2 Weeks', discount: 0.05 },
  { days: 30, label: '1 Month', discount: 0.10 },
  { days: 90, label: '3 Months', discount: 0.15 },
  { days: 180, label: '6 Months', discount: 0.20 },
];

export const calculateAdPrice = (location: string, duration: number): number => {
  const locationData = Object.values(AD_LOCATIONS).find(
    (loc) => loc.id === location
  );
  
  if (!locationData) return 0;

  const durationData = AD_DURATIONS.find((d) => d.days === duration);
  const discount = durationData?.discount || 0;

  const basePricePerDay = locationData.basePrice;
  const totalBasePrice = basePricePerDay * duration;
  const totalPrice = totalBasePrice * (1 - discount);

  return Math.round(totalPrice);
};
