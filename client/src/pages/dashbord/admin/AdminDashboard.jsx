import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import AdminHeader from './header/AdminHeader';
import AdminProfile from './profile';
import api from '../../../api.js';
import './AdminDashboard.scss';

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
  DollarSign
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const [view, setView] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalProducts: 0,
    pendingProducts: 0
  });

  /* =========================
     Initial data fetch
  ========================== */
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [usersRes, farmersRes, projectsRes] = await Promise.all([
          api.get('/users'),
          api.get('/users?role=farmer'),
          api.get('/projects')
        ]);

        const allUsers = usersRes.data;
        const allFarmers = farmersRes.data;
        const allProjects = projectsRes.data || [];

        // Calculate today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate stats
        const newUsersToday = allUsers.filter(u => {
          const userDate = new Date(u.createdAt);
          userDate.setHours(0, 0, 0, 0);
          return userDate.getTime() === today.getTime();
        }).length;

        setStats({
          totalUsers: allUsers.length,
          totalFarmers: allFarmers.length,
          activeUsers: allUsers.filter(u => u.isActive !== false).length,
          newUsersToday,
          totalProducts: allProjects.length,
          pendingProducts: allProjects.filter(p => p.status === 'pending').length
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
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
        if (view === 'users') {
          const res = await api.get('/users?role=customer');
          setUsers(res.data);
        }

        if (view === 'farmers') {
          const res = await api.get('/users?role=farmer');
          setFarmers(res.data);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    if (view !== 'dashboard') {
      fetchData();
    }
  }, [view]);

  /* =========================
     Filter data based on search term
  ========================== */
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
    );
  }, [users, searchTerm]);

  const filteredFarmers = useMemo(() => {
    return farmers.filter(farmer =>
      farmer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.farmName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [farmers, searchTerm]);

  /* =========================
     Delete handler
  ========================== */
  const handleDelete = async (id, type) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${type}? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/users/${id}`);
      if (type === 'user') {
        setUsers(prev => prev.filter(u => u._id !== id));
        setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      } else {
        setFarmers(prev => prev.filter(f => f._id !== id));
        setStats(prev => ({ ...prev, totalFarmers: prev.totalFarmers - 1 }));
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
      
      if (type === 'user') {
        setUsers(prev => prev.map(u =>
          u._id === id ? { ...u, isActive: !currentStatus } : u
        ));
      } else {
        setFarmers(prev => prev.map(f =>
          f._id === id ? { ...f, isActive: !currentStatus } : f
        ));
      }
    } catch {
      alert('Failed to update user status.');
    }
  };

  /* =========================
     Export data to CSV
  ========================== */
  const exportToCSV = (data, filename) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]).filter(key => key !== '_id' && key !== '__v');
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => 
        `"${row[header] || ''}"`
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  /* =========================
     Reusable list renderer
  ========================== */
  const renderList = (data, type) => {
    if (loading) return (
      <div className="loading-state">
        <RefreshCw className="loading-icon" />
        <p>Loading...</p>
      </div>
    );
    
    if (error) return (
      <div className="error-state">
        <AlertCircle className="error-icon" />
        <p className="error-text">{error}</p>
      </div>
    );
    
    if (data.length === 0) return (
      <div className="empty-state">
        <Users className="empty-icon" />
        <p>No {type}s found.</p>
      </div>
    );

    return (
      <div className="list-container">
        <div className="list-header">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder={`Search ${type}s...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="clear-search"
              >
                Clear
              </button>
            )}
          </div>
          <button
            onClick={() => exportToCSV(data, type)}
            className="export-btn"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <ul className="entity-list">
          {data.map(item => (
            <li key={item._id} className="entity-item">
              <div className="entity-avatar">
                {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="entity-info">
                <div className="entity-main">
                  <span className="entity-name">{item.name || 'Unnamed User'}</span>
                  <span className="entity-email">{item.email}</span>
                </div>
                <div className="entity-meta">
                  {item.phone && <span className="entity-phone">{item.phone}</span>}
                  {item.farmName && <span className="entity-farm">{item.farmName}</span>}
                  <span className="entity-date">
                    Joined: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="entity-actions">
                <span className={`status-badge ${item.isActive === false ? 'inactive' : 'active'}`}>
                  {item.isActive === false ? 'Inactive' : 'Active'}
                </span>
                <button
                  onClick={() => toggleUserStatus(item._id, type, item.isActive)}
                  className={`status-btn ${item.isActive === false ? 'activate' : 'deactivate'}`}
                  title={item.isActive === false ? 'Activate User' : 'Deactivate User'}
                >
                  {item.isActive === false ? <CheckCircle size={16} /> : <XCircle size={16} />}
                </button>
                <button
                  onClick={() => handleDelete(item._id, type)}
                  className="delete-btn"
                  title="Delete User"
                >
                  <XCircle size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="list-footer">
          <span className="list-count">
            Showing {data.length} of {type === 'user' ? users.length : farmers.length} {type}s
          </span>
        </div>
      </div>
    );
  };

  /* =========================
     Dashboard Stats Cards
  ========================== */
  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: `${color}20` }}>
        <Icon size={24} color={color} />
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
        {change && (
          <span className={`stat-change ${change > 0 ? 'positive' : 'negative'}`}>
            {change > 0 ? '+' : ''}{change}%
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
      { id: 1, user: 'John Doe', action: 'registered', time: '2 minutes ago', type: 'user' },
      { id: 2, user: 'Farm Fresh', action: 'added new product', time: '15 minutes ago', type: 'farmer' },
      { id: 3, user: 'Sarah Miller', action: 'placed an order', time: '1 hour ago', type: 'user' },
      { id: 4, user: 'Green Valley Farms', action: 'updated profile', time: '2 hours ago', type: 'farmer' },
    ];

    return (
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <ul className="activity-list">
          {activities.map(activity => (
            <li key={activity.id} className="activity-item">
              <div className={`activity-icon ${activity.type}`}>
                {activity.type === 'user' ? <Users size={16} /> : <UserCog size={16} />}
              </div>
              <div className="activity-content">
                <p>
                  <strong>{activity.user}</strong> {activity.action}
                </p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      <AdminHeader
        userCount={stats.totalUsers}
        farmerCount={stats.totalFarmers}
        productCount={stats.totalProducts}
        onNav={setView}
        activeTab={view}
        onLogout={logout}
      />

      <main className="admin-dashboard">
        <header className="dashboard-header">
          <div className="header-content">
            <div>
              <h1>Admin Dashboard</h1>
              <p className="welcome-text">
                Welcome back, <strong>{user?.name}</strong>
              </p>
            </div>
            
            <div className="header-actions">
              <button className="refresh-btn" onClick={() => window.location.reload()}>
                <RefreshCw size={18} />
                Refresh
              </button>
              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="dashboard-content">
          {view === 'dashboard' && (
            <div className="dashboard-home">
              <div className="dashboard-stats">
                <h2>Platform Overview</h2>
                
                <div className="stats-grid">
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

              <div className="dashboard-main">
                <div className="dashboard-section">
                  <h3>Quick Actions</h3>
                  <div className="quick-actions">
                    <button className="quick-action-btn">
                      <Shield size={20} />
                      <span>Manage Roles</span>
                    </button>
                    <button className="quick-action-btn">
                      <BarChart3 size={20} />
                      <span>View Reports</span>
                    </button>
                    <button className="quick-action-btn">
                      <DollarSign size={20} />
                      <span>Transaction Logs</span>
                    </button>
                  </div>
                </div>

                <div className="dashboard-section">
                  <RecentActivity />
                </div>
              </div>
            </div>
          )}

          {view === 'users' && (
            <div className="list-view">
              <h2>
                <Users size={24} />
                User Management
              </h2>
              {renderList(filteredUsers, 'user')}
            </div>
          )}

          {view === 'farmers' && (
            <div className="list-view">
              <h2>
                <UserCog size={24} />
                Farmer Management
              </h2>
              {renderList(filteredFarmers, 'farmer')}
            </div>
          )}
          {view === 'profile' && (
            <AdminProfile />
          )}
        </section>
      </main>
    </>
  );
};

export default AdminDashboard;