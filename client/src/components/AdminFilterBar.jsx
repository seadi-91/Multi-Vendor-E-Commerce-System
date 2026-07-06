import React, { useState, useEffect } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, X } from 'lucide-react';
import ExportButton from './ExportButton';

/**
 * AdminFilterBar – Professional centralized filter bar for Admin pages.
 *
 * Props:
 *   pageType: 'customers' | 'farmers' | 'products'
 *   filters: object containing current filter values
 *   setFilters: function to update the filter object
 *   searchTerm: current search term
 *   setSearchTerm: function to update search term
 *   exportData: data for export functionality
 *   exportColumns: column definitions for export
 *   exportFilename: filename for export files
 *   exportTitle: title for PDF export
 */
export default function AdminFilterBar({
  pageType,
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  exportData = [],
  exportColumns = [],
  exportFilename = 'export',
  exportTitle = 'Export Data',
}) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  
  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [localSearchTerm, setSearchTerm]);
  
  // Update local search term when external search term changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Helper to update a single filter field
  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  // Helper to clear all filters
  const handleClear = () => {
    setLocalSearchTerm('');
    setSearchTerm('');
    setFilters({
      status: "",
      category: "",
      region: "",
      priceMin: "",
      priceMax: "",
      role: "",
      accountStatus: "",
      sortBy: "",
    });
  };

  // Get filter and sort options based on page type
  const getFilterConfig = () => {
    switch(pageType) {
      case 'customers':
        return {
          filterLabel: 'Status',
          filterOptions: ['Active', 'Inactive', 'Suspended'],
          sortOptions: ['Newest', 'Oldest', 'Name A-Z', 'Name Z-A'],
          showPriceRange: false,
          showStatusFilter: false,
          statusOptions: ['Active', 'Inactive', 'Suspended'],
          useAccountStatus: true,
        };
      case 'farmers':
        return {
          filterLabel: 'Verification',
          filterOptions: ['Verified', 'Pending', 'Rejected'],
          sortOptions: ['Newest', 'Oldest', 'Name A-Z', 'Name Z-A', 'Total Sales High-Low', 'Total Sales Low-High'],
          showPriceRange: false,
          showStatusFilter: true,
          statusOptions: ['Active', 'Inactive'],
          useAccountStatus: true,
        };
      case 'products':
        return {
          filterLabel: 'Category',
          filterOptions: ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Grains'],
          sortOptions: ['Newest', 'Oldest', 'Price High-Low', 'Price Low-High', 'Name A-Z', 'Name Z-A'],
          showPriceRange: false,
          showStatusFilter: true,
          statusOptions: ['Approved', 'Pending', 'Rejected'],
        };
      default:
        return {
          filterLabel: 'Filter',
          filterOptions: [],
          sortOptions: ['Newest', 'Oldest'],
          showPriceRange: false,
          showStatusFilter: false,
        };
    }
  };

  const { filterLabel, filterOptions, sortOptions, showPriceRange, showStatusFilter, statusOptions, useAccountStatus } = getFilterConfig();

  return (
    <div className="bg-white p-3 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm rounded-t-xl sm:rounded-none">
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          type="text" 
          placeholder={`Search ${pageType}...`} 
          value={localSearchTerm} 
          onChange={(e) => setLocalSearchTerm(e.target.value)} 
          className="pl-10 bg-white border-slate-200 h-9 w-full rounded-md text-sm shadow-sm" 
        />
      </div>
      <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto justify-end shrink-0">
        
        {/* Category Filter */}
        {pageType === 'products' && (
          <Select value={filters.category || ''} onValueChange={(val) => updateFilter('category', val)}>
            <SelectTrigger className="h-9 min-w-[130px] bg-white border-slate-200 text-sm shadow-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Status Filter */}
        {showStatusFilter && (
          <Select value={useAccountStatus ? (filters.accountStatus || '') : (filters.status || '')} onValueChange={(val) => updateFilter(useAccountStatus ? 'accountStatus' : 'status', val)}>
            <SelectTrigger className="h-9 min-w-[130px] bg-white border-slate-200 text-sm shadow-sm">
              <SelectValue placeholder={useAccountStatus ? "Account Status" : "Status"} />
            </SelectTrigger>
            <SelectContent>
              {useAccountStatus ? statusOptions.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              )) : statusOptions.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Verification Filter for farmers */}
        {pageType === 'farmers' && (
          <Select value={filters.status || ''} onValueChange={(val) => updateFilter('status', val)}>
            <SelectTrigger className="h-9 min-w-[130px] bg-white border-slate-200 text-sm shadow-sm">
              <SelectValue placeholder="Verification" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Account Status Filter for customers */}
        {pageType === 'customers' && (
          <Select value={filters.accountStatus || ''} onValueChange={(val) => updateFilter('accountStatus', val)}>
            <SelectTrigger className="h-9 min-w-[130px] bg-white border-slate-200 text-sm shadow-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Sort Filter */}
        <Select value={filters.sortBy || ''} onValueChange={(val) => updateFilter('sortBy', val)}>
          <SelectTrigger className="h-9 min-w-[130px] bg-white border-slate-200 text-sm shadow-sm">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          onClick={handleClear} 
          className="h-9 px-3 gap-2 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm whitespace-nowrap"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </Button>

        {/* Export Button */}
        <ExportButton
          data={exportData}
          columns={exportColumns}
          filename={exportFilename}
          title={exportTitle}
          disabled={exportData.length === 0}
        />
      </div>
    </div>
  );
}
