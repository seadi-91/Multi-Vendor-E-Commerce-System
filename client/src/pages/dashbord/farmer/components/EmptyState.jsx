import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, BarChart3, AlertCircle, Plus, RefreshCw } from 'lucide-react';

const EmptyState = memo(({ 
  icon: Icon = Package,
  title = 'No data found',
  description = 'There are no items to display at this time.',
  actionLabel = 'Add Item',
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = 'default' // default, error, success
}) => {
  const variantStyles = {
    default: {
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-400',
      title: 'text-slate-900',
      description: 'text-slate-500',
    },
    error: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
      title: 'text-slate-900',
      description: 'text-slate-500',
    },
    success: {
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-500',
      title: 'text-slate-900',
      description: 'text-slate-500',
    },
  };

  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in duration-300">
      <div className={`w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center mb-4`}>
        <Icon className={`h-8 w-8 ${styles.iconColor}`} aria-hidden="true" />
      </div>
      <h3 className={`text-base font-semibold ${styles.title} mb-2`}>{title}</h3>
      <p className={`text-sm ${styles.description} mb-6 max-w-sm`}>{description}</p>
      
      <div className="flex items-center gap-3">
        {onAction && (
          <Button onClick={onAction} className="gap-2">
            {variant === 'default' && <Plus className="h-4 w-4" />}
            {variant === 'error' && <RefreshCw className="h-4 w-4" />}
            {actionLabel}
          </Button>
        )}
        {onSecondaryAction && secondaryActionLabel && (
          <Button variant="outline" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
});

// Pre-configured empty states for common use cases
export const EmptyOrders = memo(({ onAddOrder }) => (
  <EmptyState
    icon={ShoppingCart}
    title="No orders yet"
    description="You haven't received any orders yet. Orders from customers will appear here."
    actionLabel="View Products"
    onAction={onAddOrder}
  />
));

export const EmptyProducts = memo(({ onAddProduct }) => (
  <EmptyState
    icon={Package}
    title="No products listed"
    description="Start by adding your first product to begin selling on the marketplace."
    actionLabel="Add Product"
    onAction={onAddProduct}
  />
));

export const EmptyAnalytics = memo(({ onRefresh }) => (
  <EmptyState
    icon={BarChart3}
    title="No analytics data"
    description="Analytics data will appear once you have sales and activity on your account."
    actionLabel="Refresh"
    onAction={onRefresh}
  />
));

export const EmptyError = memo(({ onRetry }) => (
  <EmptyState
    icon={AlertCircle}
    title="Something went wrong"
    description="We couldn't load the data. Please try again or contact support if the problem persists."
    actionLabel="Try Again"
    onAction={onRetry}
    variant="error"
  />
));

export default EmptyState;
