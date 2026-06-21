
import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import AdminProfileForm from './AdminProfileForm';

const AdminProfile = () => {
  const { user, setUser, logout } = useAuth();
  const [profile, setProfile] = useState(user);

  if (!profile) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  const handleUpdate = (updated) => {
    setProfile(updated);
    setUser && setUser(updated); // update context if possible
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <div className="admin-profile-page" style={{ maxWidth: 400, margin: '2rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: 8, background: '#fff', boxShadow: '0 2px 8px #0001' }}>
      <h2 style={{ marginBottom: 24 }}>Admin Profile</h2>
      <div style={{ textAlign: 'left' }}>
        <div style={{ marginBottom: 16 }}><strong>Name:</strong> {profile.name}</div>
        <div style={{ marginBottom: 16 }}><strong>Email:</strong> {profile.email}</div>
        <div style={{ marginBottom: 16 }}><strong>Role:</strong> {profile.role}</div>
        <div style={{ marginBottom: 16 }}><strong>ID:</strong> {profile.id || profile._id}</div>
      </div>
      <AdminProfileForm user={profile} onUpdate={handleUpdate} />
      <button onClick={logout} style={{ marginTop: 32, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 24px', width: '100%', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
        Logout
      </button>
    </div>
  );
};

export default AdminProfile;
