import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import AdminSidebar from "./AdminSidebar";
import AdminProfile from "./profile";
import api from "../../../api.js";
import { Button } from "../../../components/ui/button";
import { SidebarProvider, SidebarInset } from "../../../components/ui/sidebar";

// Import Lucide React icons for better UI
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
  Filter,
  Search,
  MoreVertical,
  Edit,
  Eye,
  Calendar,
  DollarSign,
} from "lucide-react";

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const [view, setView] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalProducts: 0,
    pendingProducts: 0,
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  /* =========================
     Initial data fetch
  ========================== */
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [usersRes, farmersRes, projectsRes] = await Promise.all([
          api.get("/users"),
          api.get("/users?role=farmer"),
          api.get("/projects"),
        ]);

        const allUsers = usersRes.data;
        const allFarmers = farmersRes.data;
        const allProjects = projectsRes.data || [];

        // Calculate today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate stats
        const newUsersToday = allUsers.filter((u) => {
          const userDate = new Date(u.createdAt);
          userDate.setHours(0, 0, 0, 0);
          return userDate.getTime() === today.getTime();
        }).length;

        setStats({
          totalUsers: allUsers.length,
          totalFarmers: allFarmers.length,
          activeUsers: allUsers.filter((u) => u.isActive !== false).length,
          newUsersToday,
          totalProducts: allProjects.length,
          pendingProducts: allProjects.filter((p) => p.status === "pending")
            .length,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      }
    };

    fetchDashboardStats();
  }, []);

  /* =========================
     Fetch data by view
  ========================== */
  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      setLoading(true);

      try {
        if (view === "users") {
          const res = await api.get("/users?role=customer");
          setUsers(res.data);
        }

        if (view === "farmers") {
          const res = await api.get("/users?role=farmer");
          setFarmers(res.data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    if (view !== "dashboard") {
      fetchData();
    }
  }, [view]);

  /* =========================
     Filter data based on search term
  ========================== */
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

  /* =========================
     Delete handler
  ========================== */
  const handleDelete = async (id, type) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${type}? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await api.delete(`/users/${id}`);
      if (type === "user") {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      } else {
        setFarmers((prev) => prev.filter((f) => f._id !== id));
        setStats((prev) => ({ ...prev, totalFarmers: prev.totalFarmers - 1 }));
      }
    } catch {
      alert(`Failed to delete ${type}.`);
    }
  };

  /* =========================
     Toggle user active status
  ========================== */
  const toggleUserStatus = async (id, type, currentStatus) => {
    try {
      await api.patch(`/users/${id}`, { isActive: !currentStatus });

      if (type === "user") {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === id ? { ...u, isActive: !currentStatus } : u,
          ),
        );
      } else {
        setFarmers((prev) =>
          prev.map((f) =>
            f._id === id ? { ...f, isActive: !currentStatus } : f,
          ),
        );
      }
    } catch {
      alert("Failed to update user status.");
    }
  };

  /* =========================
     Export data to CSV
  ========================== */
  const exportToCSV = (data, filename) => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = Object.keys(data[0]).filter(
      (key) => key !== "_id" && key !== "__v",
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

  /* =========================
     Reusable list renderer
  ========================== */
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
          <Users className="w-8 h-8 text-slate-400 mb-4" />
          <p className="text-slate-500">No {type}s found.</p>
        </div>
      );

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center flex-1 max-w-[400px] min-w-[250px] bg-slate-50 border border-slate-200 rounded-[10px] px-4 py-2">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input
              type="text"
              placeholder={`Search ${type}s...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-red-500 text-xs font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <Button
            onClick={() => exportToCSV(data, type)}
            variant="outline"
            className="bg-emerald-50 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white"
          >
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>

        <ul className="list-none p-0 m-0 border border-slate-200 rounded-[14px] overflow-hidden">
          {data.map((item) => (
            <li
              key={item._id}
              className="flex items-center p-5 border-b border-slate-100 bg-white transition-all hover:bg-slate-50 gap-5 last:border-b-0"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                {item.name ? item.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <span className="font-bold text-lg text-slate-900 mr-3">
                    {item.name || "Unnamed User"}
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
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${item.isActive === false ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"}`}
                >
                  {item.isActive === false ? "Inactive" : "Active"}
                </span>
                <button
                  onClick={() =>
                    toggleUserStatus(item._id, type, item.isActive)
                  }
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold border transition-all ${item.isActive === false ? "text-emerald-500 border-emerald-500 hover:bg-emerald-500 hover:text-white" : "text-amber-500 border-amber-500 hover:bg-amber-500 hover:text-white"}`}
                  title={
                    item.isActive === false
                      ? "Activate User"
                      : "Deactivate User"
                  }
                >
                  {item.isActive === false ? (
                    <CheckCircle size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(item._id, type)}
                  className="px-3 py-1.5 rounded-[10px] text-xs font-semibold border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  title="Delete User"
                >
                  <XCircle size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex justify-end mt-4 pt-3 border-t border-slate-200">
          <span className="text-sm text-slate-500">
            Showing {data.length} of{" "}
            {type === "user" ? users.length : farmers.length} {type}s
          </span>
        </div>
      </div>
    );
  };

  /* =========================
     Dashboard Stats Cards
  ========================== */
  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white border border-slate-200 rounded-[14px] p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-indigo-500 flex items-center gap-5">
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={24} color={color} />
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-slate-900 mb-1">{value}</h3>
        <p className="text-sm text-slate-500 mb-2">{title}</p>
        {change && (
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${change > 0 ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"}`}
          >
            {change > 0 ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
    </div>
  );

  /* =========================
     Recent Activity
  ========================== */
  const RecentActivity = () => {
    const activities = [
      {
        id: 1,
        user: "John Doe",
        action: "registered",
        time: "2 minutes ago",
        type: "user",
      },
      {
        id: 2,
        user: "Farm Fresh",
        action: "added new product",
        time: "15 minutes ago",
        type: "farmer",
      },
      {
        id: 3,
        user: "Sarah Miller",
        action: "placed an order",
        time: "1 hour ago",
        type: "user",
      },
      {
        id: 4,
        user: "Green Valley Farms",
        action: "updated profile",
        time: "2 hours ago",
        type: "farmer",
      },
    ];

    return (
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-5">
          Recent Activity
        </h3>
        <ul className="list-none p-0 m-0">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="flex items-start gap-4 p-4 border-b border-slate-100 transition-all hover:bg-slate-50 rounded-[10px] last:border-b-0"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center ${activity.type === "user" ? "bg-indigo-50 text-indigo-500" : "bg-emerald-50 text-emerald-500"}`}
              >
                {activity.type === "user" ? (
                  <Users size={16} />
                ) : (
                  <UserCog size={16} />
                )}
              </div>
              <div className="flex-1">
                <p className="text-slate-900 mb-1">
                  <strong>{activity.user}</strong> {activity.action}
                </p>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <SidebarProvider className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <AdminSidebar 
        onLogout={logout} 
        activeTab={view} 
        onNav={setView} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
      <SidebarInset className="flex-1 h-full overflow-y-auto p-6 md:pl-[calc(var(--sidebar-width)+1.5rem)]">
        <header className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-extrabold mb-1">Admin Dashboard</h1>
              <p className="text-sm text-slate-500">
                Welcome back, <strong>{user?.name}</strong>
              </p>
            </div>
            <div className="flex gap-3">
            </div>
          </div>
        </header>

        <section className="bg-white dark:bg-slate-900 rounded-[14px] p-7 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-200 dark:border-slate-800">
          {view === "dashboard" && (
            <div>
              <div className="mb-10">
                <h2 className="text-2xl font-bold mb-6">Platform Overview</h2>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 mb-8">
                  <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="#6366f1"
                    change={12}
                  />
                  <StatCard
                    title="Total Farmers"
                    value={stats.totalFarmers}
                    icon={UserCog}
                    color="#10b981"
                    change={8}
                  />
                  <StatCard
                    title="Active Users"
                    value={stats.activeUsers}
                    icon={TrendingUp}
                    color="#f59e0b"
                    change={5}
                  />
                  <StatCard
                    title="New Today"
                    value={stats.newUsersToday}
                    icon={Calendar}
                    color="#8b5cf6"
                  />
                  <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon={Package}
                    color="#ec4899"
                    change={15}
                  />
                  <StatCard
                    title="Pending Approval"
                    value={stats.pendingProducts}
                    icon={AlertCircle}
                    color="#ef4444"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 lg:grid-cols-1">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-5">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
                    <Button
                      variant="outline"
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px] p-5 flex flex-col items-center gap-3 hover:bg-indigo-50 hover:border-indigo-500 hover:-translate-y-0.5 hover:shadow-lg transition-all"
                    >
                      <Shield size={20} className="text-indigo-500" />
                      <span className="font-semibold text-sm">Manage Roles</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px] p-5 flex flex-col items-center gap-3 hover:bg-indigo-50 hover:border-indigo-500 hover:-translate-y-0.5 hover:shadow-lg transition-all"
                    >
                      <BarChart3 size={20} className="text-indigo-500" />
                      <span className="font-semibold text-sm">View Reports</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px] p-5 flex flex-col items-center gap-3 hover:bg-indigo-50 hover:border-indigo-500 hover:-translate-y-0.5 hover:shadow-lg transition-all"
                    >
                      <DollarSign size={20} className="text-indigo-500" />
                      <span className="font-semibold text-sm">Transaction Logs</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <RecentActivity />
                </div>
              </div>
            </div>
          )}

          {view === "users" && (
            <div>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white mb-6">
                <Users size={24} className="text-indigo-500" />
                User Management
              </h2>
              {renderList(filteredUsers, "user")}
            </div>
          )}

          {view === "farmers" && (
            <div>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white mb-6">
                <UserCog size={24} className="text-indigo-500" />
                Farmer Management
              </h2>
              {renderList(filteredFarmers, "farmer")}
            </div>
          )}

          {view === "profile" && <AdminProfile />}
        </section>
      </SidebarInset>
  </SidebarProvider>
);

};

export default AdminDashboard;
