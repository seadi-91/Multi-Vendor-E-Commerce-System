import React from 'react';
import { 
  Users, 
  UserCog, 
  Package, 
  Search, 
  FileText, 
  ShoppingBag,
  BarChart3
} from 'lucide-react';

/**
 * EmptyState - Professional empty state component for tables and lists
 * 
 * Props:
 *   type: 'customers' | 'farmers' | 'products' | 'orders' | 'search' | 'general'
 *   message: custom message to display
 *   action: optional action button
 */
export default function EmptyState({ type = 'general', message, action }) {
  const getIcon = () => {
    switch (type) {
      case 'customers':
        return <Users className="w-12 h-12 text-slate-300" />;
      case 'farmers':
        return <UserCog className="w-12 h-12 text-slate-300" />;
      case 'products':
        return <Package className="w-12 h-12 text-slate-300" />;
      case 'orders':
        return <ShoppingBag className="w-12 h-12 text-slate-300" />;
      case 'search':
        return <Search className="w-12 h-12 text-slate-300" />;
      case 'analytics':
        return <BarChart3 className="w-12 h-12 text-slate-300" />;
      default:
        return <FileText className="w-12 h-12 text-slate-300" />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'customers':
        return 'No customers found';
      case 'farmers':
        return 'No farmers found';
      case 'products':
        return 'No products found';
      case 'orders':
        return 'No orders found';
      case 'search':
        return 'No results match your search';
      case 'analytics':
        return 'No analytics data available';
      default:
        return 'No data available';
    }
  };

  const getSubMessage = () => {
    switch (type) {
      case 'customers':
        return 'Start by adding customers to your platform';
      case 'farmers':
        return 'Verified farmers will appear here';
      case 'products':
        return 'Approved products will be displayed here';
      case 'orders':
        return 'Orders will appear once customers make purchases';
      case 'search':
        return 'Try adjusting your search filters';
      case 'analytics':
        return 'Data will populate as your platform grows';
      default:
        return 'Check back later for updates';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        {getIcon()}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {message || getDefaultMessage()}
      </h3>
      <p className="text-sm text-slate-500 mb-6 text-center max-w-md">
        {getSubMessage()}
      </p>
      {action && (
        <div className="flex gap-3">
          {action}
        </div>
      )}
    </div>
  );
}