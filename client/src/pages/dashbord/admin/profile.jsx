import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { User, Mail, Shield, Camera, Edit2, Save, X, Phone, Calendar } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import AdminProfileForm from './AdminProfileForm';

const AdminProfile = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(user || {
    name: 'Admin User',
    email: 'admin@farmconnect.com',
    role: 'ADMIN',
    phone: '+251 911 000 000',
    joinedDate: 'January 1, 2024',
    department: 'Operations',
  });

  const handleUpdate = (updated) => {
    setProfile(updated);
    setUser && setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Admin Profile</h1>
          <p className="text-xs text-slate-500">Manage your administrative details</p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="bg-slate-900 hover:bg-slate-800 h-9 text-sm rounded-lg transition-all">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline" className="border-slate-200 h-9 text-sm rounded-lg">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={() => handleUpdate(profile)} className="bg-slate-900 hover:bg-slate-800 h-9 text-sm rounded-lg transition-all">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                {profile.name?.charAt(0) || 'A'}
              </div>
              {!isEditing && (
                <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 shadow-md">
                  <Camera className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Badge className="bg-indigo-500 text-white border-none text-[10px]">Super Admin</Badge>
          </div>

          {/* Profile Details */}
          <div className="flex-1 space-y-4">
            {isEditing ? (
              <AdminProfileForm user={profile} onUpdate={handleUpdate} />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <User className="h-4 w-4 text-slate-400" />
                      {profile.name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {profile.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <Phone className="h-4 w-4 text-slate-400" />
                      {profile.phone || '+251 911 000 000'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <Shield className="h-4 w-4 text-slate-400" />
                      {profile.role}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Department</label>
                    <div className="text-sm font-medium text-slate-900">
                      {profile.department || 'Operations'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Admin ID</label>
                    <div className="text-sm font-medium text-slate-900">
                      {profile.id || profile._id || 'ADM-12345'}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Joined {profile.joinedDate || 'January 1, 2024'}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
