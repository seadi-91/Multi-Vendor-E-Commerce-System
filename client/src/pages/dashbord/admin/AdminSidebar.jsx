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

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', section: 'Overview' },
    { id: 'users', icon: Users, label: 'Users', section: 'Management' },
    { id: 'farmers', icon: UserCog, label: 'Farmers', section: 'Management' },
    { id: 'all-products', icon: Package, label: 'Products', section: 'Management' },
    { id: 'reports', icon: BarChart3, label: 'Reports', section: 'Analytics' },
    { id: 'transactions', icon: DollarSign, label: 'Transactions', section: 'Analytics' },
    { id: 'profile', icon: UserCog, label: 'Profile', section: 'Settings' },
    { id: 'settings', icon: Settings, label: 'Settings', section: 'Settings' },
  ];

  const sections = ['Overview', 'Management', 'Analytics', 'Settings'];

  return (
    <div className="flex flex-col h-full w-full bg-white border-r border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="text-white" size={20} />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900 truncate">Admin Panel</h2>
                <p className="text-xs text-slate-500 truncate">FarmFresh</p>
              </div>
            )}
          </div>
          <button
            onClick={handleCollapse}
            className="p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-100 transition-colors flex-shrink-0"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight size={20} className={`transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        {sections.map((section) => {
          const sectionItems = menuItems.filter((item) => item.section === section);
          return (
            <div key={section} className="mb-6">
              {!isCollapsed && (
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
                  {section}
                </div>
              )}
              <div className="space-y-1">
                {sectionItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                        isCollapsed ? 'justify-center' : ''
                      } ${
                        active
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer - Logout */}
      <div className="p-4 border-t border-slate-200 flex-shrink-0">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="flex-1 text-left truncate">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
