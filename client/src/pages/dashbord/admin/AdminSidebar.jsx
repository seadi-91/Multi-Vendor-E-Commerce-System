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

const AdminSidebar = ({ onLogout, activeTab, onNav, isCollapsed, onToggleCollapse, pendingFarmersCount = 0, pendingProductsCount = 0 }) => {
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
    <Sidebar>
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
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNav('farmers')}
                  isActive={activeTab === 'farmers'}
                >
                  <UserCog size={18} />
                  {!isCollapsed && <span>Farmers</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNav('pending-farmers')}
                  isActive={activeTab === 'pending-farmers'}
                  className="relative"
                >
                  <UserCog size={18} className="text-amber-500" />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-amber-600 font-medium">Pending Farmers</span>
                      {pendingFarmersCount > 0 && (
                        <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {pendingFarmersCount}
                        </span>
                      )}
                    </div>
                  )}
                  {isCollapsed && pendingFarmersCount > 0 && (
                    <span className="absolute top-1 right-1 bg-amber-500 w-2 h-2 rounded-full"></span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                {!isCollapsed ? (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={activeTab === 'products'}>
                        <Package size={18} />
                        <span>Products</span>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => handleNav('pending-products')}
                            isActive={activeTab === 'pending-products'}
                            className="flex items-center justify-between"
                          >
                            <span>Pending Approval</span>
                            {pendingProductsCount > 0 && (
                              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {pendingProductsCount}
                              </span>
                            )}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => handleNav('all-products')}
                            isActive={activeTab === 'all-products'}
                          >
                            <span>All Products</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton
                    onClick={() => handleNav('products')}
                    isActive={activeTab === 'products'}
                  >
                    <Package size={18} />
                  </SidebarMenuButton>
                )}
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
                  <Settings size={18} />
                  {!isCollapsed && <span>Profile</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-200 dark:border-slate-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout} className="text-red-500 hover:text-red-600">
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
