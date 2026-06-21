import React, { useEffect, useState } from 'react';
import api from '../../../../api';
import AddProduct from '../product/AddProduct';

const getFarmOrders = () => {
  // Get all orders from localStorage
  const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  // Filter orders that include this farmer's products (for demo, show all)
  return allOrders;
};

const FarmerHome = () => {
  const [productCount, setProductCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/farmer/products'); // Adjust endpoint as needed
      setProductCount(res.data?.length || 0);
    } catch (err) {
      setError('Could not load product information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  const handleShowOrders = () => {
    setOrders(getFarmOrders());
    setShowOrders(true);
  };

  // Update order status and persist to localStorage
  const handleStatusChange = (orderIdx, newStatus) => {
    const updatedOrders = [...orders];
    updatedOrders[orderIdx] = { ...updatedOrders[orderIdx], status: newStatus };
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };
  const handleCloseOrders = () => setShowOrders(false);

  return (
    <section className="farmer-home">
      <h2>Your Farm Overview</h2>
      {/* Overview cards removed as requested */}
      <button style={{margin:'1rem 0',padding:'0.7rem 1.5rem',background:'#388e3c',color:'#fff',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}} onClick={handleShowOrders}>
        New Orders
      </button>
      {showOrders && (
        <div style={{background:'#f9fafb',border:'1px solid #e5e7eb',borderRadius:16,padding:32,marginTop:24,maxWidth:700,boxShadow:'0 2px 16px rgba(0,0,0,0.07)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
            <h3 style={{margin:0,fontSize:'1.5rem',color:'#166534',fontWeight:700}}>Farm Orders</h3>
            <button style={{background:'none',border:'none',fontSize:28,cursor:'pointer',color:'#888'}} onClick={handleCloseOrders}>×</button>
          </div>
          {orders.length === 0 ? (
            <div style={{textAlign:'center',color:'#888',fontSize:'1.1rem',margin:'2rem 0'}}>No orders found.</div>
          ) : (
            <div className="orders-list">
              {orders.map((order, idx) => (
                <div key={idx} style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:'1.5rem',marginBottom:'1.5rem',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <span style={{fontWeight:600,color:'#166534'}}>Order #{order.orderId || idx+1}</span>
                    <span style={{color:'#64748b',fontSize:'0.95rem'}}>{order.orderDate?.slice(0,10)}</span>
                  </div>
                  <div style={{marginBottom:8}}><b>Customer:</b> {order.fullName} <span style={{color:'#888'}}>({order.phone})</span></div>
                  <div style={{marginBottom:8}}><b>Address:</b> {order.city}, {order.address} {order.additionalInfo && (<span>, {order.additionalInfo}</span>)}</div>
                  <div style={{marginBottom:8}}><b>Payment:</b> <span style={{color:'#0d9488'}}>{order.paymentMethod}</span></div>
                  <div style={{marginBottom:8,display:'flex',alignItems:'center',gap:12}}>
                    <b>Status:</b>
                    <select value={order.status || 'processing'} onChange={e => handleStatusChange(idx, e.target.value)} style={{padding:'4px 10px',borderRadius:6,border:'1px solid #b5e0c7',background:'#e8f5e9',color:'#166534',fontWeight:600}}>
                      <option value="processing">Processing</option>
                      <option value="on the way">On the Way</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div style={{marginBottom:8}}><b>Products:</b></div>
                  <table style={{width:'100%',borderCollapse:'collapse',marginBottom:8}}>
                    <thead>
                      <tr style={{background:'#f1f5f9'}}>
                        <th style={{textAlign:'left',padding:'6px 8px',fontWeight:600,color:'#166534',fontSize:'1rem'}}>Product</th>
                        <th style={{textAlign:'center',padding:'6px 8px',fontWeight:600,color:'#166534',fontSize:'1rem'}}>Qty</th>
                        <th style={{textAlign:'center',padding:'6px 8px',fontWeight:600,color:'#166534',fontSize:'1rem'}}>Price</th>
                        <th style={{textAlign:'center',padding:'6px 8px',fontWeight:600,color:'#166534',fontSize:'1rem'}}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, i) => (
                        <tr key={i} style={{borderBottom:'1px solid #f1f5f9'}}>
                          <td style={{padding:'6px 8px'}}>{item.name}</td>
                          <td style={{textAlign:'center',padding:'6px 8px'}}>{item.quantity}</td>
                          <td style={{textAlign:'center',padding:'6px 8px'}}>{item.price} ETB</td>
                          <td style={{textAlign:'center',padding:'6px 8px'}}>{(item.price * item.quantity).toFixed(2)} ETB</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{textAlign:'right',fontWeight:700,color:'#166534',fontSize:'1.1rem'}}>Order Total: {order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)} ETB</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <p>Manage your products, view orders, and update your farm information here.</p>
    </section>
  );
};

export default FarmerHome;
