'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './admin/Sidebar';
import Topbar from './Topbar';
import WhatsAppButton from '@/components/ui/WhatsAppButton'; 
import { SidebarProvider, useSidebar } from './admin/SidebarContext';
import { CartProvider } from '@/contexts/CartContext';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isOpen } = useSidebar();
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Routes where header should be shown (home, auth pages, and dynamic product pages)
  const showHeader = ['/', '/admin/login', '/admin/register', '/terms', '/policy', '/cookies', '/cancellation'].includes(pathname) || 
                    /^\/[a-zA-Z0-9-]+\/[a-zA-Z0-9]+$/.test(pathname);
  
  // Routes where sidebar should be shown (admin routes)
  const showSidebar = ['/admin/dashboard', '/products'].some(route => pathname.startsWith(route));
  
  // Show topbar wherever sidebar is shown
  const showTopbar = showSidebar;

  // Define the routes where you want to show the footer
  const showFooterRoutes = ['/', '/food', '/home-items', '/real-estates'];
  const showFooter = showFooterRoutes.some(route => pathname.startsWith(route)) || 
                    /^\/[a-zA-Z0-9-]+\/[a-zA-Z0-9]+$/.test(pathname);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8f5e6] dark:bg-gray-900 transition-colors duration-300">
      {showSidebar && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        {showHeader && <Header />}
        {showTopbar && (
          <div className={`transition-all duration-300 ${
            showSidebar 
              ? (isMobile 
                  ? 'ml-0' // On mobile, always ml-0 so topbar covers full screen
                  : 'ml-[256px]' // On desktop, account for sidebar
                )
              : ''
          }`}>
            <Topbar />
          </div>
        )}
        <main 
          className={`flex-1 overflow-auto transition-all duration-300 ${
            showSidebar 
              ? (isMobile 
                  ? 'ml-0' // On mobile, always ml-0 so content covers full screen
                  : 'ml-[256px]' // On desktop, always account for sidebar
                )
              : ''
          } bg-white dark:bg-gray-800`}
        >
          {children}
        </main>

        {/* Conditionally render the footer */}
        {showFooter && <Footer />}

        {/* WhatsApp button always rendered */}
        <WhatsAppButton />
      </div>
    </div>
  );
}

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SidebarProvider>
        <LayoutContent>{children}</LayoutContent>
      </SidebarProvider>
    </CartProvider>
  );
}