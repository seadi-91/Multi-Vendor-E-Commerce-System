import React, { useState } from 'react';
import api from '../../../api';


const AdminProfileForm = ({ user, onUpdate }) => {
  const [form, setForm] = useState({ name: user.name, email: user.email, password: '', oldPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      // Only send password fields if password is being changed
      const payload = { name: form.name, email: form.email };
      if (showPasswordFields && form.password) {
        payload.password = form.password;
        payload.oldPassword = form.oldPassword;
      }
      const res = await api.put(`/users/${user.id || user._id}`, payload);
      setSuccess(true);
      setForm(f => ({ ...f, password: '', oldPassword: '' }));
      onUpdate(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <label><strong>Name:</strong></label>
        <input name="name" value={form.name} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4 }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label><strong>Email:</strong></label>
        <input name="email" value={form.email} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4 }} />
      </div>
      {!showPasswordFields && (
        <button type="button" onClick={() => setShowPasswordFields(true)} style={{ marginBottom: 16, background: '#eee', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>
          Change Password
        </button>
      )}
      {showPasswordFields && (
        <>
          <div style={{ marginBottom: 16 }}>
            <label><strong>Old Password:</strong></label>
            <input name="oldPassword" type="password" value={form.oldPassword} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4 }} required={showPasswordFields} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label><strong>New Password:</strong></label>
            <input name="password" type="password" value={form.password} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4 }} required={showPasswordFields} />
          </div>
        </>
      )}
      <button type="submit" disabled={loading} style={{ padding: '8px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 4 }}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
      {success && <div style={{ color: 'green', marginTop: 12 }}>Profile updated!</div>}
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
    </form>
  );
};

export default AdminProfileForm;
