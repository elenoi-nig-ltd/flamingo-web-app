// app/layout.tsx
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import LayoutClient from '@/components/LayoutClient';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Flamingo',
  description: 'Food | Shop | Internet | Real Estates',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}