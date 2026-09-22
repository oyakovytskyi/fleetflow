import { Source_Sans_3 } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

const sans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FleetFlow · Operations',
  description: 'Live fleet map and delivery operations',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
