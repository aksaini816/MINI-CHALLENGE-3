import React from 'react';
import { Menu, Moon, Sun, Bell } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps): React.JSX.Element {
  const { toggleSidebar, darkMode, toggleDarkMode } = useUIStore();

  return (
    <header
      className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border"
      role="banner"
    >
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
          aria-label="Open navigation menu"
          aria-expanded="false"
          aria-controls="sidebar"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>

        {/* Page title */}
        {title && (
          <h1 className="text-lg font-semibold text-foreground hidden sm:block">{title}</h1>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={darkMode}
          >
            {darkMode ? (
              <Sun className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>

          {/* Notifications placeholder */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  );
}
