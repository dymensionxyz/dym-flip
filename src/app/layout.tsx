import React, { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.scss';

const inter = Inter({ subsets: [ 'latin' ], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'Dym Flip',
    // icons: {
    //     icon: '/favicon.ico',
    //     apple: '/logo192.png',
    // },
    // manifest: '/manifest.json',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode; }>) {
    return (
        <html lang='en' className={inter.variable}>
            <body className={inter.className}>{children}</body>
        </html>
    );
}
