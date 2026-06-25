import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Settings,
  User,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  LogOut,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Bell,
  HelpCircle,
  ExternalLink,
  Leaf
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu } from 'lucide-react';

const FarmerSidebar = ({ user, onLogout, onAddProduct }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/farmer/dashboard',
    },
    {
      title: 'My Products',
      icon: Package,
      path: '/farmer/products',
      hasSubmenu: true,
      onAddProduct,
    },
    {
      title: 'Orders',
      icon: ShoppingBag,
      path: '/farmer/orders',
    },
    {
      title: 'Earnings',
      icon: TrendingUp,
      path: '/farmer/earnings',
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      path: '/farmer/analytics',
    },
    {
      title: 'Farm Profile',
      icon: User,
      path: '/farmer/profile',
    },
    {
      title: 'Messages',
      icon: MessageSquare,
      path: '/farmer/messages',
    },
    {
      title: 'Notifications',
      icon: Bell,
      path: '/farmer/notifications',
      badge: 3,
    },
    {
      title: 'Support',
      icon: HelpCircle,
      path: '/farmer/support',
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/farmer/settings',
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  const SidebarContentComponent = () => (
    <>
      {/* Header */}
      <div className="bg-forest-600 py-5 flex items-center justify-center">
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 shrink-0">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">FarmConnect</h2>
                <p className="text-xs text-forest-100">Farmer Portal</p>
              </div>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors shrink-0"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 shrink-0">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors shrink-0"
              title="Expand Sidebar"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto bg-white px-4 py-4">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.title}
              onClick={() => item.hasSubmenu ? item.onAddProduct() : handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive(item.path)
                  ? 'bg-forest-600 text-white shadow-md'
                  : 'text-forest-700 hover:bg-forest-50 hover:text-forest-900'
              }`}
              title={isCollapsed ? item.title : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  {item.badge && (
                    <Badge className="bg-orange-500 text-white border-none h-5 px-2 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-forest-100 bg-white p-4">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-red-200 text-red-600 font-medium hover:bg-red-50 hover:border-red-300 transition-all"
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex h-full shrink-0 flex-col bg-white border-r border-forest-100 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
        <SidebarContentComponent />
      </div>

      {/* Mobile Sheet Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50 bg-forest-600 hover:bg-forest-700 text-white">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="h-full flex flex-col">
            <SidebarContentComponent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default FarmerSidebar;
