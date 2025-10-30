'use client';

import { usePathname } from 'next/navigation';
import Header from '../components/Header'; 
import Footer from '../components/Footer'; 
import { ReactNode } from 'react';

interface LayoutClientProps {
  children: ReactNode;
}

const LayoutClient = ({ children }: LayoutClientProps) => {
  const pathname = usePathname();
  const showHeaderRoutes = ['/food', '/home-items', '/real-estates'];
  const showFooterRoutes = ['/food', '/home-items', '/real-estates'];

  return (
    <>
      {showHeaderRoutes.includes(pathname) && <Header />}
      {children}
      {showFooterRoutes.includes(pathname) && <Footer />} {/* Conditionally render Footer */}
    </>
  );
};

export default LayoutClient;
