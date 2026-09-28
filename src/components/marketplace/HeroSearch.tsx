"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { MARKETPLACE_CATEGORIES } from "@/config/marketplace";
import { buildCategoryPath } from "@/config/urls";

/**
 * Homepage search control (spec §2, §9).
 *
 * Two controls that each do one job:
 *  - the category select browses straight to that category hub
 *  - the text field searches listings, submitting to /search
 *
 * There is deliberately no location selector: the marketplace is Minna-only,
 * so it would be a control with a single possible value.
 *
 * THE TWO JOBS DO NOT COMBINE, and that is deliberate. Picking a category
 * ignores whatever is in the text field. Scoping a query by category would be
 * the nicer interaction, but `/search` is backed solely by
 * `GET /real-estates/public` (`src/lib/properties.ts`), whose `categorySlug`
 * values are all property ones — houses-for-rent, houses-for-sale,
 * land-for-sale, student-accommodation. There is no cross-category listing
 * index, so `?category=vehicles` could only ever return zero results: it would
 * look like a scope and behave like a dead end. Revisit when that endpoint
 * exists.
 *
 * Because the two really are separate, the control says so: a single hairline
 * runs between the field and the select rather than presenting them as one
 * merged scope. It is drawn as its own element — horizontal when the rows
 * stack, vertical when they sit side by side — so its length and colour are not
 * at the mercy of which border utility wins.
 */
export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(
      trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search",
    );
  };

  return (
    /*
     * One card at every width — a stacked card below `sm`, the pill from `sm`
     * up. Both silhouettes keep the group reading as a single search control;
     * only the axis changes.
     *
     * The surface is white in light mode and the dark card surface (`gray-800`,
     * the same one the filter sidebar and hub cards use) in dark mode. In light
     * mode the white card is the one solid object on the cream hero and the
     * orange button is what carries the accent; in dark mode a white slab on a
     * `gray-900` page was the brightest thing on the screen and fought the
     * button for attention, so the card steps back to `gray-800` and the button
     * stays orange against it.
     *
     * Which means every control inside needs its `dark:` twin — text, icons, the
     * hairline and the select's native popup. Dropping one leaves that control
     * invisible against `gray-800`.
     */
    <form
      onSubmit={handleSubmit}
      role="search"
      className="mx-auto flex w-full max-w-2xl flex-col rounded-2xl border border-gray-100 dark:border-gray-700 bg-white p-2 shadow-sm sm:flex-row sm:items-center sm:rounded-full dark:bg-gray-800"
    >
      {/*
        The label sits inside the wrapper rather than beside it: a `sr-only`
        sibling would still be a flex child, and these rows are laid out
        edge to edge.

        Type is `text-base` across all three controls, not `text-sm` on the two
        that were smaller. Below 16px, iOS Safari zooms the viewport on focus —
        which the select was tripping, since it was the one form field at 14px.
      */}
      <div className="flex flex-1 items-center gap-2.5 rounded-xl px-3.5 focus-within:ring-2 focus-within:ring-[#f58c55]/20 sm:rounded-l-full sm:rounded-r-none dark:focus-within:ring-[#f7a16b]/30">
        <label htmlFor="home-search" className="sr-only">
          Search the Minna marketplace
        </label>
        <Search className="h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
        <input
          id="home-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search cars, homes, phones, furniture…"
          className="w-full bg-transparent py-3 text-sm sm:text-base leading-6 text-gray-900 placeholder-gray-500 focus:outline-none dark:text-gray-100 dark:placeholder-gray-400"
        />
      </div>

      {/*
        The hairline. `h-px w-full` reads as a rule between stacked rows; from
        `sm` it turns into `w-px` and stretches to the row height instead. Drawn
        as an element rather than a `border-t` so it can change axis, and so the
        rounded corners of the rows above and below cannot curve it.
      */}
      <span
        aria-hidden="true"
        className="block h-px w-full shrink-0 bg-gray-200 sm:my-2 sm:h-auto sm:w-px sm:self-stretch dark:bg-gray-700"
      />

      <div className="relative rounded-xl focus-within:ring-2 focus-within:ring-[#f58c55]/20 sm:shrink-0 sm:rounded-none dark:focus-within:ring-[#f7a16b]/30">
        <label htmlFor="home-category" className="sr-only">
          Browse a category
        </label>
        <select
          id="home-category"
          value=""
          onChange={(event) => {
            if (event.target.value)
              router.push(buildCategoryPath(event.target.value));
          }}
          /*
           * `appearance-none` drops the browser's own chevron, which is the one
           * part of this control that could not be sized, coloured or aligned to
           * anything else — it rendered at whatever weight the platform chose and
           * sat on a different baseline from the text. The arrow below replaces
           * it.
           *
           * `color-scheme` follows the card, not the page: the native option
           * popup is drawn by the OS, so it has to be told which surface it is
           * opening over — `light` on the white card, `dark` on `gray-800`. Get
           * it wrong and the popup is a white flash off a dark control.
           */
          className="w-full cursor-pointer appearance-none bg-transparent py-3 pl-3.5 pr-10 text-sm sm:text-base font-medium leading-6 text-gray-700 [color-scheme:light] focus:outline-none sm:w-auto dark:text-gray-200 dark:[color-scheme:dark]"
        >
          <option value="">All categories</option>
          {MARKETPLACE_CATEGORIES.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
        />
      </div>

      {/*
        Full width when the card is stacked — a thumb-height target on the row a
        thumb already rests on — then an inset pill button beside the select.
        `ring-offset` is set to the card's own surface so the focus ring reads as
        a ring rather than a white halo on the dark card.
      */}
      <button
        type="submit"
        className="mt-2 rounded-xl bg-[#f58c55] px-7 py-2 sm:py-3 text-sm sm:text-base font-semibold text-white transition-colors hover:bg-[#f47a45] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f47a45] focus-visible:ring-offset-2 sm:mt-0 sm:rounded-full dark:focus-visible:ring-offset-gray-800"
      >
        Search
      </button>
    </form>
  );
}
