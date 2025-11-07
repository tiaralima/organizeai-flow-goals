
import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import { DesktopSidebar } from './DesktopSidebar';

type AppLayoutProps = {
  children: ReactNode;
  hideNavigation?: boolean;
};

export const AppLayout = ({ children, hideNavigation = false }: AppLayoutProps) => {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="dark min-h-screen w-full bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Desktop layout */}
      <div className="hidden md:flex md:min-h-screen">
        {!hideNavigation && !isAuthRoute && <DesktopSidebar />}

        <div className="flex-1 relative md:pl-64">
          {/* Decorative gradient blobs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl" />
          </div>

          <main className="relative z-10 px-10 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="animate-fade-in">{children}</div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden min-h-screen w-full max-w-md mx-auto flex flex-col">
        <main className="flex-1 px-4 py-6 overflow-auto pb-24">
          <div className="animate-fade-in">{children}</div>
        </main>
        {!hideNavigation && !isAuthRoute && <BottomNavigation />}
      </div>
    </div>
  );
};
