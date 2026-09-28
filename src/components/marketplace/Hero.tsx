import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getCategoryIcon } from "@/config/categoryIcons";
import { CONTAINER } from "@/config/layout";
import HeroSearch from "./HeroSearch";

/**
 * Homepage hero (spec §1, §2, §9).
 *
 * Split layout: the promise and the search control on the left, a collage of
 * real goods on the right, over a photographic backdrop of Minna. The previous
 * hero was a full-width orange field with nothing to look at, so a first-time
 * visitor saw no products above the fold — the single biggest reason the page
 * did not read as a marketplace.
 *
 * Server component. Everything here — headings, the popular-search links, the
 * collage — is in the initial HTML; `HeroSearch` is the only client child.
 */

/**
 * The four tilted product cards.
 *
 * `slug` doubles as the key into `config/categoryIcons.ts`, so the label icon
 * is the same one the category grid and the header use — one icon map, not
 * three. Photography is the existing Unsplash set in
 * `public/assets/images/hero/`, chosen to read as a Nigerian marketplace: a
 * modern duplex, a phone, a Camry, jollof.
 *
 * Positioning is per-card rather than computed: an overlapping, hand-placed
 * collage cannot be expressed as a grid, and the reference deliberately breaks
 * alignment. z-index runs back-to-front so the car sits over the building.
 */
const COLLAGE = [
  {
    slug: "properties",
    label: "Property",
    src: "/assets/images/hero/hero-property.jpg",
    position: "left-0 top-[3%] z-10 w-[54%] aspect-[4/3] -rotate-[5deg]",
    sizes: "(max-width: 1024px) 1px, 27vw",
    priority: true,
  },
  {
    slug: "phones",
    label: "Phones",
    src: "/assets/images/hero/hero-phones.jpg",
    position: "right-[4%] top-0 z-20 w-[27%] aspect-[3/4] rotate-[7deg]",
    sizes: "(max-width: 1024px) 1px, 14vw",
  },
  {
    slug: "vehicles",
    label: "Vehicles",
    src: "/assets/images/hero/hero-vehicles.jpg",
    position: "bottom-[6%] left-[12%] z-30 w-[58%] aspect-[4/3] -rotate-[3deg]",
    sizes: "(max-width: 1024px) 1px, 29vw",
  },
  {
    slug: "food",
    label: "Food & Drinks",
    src: "/assets/images/hero/hero-food.jpg",
    position: "bottom-0 right-0 z-20 w-[37%] aspect-[4/3] rotate-[6deg]",
    sizes: "(max-width: 1024px) 1px, 19vw",
  },
];

/**
 * Real, working searches — not decoration.
 *
 * These point at `/search?q=`, which is a server-rendered page, so each chip is
 * a crawlable link rather than a client-side filter. With inventory still thin
 * most of these will land on the empty state; that is a listings problem, not a
 * markup one, and the links start returning results as stock is added.
 */
const POPULAR_SEARCHES = [
  "Toyota Camry",
  "3 Bedroom Apartment",
  "iPhone 15",
  "Jobs",
  "Food & Drinks",
];

