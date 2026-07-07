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
  ShoppingBag,
  AlertCircle
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
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
          {data.profileImage ? (
            <img 
              src={data.profileImage} 
              alt={data.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-white">
              {data.name?.charAt(0)?.toUpperCase() || 'F'}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900">{data.name || 'Not provided'}</h3>
          <p className="text-sm text-slate-500">Farmer ID: #{data.id}</p>
          <div className="mt-2 flex gap-2">
            <Badge className={
              data.isVerified 
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' 
                : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
            }>
              {data.isVerified ? '✓ Verified' : '⏱ Pending Verification'}
            </Badge>
            <Badge className={
              data.isActive 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' 
                : 'bg-red-100 text-red-700 hover:bg-red-100'
            }>
              {data.isActive ? 'Active' : 'Suspended'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 space-y-4 border border-slate-200">
        <h4 className="font-bold text-slate-900 flex items-center gap-2 text-base">
          <User className="w-5 h-5 text-indigo-600" />
          Personal Information
        </h4>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium">Email</p>
              <p className="text-sm text-slate-900">{data.email || 'Not provided'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium">Phone</p>
              <p className="text-sm text-slate-900">{data.phone || 'Not provided'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium">Address</p>
              <p className="text-sm text-slate-900">{data.address || data.location || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Farm Information */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 space-y-4 border border-emerald-200">
        <h4 className="font-bold text-slate-900 flex items-center gap-2 text-base">
          <Shield className="w-5 h-5 text-emerald-600" />
          Farm Information
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">Farm Name</p>
            <p className="font-semibold text-slate-900">{data.farmName || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">Farm Size</p>
            <p className="font-semibold text-slate-900">{data.farmSize || 'Not provided'}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium mb-1">Bio</p>
          <p className="text-sm text-slate-700">{data.bio || 'No bio added'}</p>
        </div>
      </div>

      {/* Business/Legal Documents */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 space-y-4 border border-blue-200">
        <h4 className="font-bold text-slate-900 flex items-center gap-2 text-base">
          <Package className="w-5 h-5 text-blue-600" />
          Business & Legal Documents
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">National ID</p>
            <p className="font-mono text-xs font-semibold text-slate-900 bg-white px-2 py-1 rounded">
              {data.nationalId || 'Pending verification'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">TIN Number</p>
            <p className="font-mono text-xs font-semibold text-slate-900 bg-white px-2 py-1 rounded">
              {data.tinNumber || 'Pending verification'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">Bank Name</p>
            <p className="text-sm text-slate-900">{data.bankName || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">Account Number</p>
            <p className="font-mono text-xs font-semibold text-slate-900 bg-white px-2 py-1 rounded">
              {data.accountNumber || 'Not provided'}
            </p>
          </div>
        </div>
        
        {/* Document Placeholders */}
        <div className="pt-2 space-y-2">
          <p className="text-xs text-slate-600 font-medium mb-2">Verification Documents:</p>
          <div className="bg-white rounded-lg p-3 border border-dashed border-blue-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700">ID Document</p>
                  <p className="text-[10px] text-slate-500">{data.nationalId ? 'Uploaded' : 'Not uploaded'}</p>
                </div>
              </div>
              {data.nationalId && (
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  View
                </Button>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-dashed border-blue-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700">Land Map File</p>
                  <p className="text-[10px] text-slate-500">{data.landMapFile ? 'Uploaded' : 'Not uploaded'}</p>
                </div>
              </div>
              {data.landMapFile && (
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  View
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Location Map Placeholder */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 space-y-3 border border-slate-200">
        <h4 className="font-bold text-slate-900 flex items-center gap-2 text-base">
          <MapPin className="w-5 h-5 text-slate-600" />
          Farm Location
        </h4>
        <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center border border-slate-300">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">Map integration coming soon</p>
            <p className="text-xs text-slate-500 mt-1">
              {data.address || data.location || 'No location provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 space-y-3 border border-purple-200">
        <h4 className="font-bold text-slate-900 flex items-center gap-2 text-base">
          <Package className="w-5 h-5 text-purple-600" />
          Performance Metrics
        </h4>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-slate-500 font-medium">Products</p>
            <p className="text-2xl font-bold text-slate-900">{data.productCount || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-slate-500 font-medium">Orders</p>
            <p className="text-2xl font-bold text-slate-900">{data.orderCount || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-slate-500 font-medium">Rating</p>
            <p className="text-2xl font-bold text-slate-900">{data.rating || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Account Timeline */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 space-y-3 border border-slate-200">
        <h4 className="font-bold text-slate-900 flex items-center gap-2 text-base">
          <Calendar className="w-5 h-5 text-slate-600" />
          Account Timeline
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-slate-600">Member Since</span>
            <span className="font-semibold text-slate-900">{formatDate(data.createdAt)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-slate-600">Verification Status</span>
            <span className={`font-semibold ${data.isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
              {data.isVerified ? 'Verified' : 'Pending'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-slate-600">Account Status</span>
            <span className={`font-semibold ${data.isActive ? 'text-blue-600' : 'text-red-600'}`}>
              {data.isActive ? 'Active' : 'Suspended'}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 space-y-3 border border-slate-200">
        <h4 className="font-bold text-slate-900 flex items-center gap-2 text-base">
          <Clock className="w-5 h-5 text-slate-600" />
          Recent Activity
        </h4>
        <div className="text-sm text-slate-500 text-center py-4">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p>No recent activity to display</p>
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
        {!data.farmer ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="font-medium">Farmer account has been deleted</p>
            </div>
            <p className="text-xs text-amber-600 mt-1">
              The farmer who created this product is no longer in the system.
            </p>
          </div>
        ) : (
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
        )}
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
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl overflow-y-auto">
        <SheetHeader className="border-b border-slate-200 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-2xl">{getTitle()}</SheetTitle>
              <SheetDescription className="text-base mt-1">
                View detailed information and manage this {type}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="mt-6">
          {renderContent()}
        </div>

        {/* Action Buttons Section */}
        {type === 'farmer' && data && (
          <div className="mt-8 pt-6 border-t border-slate-200 bg-slate-50 -mx-6 px-6 py-4 sticky bottom-0">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Admin Actions</h4>
            <div className="flex flex-wrap gap-3">
              {!data.isVerified && !data.isRejected && (
                <>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      // This will be handled by parent component
                      if (window.handleApproveFarmer) {
                        window.handleApproveFarmer(data.id);
                        onClose();
                      }
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Verification
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      // This will be handled by parent component
                      if (window.handleRejectFarmer) {
                        window.handleRejectFarmer(data.id, data.name);
                        onClose();
                      }
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Verification
                  </Button>
                </>
              )}
              {data.isActive ? (
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (window.handleSuspendFarmer) {
                      window.handleSuspendFarmer(data.id);
                      onClose();
                    }
                  }}
                >
                  Suspend Account
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (window.handleActivateFarmer) {
                      window.handleActivateFarmer(data.id);
                      onClose();
                    }
                  }}
                >
                  Activate Account
                </Button>
              )}
              <Button variant="outline" onClick={onClose} className="ml-auto">
                Close
              </Button>
            </div>
          </div>
        )}

        {type !== 'farmer' && (
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}