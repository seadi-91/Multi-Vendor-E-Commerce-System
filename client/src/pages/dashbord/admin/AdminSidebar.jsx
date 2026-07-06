import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Package,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  BarChart3,
  DollarSign,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from '../../../components/ui/sidebar';

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../../../components/ui/collapsible';

const AdminSidebar = ({
  onLogout,
  activeTab,
  onNav,
  isCollapsed,
  onToggleCollapse,
  pendingFarmersCount = 0,
  pendingProductsCount = 0,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleNav = (tab) => {
    console.log('=== Sidebar Navigation ===');
    console.log('Navigating to tab:', tab);
    onNav(tab);
  };

  const handleCollapse = () => {
    onToggleCollapse();
  };

  return (
    <Sidebar className={isCollapsed ? "w-28" : "w-64"} data-state={isCollapsed ? 'collapsed' : 'expanded'}>
      <SidebarHeader className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="text-white" size={20} />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Admin Panel</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">FarmFresh</p>
              </div>
            )}
          </div>
          <button
            onClick={handleCollapse}
            className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronRight size={20} className="rotate-180" />}
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Overview</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNav('dashboard')}
                  isActive={activeTab === 'dashboard'}
                >
                  <LayoutDashboard size={18} />
                  {!isCollapsed && <span>Dashboard</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Management</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNav('users')}
                  isActive={activeTab === 'users'}
                >
                  <Users size={18} />
                  {!isCollapsed && <span>Users</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Farmers */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNav('farmers')}
                  isActive={activeTab === 'farmers'}
                >
                  <UserCog size={18} />
                  {!isCollapsed && <span>Farmers</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Products */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNav('all-products')}
                  isActive={activeTab === 'all-products'}
                >
                  <Package size={18} />
                  {!isCollapsed && <span>Products</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Analytics</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNav('reports')}
                  isActive={activeTab === 'reports'}
                >
                  <BarChart3 size={18} />
                  {!isCollapsed && <span>Reports</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNav('transactions')}
                  isActive={activeTab === 'transactions'}
                >
                  <DollarSign size={18} />
                  {!isCollapsed && <span>Transactions</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Settings</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNav('profile')}
                  isActive={activeTab === 'profile'}
                >
                  <UserCog size={18} />
                  {!isCollapsed && <span>Profile</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNav('settings')}
                  isActive={activeTab === 'settings'}
                >
                  <Settings size={18} />
                  {!isCollapsed && <span>Settings</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Optional Footer for logout */}
      <SidebarFooter className="p-4 border-t border-slate-200 dark:border-slate-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout}>
              <LogOut size={18} />
              {!isCollapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
