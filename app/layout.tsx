'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { SidebarProvider, useSidebar } from '@/app/context/SidebarContext';
import Sidebar from '@/app/components/Navigation/Sidebar';
import CustomHeader from '@/app/components/Navigation/CustomHeader';
import Footer from '@/app/components/Navigation/Footer';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

interface RootLayoutProps {
  children: ReactNode;
}

function AppContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isExpanded, isReady, toggleSidebar: onToggle } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Delay transition until after initial mount
  useEffect(() => {
    if (mounted && isReady) {
      const timer = setTimeout(() => setCanAnimate(true), 100);
      return () => clearTimeout(timer);
    }
  }, [mounted, isReady]);

  const noLayoutRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];
  const isLanding = pathname === '/';
  const hasSidebar = !noLayoutRoutes.includes(pathname) && !isLanding;
  const isAuthPage = noLayoutRoutes.includes(pathname);

  // Padding should only apply if sidebar is present
  const paddingClass = hasSidebar
    ? (isExpanded ? 'pl-[280px]' : 'pl-[80px]')
    : 'pl-0';

  const transitionClass = canAnimate ? 'transition-[padding] duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)]' : '';

  if (!mounted || !isReady) return <div className="min-h-screen bg-[#111827]" />;

  return (
    <div className="min-h-screen flex flex-col relative font-sans text-white">
      {/* Background Glows (Global) */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <img
          src="/assets/TupForLanding.jpg"
          alt="Background"
          className="w-full h-full object-cover blur-[15px] scale-110 opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E1E2E]/95 via-[#262637]/90 to-black/95" />
      </div>

      {hasSidebar && <Sidebar />}

      <div className={`flex-1 flex flex-col ${transitionClass} ${paddingClass}`}>
        {!isAuthPage && <CustomHeader isLanding={isLanding} />}

        <main className="flex-grow">
          {children}
        </main>

        {!isAuthPage && <Footer />}
      </div>
    </div>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
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
        <SidebarProvider>
          <AppContent>
            {children}
          </AppContent>
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
            theme="dark"
          />
        </SidebarProvider>
      </body>
    </html>
  );
}
