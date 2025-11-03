import React from 'react';

export default function Footer() {
  return (
    <>
      <footer className="bg-[#f58c55] dark:bg-gray-800 mt-20 text-white dark:text-gray-200 py-12 shadow-lg dark:shadow-gray-900 transition-colors duration-300">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 justify-items-center">
            {/* Flamingo Links */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-3xl font-semibold text-white dark:text-gray-100" style={{ fontFamily: 'Parisienne, cursive' }}>
                Flamingo
              </h3>
              <ul className="space-y-3 text-sm font-medium text-white/90 dark:text-gray-300 text-center">
                <li className="hover:text-[#f8f5e6] dark:hover:text-white transition-colors duration-200 cursor-pointer">
                  Flamingo French Fries
                </li>
                <li className="hover:text-[#f8f5e6] dark:hover:text-white transition-colors duration-200 cursor-pointer">
                  Flamingo Enterprise
                </li>
                <li className="hover:text-[#f8f5e6] dark:hover:text-white transition-colors duration-200 cursor-pointer">
                  Flourish Real Estate
                </li>
              </ul>
            </div>

            {/* Social Media Links */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-3xl font-semibold text-white dark:text-gray-100" style={{ fontFamily: 'Parisienne, cursive' }}>
                Socials
              </h3>
              <ul className="space-y-3 text-sm font-medium text-white/90 dark:text-gray-300 text-center">
                <li>
                  <a
                    href="https://www.instagram.com/Flamingo_GK"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#f8f5e6] dark:hover:text-white transition-colors duration-200 flex items-center gap-2 justify-center"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.02.049 1.717.209 2.327.437a4.68 4.68 0 011.702 1.106 4.68 4.68 0 011.106 1.702c.228.61.388 1.307.437 2.327.047 1.024.06 1.378.06 3.808s-.013 2.784-.06 3.808c-.049 1.02-.209 1.717-.437 2.327a4.68 4.68 0 01-1.106 1.702 4.68 4.68 0 01-1.702 1.106c-.61.228-1.307.388-2.327.437-1.024.047-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.02-.049-1.717-.209-2.327-.437a4.68 4.68 0 01-1.702-1.106 4.68 4.68 0 01-1.106-1.702c-.228-.61-.388-1.307-.437-2.327-.047-1.024-.06-1.378-.06-3.808s.013-2.784.06-3.808c.049-1.02.209-1.717.437-2.327a4.68 4.68 0 011.106-1.702 4.68 4.68 0 011.702-1.106c.61-.228 1.307-.388 2.327-.437 1.024-.047 1.378-.06 3.808-.06z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M12 6.865a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 8.468a3.333 3.333 0 110-6.667 3.333 3.333 0 010 6.667zM16.94 5.553a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/profile.php?id=61579342001391"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#f8f5e6] dark:hover:text-white transition-colors duration-200 flex items-center gap-2 justify-center"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.tiktok.com/@Flamingo_GK"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#f8f5e6] dark:hover:text-white transition-colors duration-200 flex items-center gap-2 justify-center"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
                      />
                    </svg>
                    TikTok
                  </a>
                </li>
              </ul>
            </div>

            {/* Links */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-3xl font-semibold text-white dark:text-gray-100" style={{ fontFamily: 'Parisienne, cursive' }}>
                Links
              </h3>
              <ul className="space-y-3 text-sm font-medium text-white/90 dark:text-gray-300 text-center">
                <li>
                  <a href="/policy" className="hover:text-[#f8f5e6] dark:hover:text-white transition-colors duration-200">
                    Policy
                  </a>
                </li>
                <li>
                  <a href="/cancellation" className="hover:text-[#f8f5e6] dark:hover:text-white transition-colors duration-200">
                    Cancellation Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-[#f8f5e6] dark:hover:text-white transition-colors duration-200">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/cookies" className="hover:text-[#f8f5e6] dark:hover:text-white transition-colors duration-200">
                    Cookie Settings
                  </a>
                </li>
              </ul>
            </div>

            {/* Locations */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-3xl font-semibold text-white dark:text-gray-100" style={{ fontFamily: 'Parisienne, cursive' }}>
                Locations
              </h3>
              <ul className="space-y-3 text-sm font-medium text-white/90 dark:text-gray-300 text-center max-w-xs">
                <li className="hover:text-[#f8f5e6] dark:hover:text-white transition-colors duration-200">
                  <svg className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Opposite FUT Main Campus, Gidan Kwano, Minna
                </li>
                <li className="hover:text-[#f8f5e6] dark:hover:text-white transition-colors duration-200">
                  <svg className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Shop 1, Opposite Castle Snow Plaza, Talba Road, Gidan Kwano
                </li>
                <li className="hover:text-[#f8f5e6] dark:hover:text-white transition-colors duration-200">
                  <svg className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Flamingo Warehouse, Gidan Mangoro, Minna
                </li>
                <li className="hover:text-[#f8f5e6] dark:hover:text-white transition-colors duration-200">
                  <svg className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Elenoi Head Office, No. 4 KFF Street, After Central Mosque, Gidan Kwano
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center mt-10 text-sm font-medium border-t border-[#f7a16b] dark:border-gray-600 pt-6">
            <p className="text-white/90 dark:text-gray-300">© 2025 Elenoi Nig Limited. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}