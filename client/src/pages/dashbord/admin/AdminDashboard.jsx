import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import AdminSidebar from "./AdminSidebar";
import AdminProfile from "./profile";
import api from "../../../api.js";
import { Button } from "../../../components/ui/button";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../../../components/ui/sidebar";

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
  Bell
} from "lucide-react";

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const [view, setView] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [pendingFarmers, setPendingFarmers] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalProducts: 0,
    pendingFarmers: 0,
    pendingProducts: 0,
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const fetchDashboardStats = async () => {
    try {
      console.log('=== Fetching Dashboard Stats ===');
      const res = await api.get("/admin/stats");
      console.log('Dashboard stats response:', res.data);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/admin/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/admin/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/admin/notifications/read-all");
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const fetchData = async () => {
    setError(null);
    setLoading(true);
    setSearchTerm("");

    try {
      if (view === "users") {
        const res = await api.get("/admin/users");
        setUsers(res.data);
      } else if (view === "farmers") {
        const res = await api.get("/admin/farmers/verified");
        setFarmers(res.data);
      } else if (view === "pending-farmers") {
        const res = await api.get("/admin/farmers/pending");
        setPendingFarmers(res.data);
      } else if (view === "pending-products") {
        const res = await api.get("/admin/products/pending");
        setPendingProducts(res.data);
      } else if (view === "all-products") {
        console.log('=== Fetching All Products from Admin Dashboard ===');
        try {
          const res = await api.get("/admin/products");
          console.log('All products response:', res.data);
          setAllProducts(res.data);
        } catch (err) {
          console.error('Error fetching all products:', err);
          setError('Failed to fetch all products');
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view !== "dashboard" && view !== "profile") {
      fetchData();
    }
  }, [view]);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm),
    );
  }, [users, searchTerm]);

  const filteredFarmers = useMemo(() => {
    return farmers.filter(
      (farmer) =>
        farmer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.farmName?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [farmers, searchTerm]);

  const filteredPendingFarmers = useMemo(() => {
    return pendingFarmers.filter(
      (farmer) =>
        farmer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.farmName?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [pendingFarmers, searchTerm]);

  const handleDelete = async (id, type) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${type}? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await api.delete(`/admin/${type}s/${id}`);
      if (type === "user") {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        setFarmers((prev) => prev.filter((f) => f.id !== id));
      }
      fetchDashboardStats();
    } catch {
      alert(`Failed to delete ${type}.`);
    }
  };

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
      alert("Failed to update user status.");
    }
  };

  // Farmer Approval Actions
  const handleApproveFarmer = async (id) => {
    try {
      await api.put(`/admin/farmers/${id}/verify`);
      setPendingFarmers(prev => prev.filter(f => f.id !== id));
      fetchDashboardStats();
    } catch (err) {
      alert("Failed to approve farmer.");
    }
  };

  const handleRejectFarmer = async (id) => {
    const confirmed = window.confirm("Are you sure you want to reject this farmer application? This will permanently delete their account request.");
    if (!confirmed) return;
    try {
      await api.put(`/admin/farmers/${id}/reject`);
      setPendingFarmers(prev => prev.filter(f => f.id !== id));
      fetchDashboardStats();
    } catch (err) {
      alert("Failed to reject farmer.");
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

  const renderList = (data, type) => {
    if (loading)
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <RefreshCw className="w-8 h-8 text-slate-400 mb-4 animate-spin" />
          <p className="text-slate-500">Loading...</p>
        </div>
      );

    if (error)
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
          <p className="text-red-500 font-semibold">{error}</p>
        </div>
      );

    if (data.length === 0)
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {type === "pending-farmer" ? (
             <Shield className="w-12 h-12 text-emerald-200 mb-4" />
          ) : (
             <Users className="w-8 h-8 text-slate-400 mb-4" />
          )}
          <p className="text-slate-500 font-medium text-lg">No {type.replace('-', ' ')}s found.</p>
        </div>
      );

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center flex-1 max-w-[400px] min-w-[250px] bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input
              type="text"
              placeholder={`Search ${type.replace('-', ' ')}s...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <Button
            onClick={() => exportToCSV(data, type)}
            variant="outline"
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>

        {type === "pending-farmer" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((item) => (
              <div key={item.id} className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-400"></div>
                <div className="flex items-start justify-between mb-4 mt-1">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-500">{item.email}</p>
                  </div>
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Review Needed</span>
                </div>
                
                <div className="space-y-3 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-sm"><span className="font-semibold text-slate-700">Farm Name:</span> {item.farmName || 'Not specified'}</div>
                  <div className="text-sm"><span className="font-semibold text-slate-700">Phone:</span> {item.phone || 'Not specified'}</div>
                  <div className="text-sm"><span className="font-semibold text-slate-700">Address:</span> {item.address || 'Not specified'}</div>
                  <div className="text-sm"><span className="font-semibold text-slate-700">TIN:</span> {item.tinNumber || 'Not provided'}</div>
                  <div className="text-sm"><span className="font-semibold text-slate-700">Bio:</span> <span className="text-slate-600 text-xs">{item.bio || 'None'}</span></div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button onClick={() => handleApproveFarmer(item.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                    <Check size={16} /> Approve
                  </Button>
                  <Button onClick={() => handleRejectFarmer(item.id)} variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2">
                    <X size={16} /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="list-none p-0 m-0 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {data.map((item) => (
              <li
                key={item.id}
                className="flex items-center p-5 border-b border-slate-100 bg-white transition-all hover:bg-slate-50 gap-5 last:border-b-0"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                  {item.name ? item.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <span className="font-bold text-lg text-slate-900 mr-3">
                      {item.name || "Unnamed"}
                    </span>
                    <span className="text-sm text-slate-500">{item.email}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    {item.phone && (
                      <span className="flex items-center gap-1.5 before:content-['•'] before:text-slate-300 first:before:content-none">
                        {item.phone}
                      </span>
                    )}
                    {item.farmName && (
                      <span className="flex items-center gap-1.5 before:content-['•'] before:text-slate-300 first:before:content-none">
                        {item.farmName}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 before:content-['•'] before:text-slate-300 first:before:content-none">
                      Joined: {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 flex-shrink-0">
                  {type === "user" && (
                    <>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${item.isActive === false ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}
                      >
                        {item.isActive === false ? "Suspended" : "Active"}
                      </span>
                      <button
                        onClick={() => toggleUserStatus(item.id, type, item.isActive)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${item.isActive === false ? "text-emerald-600 border-emerald-500 hover:bg-emerald-500 hover:text-white" : "text-amber-500 border-amber-500 hover:bg-amber-500 hover:text-white"}`}
                        title={item.isActive === false ? "Activate User" : "Suspend User"}
                      >
                        {item.isActive === false ? "Activate" : "Suspend"}
                      </button>
                    </>
                  )}
                  {type === "farmer" && (
                     <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                       <CheckCircle size={12} className="inline mr-1" /> Verified
                     </span>
                  )}
                  <button
                    onClick={() => handleDelete(item.id, type)}
                    className="p-2 rounded-lg text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    title={`Delete ${type}`}
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-end mt-4">
          <span className="text-sm text-slate-500">
            Showing {data.length} {type.replace('-', ' ')}s
          </span>
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color, change, onClick }) => (
    <div 
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg flex items-center gap-5 ${onClick ? 'cursor-pointer hover:border-indigo-500' : ''}`}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={28} color={color} />
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-slate-900 mb-1">{value}</h3>
        <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
        {change !== undefined && (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${change > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
          >
            {change > 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
    </div>
  );

  return (
    <SidebarProvider className="flex h-screen w-full overflow-hidden bg-slate-50/50">
      <AdminSidebar
        onLogout={logout}
        activeTab={view}
        onNav={setView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        pendingFarmersCount={stats.pendingFarmers}
        pendingProductsCount={stats.pendingProducts}
      />
      <SidebarInset className="flex-1 h-full overflow-y-auto">
        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
          <header className="mb-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="md:hidden">
                <SidebarTrigger className="p-2" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1 capitalize">
                  {view === 'dashboard' ? 'Overview' : view.replace('-', ' ')}
                </h1>
                <p className="text-sm text-slate-500">
                  {view === 'dashboard'
                    ? `Welcome back, ${user?.name}. Here's what's happening today.`
                    : `Manage and monitor your platform's ${view.replace('-', ' ')}.`}
                </p>
              </div>
            </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Bell className="w-5 h-5 text-slate-600" />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900">Notifications</h3>
                      {notifications.filter(n => !n.isRead).length > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {notifications.map(notification => (
                          <div
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-emerald-50' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${!notification.isRead ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                                <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-slate-400 mt-2">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </header>

          <main>
            {view === "dashboard" && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Critical Alerts / Actions */}
                {stats.pendingFarmers > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 text-amber-600">
                        <AlertCircle size={24} />
                      </div>
                      <div>
                        <h3 className="text-amber-900 font-bold text-lg">Action Required</h3>
                        <p className="text-amber-700 text-sm">You have {stats.pendingFarmers} farmer application(s) waiting for approval.</p>
                      </div>
                    </div>
                    <Button onClick={() => setView('pending-farmers')} className="bg-amber-500 hover:bg-amber-600 text-white w-full sm:w-auto">
                      Review Applications
                    </Button>
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Platform Metrics</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <StatCard
                      title="Total Customers"
                      value={stats.totalUsers}
                      icon={Users}
                      color="#6366f1"
                      onClick={() => setView('users')}
                    />
                    <StatCard
                      title="Verified Farmers"
                      value={stats.totalFarmers}
                      icon={CheckCircle}
                      color="#10b981"
                      onClick={() => setView('farmers')}
                    />
                    <StatCard
                      title="Pending Farmers"
                      value={stats.pendingFarmers}
                      icon={UserCog}
                      color="#f59e0b"
                      onClick={() => setView('pending-farmers')}
                    />
                    <StatCard
                      title="Pending Products"
                      value={stats.pendingProducts}
                      icon={Package}
                      color="#8b5cf6"
                      onClick={() => setView('pending-products')}
                    />
                    <StatCard
                      title="Total Products"
                      value={stats.totalProducts}
                      icon={Package}
                      color="#ec4899"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                      <Shield className="text-emerald-500 w-5 h-5" /> Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200">
                        <FileText size={20} />
                        <span>View Reports</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200">
                        <DollarSign size={20} />
                        <span>Transactions</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {view === "users" && (
              <div className="animate-in fade-in duration-300">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-slate-900">All Customers</h2>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Search customers..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                  {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading...</div>
                  ) : error ? (
                    <div className="p-8 text-center text-red-500">{error}</div>
                  ) : users.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No customers found</div>
                  ) : (
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
                          {users
                            .filter(u =>
                              u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              u.email?.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((user) => (
                              <tr key={user.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                  <div className="font-medium text-slate-900">{user.name}</div>
                                  <div className="text-xs text-slate-500">ID: {user.id}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    user.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-700' :
                                    user.role === 'FARMER' ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-slate-100 text-slate-700'
                                  }`}>
                                    {user.role}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    {user.isActive ? (
                                      <button
                                        onClick={async () => {
                                          try {
                                            await api.put(`/admin/users/${user.id}/suspend`);
                                            fetchData();
                                          } catch (err) {
                                            console.error('Failed to suspend user:', err);
                                          }
                                        }}
                                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors"
                                      >
                                        Suspend
                                      </button>
                                    ) : (
                                      <button
                                        onClick={async () => {
                                          try {
                                            await api.put(`/admin/users/${user.id}/activate`);
                                            fetchData();
                                          } catch (err) {
                                            console.error('Failed to activate user:', err);
                                          }
                                        }}
                                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors"
                                      >
                                        Activate
                                      </button>
                                    )}
                                    <button
                                      onClick={async () => {
                                        try {
                                          await api.delete(`/admin/users/${user.id}`);
                                          fetchData();
                                          fetchDashboardStats();
                                        } catch (err) {
                                          console.error('Failed to delete user:', err);
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {view === "farmers" && (
              <div className="animate-in fade-in duration-300">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-slate-900">Verified Farmers</h2>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Search farmers..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                  {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading...</div>
                  ) : error ? (
                    <div className="p-8 text-center text-red-500">{error}</div>
                  ) : farmers.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No verified farmers found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Farmer</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Farm Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {farmers
                            .filter(f =>
                              f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              f.email?.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((farmer) => (
                              <tr key={farmer.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                  <div className="font-medium text-slate-900">{farmer.name}</div>
                                  <div className="text-xs text-slate-500">ID: {farmer.id}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{farmer.email}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{farmer.farmName || 'N/A'}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    farmer.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {farmer.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={async () => {
                                        try {
                                          await api.put(`/admin/users/${farmer.id}/suspend`);
                                          fetchData();
                                        } catch (err) {
                                          console.error('Failed to suspend farmer:', err);
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors"
                                    >
                                      Suspend
                                    </button>
                                    <button
                                      onClick={async () => {
                                        try {
                                          await api.delete(`/admin/users/${farmer.id}`);
                                          fetchData();
                                          fetchDashboardStats();
                                        } catch (err) {
                                          console.error('Failed to delete farmer:', err);
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {view === "pending-farmers" && (
              <div className="animate-in fade-in duration-300">
                {renderList(filteredPendingFarmers, "pending-farmer")}
              </div>
            )}

            {view === "pending-products" && (
              <div className="animate-in fade-in duration-300">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-slate-900">Pending Products</h2>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                  {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading...</div>
                  ) : error ? (
                    <div className="p-8 text-center text-red-500">{error}</div>
                  ) : pendingProducts.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No pending products</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
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
                          {pendingProducts
                            .filter(p =>
                              p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              p.category?.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((product) => (
                              <tr key={product.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    {product.image && (
                                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                                    )}
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
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                                    {product.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={async () => {
                                        try {
                                          await api.put(`/admin/products/${product.id}/approve`);
                                          fetchData();
                                          fetchDashboardStats();
                                        } catch (err) {
                                          console.error('Failed to approve product:', err);
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={async () => {
                                        try {
                                          await api.put(`/admin/products/${product.id}/reject`);
                                          fetchData();
                                          fetchDashboardStats();
                                        } catch (err) {
                                          console.error('Failed to reject product:', err);
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {view === "all-products" && (
              <div className="animate-in fade-in duration-300">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-slate-900">All Products</h2>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                  {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading...</div>
                  ) : error ? (
                    <div className="p-8 text-center text-red-500">{error}</div>
                  ) : allProducts.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No products found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
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
                          {allProducts
                            .filter(p =>
                              p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              p.category?.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((product) => (
                              <tr key={product.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    {product.image && (
                                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                                    )}
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
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    product.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                    product.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {product.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    {product.status === 'pending' && (
                                      <>
                                        <button
                                          onClick={async () => {
                                            try {
                                              await api.put(`/admin/products/${product.id}/approve`);
                                              fetchData();
                                              fetchDashboardStats();
                                            } catch (err) {
                                              console.error('Failed to approve product:', err);
                                            }
                                          }}
                                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors"
                                        >
                                          Approve
                                        </button>
                                        <button
                                          onClick={async () => {
                                            try {
                                              await api.put(`/admin/products/${product.id}/reject`);
                                              fetchData();
                                              fetchDashboardStats();
                                            } catch (err) {
                                              console.error('Failed to reject product:', err);
                                            }
                                          }}
                                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
                                        >
                                          Reject
                                        </button>
                                      </>
                                    )}
                                    <button
                                      onClick={async () => {
                                        try {
                                          await api.delete(`/admin/products/${product.id}`);
                                          fetchData();
                                          fetchDashboardStats();
                                        } catch (err) {
                                          console.error('Failed to delete product:', err);
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-slate-500 hover:bg-slate-600 text-white text-xs font-medium rounded-lg transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {view === "profile" && (
              <div className="animate-in fade-in duration-300">
                 <AdminProfile />
              </div>
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminDashboard;
