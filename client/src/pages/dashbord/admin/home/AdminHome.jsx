// import React, { useState, useEffect } from 'react';
// import AdminDashboard from '../AdminDashboard';
// import api from '../../../../api.js';
// import './AdminHome.scss';

// const AdminHome = () => {
//   const [view, setView] = useState('users');
//   const [users, setUsers] = useState([]);
//   const [farmers, setFarmers] = useState([]);

//   useEffect(() => {
//     if (view === 'users') {
//       // Fetch real users (role: customer)
//       api.get('/users?role=customer')
//         .then(res => setUsers(res.data))
//         .catch(err => console.error('Error fetching users:', err));
//     } else if (view === 'farmers') {
//       // Fetch real farmers (role: farmer)
//       api.get('/users?role=farmer')
//         .then(res => setFarmers(res.data))
//         .catch(err => console.error('Error fetching farmers:', err));
//     }
//   }, [view]);

//   const handleDelete = (id, type) => {
//     if (type === 'user') setUsers(users.filter(u => u._id !== id));
//     else setFarmers(farmers.filter(f => f._id !== id));
//   };

//   return (
//     <div className="admin-home">
//       {/* Remove AdminHeader from AdminHome if you do not want it displayed */}
//       {/* <AdminHeader 
//         userCount={users.length} 
//         farmerCount={farmers.length} 
//         onNav={setView} 
//         activeTab={view}
//       /> */}
//       <AdminDashboard />
//       <div className="admin-content">
//         {view === 'users' ? (
//           <div className="admin-list">
//             <h2>Users</h2>
//             {users.length === 0 ? <p>No users found.</p> : (
//               <ul>
//                 {users.map(user => (
//                   <li key={user._id} className="admin-list-item" style={{background: 'black', color: 'white'}}>
//                     <span>{user.name}</span>
//                     <span className="role-badge">{user.role}</span>
//                     <button className="view-btn">View</button>
//                     <button className="delete-btn" onClick={() => handleDelete(user._id, 'user')}>Delete</button>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         ) : (
//           <div className="admin-list">
//             <h2>Farmers</h2>
//             {farmers.length === 0 ? <p>No farmers found.</p> : (
//               <ul>
//                 {farmers.map(farmer => (
//                   <li key={farmer._id} className="admin-list-item" style={{background: 'black', color: 'white'}}>
//                     <span>{farmer.name}</span>
//                     <span className="role-badge">{farmer.role}</span>
//                     <button className="view-btn">View</button>
//                     <button className="delete-btn" onClick={() => handleDelete(farmer._id, 'farmer')}>Delete</button>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminHome;
