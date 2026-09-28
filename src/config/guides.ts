/**
 * Minna Information Centre content (spec §10).
 *
 * These are locally-grounded reference articles, not generic keyword filler.
 * Content is intentionally grounded in real Minna/Gidan Kwano marketplace
 * observations (areas, price bands, FUT Minna context). Each article renders
 * at /minna-guide/<slug> and is included in the sitemap.
 *
 * `body` uses a tiny block format the renderer understands:
 *   { type: 'p' | 'h2' | 'ul', text?, items? }
 */

export interface GuideBlock {
  type: 'p' | 'h2' | 'ul';
  text?: string;
  items?: string[];
}

export interface GuideArticle {
  slug: string;
  title: string;
  /** SEO <title> (falls back to title). */
  seoTitle?: string;
  description: string;
  /** ISO date used for article metadata + sitemap. */
  updated: string;
  readMinutes: number;
  tags: string[];
  body: GuideBlock[];
}

const UPDATED = '2026-01-15';

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: 'houses-for-rent-gidan-kwano-minna-2026-guide',
    title: 'Houses for Rent in Gidan Kwano, Minna: Complete 2026 Guide',
    seoTitle:
      'Houses for Rent in Gidan Kwano, Minna (2026 Guide) | Flamingo',
    description:
      'Everything you need to rent a house in Gidan Kwano, Minna in 2026 — typical prices, popular streets around FUT Minna, what to check before you pay, and how to avoid rental scams.',
    updated: UPDATED,
    readMinutes: 8,
    tags: ['gidan-kwano', 'houses-for-rent', 'fut-minna'],
    body: [
      {
        type: 'p',
        text: 'Gidan Kwano is the busiest rental market in Minna, driven almost entirely by the Federal University of Technology (FUT) Minna main campus. Demand peaks sharply around resumption, so understanding the market before you arrive saves both money and stress.',
      },
      { type: 'h2', text: 'What rent costs in Gidan Kwano' },
      {
        type: 'p',
        text: 'Prices vary with how close you are to the main gate, whether there is a borehole, and whether the unit is self-contained. As a rough 2026 guide for the Gidan Kwano corridor along Talba Road and the KFF axis:',
      },
      {
        type: 'ul',
        items: [
          'Single room (shared facilities): typically the entry point for students on a budget.',
          'Self-contained room: the most popular student option — verify water and power arrangements.',
          'One-bedroom flat (a "room and parlour" self-con): common for final-year students and young professionals.',
          'Two to three-bedroom bungalow: for families and shared student groups.',
        ],
      },
      { type: 'h2', text: 'Where people actually look' },
      {
        type: 'p',
        text: 'The strongest clusters are directly opposite the FUT main gate, along Talba Road, and around the KFF Street / Central Mosque area. The closer to campus, the higher the premium and the faster units disappear.',
      },
      { type: 'h2', text: 'Before you pay anything' },
      {
        type: 'ul',
        items: [
          'Physically visit the property — never pay based on photos alone.',
          'Confirm the water source (borehole vs well vs tanker) and electricity band.',
          'Meet the landlord or a verifiable agent and confirm agency/agreement fees in writing.',
          'Ask what the total move-in cost is: rent + agreement + agency + caution can add up.',
        ],
      },
      {
        type: 'p',
        text: 'On Flamingo, look for the Property Verified badge, which means the property\u2019s existence and basic listing details were physically confirmed by our process. It is a trust signal, not a guarantee of any transaction.',
      },
    ],
  },
  {
    slug: 'how-much-does-it-cost-to-rent-a-house-in-minna',
    title: 'How Much Does It Cost to Rent a House in Minna?',
    seoTitle: 'How Much Does It Cost to Rent a House in Minna? | Flamingo',
    description:
      'A realistic breakdown of rental costs across Minna neighbourhoods — Gidan Kwano, Bosso, Tunga, Kpakungu and Chanchaga — plus the hidden fees to budget for.',
    updated: UPDATED,
    readMinutes: 6,
    tags: ['minna', 'rent', 'cost-of-living'],
    body: [
      {
        type: 'p',
        text: 'Rent in Minna is shaped by three things: proximity to a FUT campus, the quality of utilities (water and power), and the neighbourhood itself. Student-heavy areas price by the room; family areas price by the flat.',
      },
      { type: 'h2', text: 'How neighbourhoods compare' },
      {
        type: 'ul',
        items: [
          'Gidan Kwano: premium for closeness to FUT main campus; student self-cons dominate.',
          'Bosso: strong demand around the Bosso campus; broad mix of rooms and flats.',
          'Tunga: central and well-serviced, generally pricier for families.',
          'Kpakungu: more affordable, popular with budget-conscious renters.',
          'Chanchaga & Maitumbi: established residential options, often better value per bedroom.',
        ],
      },
      { type: 'h2', text: 'The fees people forget' },
      {
        type: 'ul',
        items: [
          'Agreement fee and agency/commission (often a percentage of annual rent).',
          'Caution/security deposit, refundable in principle.',
          'Service or water levy in some serviced compounds.',
        ],
      },
      {
        type: 'p',
        text: 'Always ask for the all-in move-in figure, not just the headline yearly rent, so you can compare listings fairly.',
      },
    ],
  },
  {
    slug: 'best-areas-to-live-in-minna',
    title: 'Best Areas to Live in Minna',
    description:
      'A practical rundown of the best neighbourhoods to live in Minna depending on whether you are a student, a young professional or a family.',
    updated: UPDATED,
    readMinutes: 6,
    tags: ['minna', 'neighbourhoods'],
    body: [
      {
        type: 'p',
        text: 'The "best" area in Minna depends entirely on your priorities: closeness to campus, quiet family living, affordability, or access to markets and transport.',
      },
      { type: 'h2', text: 'For FUT Minna students' },
      {
        type: 'p',
        text: 'Gidan Kwano (main campus) and Bosso (Bosso campus) are the obvious choices — you trade a higher rent for the ability to walk or take a short keke to lectures.',
      },
      { type: 'h2', text: 'For families' },
      {
        type: 'p',
        text: 'Tunga, Chanchaga and Maitumbi offer a calmer residential feel with better access to schools, markets and healthcare.',
      },
      { type: 'h2', text: 'For value' },
      {
        type: 'p',
        text: 'Kpakungu and the outer developing areas typically give you more space per naira, at the cost of a longer commute.',
      },
    ],
  },
  {
    slug: 'student-accommodation-fut-minna-gidan-kwano',
    title: 'Student Accommodation Around FUT Minna Gidan Kwano',
    seoTitle:
      'Student Accommodation Around FUT Minna, Gidan Kwano | Flamingo',
    description:
      'How to find safe, affordable student accommodation around FUT Minna in Gidan Kwano — lodge vs self-con, what to check, and when to start looking.',
    updated: UPDATED,
    readMinutes: 7,
    tags: ['fut-minna', 'student-accommodation', 'gidan-kwano'],
    body: [
      {
        type: 'p',
        text: 'Most FUT Minna students in Gidan Kwano choose between a room in a lodge (shared compound, per-room booking) and a self-contained unit. Each has trade-offs in cost, privacy and security.',
      },
      { type: 'h2', text: 'Lodge vs self-contained' },
      {
        type: 'ul',
        items: [
          'Lodge room: cheaper, more social, shared facilities — book early as rooms go fast.',
          'Self-contained: more privacy and your own facilities, at a higher price point.',
        ],
      },
      { type: 'h2', text: 'When to start looking' },
      {
        type: 'p',
        text: 'Begin before resumption. The best-value rooms near the main gate are usually gone within the first couple of weeks of a new session.',
      },
      { type: 'h2', text: 'Safety checklist' },
      {
        type: 'ul',
        items: [
          'Visit in person and confirm the compound is occupied and secure.',
          'Confirm water and power before paying.',
          'Prefer listings with a Flamingo Property Verified badge.',
        ],
      },
    ],
  },
  {
    slug: 'gidan-kwano-property-and-rental-guide',
    title: 'Gidan Kwano Property and Rental Guide',
    description:
      'A focused guide to buying, renting and investing in property around Gidan Kwano, Minna — the neighbourhood built around FUT Minna.',
    updated: UPDATED,
    readMinutes: 7,
    tags: ['gidan-kwano', 'property', 'investment'],
    body: [
      {
        type: 'p',
        text: 'Gidan Kwano has grown from a quiet settlement into one of Minna\u2019s most active property markets, thanks to sustained student demand from FUT Minna.',
      },
      { type: 'h2', text: 'Renting' },
      {
        type: 'p',
        text: 'Student self-cons and lodges dominate. Proximity to the main gate and reliable water are the biggest price drivers.',
      },
      { type: 'h2', text: 'Buying land' },
      {
        type: 'p',
        text: 'Land around Gidan Kwano attracts investors betting on continued campus-driven growth. Always confirm documentation and survey before committing.',
      },
    ],
  },
  {
    slug: 'how-to-find-genuine-houses-for-rent-in-minna',
    title: 'How to Find Genuine Houses for Rent in Minna',
    description:
      'Practical steps to avoid rental scams in Minna and confirm a house for rent is genuine before you part with any money.',
    updated: UPDATED,
    readMinutes: 5,
    tags: ['minna', 'safety', 'rent'],
    body: [
      {
        type: 'p',
        text: 'Rental scams usually follow a pattern: an unusually cheap price, pressure to pay a "reservation" quickly, and a reason you cannot visit in person. Slow down and verify.',
      },
      { type: 'h2', text: 'Red flags' },
      {
        type: 'ul',
        items: [
          'The agent refuses a physical inspection.',
          'You are asked to pay before seeing the property or meeting the landlord.',
          'The price is far below everything else in the same area.',
        ],
      },
      { type: 'h2', text: 'How to verify' },
      {
        type: 'ul',
        items: [
          'Inspect the property physically and confirm it exists as advertised.',
          'Confirm the landlord\u2019s identity and get any agreement in writing.',
          'Favour Flamingo listings that carry the Property Verified badge.',
        ],
      },
    ],
  },
  {
    slug: 'land-for-sale-in-gidan-kwano-what-buyers-should-know',
    title: 'Land for Sale in Gidan Kwano: What Buyers Should Know',
    description:
      'A buyer\u2019s guide to land for sale in Gidan Kwano, Minna — documentation to demand, common pitfalls, and how to reduce risk.',
    updated: UPDATED,
    readMinutes: 6,
    tags: ['gidan-kwano', 'land-for-sale'],
    body: [
      {
        type: 'p',
        text: 'Land near Gidan Kwano is popular with investors, but buying land carries more documentation risk than renting. Due diligence is everything.',
      },
      { type: 'h2', text: 'Documents to demand' },
      {
        type: 'ul',
        items: [
          'A valid survey plan and clear beacon boundaries.',
          'Proof of ownership / title and the seller\u2019s right to sell.',
          'Any relevant deed of assignment.',
        ],
      },
      { type: 'h2', text: 'Reduce your risk' },
      {
        type: 'p',
        text: 'Engage a surveyor and, for larger purchases, a lawyer. Confirm the land is not under dispute or government acquisition before you pay.',
      },
    ],
  },
  {
    slug: 'gidan-kwano-vs-bosso-for-fut-minna-students',
    title: 'Gidan Kwano vs Bosso for FUT Minna Students',
    description:
      'Choosing between Gidan Kwano and Bosso as a FUT Minna student — campus proximity, cost, transport and lifestyle compared.',
    updated: UPDATED,
    readMinutes: 5,
    tags: ['gidan-kwano', 'bosso', 'fut-minna'],
    body: [
      {
        type: 'p',
        text: 'FUT Minna operates across the Gidan Kwano main campus and the Bosso campus. Where you should live depends heavily on where your faculty sits.',
      },
      { type: 'h2', text: 'Gidan Kwano' },
      {
        type: 'p',
        text: 'Best if your lectures are at the main campus. Expect a livelier student scene and premium pricing close to the gate.',
      },
      { type: 'h2', text: 'Bosso' },
      {
        type: 'p',
        text: 'Closer to town and the Bosso campus, often with a broader mix of housing. Consider transport time to the main campus if you have split classes.',
      },
    ],
  },
  {
    slug: 'where-to-buy-affordable-furniture-household-items-minna',
    title: 'Where to Buy Affordable Furniture and Household Items in Minna',
    description:
      'A guide to furnishing your room or home affordably in Minna — new vs used, what to buy first, and how to move it around Gidan Kwano.',
    updated: UPDATED,
    readMinutes: 5,
    tags: ['minna', 'furniture', 'household'],
    body: [
      {
        type: 'p',
        text: 'Furnishing a new room in Minna does not have to be expensive. Prioritise essentials and mix new with good-condition used items.',
      },
      { type: 'h2', text: 'Buy first' },
      {
        type: 'ul',
        items: [
          'A bed and mattress that suits your room size.',
          'A reading table and chair — essential for students.',
          'Basic kitchen and storage items.',
        ],
      },
      {
        type: 'p',
        text: 'Browse the Home & Furniture category on Flamingo to compare prices from sellers around Minna before buying, and factor in keke/transport for delivery.',
      },
    ],
  },
  {
    slug: 'how-to-buy-and-sell-safely-online-in-minna',
    title: 'How to Buy and Sell Safely Online in Minna',
    description:
      'Simple, practical rules for buying and selling safely on local marketplaces in Minna — meeting points, payment safety and spotting scams.',
    updated: UPDATED,
    readMinutes: 5,
    tags: ['minna', 'safety', 'marketplace'],
    body: [
      {
        type: 'p',
        text: 'Local trading is fast and convenient, but a few habits keep you safe whether you are buying a phone or renting a room in Minna.',
      },
      { type: 'h2', text: 'For buyers' },
      {
        type: 'ul',
        items: [
          'Meet in a public, familiar place during daylight.',
          'Inspect and test the item before paying.',
          'Be wary of deals that are far cheaper than everything else.',
        ],
      },
      { type: 'h2', text: 'For sellers' },
      {
        type: 'ul',
        items: [
          'Confirm payment has actually cleared before releasing an item.',
          'Keep your contact details and listing description accurate.',
          'Use Flamingo\u2019s verification signals to build buyer trust.',
        ],
      },
    ],
  },
];

export function getGuideBySlug(slug: string): GuideArticle | undefined {
  return GUIDE_ARTICLES.find((a) => a.slug === slug);
}
