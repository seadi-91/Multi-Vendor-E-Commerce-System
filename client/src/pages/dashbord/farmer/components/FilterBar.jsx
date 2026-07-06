import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ExportButton from '@/components/ExportButton';

const FilterBar = ({ 
  filters, 
  setFilters, 
  categories = [], 
  statuses = [],
  exportData = [],
  exportColumns = [],
  exportFilename = 'export',
  exportTitle = 'Export Data'
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: localSearch }));
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [localSearch, setFilters]);

  // Sync local search with filters when filters change externally
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  const handleClear = () => {
    setLocalSearch('');
    setFilters({ search: '', category: 'All', status: 'All' });
  };

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, [setFilters]);

  return (
    <div className="bg-white p-3 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm rounded-t-xl sm:rounded-none">
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          type="text" 
          placeholder="Search..." 
          value={localSearch} 
          onChange={(e) => setLocalSearch(e.target.value)} 
          className="pl-10 bg-white border-slate-200 h-9 w-full rounded-md text-sm shadow-sm" 
        />
      </div>
      <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto justify-end shrink-0">
        {categories.length > 0 && (
          <Select value={filters.category} onValueChange={(val) => handleFilterChange('category', val)}>
            <SelectTrigger className="h-9 min-w-[130px] bg-white border-slate-200 text-sm shadow-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {statuses.length > 0 && (
          <Select value={filters.status} onValueChange={(val) => handleFilterChange('status', val)}>
            <SelectTrigger className="h-9 min-w-[130px] bg-white border-slate-200 text-sm shadow-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

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
};

export default FilterBar;
