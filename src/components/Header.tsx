'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaShoppingCart } from 'react-icons/fa';
import { ChevronDown, LayoutGrid, MapPin, Menu, Plus, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { MARKETPLACE_CATEGORIES, MINNA_AREAS } from '@/config/marketplace';
import { buildAreaPath, buildCategoryPath, isAreaSlug } from '@/config/urls';
import { getCategoryIcon } from '@/config/categoryIcons';
import { CONTAINER } from '@/config/layout';
import ThemeToggle from './ThemeToggle';

/**
 * Global header (spec §1) — "storefront masthead".
 *
 * The bar follows the theme: a light surface with the warm brand border in
 * light mode, `gray-900` in dark. It is `fixed`, so it floats over both the
 * cream marketplace pages and the white ones, and every control therefore
 * needs a `dark:` twin — dropping one makes that control invisible in one of
 * the two themes. Only the dropdown *panels* are unconditionally page surfaces.
 *
 * Nav is three destinations: Marketplace (the /minna hub), Explore (the Minna
 * areas) and Categories (the nine marketplace categories). Nothing was
 * orphaned by the move from six items — Food & Drinks and Internet are two of
 * the nine categories, and Home Items keeps its own entry in the Categories
 * panel because it is a separate catalogue behind /home-items.
 *
 * This also drops the two client-side category fetches the old header ran on
 * every page (`usePublicCategories`, `useHomeItemCategories`); the panels are
 * now built from the static taxonomy, so the header no longer issues requests
 * to render.
 */

/** Paid banner advertising lives at /create-ad; listing a property is free. */
const SELL_HREF = '/landlord/add-properties';

/** The marketplace hub. Both Explore and Categories resolve to /minna/<slug>. */
const MARKETPLACE_HREF = '/minna';

/*
 * Shared focus treatment. The ring offset tracks the bar colour — white in
 * light mode, `gray-900` in dark — so the ring never floats on a mismatched
 * square.
 */
const FOCUS_RING =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f58c55] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900';

/*
 * Nav triggers stretch to the full bar height so the active underline can sit
 * on the bar's bottom edge, which is where the reference puts it.
 */
const NAV_ITEM = `relative flex h-full items-center gap-1.5 whitespace-nowrap px-3 text-sm font-medium text-gray-700 transition-colors hover:text-[#e2703a] xl:px-4 dark:text-gray-200 dark:hover:text-white ${FOCUS_RING}`;

/** The active/open label colour, layered on top of NAV_ITEM. */
const NAV_ACTIVE = 'text-gray-900 dark:text-white';

/** Shared hover for the round icon buttons (cart, theme, menu). */
const ICON_BUTTON_HOVER =
  'hover:bg-[#f8f5e6] hover:text-[#e2703a] dark:hover:bg-white/10 dark:hover:text-white';

const PANEL =
  'invisible absolute left-0 top-full z-[10000] rounded-xl border border-gray-200 bg-white p-2 opacity-0 shadow-xl transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 dark:border-gray-700 dark:bg-gray-800';

const PANEL_LINK = `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-[#f8f5e6] hover:text-[#e2703a] dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-[#f7a16b] ${FOCUS_RING}`;

