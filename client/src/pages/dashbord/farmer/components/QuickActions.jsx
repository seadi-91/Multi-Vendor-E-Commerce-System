import React from 'react';
import { Package, ShoppingBag, TrendingUp, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';

const QuickActions = ({ onAddProduct }) => {
  const actions = [
    {
      id: 1,
      title: 'Add New Product',
      icon: Package,
      color: 'bg-forest-600 hover:bg-forest-700',
      onClick: onAddProduct,
    },
    {
      id: 2,
      title: 'Manage Orders',
      icon: ShoppingBag,
      color: 'bg-mint-500 hover:bg-mint-600',
      onClick: () => console.log('Manage Orders'),
    },
    {
      id: 3,
      title: 'Promote Products',
      icon: TrendingUp,
      color: 'bg-amber-500 hover:bg-amber-600',
      onClick: () => console.log('Promote Products'),
    },
    {
      id: 4,
      title: 'Farm Resources',
      icon: Sprout,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => console.log('Farm Resources'),
    },
  ];

  return (
    <div className="bg-white border border-forest-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-forest-900">Quick Actions</h3>
          <p className="text-sm text-forest-600">Common tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.id}
            onClick={action.onClick}
            className={`${action.color} text-white h-auto py-4 flex flex-col items-center gap-2 rounded-xl`}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-sm font-medium">{action.title}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
