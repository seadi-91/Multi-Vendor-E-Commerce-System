import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  Sprout,
  Box,
  BarChart3,
  Download,
  Tag,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const QuickActions = memo(() => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 1,
      title: 'Add Product',
      description: 'List new items',
      icon: Package,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      onClick: () => navigate('/farmer/products/add'),
      shortcut: '⌘P',
    },
    {
      id: 2,
      title: 'Manage Inventory',
      description: 'Track stock levels',
      icon: Box,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      onClick: () => navigate('/farmer/products'),
      shortcut: '⌘I',
    },
    {
      id: 3,
      title: 'View Orders',
      description: 'Manage orders',
      icon: ShoppingBag,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      onClick: () => navigate('/farmer/orders'),
      shortcut: '⌘O',
    },
    {
      id: 4,
      title: 'Create Discount',
      description: 'Promote products',
      icon: Tag,
      color: 'bg-amber-600 hover:bg-amber-700',
      onClick: () => console.log('Create Discount'),
      shortcut: '⌘D',
    },
    {
      id: 5,
      title: 'View Analytics',
      description: 'Track performance',
      icon: BarChart3,
      color: 'bg-cyan-600 hover:bg-cyan-700',
      onClick: () => navigate('/farmer/analytics'),
      shortcut: '⌘A',
    },
    {
      id: 6,
      title: 'Export Report',
      description: 'Download data',
      icon: Download,
      color: 'bg-slate-600 hover:bg-slate-700',
      onClick: () => console.log('Export Report'),
      shortcut: '⌘E',
    },
    {
      id: 7,
      title: 'Manage Coupons',
      description: 'Create offers',
      icon: TrendingUp,
      color: 'bg-rose-600 hover:bg-rose-700',
      onClick: () => console.log('Manage Coupons'),
      shortcut: '⌘C',
    },
    {
      id: 8,
      title: 'Customer Messages',
      description: 'Reply to inquiries',
      icon: MessageSquare,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      onClick: () => navigate('/farmer/messages'),
      shortcut: '⌘M',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Quick Actions</h3>
          <p className="text-xs text-slate-500">Common tasks and shortcuts</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <Button
            key={action.id}
            onClick={action.onClick}
            className={`${action.color} text-white h-auto py-4 flex flex-col items-center gap-2 rounded-lg text-xs group transition-all duration-300 hover:scale-105 hover:shadow-lg hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400`}
            style={{ animationDelay: `${index * 50}ms` }}
            aria-label={`${action.title}: ${action.description}. Keyboard shortcut: ${action.shortcut}`}
          >
            <action.icon className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" aria-hidden="true" />
            <span className="text-xs font-medium">{action.title}</span>
            <span className="text-[10px] opacity-80">{action.description}</span>
            <span className="text-[9px] opacity-60 mt-1" aria-label={`Keyboard shortcut: ${action.shortcut}`}>{action.shortcut}</span>
          </Button>
        ))}
      </div>
    </div>
  );
});

export default QuickActions;