/** Small uppercase label that heads a dropdown panel. */
const PanelLabel = ({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <p className="flex items-center gap-2 px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    {children}
  </p>
);

/** The orange rule under the current section's label. */
const ActiveUnderline = () => (
  <span
    className="absolute inset-x-2 bottom-0 h-0.5 rounded-t-full bg-[#f58c55]"
    aria-hidden="true"
  />
);

const Header = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile menu on navigation, otherwise it stays open over the page
  // the visitor just asked for.
  useEffect(() => setMobileMenuOpen(false), [pathname]);

  /*
   * Which of the three sections the visitor is currently in.
   *
   * /minna/<slug> serves BOTH an area and a category — the catch-all page
   * decides between them with `isAreaSlug` — so the header has to ask the same
   * question to know whether Explore or Categories owns the current page.
   * A listing URL (/minna/<area>/<category>/<title>-<id>) starts with an area
   * slug, so it correctly highlights Explore.
   */
  const segments = pathname.split('/').filter(Boolean);
  const hub = segments[0] === 'minna' ? segments[1] : undefined;
  const inAreas = hub ? isAreaSlug(hub) : false;

  const isMarketplaceActive = pathname === MARKETPLACE_HREF;
  const isExploreActive = inAreas || pathname.startsWith('/minna-guide');
  const isCategoriesActive = Boolean(hub) && !inAreas;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[9998] isolate border-b border-[#f0e6d0] bg-white transition-shadow duration-300 dark:border-gray-700 dark:bg-gray-900 ${
        scrolled ? 'shadow-lg shadow-black/5 dark:shadow-black/40' : ''
      }`}
    >
      {/*
        The shared container, not Tailwind's `container`. The latter is a
        full-breakpoint-width box, so the masthead's content floated 136px to
        the left of the page content it sits over.
      */}
      <div className={`${CONTAINER} flex h-20 items-center gap-4 lg:gap-6`}>
        {/*
          The logo is square (500x500), so the intrinsic width/height have to be
          square too: `h-12 w-auto` derives its width from that ratio, and the
          previous 160x60 made the square artwork render 128x48 — stretched to
          roughly 2.7x its width.
        */}
        <Link
          href="/"
          className={`shrink-0 rounded-lg ${FOCUS_RING}`}
          aria-label="Flamingo — go to homepage"
        >
          <Image
            src="/assets/icons/logo.png"
            alt="Flamingo"
            width={96}
            height={96}
            className="h-12 w-auto"
            priority
          />
        </Link>

        <nav className="hidden h-full shrink-0 items-stretch lg:flex">
          <Link
            href={MARKETPLACE_HREF}
            aria-current={isMarketplaceActive ? 'page' : undefined}
            className={`${NAV_ITEM} ${isMarketplaceActive ? NAV_ACTIVE : ''}`}
          >
            Marketplace
            {isMarketplaceActive && <ActiveUnderline />}
          </Link>

          <NavDisclosure
            title="Explore"
            active={isExploreActive}
            panelClassName="w-[26rem]"
          >
            <PanelLabel icon={MapPin}>Minna areas</PanelLabel>
            <div className="grid grid-cols-2 gap-0.5">
              {MINNA_AREAS.map((area) => (
                <Link
                  key={area.slug}
                  href={buildAreaPath(area.slug)}
                  className={PANEL_LINK}
                >
                  {area.name}
                </Link>
              ))}
            </div>
            <div className="my-1.5 border-t border-gray-200 dark:border-gray-700" />
            <Link href="/minna-guide" className={PANEL_LINK}>
              Minna marketplace guide
            </Link>
          </NavDisclosure>

          <NavDisclosure
            title="Categories"
            active={isCategoriesActive}
            panelClassName="w-[30rem]"
          >
            <PanelLabel icon={LayoutGrid}>Browse categories</PanelLabel>
            <div className="grid grid-cols-2 gap-0.5">
              {MARKETPLACE_CATEGORIES.map((category) => {
                const Icon = getCategoryIcon(category.slug);
                return (
                  <Link
                    key={category.slug}
                    href={buildCategoryPath(category.slug)}
                    className={PANEL_LINK}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[#e2703a] dark:text-[#f7a16b]" />
                    {category.name}
                  </Link>
                );
              })}
            </div>
            <div className="my-1.5 border-t border-gray-200 dark:border-gray-700" />
            <Link href="/home-items" className={PANEL_LINK}>
              Home Items
            </Link>
            <Link
              href={MARKETPLACE_HREF}
              className={`${PANEL_LINK} font-semibold text-[#e2703a] dark:text-[#f7a16b]`}
            >
              View all categories
            </Link>
          </NavDisclosure>
        </nav>

        {/* Right cluster: primary action, then the two utility controls. */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Link
            href={SELL_HREF}
            className={`hidden items-center gap-2 rounded-full bg-[#f58c55] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#f47a45] sm:inline-flex lg:px-5 ${FOCUS_RING}`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/25">
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            Sell something
          </Link>

          <ThemeToggle />

          <Link
            href="/cart"
            className={`relative shrink-0 rounded-full p-2 text-gray-700 transition-colors dark:text-gray-200 ${ICON_BUTTON_HOVER} ${FOCUS_RING}`}
            aria-label={
              totalItems > 0 ? `Cart, ${totalItems} items` : 'Cart, empty'
            }
          >
            <FaShoppingCart size={20} aria-hidden="true" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#f47a45] text-[10px] font-bold text-white dark:border-gray-900">
                {totalItems}
              </span>
            )}
          </Link>

          <button
            type="button"
            className={`rounded-full p-2 text-gray-700 transition-colors lg:hidden dark:text-gray-200 ${ICON_BUTTON_HOVER} ${FOCUS_RING}`}
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/*
        Mobile menu. The primary action leads, because it is hidden from the
        mobile bar to keep the cluster down to three controls. Capped in height
        and scrollable — nine categories plus nine areas overflows a phone.
      */}
      {mobileMenuOpen && (
        <nav
          id="mobile-nav"
          className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-[#f0e6d0] bg-white pb-3 lg:hidden dark:border-gray-700 dark:bg-gray-900"
        >
          <div className={CONTAINER}>
            <Link
              href={SELL_HREF}
              className={`mt-3 flex items-center justify-center gap-2 rounded-full bg-[#f58c55] px-4 py-3 text-sm font-bold text-white sm:hidden ${FOCUS_RING}`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Sell something
            </Link>

            <MobileLink href={MARKETPLACE_HREF} label="Marketplace" />

            <MobileDisclosure title="Explore" defaultOpen={isExploreActive}>
              {MINNA_AREAS.map((area) => (
                <MobileLink
                  key={area.slug}
                  href={buildAreaPath(area.slug)}
                  label={area.name}
                  nested
                />
              ))}
              <MobileLink href="/minna-guide" label="Minna marketplace guide" nested />
            </MobileDisclosure>

            <MobileDisclosure
              title="Categories"
              defaultOpen={isCategoriesActive}
            >
              {MARKETPLACE_CATEGORIES.map((category) => (
                <MobileLink
                  key={category.slug}
                  href={buildCategoryPath(category.slug)}
                  label={category.name}
                  nested
                />
              ))}
              <MobileLink href="/home-items" label="Home Items" nested />
            </MobileDisclosure>
          </div>
        </nav>
      )}
    </header>
  );
};

/**
 * A top-level nav item with a panel of children.
 *
 * The trigger is a button, not a link: its children are the real destinations.
 * The panel is revealed by hover *or* focus-within *or* the open state, so the
 * links stay crawlable and reachable by keyboard — an earlier hover-only
 * version was unreachable without a mouse.
 */
const NavDisclosure = ({
  title,
  active,
  panelClassName,
  children,
}: {
  title: string;
  active: boolean;
  panelClassName?: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="group relative h-full"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((previous) => !previous)}
        className={`${NAV_ITEM} ${active || open ? NAV_ACTIVE : ''}`}
      >
        {title}
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-70 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
        {active && <ActiveUnderline />}
      </button>

      <div className={`${PANEL} ${panelClassName ?? ''}`}>{children}</div>
    </div>
  );
};

const MobileLink = ({
  href,
  label,
  nested = false,
}: {
  href: string;
  label: string;
  nested?: boolean;
}) => (
  <Link
    href={href}
    className={`block rounded-lg px-4 py-3 font-medium text-gray-800 dark:text-gray-200 ${ICON_BUTTON_HOVER} ${FOCUS_RING} ${
      nested ? 'text-sm' : ''
    }`}
  >
    {label}
  </Link>
);

/**
 * Mobile disclosure. A plain toggle button — an earlier version nested an <a>
 * inside a <button>, which is invalid HTML and gave the control two competing
 * actions.
 */
const MobileDisclosure = ({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-[#f0e6d0] first:border-t-0 dark:border-gray-700">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-medium text-gray-800 dark:text-gray-200 ${ICON_BUTTON_HOVER} ${FOCUS_RING}`}
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      {open && <div className="pb-2 pl-3">{children}</div>}
    </div>
  );
};

export default Header;
