import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  Target,
  Trophy,
  BookOpen,
  Lightbulb,
  Settings,
  LogOut,
  Leaf,
  X,
  Shield,
  TrendingDown,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calculator', icon: Calculator, label: 'Calculator' },
  { to: '/insights', icon: Lightbulb, label: 'AI Insights' },
  { to: '/goals', icon: Target, label: 'My Goals' },
  { to: '/challenges', icon: Trophy, label: 'Challenges' },
  { to: '/knowledge', icon: BookOpen, label: 'Knowledge Hub' },
  { to: '/history', icon: TrendingDown, label: 'History' },
];

const adminNavItems: NavItem[] = [
  { to: '/admin', icon: Shield, label: 'Admin Panel', adminOnly: true },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps): React.JSX.Element {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate('/login');
  };

  const items = user?.role === 'ADMIN' ? [...navItems, ...adminNavItems] : navItems;

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="sidebar"
        aria-label="Main navigation"
        className={cn(
          'fixed left-0 top-0 z-30 h-full w-64 bg-card border-r border-border',
          'flex flex-col transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          className,
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-4.5 h-4.5 text-primary-foreground" aria-hidden="true" />
            </div>
            <div>
              <span className="font-semibold text-sm text-foreground">CarbonTrack</span>
              <p className="text-xs text-muted-foreground">Sustainability Platform</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin" aria-label="Sidebar">
          <ul role="list" className="space-y-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    )
                  }
                  aria-current={undefined}
                  onClick={() => setSidebarOpen(false)}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={cn('h-4 w-4 flex-shrink-0', isActive && 'text-primary')}
                        aria-hidden="true"
                      />
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-border p-3 space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 w-full',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            Settings
          </NavLink>
          <button
            onClick={() => void handleLogout()}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-all duration-150',
              'text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
            aria-label="Log out of your account"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log Out
          </button>

          {/* User avatar */}
          <div className="flex items-center gap-3 px-3 py-2 mt-2 rounded-lg bg-muted/50">
            <div
              className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold"
              aria-hidden="true"
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
