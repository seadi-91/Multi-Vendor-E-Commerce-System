import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import AdminSidebar from "./AdminSidebar";
import AdminProfile from "./profile";
import AdminSettings from "./settings";
import AdminDetailSheet from "../../../components/AdminDetailSheet";
import AdminFilterBar from "../../../components/AdminFilterBar";
import SkeletonLoader from "../../../components/SkeletonLoader";
import EmptyState from "../../../components/EmptyState";
import NotificationBell from "../../../components/NotificationBell";
import { Toaster } from "sonner";
import { toast } from "sonner";
import api from "../../../api.js";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Switch } from "../../../components/ui/switch";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../../../components/ui/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "../../../components/ui/sheet";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../../components/ui/chart";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { Skeleton } from "../../../components/ui/skeleton";


import {
  Users,
  UserCog,
  Package,
  BarChart3,
  Shield,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Search,
  Calendar,
  DollarSign,
  Check,
  X,
  FileText,
  Bell,
  Eye,

  User,
  LogOut,
  Settings,
  MessageSquare,
  Menu,
  LayoutDashboard,
  MoreHorizontal
} from "lucide-react";

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const [view, setView] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Determine page type for AdminFilterBar
  const getPageType = () => {
    switch(view) {
      case 'users': return 'customers';
      case 'farmers': return 'farmers';
      case 'products': return 'products';
      default: return 'customers';
    }
  };

  // Export column definitions
  const getExportColumns = () => {
    switch(view) {
      case 'users':
        return [
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Name' },
          { key: 'email', header: 'Email' },
          { key: 'role', header: 'Role' },
          { key: 'isActive', header: 'Status' },
          { key: 'createdAt', header: 'Created At' },
        ];
      case 'farmers':
        return [
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Name' },
          { key: 'email', header: 'Email' },
          { key: 'farmName', header: 'Farm Name' },
          { key: 'isVerified', header: 'Verified' },
          { key: 'isActive', header: 'Status' },
          { key: 'createdAt', header: 'Created At' },
        ];
      case 'products':
        return [
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Product Name' },
          { key: 'category', header: 'Category' },
          { key: 'price', header: 'Price' },
          { key: 'stock', header: 'Stock' },
          { key: 'status', header: 'Status' },
          { key: 'createdAt', header: 'Created At' },
        ];
      default:
        return [];
    }
  };

  const getExportData = () => {
    switch(view) {
      case 'users': return filteredUsers;
      case 'farmers': return filteredFarmers;
      case 'products': return filteredAllProducts;
      default: return [];
    }
  };

  const getExportFilename = () => {
    switch(view) {
      case 'users': return 'customers';
      case 'farmers': return 'farmers';
      case 'products': return 'products';
      default: return 'data';
    }
  };

  const getExportTitle = () => {
    switch(view) {
      case 'users': return 'Customers Report';
      case 'farmers': return 'Farmers Report';
      case 'products': return 'Products Report';
      default: return 'Data Export';
    }
  };
  const pageType = view.includes('farmers') ? 'farmers' : view.includes('products') ? 'products' : view;
  // Unified filter state object
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    region: "",
    priceMin: "",
    priceMax: "",
    role: "",
    accountStatus: "",
    sortBy: "",
  });
  // Selected IDs for batch actions (farmers only for now)
  const [selectedIds, setSelectedIds] = useState([]);
  // Detail sheet state
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [detailSheetData, setDetailSheetData] = useState(null);
  const [detailSheetType, setDetailSheetType] = useState(null);

  const handleViewDetail = (data, type) => {
    setDetailSheetData(data);
    setDetailSheetType(type);
    setDetailSheetOpen(true);
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
      await api.patch(`/admin/products/${productId}/status`, { status: newStatus });
      setAllProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, status: newStatus } : p
      ));
      await fetchDashboardStats(); // Fixed: Added await to prevent hanging
    } catch (err) {
      console.error('Failed to update product status:', err);
      setError('Failed to update product status. Please try again.');
    }
  };

  const handleSellerClick = (seller) => {
    // Navigate to farmers page and filter by this seller
    setView('farmers');
    setSearchTerm(seller.name);
    // Reset filters to show all farmers initially
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

  // Handle search functionality with debouncing
  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchTerm.trim().toLowerCase();
    if (query) {
      // Search is already handled by the filteredProducts, filteredUsers, etc. computed values
      // Just ensure the search term is set
      setSearchTerm(query);
    }
  };

  // Debounced search handler
  let searchTimeout;
  const handleSearchChange = (value) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setSearchTerm(value);
    }, 300);
  };

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalProducts: 0,
    totalEarnings: 0,
    totalOrders: 0,
    usersChange: 0,
    farmersChange: 0,
    ordersChange: 0,
    earningsChange: 0,
  });

  // Separate loading states for analytics charts vs data tables
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Delete confirmation dialog state
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, type: null, label: '' });
  
  // Reject confirmation dialog state
  const [rejectConfirm, setRejectConfirm] = useState({ open: false, id: null, name: '' });

  // Pagination state per table (10 rows per page)
  const PAGE_SIZE = 10;
  const [usersPage, setUsersPage] = useState(1);
  const [farmersPage, setFarmersPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);

  // Debounced search: raw input fires immediately, actual filtering debounced
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      // Reset pagination when search changes
      setUsersPage(1);
      setFarmersPage(1);
      setProductsPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const [salesTrend, setSalesTrend] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  // Reports and Transactions state
  const [reportsData, setReportsData] = useState(null);
  const [transactionsData, setTransactionsData] = useState([]);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
      // Set default stats to prevent UI crashes
      setStats({
        totalUsers: 0,
        totalFarmers: 0,
        totalProducts: 0,
        totalEarnings: 0,
        totalOrders: 0,
        usersChange: 0,
        farmersChange: 0,
        ordersChange: 0,
        earningsChange: 0,
      });
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      const [salesRes, categoriesRes, activityRes, sellersRes] = await Promise.all([
        api.get('/admin/analytics/sales-trend'),
        api.get('/admin/analytics/top-categories'),
        api.get('/admin/analytics/recent-activity'),
        api.get('/admin/analytics/top-sellers')
      ]);
      
      setSalesTrend(salesRes.data);
      const mappedCategories = (categoriesRes.data || []).map(item => ({
        category: item.category || item.name || 'Unknown',
        total: item.total || item.value || item.count || 0,
      }));
      setTopCategories(mappedCategories);
      setRecentActivity(activityRes.data);
      setTopSellers(sellersRes.data);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      // Set empty arrays to prevent UI crashes
      setSalesTrend([]);
      setTopCategories([]);
      setRecentActivity([]);
      setTopSellers([]);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch Reports data
  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports');
      setReportsData(res.data || null);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  // Fetch Transactions data
  const fetchTransactions = async () => {
    try {
      const res = await api.get('/admin/transactions');
      // Normalize: API may return array directly or { transactions: [] }
      const data = res.data;
      if (Array.isArray(data)) {
        setTransactionsData(data);
      } else if (data && Array.isArray(data.transactions)) {
        setTransactionsData(data.transactions);
      } else {
        setTransactionsData([]);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setTransactionsData([]);
    }
  };

  // Custom tooltip for category donut chart
  const CategoryTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value, percent } = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 p-2 rounded shadow-md">
          <p className="font-medium">{name}</p>
          <p>{value} sold</p>
          <p>{Math.round(percent * 100)}%</p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    if (view === 'dashboard') {
      fetchAnalyticsData();
    } else if (view === 'reports') {
      fetchReports();
    } else if (view === 'transactions') {
      fetchTransactions();
    }
  }, [view]);

  // ❌ REMOVED DUPLICATE NOTIFICATION FETCHING
  // NotificationBell component already handles fetching notifications
  // Having duplicate fetch logic was causing 429 Rate Limit errors

  const fetchData = async () => {
    setError(null);
    setLoading(true);
    // Reset search when view changes
    setSearchTerm("");

    try {
      if (view === "users") {
        const res = await api.get("/admin/users");
        setUsers(res.data.users || res.data);
      } else if (view === "farmers") {
        const res = await api.get("/admin/farmers");
        setFarmers(res.data.farmers || res.data);
      } else if (view === "all-products") {
        const res = await api.get("/admin/products");
        setAllProducts(res.data.products || res.data);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      if (err.response) {
        // Server responded with error status
        setError(`Server error: ${err.response.data?.error || err.response.statusText}`);
      } else if (err.request) {
        // Request made but no response
        setError("Network error: Unable to connect to server. Please check your connection.");
      } else {
        // Other errors
        setError(`Error: ${err.message || "Failed to load data"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view !== "profile") {
      fetchData();
    }
  }, [view]);

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    
    let filtered = users.filter(
      (user) =>
        (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.includes(searchTerm)) &&
        (!filters.accountStatus || filters.accountStatus === "" || 
          (filters.accountStatus === "Active" && user.isActive) ||
          (filters.accountStatus === "Inactive" && !user.isActive) ||
          (filters.accountStatus === "Suspended" && !user.isActive)),
    );

    // Apply sorting
    if (!filters.sortBy || filters.sortBy === "" || filters.sortBy === 'Newest') {
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filters.sortBy === 'Oldest') {
      filtered = [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (filters.sortBy === 'Name A-Z') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sortBy === 'Name Z-A') {
      filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
    }

    return filtered;
  }, [users, searchTerm, filters]);

  const filteredFarmers = useMemo(() => {
    let filtered = farmers.filter((farmer) => {
      const matchesSearch =
        farmer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.farmName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        !filters.status || filters.status === "" ||
        (filters.status === "Verified" && farmer.isVerified) ||
        (filters.status === "Pending" && !farmer.isVerified) ||
        (filters.status === "Rejected" && !farmer.isVerified);
      const matchesActiveStatus =
        !filters.accountStatus || filters.accountStatus === "" ||
        (filters.accountStatus === "Active" && farmer.isActive) ||
        (filters.accountStatus === "Inactive" && !farmer.isActive);
      const matchesRegion =
        !filters.region || filters.region === "" || farmer.region === filters.region;
      return matchesSearch && matchesStatus && matchesActiveStatus && matchesRegion;
    });

    // Apply sorting
    if (!filters.sortBy || filters.sortBy === "" || filters.sortBy === 'Newest') {
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filters.sortBy === 'Oldest') {
      filtered = [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (filters.sortBy === 'Name A-Z') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sortBy === 'Name Z-A') {
      filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
    }

    return filtered;
  }, [farmers, searchTerm, filters]);



  const filteredAllProducts = useMemo(() => {
    let filtered = allProducts.filter((p) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filters.category || filters.category === "" || p.category === filters.category;
      const matchesStatus = !filters.status || filters.status === "" || 
        (filters.status === "Approved" && p.status === "approved") ||
        (filters.status === "Pending" && p.status === "pending") ||
        (filters.status === "Rejected" && p.status === "rejected");
      const matchesPrice =
        (filters.priceMin === "" || p.price >= filters.priceMin) &&
        (filters.priceMax === "" || p.price <= filters.priceMax);
      return matchesSearch && matchesCategory && matchesStatus && matchesPrice;
    });

    // Apply sorting
    if (!filters.sortBy || filters.sortBy === "" || filters.sortBy === 'Newest') {
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filters.sortBy === 'Oldest') {
      filtered = [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (filters.sortBy === 'Price High-Low') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'Price Low-High') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'Name A-Z') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sortBy === 'Name Z-A') {
      filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
    }

    return filtered;
  }, [allProducts, searchTerm, filters]);

  const handleDelete = (id, type, label = '') => {
    setDeleteConfirm({ open: true, id, type, label });
  };

  const executeDelete = async () => {
    console.log('=== START: Frontend Delete User ===');
    const { id, type, label } = deleteConfirm;
    console.log(`Deleting ${type} with ID: ${id} (${label})`);
    
    // Close dialog immediately
    setDeleteConfirm({ open: false, id: null, type: null, label: '' });
    
    // Set loading state
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Making API call: DELETE /admin/${type}s/${id}`);
      await api.delete(`/admin/${type}s/${id}`);
      console.log(`API call successful for ${type} ${id}`);
      
      // ✅ PAGINATION FIX: Check if we're deleting the last item on current page
      let shouldResetPage = false;
      
      if (type === "user") {
        console.log('Removing user from local state');
        const remainingUsers = users.filter((u) => u.id !== id);
        setUsers(remainingUsers);
        
        // Check if current page will be empty after deletion
        const currentPageItems = filteredUsers.filter((u) => u.id !== id);
        const itemsOnCurrentPage = currentPageItems.slice((usersPage - 1) * PAGE_SIZE, usersPage * PAGE_SIZE);
        if (itemsOnCurrentPage.length === 0 && usersPage > 1) {
          console.log('Last item on page deleted - resetting to page 1');
          setUsersPage(1);
          shouldResetPage = true;
        }
      } else if (type === "farmer") {
        console.log('Removing farmer from local state');
        const remainingFarmers = farmers.filter((f) => f.id !== id);
        setFarmers(remainingFarmers);
        
        // Check if current page will be empty after deletion
        const currentPageItems = filteredFarmers.filter((f) => f.id !== id);
        const itemsOnCurrentPage = currentPageItems.slice((farmersPage - 1) * PAGE_SIZE, farmersPage * PAGE_SIZE);
        if (itemsOnCurrentPage.length === 0 && farmersPage > 1) {
          console.log('Last item on page deleted - resetting to page 1');
          setFarmersPage(1);
          shouldResetPage = true;
        }
      } else if (type === "product") {
        console.log('Removing product from local state');
        const remainingProducts = allProducts.filter((p) => p.id !== id);
        setAllProducts(remainingProducts);
        
        // Check if current page will be empty after deletion
        const currentPageItems = filteredAllProducts.filter((p) => p.id !== id);
        const itemsOnCurrentPage = currentPageItems.slice((productsPage - 1) * PAGE_SIZE, productsPage * PAGE_SIZE);
        if (itemsOnCurrentPage.length === 0 && productsPage > 1) {
          console.log('Last item on page deleted - resetting to page 1');
          setProductsPage(1);
          shouldResetPage = true;
        }
      }
      
      // Refresh dashboard stats
      console.log('Refreshing dashboard stats...');
      await fetchDashboardStats();
      
      // Close detail sheet if open
      if (detailSheetOpen && detailSheetData?.id === id) {
        console.log('Closing detail sheet');
        setDetailSheetOpen(false);
        setDetailSheetData(null);
        setDetailSheetType(null);
      }
      
      // ✅ SUCCESS NOTIFICATION
      console.log(`✅ Successfully deleted ${type} "${label}"`);
      if (shouldResetPage) {
        console.log('ℹ️ Pagination was reset to page 1');
      }
      
      console.log('=== END: Frontend Delete User - Success ===');
    } catch (err) {
      console.error('=== END: Frontend Delete User - Error ===');
      console.error('Delete error:', err);
      
      // Show error message
      const errorMessage = err.response?.data?.error || err.message || `Failed to delete ${type}. Please try again.`;
      setError(errorMessage);
      
      // Refetch data to ensure UI is in sync with backend
      console.log('Refetching data after error...');
      await fetchData();
    } finally {
      setLoading(false);
      console.log('Delete operation completed');
    }
  };

  // Handle farmer verification (approve)
  const handleApproveFarmer = async (farmerId) => {
    try {
      await api.put(`/admin/farmers/${farmerId}/verify`);
      // Optimistic UI update
      setFarmers(prev => prev.map(f => 
        f.id === farmerId ? { ...f, isVerified: true } : f
      ));
      fetchDashboardStats();
    } catch (err) {
      console.error('Failed to verify farmer:', err);
      setError('Failed to verify farmer. Please try again.');
      // Revert optimistic update by refetching
      fetchData();
    }
  };

  // Handle farmer rejection
  const handleRejectFarmer = (farmerId, farmerName) => {
    setRejectConfirm({ open: true, id: farmerId, name: farmerName });
  };

  const executeRejectFarmer = async () => {
    const { id } = rejectConfirm;
    setRejectConfirm({ open: false, id: null, name: '' });
    try {
      await api.put(`/admin/farmers/${id}/reject`);
      // Optimistic UI update - mark as rejected (isVerified: false and add rejected flag)
      setFarmers(prev => prev.map(f => 
        f.id === id ? { ...f, isVerified: false, isRejected: true } : f
      ));
      fetchDashboardStats();
    } catch (err) {
      console.error('Failed to reject farmer:', err);
      setError('Failed to reject farmer. Please try again.');
      // Revert optimistic update by refetching
      fetchData();
    }
  };

  // Handle farmer suspend
  const handleSuspendFarmer = async (farmerId) => {
    try {
      await api.put(`/admin/users/${farmerId}/suspend`);
      setFarmers(prev => prev.map(f => 
        f.id === farmerId ? { ...f, isActive: false } : f
      ));
      setDetailSheetData(prev => prev ? { ...prev, isActive: false } : null);
      fetchDashboardStats();
    } catch (err) {
      setError('Failed to suspend farmer.');
    }
  };

  // Handle farmer activate
  const handleActivateFarmer = async (farmerId) => {
    try {
      await api.put(`/admin/users/${farmerId}/activate`);
      setFarmers(prev => prev.map(f => 
        f.id === farmerId ? { ...f, isActive: true } : f
      ));
      setDetailSheetData(prev => prev ? { ...prev, isActive: true } : null);
      fetchDashboardStats();
    } catch (err) {
      setError('Failed to activate farmer.');
    }
  };

  // Expose handlers globally for AdminDetailSheet
  React.useEffect(() => {
    window.handleApproveFarmer = handleApproveFarmer;
    window.handleRejectFarmer = handleRejectFarmer;
    window.handleSuspendFarmer = handleSuspendFarmer;
    window.handleActivateFarmer = handleActivateFarmer;
    
    return () => {
      delete window.handleApproveFarmer;
      delete window.handleRejectFarmer;
      delete window.handleSuspendFarmer;
      delete window.handleActivateFarmer;
    };
  }, []);

  const toggleUserStatus = async (id, type, currentStatus) => {
    try {
      if (currentStatus) {
        await api.put(`/admin/users/${id}/suspend`);
      } else {
        await api.put(`/admin/users/${id}/activate`);
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, isActive: !currentStatus } : u,
        ),
      );
      fetchDashboardStats();
    } catch {
      setError("Failed to update user status. Please try again.");
    }
  };



  const exportToCSV = (data, filename) => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = Object.keys(data[0]).filter(
      (key) => key !== "id" && key !== "__v",
    );
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };



  // Helper to render active filter tags
  const renderActiveFilters = () => {
    const activeFilters = [];
    
    // Search term
    if (searchTerm) {
      activeFilters.push({ key: 'search', label: `Search: "${searchTerm}"`, value: searchTerm });
    }
    
    // Page-specific filters
    if (view === 'users') {
      if (filters.accountStatus) {
        activeFilters.push({ key: 'accountStatus', label: `Status: ${filters.accountStatus}`, value: filters.accountStatus });
      }
    } else if (view === 'farmers') {
      if (filters.status) {
        activeFilters.push({ key: 'status', label: `Verification: ${filters.status}`, value: filters.status });
      }
      if (filters.accountStatus) {
        activeFilters.push({ key: 'accountStatus', label: `Account Status: ${filters.accountStatus}`, value: filters.accountStatus });
      }
      if (filters.region) {
        activeFilters.push({ key: 'region', label: `Region: ${filters.region}`, value: filters.region });
      }
    } else if (view === 'all-products') {
      if (filters.category) {
        activeFilters.push({ key: 'category', label: `Category: ${filters.category}`, value: filters.category });
      }
      if (filters.status) {
        activeFilters.push({ key: 'status', label: `Status: ${filters.status}`, value: filters.status });
      }
    }
    
    // Sort filter (common to all)
    if (filters.sortBy) {
      activeFilters.push({ key: 'sortBy', label: `Sort: ${filters.sortBy}`, value: filters.sortBy });
    }
    
    // Price range (products only)
    if (view === 'all-products' && (filters.priceMin || filters.priceMax)) {
      const priceLabel = `Price: ${filters.priceMin || '0'} - ${filters.priceMax || '∞'}`;
      activeFilters.push({ key: 'priceRange', label: priceLabel, value: { min: filters.priceMin, max: filters.priceMax } });
    }
    
    if (activeFilters.length === 0) return null;
    
    const removeFilter = (key) => {
      if (key === 'search') {
        setSearchTerm('');
      } else if (key === 'priceRange') {
        setFilters(prev => ({ ...prev, priceMin: '', priceMax: '' }));
      } else {
        setFilters(prev => ({ ...prev, [key]: '' }));
      }
    };
    
    return (
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-2 items-center">
        <span className="text-xs font-medium text-slate-500">Active filters:</span>
        {activeFilters.map(filter => (
          <div 
            key={filter.key}
            className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-700"
          >
            {filter.label}
            <button 
              onClick={() => removeFilter(filter.key)}
              className="ml-1 hover:text-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color, change, onClick, subtitle }) => (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-2xl p-5 transition-all duration-200 hover:shadow-md group relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-indigo-300 hover:shadow-indigo-100/50' : ''
      }`}
    >
      {/* Accent bar */}
      <div className="absolute top-0 left-0 h-1 w-full rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={22} color={color} />
        </div>
        {change !== undefined && change !== 0 && (
          <span
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
              change > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
            }`}
          >
            {change > 0 ? '▲' : '▼'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 tabular-nums">{value}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      {change !== undefined && (
        <p className="text-xs text-slate-400 mt-2">
          {change > 0 ? `↑ ${change}% vs last period` : change < 0 ? `↓ ${Math.abs(change)}% vs last period` : 'No change'}
        </p>
      )}
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex flex-row w-full h-screen bg-slate-50/50 overflow-hidden">
        <Toaster position="top-right" richColors closeButton />
        {/* Desktop Sidebar */}
        <div className={`hidden md:block ${isSidebarCollapsed ? 'w-28 flex-shrink-0 transition-all duration-300 ease-in-out' : 'w-64 flex-shrink-0 transition-all duration-300 ease-in-out'}`}>
          <AdminSidebar
            onLogout={logout}
            activeTab={view}
            onNav={setView}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}

          />
        </div>

        {/* Mobile Sidebar Drawer */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-[100] bg-white border border-slate-200 shadow-md">
              <Menu className="h-5 w-5 text-slate-700" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 z-[100] overflow-y-auto">
            <div className="h-full flex flex-col bg-white">
              {/* Mobile Header */}
              <div className="bg-indigo-600 p-4 border-b border-indigo-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Admin Panel</h2>
                    <p className="text-xs text-indigo-100">FarmConnect</p>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="flex-1 p-4 space-y-2">
                <button onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <LayoutDashboard size={18} /> <span className="font-medium">Dashboard</span>
                </button>
                <button onClick={() => { setView('users'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'users' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <Users size={18} /> <span className="font-medium">Users</span>
                </button>
                <button onClick={() => { setView('farmers'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'farmers' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <UserCog size={18} /> <span className="font-medium">Farmers</span>
                </button>
                <button onClick={() => { setView('all-products'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'all-products' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <Package size={18} /> <span className="font-medium">All Products</span>
                </button>
                <button onClick={() => { setView('profile'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <UserCog size={18} /> <span className="font-medium">Profile</span>
                </button>
                <button onClick={() => { setView('settings'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <Settings size={18} /> <span className="font-medium">Settings</span>
                </button>
                <button onClick={() => { setView('reports'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'reports' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <BarChart3 size={18} /> <span className="font-medium">Reports</span>
                </button>
                <button onClick={() => { setView('transactions'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'transactions' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <DollarSign size={18} /> <span className="font-medium">Transactions</span>
                </button>

              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">

          {/* ── Header (matches Farmer Dashboard style) ── */}
          <nav className="flex flex-row items-center justify-between w-full px-4 sm:px-6 py-4 bg-white border-b border-slate-200 flex-shrink-0 z-10">
            {/* Left – Logo on mobile, Greeting on desktop */}
            <div className="flex items-center shrink-0 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center sm:hidden">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-base sm:text-lg font-semibold text-slate-900">
                    Welcome back, {user?.name || 'Admin'}.
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Here's what's happening on your platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Middle – Search Bar */}
            <form onSubmit={(e) => e.preventDefault()} className="relative flex-grow max-w-md mx-2 sm:mx-4 hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Search users, farmers, products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-9 pl-10 bg-slate-50 border-slate-200 text-sm rounded-md"
              />
            </form>

            {/* Right – Notifications + Profile */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">

              {/* Notifications */}
              <div className="hidden sm:block">
                <NotificationBell />
              </div>

              {/* Profile dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-8 px-2 rounded-lg"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-medium text-slate-900">{user?.name || 'Admin'}</p>
                    <p className="text-[10px] text-slate-600">Super Admin</p>
                  </div>
                </Button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">My Account</p>
                    </div>
                    <button
                      onClick={() => { setView('profile'); setProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </button>
                    <div className="border-t border-slate-100 my-2" />
                    <button
                      onClick={() => { logout(); setProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>

          <div className="flex-1 overflow-y-auto">
            <main className="p-6 md:p-10 max-w-7xl mx-auto w-full">
            {/* Global Admin Filter Bar */}
            
              {view === "dashboard" && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

                  {/* Platform Overview Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">At a Glance</p>
                      <h2 className="text-xl font-bold text-slate-900">Platform Overview</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
                        📅 {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => { fetchDashboardStats(); fetchAnalyticsData(); }}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors"
                        title="Refresh data"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard
                      title="Total Revenue"
                      value={`${(stats.totalEarnings || 0).toLocaleString()} ETB`}
                      icon={DollarSign}
                      color="#10b981"
                      change={stats.earningsChange}
                      subtitle="All-time gross revenue"
                    />
                    <StatCard
                      title="Active Farmers"
                      value={stats.totalFarmers}
                      icon={UserCog}
                      color="#6366f1"
                      change={stats.farmersChange}
                      onClick={() => setView('farmers')}
                      subtitle="Click to manage"
                    />
                    <StatCard
                      title="Total Customers"
                      value={stats.totalUsers}
                      icon={Users}
                      color="#ec4899"
                      change={stats.usersChange}
                      onClick={() => setView('users')}
                      subtitle="Click to manage"
                    />
                    <StatCard
                      title="Total Orders"
                      value={stats.totalOrders}
                      icon={Package}
                      color="#f59e0b"
                      change={stats.ordersChange}
                      onClick={() => setView('transactions')}
                      subtitle="Click to view all"
                    />
                  </div>

                  {/* ── Row 1: Revenue Trend (full width) ── */}
                  <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    <div className="px-6 pt-6 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Monthly Performance</p>
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-emerald-500" /> Sales Revenue Trend
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />Revenue (ETB)</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-400 inline-block" />Orders</span>
                      </div>
                    </div>
                    <CardContent className="pt-2 pb-6 px-2">
                      {salesTrend.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[320px] text-slate-400 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60">
                          <TrendingUp className="w-10 h-10 mb-3 text-slate-300" />
                          <p className="font-medium">No revenue data yet</p>
                          <p className="text-xs mt-1">Revenue will appear once orders are placed</p>
                        </div>
                      ) : (
                        <ChartContainer
                          config={{
                            revenue: { label: "Revenue (ETB)", color: "#10b981" },
                            orders: { label: "Orders", color: "#818cf8" },
                          }}
                          className="h-[320px] w-full"
                        >
                          <AreaChart data={salesTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} />
                            <YAxis yAxisId="revenue" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                            <YAxis yAxisId="orders" orientation="right" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <ChartTooltip
                              content={<ChartTooltipContent />}
                              cursor={{ stroke: '#e2e8f0', strokeWidth: 1.5 }}
                            />
                            <Area yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#gradRevenue)" dot={false} activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                            <Area yAxisId="orders" type="monotone" dataKey="orders" stroke="#818cf8" strokeWidth={2} fill="url(#gradOrders)" dot={false} activeDot={{ r: 4, fill: '#818cf8', stroke: '#fff', strokeWidth: 2 }} />
                          </AreaChart>
                        </ChartContainer>
                      )}
                    </CardContent>
                  </Card>

                  {/* ── Row 2: Categories + Sellers side-by-side ── */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Top Selling Categories — Donut + custom legend */}
                    <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                      <div className="px-6 pt-6 pb-2">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Product Mix</p>
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-indigo-500" /> Top Selling Categories
                        </h3>
                      </div>
                      <CardContent className="pt-2 pb-6">
                        {topCategories.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-[300px] text-slate-400 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60">
                            <BarChart3 className="w-10 h-10 mb-3 text-slate-300" />
                            <p className="font-medium">No category data yet</p>
                          </div>
                        ) : (() => {
                          const PALETTE = ['#6366f1','#10b981','#f59e0b','#ec4899','#3b82f6','#8b5cf6','#14b8a6'];
                          const total = topCategories.reduce((s, c) => s + c.total, 0);
                          return (
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                              <div className="w-full sm:w-1/2">
                                <ChartContainer
                                  config={Object.fromEntries(topCategories.map((c, i) => [c.category, { label: c.category, color: PALETTE[i % PALETTE.length] }]))}
                                  className="h-[220px] w-full"
                                >
                                  <PieChart>
                                    <Pie
                                      data={topCategories}
                                      dataKey="total"
                                      nameKey="category"
                                      cx="50%" cy="50%"
                                      innerRadius={60} outerRadius={95}
                                      paddingAngle={3}
                                      strokeWidth={0}
                                    >
                                      {topCategories.map((_, i) => (
                                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                                      ))}
                                    </Pie>
                                    <ChartTooltip
                                      content={({ active, payload }) => active && payload?.length ? (
                                        <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
                                          <p className="font-semibold text-slate-900">{payload[0].payload.category}</p>
                                          <p className="text-slate-600">{payload[0].value} sold · {Math.round(payload[0].value / total * 100)}%</p>
                                        </div>
                                      ) : null}
                                    />
                                  </PieChart>
                                </ChartContainer>
                              </div>
                              <div className="w-full sm:w-1/2 space-y-2">
                                {topCategories.map((cat, i) => (
                                  <div key={cat.category} className="flex items-center gap-2.5">
                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                                    <span className="text-sm text-slate-700 flex-1 truncate font-medium">{cat.category}</span>
                                    <span className="text-sm font-bold text-slate-900">{cat.total}</span>
                                    <span className="text-xs text-slate-400 w-9 text-right">{Math.round(cat.total / total * 100)}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>

                    {/* Top 5 Sellers — Horizontal bars with rank badges */}
                    <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                      <div className="px-6 pt-6 pb-2">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Leaderboard</p>
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          <UserCog className="w-5 h-5 text-blue-500" /> Top 5 Sellers
                        </h3>
                      </div>
                      <CardContent className="pt-4 pb-6">
                        {topSellers.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-[260px] text-slate-400 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60">
                            <UserCog className="w-10 h-10 mb-3 text-slate-300" />
                            <p className="font-medium">No seller data yet</p>
                          </div>
                        ) : (() => {
                          const max = Math.max(...topSellers.map(s => s.totalSales || 0));
                          const RANK_COLORS = ['#f59e0b','#94a3b8','#cd7c2f','#6366f1','#10b981'];
                          const RANK_LABELS = ['🥇','🥈','🥉','4th','5th'];
                          return (
                            <div className="space-y-3">
                              {topSellers.slice(0, 5).map((seller, i) => {
                                const pct = max > 0 ? (seller.totalSales / max) * 100 : 0;
                                return (
                                  <button
                                    key={seller.farmName || i}
                                    onClick={() => handleSellerClick(seller)}
                                    className="w-full text-left group"
                                  >
                                    <div className="flex items-center gap-3 mb-1">
                                      <span className="text-base w-8 text-center flex-shrink-0">{RANK_LABELS[i]}</span>
                                      <span className="text-sm font-semibold text-slate-800 flex-1 truncate group-hover:text-indigo-600 transition-colors">
                                        {seller.farmName || seller.name || 'Unknown'}
                                      </span>
                                      <span className="text-sm font-bold text-slate-900 tabular-nums">
                                        {(seller.totalSales || 0).toLocaleString()} ETB
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="w-8 flex-shrink-0" />
                                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                          className="h-full rounded-full transition-all duration-700"
                                          style={{ width: `${pct}%`, backgroundColor: RANK_COLORS[i] }}
                                        />
                                      </div>
                                      <span className="text-xs text-slate-400 w-10 text-right tabular-nums">{pct.toFixed(0)}%</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  </div>

                  {/* ── Row 3: Recent Activity — Timeline style ── */}
                  <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    <div className="px-6 pt-6 pb-2 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Live Feed</p>
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          <Bell className="w-5 h-5 text-amber-500" /> Recent Platform Activity
                        </h3>
                      </div>
                      {recentActivity.length > 0 && (
                        <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                          {recentActivity.length} events
                        </span>
                      )}
                    </div>
                    <CardContent className="pt-4 pb-6">
                      {recentActivity.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                          <Bell className="w-10 h-10 mb-3 text-slate-300" />
                          <p className="font-medium">No recent activity</p>
                          <p className="text-xs mt-1">Platform events will appear here in real-time</p>
                        </div>
                      ) : (
                        <div className="relative">
                          {/* vertical timeline line */}
                          <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-100" />
                          <div className="space-y-1">
                            {recentActivity.map((activity, idx) => {
                              const isOrder = activity.type === 'order';
                              const isFarmer = activity.type === 'farmer';
                              const iconBg = isOrder ? 'bg-emerald-100' : isFarmer ? 'bg-blue-100' : 'bg-violet-100';
                              const iconColor = isOrder ? 'text-emerald-600' : isFarmer ? 'text-blue-600' : 'text-violet-600';
                              const dotColor = isOrder ? 'bg-emerald-500' : isFarmer ? 'bg-blue-500' : 'bg-violet-500';
                              const statusStyle =
                                activity.status === 'completed' || activity.status === 'verified'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : activity.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200';
                              return (
                                <div key={activity.id || idx} className="relative flex items-start gap-4 pl-2 pr-2 py-3 rounded-xl hover:bg-slate-50/80 transition-colors group">
                                  {/* dot on line */}
                                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white ${iconBg}`}>
                                    {isOrder && <Package className={`w-4 h-4 ${iconColor}`} />}
                                    {isFarmer && <UserCog className={`w-4 h-4 ${iconColor}`} />}
                                    {!isOrder && !isFarmer && <Package className={`w-4 h-4 ${iconColor}`} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-semibold text-sm text-slate-900">{activity.title}</span>
                                      <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${statusStyle}`}>
                                        {activity.status}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5 truncate">{activity.description}</p>
                                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Just now'}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {view === "users" && (
                <div className="animate-in fade-in duration-300">
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <AdminFilterBar
                      pageType="customers"
                      filters={filters}
                      setFilters={setFilters}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      exportData={getExportData()}
                      exportColumns={getExportColumns()}
                      exportFilename={getExportFilename()}
                      exportTitle={getExportTitle()}
                    />
                    {renderActiveFilters()}
                    {/* Inline error banner */}
                    {error && (
                      <div className="px-4 py-3 bg-red-50 border-b border-red-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-red-700 text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{error}</span>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {loading ? (
                      <div className="p-8">
                        <SkeletonLoader type="table" rows={8} />
                      </div>
                    ) : error ? (
                      <div className="p-8 text-center text-red-500">{error}</div>
                    ) : filteredUsers.length === 0 ? (
                      <EmptyState 
                        type={searchTerm ? 'search' : 'customers'} 
                        message={searchTerm ? 'No customers match your search' : 'No customers found'}
                      />
                    ) : (() => {
                      const pagedUsers = filteredUsers.slice((usersPage - 1) * PAGE_SIZE, usersPage * PAGE_SIZE);
                      const totalUsersPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
                      return (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-slate-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {pagedUsers.map((user) => (
                                  <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                      <div className="font-medium text-slate-900">{user.name}</div>
                                      <div className="text-xs text-slate-500">ID: {user.id}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                                    <td className="px-6 py-4">
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-700' :
                                          user.role === 'FARMER' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                        {user.role}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                          <DropdownMenuItem onClick={() => handleViewDetail(user, 'customer')}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          {user.isActive ? (
                                            <DropdownMenuItem onClick={async () => {
                                              try {
                                                await api.put(`/admin/users/${user.id}/suspend`);
                                                fetchData();
                                              } catch (err) {
                                                setError('Failed to suspend user.');
                                              }
                                            }}>
                                              Suspend User
                                            </DropdownMenuItem>
                                          ) : (
                                            <DropdownMenuItem onClick={async () => {
                                              try {
                                                await api.put(`/admin/users/${user.id}/activate`);
                                                fetchData();
                                              } catch (err) {
                                                setError('Failed to activate user.');
                                              }
                                            }}>
                                              Activate User
                                            </DropdownMenuItem>
                                          )}
                                          <DropdownMenuItem
                                            className="text-red-600 focus:text-red-600"
                                            onClick={() => handleDelete(user.id, 'user', user.name || 'this user')}
                                          >
                                            Delete User
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {/* Pagination */}
                          {totalUsersPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
                              <p className="text-xs text-slate-500">
                                Showing {(usersPage - 1) * PAGE_SIZE + 1}–{Math.min(usersPage * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}
                              </p>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => setUsersPage(p => Math.max(1, p - 1))} disabled={usersPage === 1} className="h-8 px-3 text-xs">Previous</Button>
                                <span className="text-xs text-slate-600 font-medium">{usersPage} / {totalUsersPages}</span>
                                <Button variant="outline" size="sm" onClick={() => setUsersPage(p => Math.min(totalUsersPages, p + 1))} disabled={usersPage === totalUsersPages} className="h-8 px-3 text-xs">Next</Button>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {view === "farmers" && (
                <div className="animate-in fade-in duration-300">
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <AdminFilterBar
                      pageType="farmers"
                      filters={filters}
                      setFilters={setFilters}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      exportData={getExportData()}
                      exportColumns={getExportColumns()}
                      exportFilename={getExportFilename()}
                      exportTitle={getExportTitle()}
                    />
                    {renderActiveFilters()}
                    {/* Inline error banner */}
                    {error && (
                      <div className="px-4 py-3 bg-red-50 border-b border-red-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-red-700 text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{error}</span>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {loading ? (
                      <div className="p-8">
                        <SkeletonLoader type="table" rows={8} />
                      </div>
                    ) : error ? (
                      <div className="p-8 text-center text-red-500">{error}</div>
                    ) : filteredFarmers.length === 0 ? (
                      <EmptyState 
                        type={searchTerm ? 'search' : 'farmers'} 
                        message={searchTerm ? 'No farmers match your search' : 'No verified farmers found'}
                      />
                    ) : (() => {
                      const pagedFarmers = filteredFarmers.slice((farmersPage - 1) * PAGE_SIZE, farmersPage * PAGE_SIZE);
                      const totalFarmersPages = Math.ceil(filteredFarmers.length / PAGE_SIZE);
                      return (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-slate-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Farmer</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Farm Name</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Verification</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Account Status</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {pagedFarmers.map((farmer) => (
                                  <tr key={farmer.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                      <div className="font-medium text-slate-900">{farmer.name}</div>
                                      <div className="text-xs text-slate-500">ID: {farmer.id}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{farmer.email}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{farmer.farmName || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                          farmer.isVerified 
                                            ? 'bg-emerald-100 text-emerald-700' 
                                            : farmer.isRejected
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-amber-100 text-amber-700'
                                        }`}>
                                          {farmer.isVerified ? '✓ Verified' : farmer.isRejected ? '✗ Rejected' : '⏱ Pending'}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${farmer.isActive ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {farmer.isActive ? 'Active' : 'Suspended'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                          <DropdownMenuItem onClick={() => handleViewDetail(farmer, 'farmer')}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          {!farmer.isVerified && (
                                            <>
                                              <DropdownMenuItem onClick={async () => {
                                                try {
                                                  await api.put(`/admin/farmers/${farmer.id}/verify`);
                                                  fetchData();
                                                  fetchDashboardStats();
                                                } catch (err) {
                                                  setError('Failed to verify farmer.');
                                                }
                                              }}>
                                                <Check className="mr-2 h-4 w-4 text-emerald-600" />
                                                Verify Farmer
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                            </>
                                          )}
                                          {farmer.isActive ? (
                                            <DropdownMenuItem onClick={async () => {
                                              try {
                                                await api.put(`/admin/users/${farmer.id}/suspend`);
                                                fetchData();
                                              } catch (err) {
                                                setError('Failed to suspend farmer.');
                                              }
                                            }}>
                                              Suspend Farmer
                                            </DropdownMenuItem>
                                          ) : (
                                            <DropdownMenuItem onClick={async () => {
                                              try {
                                                await api.put(`/admin/users/${farmer.id}/activate`);
                                                fetchData();
                                              } catch (err) {
                                                setError('Failed to activate farmer.');
                                              }
                                            }}>
                                              Activate Farmer
                                            </DropdownMenuItem>
                                          )}
                                          <DropdownMenuItem 
                                            className="text-red-600 focus:text-red-600"
                                            onClick={() => handleDelete(farmer.id, 'user', farmer.name || 'this farmer')}
                                          >
                                            Delete Farmer
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {/* Pagination */}
                          {totalFarmersPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
                              <p className="text-xs text-slate-500">
                                Showing {(farmersPage - 1) * PAGE_SIZE + 1}–{Math.min(farmersPage * PAGE_SIZE, filteredFarmers.length)} of {filteredFarmers.length}
                              </p>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => setFarmersPage(p => Math.max(1, p - 1))} disabled={farmersPage === 1} className="h-8 px-3 text-xs">Previous</Button>
                                <span className="text-xs text-slate-600 font-medium">{farmersPage} / {totalFarmersPages}</span>
                                <Button variant="outline" size="sm" onClick={() => setFarmersPage(p => Math.min(totalFarmersPages, p + 1))} disabled={farmersPage === totalFarmersPages} className="h-8 px-3 text-xs">Next</Button>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {view === "all-products" && (
                <div className="animate-in fade-in duration-300 -mx-6 md:-mx-10">
                  <div className="bg-white border-y border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 md:px-10">
                      <AdminFilterBar
                        pageType="products"
                        filters={filters}
                        setFilters={setFilters}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        exportData={getExportData()}
                        exportColumns={getExportColumns()}
                        exportFilename={getExportFilename()}
                        exportTitle={getExportTitle()}
                      />
                    </div>
                    {renderActiveFilters()}
                    {/* Inline error banner */}
                    {error && (
                      <div className="px-6 md:px-10 py-3 bg-red-50 border-b border-red-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-red-700 text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{error}</span>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {loading ? (
                      <div className="p-8">
                        <SkeletonLoader type="table" rows={8} />
                      </div>
                    ) : error ? (
                      <div className="p-8 text-center text-red-500">{error}</div>
                    ) : filteredAllProducts.length === 0 ? (
                      <EmptyState 
                        type={searchTerm ? 'search' : 'products'} 
                        message={searchTerm ? 'No products match your search' : 'No products found'}
                      />
                    ) : (() => {
                      const pagedProducts = filteredAllProducts.slice((productsPage - 1) * PAGE_SIZE, productsPage * PAGE_SIZE);
                      const totalProductsPages = Math.ceil(filteredAllProducts.length / PAGE_SIZE);
                      return (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-slate-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Photo</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Product</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Farmer</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Price</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Stock</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {pagedProducts.map((product) => (
                                  <tr key={product.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                      {product.image ? (
                                        <img
                                          src={product.image}
                                          alt={product.name}
                                          className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => handleViewDetail(product, 'product')}
                                        />
                                      ) : (
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                                          <Package className="w-6 h-6 text-slate-400" />
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div>
                                          <div className="font-medium text-slate-900">{product.name}</div>
                                          <div className="text-xs text-slate-500">{product.sku || 'No SKU'}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="text-sm text-slate-900">{product.farmer?.name || 'Unknown'}</div>
                                      <div className="text-xs text-slate-500">{product.farmer?.email || ''}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{product.category || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{product.price} ETB</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{product.stock} {product.unit}</td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-2">
                                        <Switch
                                          checked={product.status === 'approved'}
                                          onCheckedChange={() => toggleProductStatus(product.id, product.status)}
                                          className="data-[state=checked]:bg-emerald-600"
                                        />
                                        <span className={`text-xs font-medium ${product.status === 'approved' ? 'text-emerald-700' : 'text-slate-500'}`}>
                                          {product.status === 'approved' ? 'Active' : 'Inactive'}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                          <DropdownMenuItem onClick={() => handleViewDetail(product, 'product')}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem 
                                            className="text-red-600 focus:text-red-600"
                                            onClick={() => handleDelete(product.id, 'product', product.name || 'this product')}
                                          >
                                            Delete Product
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {/* Pagination */}
                          {totalProductsPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
                              <p className="text-xs text-slate-500">
                                Showing {(productsPage - 1) * PAGE_SIZE + 1}–{Math.min(productsPage * PAGE_SIZE, filteredAllProducts.length)} of {filteredAllProducts.length}
                              </p>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => setProductsPage(p => Math.max(1, p - 1))} disabled={productsPage === 1} className="h-8 px-3 text-xs">Previous</Button>
                                <span className="text-xs text-slate-600 font-medium">{productsPage} / {totalProductsPages}</span>
                                <Button variant="outline" size="sm" onClick={() => setProductsPage(p => Math.min(totalProductsPages, p + 1))} disabled={productsPage === totalProductsPages} className="h-8 px-3 text-xs">Next</Button>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {view === "reports" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-bold text-slate-900">Reports Overview</h2>
                  {!reportsData ? (
                    <div className="flex items-center justify-center py-24">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
                    </div>
                  ) : (
                    <>
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Monthly Revenue</p>
                            <p className="text-2xl font-bold text-slate-900">${(reportsData.monthlyRevenue || 0).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Total Orders</p>
                            <p className="text-2xl font-bold text-slate-900">{reportsData.totalOrders || 0}</p>
                          </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
                          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Top Products Count</p>
                            <p className="text-2xl font-bold text-slate-900">{(reportsData.topProducts || []).length}</p>
                          </div>
                        </div>
                      </div>

                      {/* Top Products Table */}
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-200">
                          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-indigo-500" /> Top Products
                          </h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Units Sold</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(reportsData.topProducts || []).map((p, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-5 py-3 font-medium text-slate-900">{p.name || p.productName || 'N/A'}</td>
                                  <td className="px-5 py-3 text-slate-600">{p.category || 'N/A'}</td>
                                  <td className="px-5 py-3 text-right text-slate-900">{p.totalSold ?? p.count ?? 0}</td>
                                  <td className="px-5 py-3 text-right font-medium text-emerald-600">${(p.revenue || 0).toLocaleString()}</td>
                                </tr>
                              ))}
                              {(reportsData.topProducts || []).length === 0 && (
                                <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500">No data available</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Recent Orders */}
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-200">
                          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-500" /> Recent Orders
                          </h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(reportsData.recentOrders || []).map((o, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-5 py-3 font-mono text-xs text-slate-700">#{(o.id || '').toString().slice(-8)}</td>
                                  <td className="px-5 py-3 text-slate-900">{o.customer || o.user?.name || 'N/A'}</td>
                                  <td className="px-5 py-3 text-slate-500">{o.date ? new Date(o.date).toLocaleDateString() : 'N/A'}</td>
                                  <td className="px-5 py-3 text-right font-medium text-slate-900">${(o.amount || o.total || 0).toLocaleString()}</td>
                                  <td className="px-5 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      o.status === 'completed' || o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                      o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                      o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                      'bg-slate-100 text-slate-700'
                                    }`}>{o.status || 'N/A'}</span>
                                  </td>
                                </tr>
                              ))}
                              {(reportsData.recentOrders || []).length === 0 && (
                                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No recent orders</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {view === "transactions" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-bold text-slate-900">Transactions</h2>
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-indigo-500" /> All Transactions
                      </h3>
                      <span className="text-sm text-slate-500">{transactionsData.length} records</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order Code</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {transactionsData.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-5 py-16 text-center">
                                <DollarSign className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                                <p className="text-slate-500 font-medium">No transactions found</p>
                                <p className="text-xs text-slate-400 mt-1">Orders will appear here once placed</p>
                              </td>
                            </tr>
                          ) : (
                            transactionsData.map((t, i) => (
                              <tr key={t.id || i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-5 py-3 font-mono text-xs font-semibold text-indigo-600">{t.orderCode || `#${t.id}`}</td>
                                <td className="px-5 py-3">
                                  <div className="font-medium text-slate-900">{t.customer || 'N/A'}</div>
                                  <div className="text-xs text-slate-500">{t.customerEmail || ''}</div>
                                </td>
                                <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{t.date ? new Date(t.date).toLocaleDateString() : 'N/A'}</td>
                                <td className="px-5 py-3 text-right font-bold text-slate-900">{(t.amount || 0).toLocaleString()} ETB</td>
                                <td className="px-5 py-3">
                                  <span className="px-2 py-1 rounded-md text-xs bg-slate-100 text-slate-700 capitalize">
                                    {t.paymentMethod || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-5 py-3">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    t.status === 'completed' || t.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                    t.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                    t.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                    t.status === 'failed' || t.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                    'bg-slate-100 text-slate-600'
                                  }`}>{t.status || 'N/A'}</span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {view === "profile" && (
                <div className="animate-in fade-in duration-300">
                  <AdminProfile />
                </div>
              )}

              {view === "settings" && (
                <div className="animate-in fade-in duration-300">
                  <AdminSettings />
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <AdminDetailSheet
        open={detailSheetOpen}
        onClose={() => setDetailSheetOpen(false)}
        type={detailSheetType}
        data={detailSheetData}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({ open: false, id: null, type: null, label: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteConfirm.label || deleteConfirm.type}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default AdminDashboard;
