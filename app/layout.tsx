'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const hideLayoutHeader = ['/', '/home', '/documents'].includes(pathname);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="TUPT Thesis Archive - AI-powered thesis analysis" />
        <link rel="icon" href="/assets/tup-logo.png" />
        <title>TUPT-Thesis Archive</title>
      </head>
      <body className="antialiased font-sans">
        <div className="min-h-screen flex flex-col relative">
          <main className="flex-grow">
            {children}
          </main>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </body>
    </html>
  );
}
