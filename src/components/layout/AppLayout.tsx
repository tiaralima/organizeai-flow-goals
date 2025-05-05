
import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';

type AppLayoutProps = {
  children: ReactNode;
  hideNavigation?: boolean;
};

export const AppLayout = ({ children, hideNavigation = false }: AppLayoutProps) => {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen w-full max-w-md mx-auto flex flex-col">
      <main className="flex-1 px-4 py-6 overflow-auto">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
      {!hideNavigation && !isAuthRoute && <BottomNavigation />}
    </div>
  );
};
