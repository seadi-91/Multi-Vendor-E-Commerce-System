import React, { useState, useEffect } from 'react';
import CustomerHeader from '../dashbord/customer/header/Header';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCreditCard,
  FiCalendar,
  FiFilter,
  FiRefreshCw
} from 'react-icons/fi';
import { MdRestaurant, MdLocalOffer } from 'react-icons/md';
import './Orders.scss';

const Orders = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const statusColors = {
    pending: '#f59e0b',
    processing: '#3b82f6',
    delivered: '#10b981',
    cancelled: '#ef4444',
    'on the way': '#8b5cf6'
  };

  const statusIcons = {
    pending: <FiClock />,
    processing: <FiPackage />,
    delivered: <FiCheckCircle />,
    cancelled: <FiClock />,
    'on the way': <FiTruck />
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      const serverOrders = response.data || [];
      const normalizedOrders = serverOrders.map(order => {
        const orderDate = new Date(order.createdAt || order.updatedAt || Date.now());
        return {
          ...order,
          orderNumber: order.orderCode || `ORD-${String(order.id).padStart(5, '0')}`,
          date: orderDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          timestamp: orderDate.toISOString(),
          status: order.status || 'processing',
          paymentStatus: order.paymentStatus || (order.paymentMethod === 'cash' ? 'unpaid' : 'paid'),
          items: order.items || [],
          vendor: order.vendor || 'Fresh Farm',
          fullName: order.fullName || user?.name || 'Customer'
        };
      });
      setOrders(normalizedOrders);
      localStorage.setItem('orders', JSON.stringify(normalizedOrders));
    } catch (error) {
      console.warn('Unable to load orders from server, falling back to localStorage', error);
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        const mockOrders = generateMockOrders();
        setOrders(mockOrders);
        localStorage.setItem('orders', JSON.stringify(mockOrders));
      }
    } finally {
      setLoading(false);
    }
  };

  const generateMockOrders = () => {
    return [
      {
        id: `ORD-${Date.now().toString().slice(-8)}`,
        orderNumber: '#00123',
        date: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        timestamp: new Date().toISOString(),
        status: 'processing',
        items: [
          { name: 'Margherita Pizza', quantity: 2, price: 280, image: '🍕' },
          { name: 'Caesar Salad', quantity: 1, price: 180, image: '🥗' },
          { name: 'Chocolate Brownie', quantity: 3, price: 120, image: '🍫' }
        ],
        total: 980,
        subtotal: 860,
        deliveryFee: 50,
        tax: 129,
        fullName: 'John Doe',
        phone: '+251 91 234 5678',
        email: user?.email || 'john@example.com',
        city: 'Addis Ababa',
        address: 'Bole',
        additionalInfo: 'Bole Medhanialem, Street 123, House #45',
        paymentMethod: 'cash',
        estimatedDelivery: '30-45 minutes',
        restaurant: 'Pizza Palace',
        specialInstructions: 'Please add extra cheese'
      },
      {
        id: `ORD-${Date.now().toString().slice(-7)}`,
        orderNumber: '#00122',
        date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'on the way',
        items: [
          { name: 'Spaghetti Carbonara', quantity: 1, price: 220, image: '🍝' },
          { name: 'Garlic Bread', quantity: 2, price: 80, image: '🍞' }
        ],
        total: 460,
        subtotal: 380,
        deliveryFee: 50,
        tax: 57,
        fullName: 'John Doe',
        phone: '+251 91 234 5678',
        email: user?.email || 'john@example.com',
        city: 'Addis Ababa',
        address: 'Kirkos',
        additionalInfo: 'Near Stadium, Building #12',
        paymentMethod: 'mobile',
        estimatedDelivery: '20-30 minutes',
        restaurant: 'Italian Bistro',
        specialInstructions: 'Less spicy please'
      },
      {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        orderNumber: '#00121',
        date: new Date(Date.now() - 172800000).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        status: 'cancelled',
        items: [
          { name: 'Burger Supreme', quantity: 1, price: 190, image: '🍔' },
          { name: 'French Fries', quantity: 1, price: 90, image: '🍟' },
          { name: 'Coca Cola', quantity: 2, price: 60, image: '🥤' }
        ],
        total: 460,
        subtotal: 400,
        deliveryFee: 0,
        tax: 60,
        fullName: 'John Doe',
        phone: '+251 91 234 5678',
        email: user?.email || 'john@example.com',
        city: 'Addis Ababa',
        address: 'Megenagna',
        additionalInfo: 'Mega Building, 3rd floor',
        paymentMethod: 'card',
        estimatedDelivery: '25-35 minutes',
        restaurant: 'Burger King',
        specialInstructions: 'No onions'
      }
    ];
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status.toLowerCase() === filter.toLowerCase());

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'processing': return 'status-processing';
      case 'on the way': return 'status-ontheway';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  const formatPrice = (price) => {
    return price.toFixed(2);
  };

  const reorderItem = (order) => {
    // Implement reorder functionality
    console.log('Reordering:', order);
    alert(`Adding items from order ${order.orderNumber} to cart!`);
  };

  return (
    <>
      <CustomerHeader user={user} onLogout={logout} />
      <div className="orders-page" style={{ background: '#fff', minHeight: '100vh', padding: '1rem 0' }}>
        <div className="orders-container" style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(16,185,129,0.07)', padding: '1.5rem 1rem' }}>
          <div className="orders-header">
            <div className="header-content">
              <h1 className="page-title">
                <FiPackage /> My Orders
              </h1>
              <p className="page-subtitle">Track and manage your food orders</p>
            </div>

            <div className="header-actions">
              <button className="refresh-btn" onClick={fetchOrders}>
                <FiRefreshCw /> Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading your orders...</p>
            </div>
          ) : (
            <>
              <div className="orders-filters">
                <div className="filter-tabs">
                  <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    All Orders ({orders.length})
                  </button>
                  <button
                    className={`filter-tab ${filter === 'delivered' ? 'active' : ''}`}
                    onClick={() => setFilter('delivered')}
                  >
                    <FiCheckCircle /> Delivered
                  </button>
                  <button
                    className={`filter-tab ${filter === 'on the way' ? 'active' : ''}`}
                    onClick={() => setFilter('on the way')}
                  >
                    <FiTruck /> On the Way
                  </button>
                  <button
                    className={`filter-tab ${filter === 'processing' ? 'active' : ''}`}
                    onClick={() => setFilter('processing')}
                  >
                    <FiPackage /> Processing
                  </button>
                </div>

                <div className="filter-select">
                  <FiFilter />
                  <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="on the way">On the Way</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="empty-state">
                  <FiPackage className="empty-icon" />
                  <h2>No orders found</h2>
                  <p>You haven't placed any orders {filter !== 'all' ? `with status "${filter}"` : 'yet'}</p>
                  <button className="primary-btn" onClick={() => window.location.href = '/customer/dashboard'}>
                    Browse Menu
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {filteredOrders.map(order => (
                    <div className={`order-card ${expandedOrder === order.id ? 'expanded' : ''}`} key={order.id}>
                      <div className="order-summary" onClick={() => toggleOrderExpansion(order.id)}>
                        <div className="order-header">
                          <div className="order-info">
                            <div className="order-number-date">
                              <h3 className="order-number">{order.orderNumber}</h3>
                              <div className="order-date">
                                <FiCalendar />
                                <span>{order.date}</span>
                              </div>
                            </div>
                            <div className="order-restaurant">
                              <MdRestaurant />
                              <span>{order.restaurant}</span>
                            </div>
                          </div>

                          <div className="order-status-section">
                            <div className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                              {statusIcons[order.status.toLowerCase()] || <FiClock />}
                              <span>{order.status}</span>
                            </div>
                            <div className="order-total-amount">
                              <span className="total-label">Total:</span>
                              <span className="total-amount">{formatPrice(order.total)} ETB</span>
                            </div>
                          </div>
                        </div>

                        <div className="order-preview">
                          <div className="order-items-preview">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <div className="preview-item" key={idx}>
                                {typeof item.image === 'string' && item.image.startsWith('http') ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="item-img-thumb order-img-success"
                                    style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', marginRight: 10, border: '2.5px solid #10b981', boxShadow: '0 0 0 3px #d1fae5' }}
                                  />
                                ) : (
                                  <span className="item-emoji">{item.image || '🛒'}</span>
                                )}
                                <span className="item-name">{item.name}</span>
                                <span className="item-quantity">x{item.quantity}</span>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="more-items">+{order.items.length - 2} more items</div>
                            )}
                          </div>
                          <div className="expand-indicator">
                            {expandedOrder === order.id ? '▲' : '▼'}
                          </div>
                        </div>
                      </div>

                      {expandedOrder === order.id && (
                        <div className="order-details-expanded">
                          <div className="details-grid">
                            <div className="details-section">
                              <h4 className="section-title">
                                <FiPackage /> Order Details
                              </h4>
                              <div className="order-items-full">
                                {order.items.map((item, idx) => (
                                  <div className="order-item-full" key={idx}>
                                    <div className="item-left">
                                      {typeof item.image === 'string' && item.image.startsWith('http') ? (
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          className="item-img-large order-img-success"
                                          style={{ width: 100, height: 100, borderRadius: 14, objectFit: 'cover', marginRight: 16, border: '3px solid #10b981', boxShadow: '0 0 0 4px #d1fae5' }}
                                        />
                                      ) : (
                                        <span className="item-emoji-large">{item.image || '🛒'}</span>
                                      )}
                                      <div>
                                        <h5>{item.name}</h5>
                                        <p className="item-price">{item.price} ETB each</p>
                                      </div>
                                    </div>
                                    <div className="item-right">
                                      <div className="quantity-display">x{item.quantity}</div>
                                      <div className="item-total">{formatPrice(item.price * item.quantity)} ETB</div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="order-breakdown">
                                <div className="breakdown-row">
                                  <span>Subtotal</span>
                                  <span>{formatPrice(order.subtotal)} ETB</span>
                                </div>
                                <div className="breakdown-row">
                                  <span>Delivery Fee</span>
                                  <span className={order.deliveryFee === 0 ? 'free' : ''}>
                                    {order.deliveryFee === 0 ? 'FREE' : `${formatPrice(order.deliveryFee)} ETB`}
                                  </span>
                                </div>
                                <div className="breakdown-row">
                                  <span>Tax (15%)</span>
                                  <span>{formatPrice(order.tax)} ETB</span>
                                </div>
                                <div className="breakdown-row total">
                                  <span>Total</span>
                                  <span className="grand-total">{formatPrice(order.total)} ETB</span>
                                </div>
                              </div>
                            </div>

                            <div className="details-section">
                              <h4 className="section-title">
                                <FiMapPin /> Delivery Information
                              </h4>
                              <div className="delivery-details">
                                <div className="info-row">
                                  <FiMapPin />
                                  <div>
                                    <strong>Address:</strong>
                                    <p>{order.additionalInfo}</p>
                                    <p>{order.address}, {order.city}</p>
                                  </div>
                                </div>
                                <div className="info-row">
                                  <FiPhone />
                                  <div>
                                    <strong>Phone:</strong>
                                    <p>{order.phone}</p>
                                  </div>
                                </div>
                                <div className="info-row">
                                  <FiMail />
                                  <div>
                                    <strong>Email:</strong>
                                    <p>{order.email}</p>
                                  </div>
                                </div>
                                <div className="info-row">
                                  <FiCreditCard />
                                  <div>
                                    <strong>Payment Method:</strong>
                                    <p className={`payment-method ${order.paymentMethod}`} style={{ color: '#2563eb', fontWeight: 600 }}>
                                      {order.paymentMethod === 'cash' ? 'Cash on Delivery' :
                                        order.paymentMethod === 'card' ? 'Credit/Debit Card' :
                                          'Mobile Payment'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {order.specialInstructions && (
                                <div className="special-instructions">
                                  <h5>Special Instructions</h5>
                                  <p>{order.specialInstructions}</p>
                                </div>
                              )}

                              <div className="delivery-estimate">
                                <FiClock />
                                <div>
                                  <h5>Estimated Delivery Time</h5>
                                  <p>{order.estimatedDelivery}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="order-actions">
                            <button className="action-btn reorder-btn" onClick={() => reorderItem(order)}>
                              <MdLocalOffer /> Reorder
                            </button>
                            <button className="action-btn help-btn">
                              Get Help
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="orders-stats">
                <div className="stat-card">
                  <h4>Total Orders</h4>
                  <p className="stat-number">{orders.length}</p>
                </div>
                <div className="stat-card">
                  <h4>Total Spent</h4>
                  <p className="stat-number">
                    {formatPrice(orders.reduce((sum, order) => sum + order.total, 0))} ETB
                  </p>
                </div>
                <div className="stat-card">
                  <h4>Avg. Order Value</h4>
                  <p className="stat-number">
                    {orders.length > 0 ? formatPrice(orders.reduce((sum, order) => sum + order.total, 0) / orders.length) : 0} ETB
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Orders;