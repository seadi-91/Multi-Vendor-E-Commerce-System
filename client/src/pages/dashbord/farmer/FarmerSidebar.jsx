import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Settings,
  User,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Bell,
  HelpCircle,
  Leaf,
  ChevronRight
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

const FarmerSidebar = ({ user, isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
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
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Sidebar className={isCollapsed ? 'w-28' : 'w-64'} data-state={isCollapsed ? 'collapsed' : 'expanded'}>
      <SidebarHeader className="bg-green-600 border-b border-green-700 p-4">
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-white">FarmConnect</h2>
                <p className="text-xs text-green-100">Farmer Portal</p>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-md border border-green-500 bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={20} className="text-white" /> : <ChevronRight size={20} className="rotate-180 text-white" />}
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Store</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation('/farmer/dashboard')}
                  isActive={isActive('/farmer/dashboard')}
                  className={isCollapsed ? 'justify-center' : ''}
                >
                  <LayoutDashboard size={18} />
                  {!isCollapsed && <span>Dashboard</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation('/farmer/products')}
                  isActive={isActive('/farmer/products') || isActive('/farmer/products/add')}
                  className={isCollapsed ? 'justify-center' : ''}
                >
                  <Package size={18} />
                  {!isCollapsed && <span>My Products</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation('/farmer/orders')}
                  isActive={isActive('/farmer/orders')}
                  className={isCollapsed ? 'justify-center' : ''}
                >
                  <ShoppingBag size={18} />
                  {!isCollapsed && <span>Orders</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Business</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.slice(0, 2).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.path)}
                    isActive={isActive(item.path)}
                    className={isCollapsed ? 'justify-center' : ''}
                  >
                    <item.icon size={18} />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>System</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.slice(2).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.path)}
                    isActive={isActive(item.path)}
                    className={isCollapsed ? 'justify-center' : ''}
                  >
                    <item.icon size={18} />
                    {!isCollapsed && (
                      <>
                        <span>{item.title}</span>
                        {item.badge && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </>
                    )}
                    {isCollapsed && item.badge && (
                      <span className="absolute top-1 right-1 bg-orange-500 w-2 h-2 rounded-full"></span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default FarmerSidebar;
