import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useFarmerProfile } from '../../../../context/FarmerProfileContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Camera, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const Profile = () => {
  const { user, logout } = useAuth();
  const { profile: contextProfile, loading: contextLoading, fetchProfile, updateProfile } = useFarmerProfile();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    address: '',
    farmName: '',
    farmSize: '',
    bio: '',
    certifications: [],
    languages: [],
    isVerified: false,
    createdAt: null
  });

  useEffect(() => {
    // Fetch profile on mount if not already loaded
    if (!contextProfile) {
      fetchProfile();
    }
  }, [contextProfile, fetchProfile]);

  useEffect(() => {
    // Sync local state with context
    if (contextProfile) {
      setProfile(contextProfile);
    }
  }, [contextProfile]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        address: profile.address,
        farmName: profile.farmName,
        farmSize: profile.farmSize,
        bio: profile.bio
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to context profile
    if (contextProfile) {
      setProfile(contextProfile);
    }
    setIsEditing(false);
  };

  const formatJoinedDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (contextLoading && !contextProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">Farm Profile</h1>
          <p className="text-[10px] text-slate-500">Manage your farm information and personal details</p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="bg-slate-900 hover:bg-slate-800 h-7 text-xs rounded-lg transition-all">
              <Edit2 className="h-3 w-3 mr-1.5" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline" className="border-slate-200 h-7 text-xs rounded-lg" disabled={saving}>
                <X className="h-3 w-3 mr-1.5" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-slate-900 hover:bg-slate-800 h-7 text-xs rounded-lg transition-all" disabled={saving}>
                <Save className="h-3 w-3 mr-1.5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xl font-semibold">
                {profile.name?.charAt(0)?.toUpperCase() || 'F'}
              </div>
              {!isEditing && (
                <button className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800">
                  <Camera className="h-3 w-3" />
                </button>
              )}
            </div>
            <Badge className={`${profile.isVerified ? 'bg-emerald-500' : 'bg-amber-500'} text-white border-none text-[10px]`}>
              {profile.isVerified ? 'Verified Farmer' : 'Pending Verification'}
            </Badge>
          </div>

          {/* Profile Details */}
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                {isEditing ? (
                  <Input
                    name="name"
                    value={profile.name || ''}
                    onChange={handleChange}
                    className="border-slate-200 h-9 text-sm rounded-md"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-900">
                    <User className="h-4 w-4 text-slate-400" />
                    {profile.name || 'Not set'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                {isEditing ? (
                  <Input
                    name="email"
                    value={profile.email || ''}
                    onChange={handleChange}
                    className="border-slate-200 h-9 text-sm"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-900">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {profile.email || 'Not set'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                {isEditing ? (
                  <Input
                    name="phone"
                    value={profile.phone || ''}
                    onChange={handleChange}
                    className="border-slate-200 h-9 text-sm"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-900">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {profile.phone || 'Not set'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
                {isEditing ? (
                  <Input
                    name="location"
                    value={profile.location || ''}
                    onChange={handleChange}
                    className="border-slate-200 h-9 text-sm"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-900">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {profile.location || 'Not set'}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Farm Name</label>
              {isEditing ? (
                <Input
                  name="farmName"
                  value={profile.farmName || ''}
                  onChange={handleChange}
                  className="border-slate-200 h-9 text-sm"
                />
              ) : (
                <div className="text-sm text-slate-900">{profile.farmName || 'Not set'}</div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Farm Size</label>
              {isEditing ? (
                <Input
                  name="farmSize"
                  value={profile.farmSize || ''}
                  onChange={handleChange}
                  className="border-slate-200 h-9 text-sm"
                />
              ) : (
                <div className="text-sm text-slate-900">{profile.farmSize || 'Not set'}</div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Bio</label>
              {isEditing ? (
                <Textarea
                  name="bio"
                  value={profile.bio || ''}
                  onChange={handleChange}
                  className="border-slate-200 text-sm"
                  rows={3}
                />
              ) : (
                <p className="text-sm text-slate-700">{profile.bio || 'No bio added'}</p>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs">Member since {formatJoinedDate(profile.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
