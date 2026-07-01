import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Camera, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Mubarek Edris',
    email: 'mubarek.edris@farmconnect.com',
    phone: '+251 911 234 567',
    location: 'Gondar, Ethiopia',
    farmName: 'Green Valley Farm',
    farmSize: '15 hectares',
    joinedDate: 'January 15, 2024',
    bio: 'Passionate organic farmer specializing in vegetables and fruits. Committed to sustainable farming practices and providing fresh, high-quality produce to the local community.',
    certifications: ['Organic Certified', 'Fair Trade'],
    languages: ['Amharic', 'English'],
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset logic here
  };

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Farm Profile</h1>
          <p className="text-xs text-slate-500">Manage your farm information and personal details</p>
        </div>
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
            <Button onClick={handleSave} className="bg-slate-900 hover:bg-slate-800 h-9 text-sm rounded-lg transition-all">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xl font-semibold">
                {profile.name.charAt(0)}
              </div>
              {!isEditing && (
                <button className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800">
                  <Camera className="h-3 w-3" />
                </button>
              )}
            </div>
            <Badge className="bg-emerald-500 text-white border-none text-[10px]">Verified Farmer</Badge>
          </div>

          {/* Profile Details */}
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                {isEditing ? (
                  <Input
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="border-slate-200 h-9 text-sm rounded-md"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-900">
                    <User className="h-4 w-4 text-slate-400" />
                    {profile.name}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                {isEditing ? (
                  <Input
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="border-slate-200 h-9 text-sm"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-900">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {profile.email}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                {isEditing ? (
                  <Input
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="border-slate-200 h-9 text-sm"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-900">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {profile.phone}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
                {isEditing ? (
                  <Input
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                    className="border-slate-200 h-9 text-sm"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-900">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {profile.location}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Farm Name</label>
              {isEditing ? (
                <Input
                  name="farmName"
                  value={profile.farmName}
                  onChange={handleChange}
                  className="border-slate-200 h-9 text-sm"
                />
              ) : (
                <div className="text-sm text-slate-900">{profile.farmName}</div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Farm Size</label>
              {isEditing ? (
                <Input
                  name="farmSize"
                  value={profile.farmSize}
                  onChange={handleChange}
                  className="border-slate-200 h-9 text-sm"
                />
              ) : (
                <div className="text-sm text-slate-900">{profile.farmSize}</div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Bio</label>
              {isEditing ? (
                <Textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  className="border-slate-200 text-sm"
                  rows={3}
                />
              ) : (
                <p className="text-sm text-slate-700">{profile.bio}</p>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs">Member since {profile.joinedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications & Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-900 mb-3">Certifications</h3>
          <div className="flex flex-wrap gap-2">
            {profile.certifications.map((cert, index) => (
              <Badge key={index} className="bg-slate-100 text-slate-700 border-slate-200 text-[10px]">
                {cert}
              </Badge>
            ))}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-900 mb-3">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((lang, index) => (
              <Badge key={index} className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                {lang}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
