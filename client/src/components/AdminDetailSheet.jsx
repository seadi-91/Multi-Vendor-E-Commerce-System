import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Package, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  Clock,
  Shield,
  Truck,
  ShoppingBag
} from 'lucide-react';

/**
 * AdminDetailSheet – Professional detail view for Customers, Farmers, and Products
 * 
 * Props:
 *   open: boolean - controls sheet visibility
 *   onClose: function - called when sheet is closed
 *   type: 'customer' | 'farmer' | 'product'
 *   data: object - the data to display
 */
export default function AdminDetailSheet({ open, onClose, type, data }) {
  if (!data) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount);
  };

  const renderCustomerDetails = () => (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
          {data.profileImage ? (
            <img 
              src={data.profileImage} 
              alt={data.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-slate-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900">{data.name}</h3>
          <p className="text-sm text-slate-500">Customer ID: #{data.id}</p>
          <div className="mt-2">
            <Badge variant={data.isActive ? 'default' : 'destructive'}>
              {data.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4" />
          Contact Information
        </h4>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{data.email || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{data.phone || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{data.address || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Account Details
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Role</p>
            <p className="font-medium text-slate-900">{data.role || 'CUSTOMER'}</p>
          </div>
          <div>
            <p className="text-slate-500">Status</p>
            <p className="font-medium text-slate-900">{data.isActive ? 'Active' : 'Inactive'}</p>
          </div>
          <div>
            <p className="text-slate-500">Member Since</p>
            <p className="font-medium text-slate-900">{formatDate(data.createdAt)}</p>
          </div>
          <div>
            <p className="text-slate-500">Language</p>
            <p className="font-medium text-slate-900">{data.language || 'English'}</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" />
          Transaction History
        </h4>
        <div className="text-sm text-slate-500">
          <p>Transaction history would be displayed here</p>
          <p className="text-xs mt-1">Total Orders: {data.orderCount || 0}</p>
        </div>
      </div>
    </div>
  );

  const renderFarmerDetails = () => (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
          {data.profileImage ? (
            <img 
              src={data.profileImage} 
              alt={data.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-slate-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900">{data.name}</h3>
          <p className="text-sm text-slate-500">Farmer ID: #{data.id}</p>
          <div className="mt-2 flex gap-2">
            <Badge variant={data.isVerified ? 'default' : 'secondary'}>
              {data.isVerified ? 'Verified' : 'Pending'}
            </Badge>
            <Badge variant={data.isActive ? 'default' : 'destructive'}>
              {data.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Farm Information */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Farm Information
        </h4>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div>
            <p className="text-slate-500">Farm Name</p>
            <p className="font-medium text-slate-900">{data.farmName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-500">Farm Size</p>
            <p className="font-medium text-slate-900">{data.farmSize || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-500">Bio</p>
            <p className="font-medium text-slate-900">{data.bio || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4" />
          Contact Information
        </h4>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{data.email || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{data.phone || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{data.address || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <Package className="w-4 h-4" />
          Business Details
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">National ID</p>
            <p className="font-medium text-slate-900">{data.nationalId || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-500">TIN Number</p>
            <p className="font-medium text-slate-900">{data.tinNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-500">Bank Name</p>
            <p className="font-medium text-slate-900">{data.bankName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-500">Account Number</p>
            <p className="font-medium text-slate-900">{data.accountNumber || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Account Status
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Verification Status</p>
            <p className="font-medium text-slate-900">{data.isVerified ? 'Verified' : 'Pending'}</p>
          </div>
          <div>
            <p className="text-slate-500">Active Status</p>
            <p className="font-medium text-slate-900">{data.isActive ? 'Active' : 'Inactive'}</p>
          </div>
          <div>
            <p className="text-slate-500">Member Since</p>
            <p className="font-medium text-slate-900">{formatDate(data.createdAt)}</p>
          </div>
          <div>
            <p className="text-slate-500">Total Products</p>
            <p className="font-medium text-slate-900">{data.productCount || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProductDetails = () => (
    <div className="space-y-6">
      {/* Product Image */}
      <div className="flex gap-4">
        <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {data.image ? (
            <img 
              src={data.image} 
              alt={data.name}
              className="w-full h-full rounded-lg object-cover"
            />
          ) : (
            <Package className="w-12 h-12 text-slate-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900">{data.name}</h3>
          <p className="text-sm text-slate-500">Product ID: #{data.id}</p>
          <div className="mt-2">
            <Badge variant={data.status === 'active' ? 'default' : 'secondary'}>
              {data.status || 'Pending'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Pricing & Stock
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Price</p>
            <p className="font-medium text-slate-900 text-lg">{formatCurrency(data.price)}</p>
          </div>
          <div>
            <p className="text-slate-500">Stock</p>
            <p className="font-medium text-slate-900 text-lg">{data.stock || 0} units</p>
          </div>
          <div>
            <p className="text-slate-500">Category</p>
            <p className="font-medium text-slate-900">{data.category || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-500">Status</p>
            <p className="font-medium text-slate-900">{data.status || 'Pending'}</p>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <Package className="w-4 h-4" />
          Product Description
        </h4>
        <p className="text-sm text-slate-600">{data.description || 'No description available'}</p>
      </div>

      {/* Farmer Information */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4" />
          Farmer Information
        </h4>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div>
            <p className="text-slate-500">Farmer Name</p>
            <p className="font-medium text-slate-900">{data.farmer?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-500">Farm Name</p>
            <p className="font-medium text-slate-900">{data.farmer?.farmName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-500">Contact Email</p>
            <p className="font-medium text-slate-900">{data.farmer?.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-500">Phone</p>
            <p className="font-medium text-slate-900">{data.farmer?.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-500">Address</p>
            <p className="font-medium text-slate-900">{data.farmer?.address || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-500">Verification Status</p>
            <p className="font-medium text-slate-900">
              {data.farmer?.isVerified ? 'Verified' : 'Pending'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Account Status</p>
            <p className="font-medium text-slate-900">
              {data.farmer?.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Timestamps
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Created</p>
            <p className="font-medium text-slate-900">{formatDate(data.createdAt)}</p>
          </div>
          <div>
            <p className="text-slate-500">Last Updated</p>
            <p className="font-medium text-slate-900">{formatDate(data.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      {data.badges && data.badges.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Product Badges
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.badges.map((badge, index) => (
              <Badge key={index} variant="outline">{badge}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const getTitle = () => {
    switch(type) {
      case 'customer': return 'Customer Details';
      case 'farmer': return 'Farmer Details';
      case 'product': return 'Product Details';
      default: return 'Details';
    }
  };

  const renderContent = () => {
    switch(type) {
      case 'customer': return renderCustomerDetails();
      case 'farmer': return renderFarmerDetails();
      case 'product': return renderProductDetails();
      default: return <div>No details available</div>;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{getTitle()}</SheetTitle>
          <SheetDescription>
            View detailed information about this {type}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          {renderContent()}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}