export default function Hero() {
  return (
    /*
     * `pt-28` clears the fixed 80px header.
     *
     * At `lg` the section takes the full viewport height and centres its
     * contents, so the hero is the whole first screen and the next section
     * starts below the fold. Without it the hero was only as tall as its
     * content, which left "Browse categories" clipped at the fold — the page
     * read as already underway before the promise had landed.
     *
     * `min-h` rather than `h`: on a short viewport the section still grows to
     * fit its content instead of clipping it. `svh` rather than `vh` or `dvh`:
     * `vh` overshoots on mobile (it includes the browser chrome, so the hero
     * would push past the fold), and `dvh` resizes as that chrome hides and
     * shows, which makes the hero jump under the visitor's thumb.
     *
     * The background is a warm off-white rather than the old saturated orange
     * gradient — the orange is still the page's accent, but at button scale
     * where it has contrast, instead of as a wall behind small white text.
     *
     * The gradient that lifts the cream into the white page below lives on its
     * own `dark:hidden` layer rather than as a `dark:` twin of the background
     * utility. A gradient is `background-image`, so `dark:bg-gray-900` would
     * set the colour and leave the image painting over it — the two would have
     * the same specificity and the winner would come down to source order.
     */
    <section className="relative overflow-hidden bg-[#f9f4ee] pb-14 pt-28 dark:bg-gray-900 lg:flex lg:min-h-svh lg:flex-col lg:justify-center lg:pb-24 lg:pt-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f9f4ee_0%,#fdfbf6_58%,#ffffff_100%)] dark:hidden"
      />

      {/*
        Backdrop: a Minna townscape filling the right of the band and running to
        the viewport edge, faded out to the left so it never fights the headline.

        It sits at section level, not inside the collage box, because the
        reference bleeds it off-canvas while the product cards stay contained.
        Kept faint in dark mode so it reads as atmosphere rather than as a bright
        rectangle pasted onto a dark page.

        It is a generic West African townscape, NOT a survey photograph of
        Minna — it is scenery, not a claim about the city.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[56%] lg:block"
      >
        <Image
          src="/assets/images/hero/hero-backdrop.jpg"
          alt=""
          fill
          sizes="56vw"
          className="object-cover [mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.45)_45%,black_100%)] dark:opacity-20"
        />
      </div>

      <div className={`${CONTAINER} relative`}>
        {/*
          The left column takes slightly more than half at `lg`. It is not a
          cosmetic split: at 48px the headline needs ~580px, which a 50/50 column
          cannot give it, and a headline that breaks after "around" is worse than
          a slightly narrower collage.
        */}
        <div className="grid items-center mt-[5%] gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-8">
          {/* ---------------- Left: the promise and the control ---------------- */}
          <div>
            {/*
              A static label, not a dropdown. The marketplace is Minna-only, so
              a location selector would have exactly one selectable value — and
              the previous version's chevron invited a click that did nothing.
            */}
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300">
              <MapPin
                className="h-4 w-4 shrink-0 text-[#e2703a] dark:text-[#f7a16b]"
                aria-hidden="true"
              />
              Minna, Niger
            </p>

            {/*
              A confident hero scale. "Everything around Minna." is a long line,
              so the size and the column width below are chosen together: the
              left column is given a little more than half at `lg` specifically
              so this headline can be 48px without breaking mid-phrase. Tight
              leading and `tracking-tight` carry the weight.
            */}
            <h1 className="mt-3 text-[2rem] font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-[2.5rem] lg:text-5xl dark:text-gray-100">
              Everything around Minna.
              <span className="block text-[#f58c55]">In one marketplace.</span>
            </h1>

            <p className="mt-4 max-w-xl text-base text-gray-600 sm:text-lg dark:text-gray-300">
              Buy, sell and discover great deals from people and businesses
              around you.
            </p>

            <div className="mt-7">
              <HeroSearch />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Popular searches:
              </span>
              {POPULAR_SEARCHES.map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="rounded-full border border-[#e8dcc4] bg-white/70 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-[#f58c55] hover:text-[#e2703a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f58c55] focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-200 dark:hover:border-[#f7a16b] dark:hover:text-[#f7a16b] dark:focus-visible:ring-offset-gray-900"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>

          {/* ---------------- Right: the collage ---------------- */}
          {/*
            Desktop only. Below `lg` the column would be ~340px wide and four
            overlapping cards would be unreadable, so mobile gets the copy, the
            search control and — immediately below — the category grid, which
            already carries product imagery. The images are still marked
            `sizes="1px"` at that width so no phone ever downloads them.
          */}
          <div className="relative hidden aspect-[6/5] w-full lg:block">
            {COLLAGE.map((card) => {
              const Icon = getCategoryIcon(card.slug);
              return (
                <div
                  key={card.slug}
                  className={`absolute ${card.position} overflow-hidden rounded-2xl bg-white shadow-xl ring-[6px] ring-white dark:bg-gray-800 dark:ring-gray-800`}
                >
                  <Image
                    src={card.src}
                    alt={card.label}
                    fill
                    sizes={card.sizes}
                    priority={card.priority}
                    className="object-cover"
                  />
                  <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-sm dark:bg-gray-900/90 dark:text-gray-100">
                    <Icon
                      className="h-3.5 w-3.5 text-[#e2703a] dark:text-[#f7a16b]"
                      aria-hidden="true"
                    />
                    {card.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
