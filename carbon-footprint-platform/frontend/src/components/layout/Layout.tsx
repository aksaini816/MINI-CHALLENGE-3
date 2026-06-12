import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps): React.JSX.Element {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <div
        className={cn(
          'flex flex-col flex-1 min-w-0 transition-all duration-300',
          'lg:ml-0',
        )}
      >
        <Header title={title} />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin focus:outline-none"
          aria-label="Main content"
        >
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
