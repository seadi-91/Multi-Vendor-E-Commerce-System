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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest-900">Farm Profile</h1>
          <p className="text-forest-600">Manage your farm information and personal details</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-forest-600 hover:bg-forest-700">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline" className="border-forest-200">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-forest-600 hover:bg-forest-700">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-forest-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 text-4xl font-bold">
                {profile.name.charAt(0)}
              </div>
              {!isEditing && (
                <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-forest-600 text-white flex items-center justify-center hover:bg-forest-700">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <Badge className="bg-mint-500 text-white border-none">Verified Farmer</Badge>
          </div>

          {/* Profile Details */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1">Full Name</label>
                {isEditing ? (
                  <Input
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="border-forest-200"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-forest-900">
                    <User className="h-4 w-4 text-forest-600" />
                    {profile.name}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1">Email</label>
                {isEditing ? (
                  <Input
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="border-forest-200"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-forest-900">
                    <Mail className="h-4 w-4 text-forest-600" />
                    {profile.email}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1">Phone</label>
                {isEditing ? (
                  <Input
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="border-forest-200"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-forest-900">
                    <Phone className="h-4 w-4 text-forest-600" />
                    {profile.phone}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1">Location</label>
                {isEditing ? (
                  <Input
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                    className="border-forest-200"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-forest-900">
                    <MapPin className="h-4 w-4 text-forest-600" />
                    {profile.location}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1">Farm Name</label>
              {isEditing ? (
                <Input
                  name="farmName"
                  value={profile.farmName}
                  onChange={handleChange}
                  className="border-forest-200"
                />
              ) : (
                <div className="text-forest-900">{profile.farmName}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1">Farm Size</label>
              {isEditing ? (
                <Input
                  name="farmSize"
                  value={profile.farmSize}
                  onChange={handleChange}
                  className="border-forest-200"
                />
              ) : (
                <div className="text-forest-900">{profile.farmSize}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1">Bio</label>
              {isEditing ? (
                <Textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  className="border-forest-200"
                  rows={3}
                />
              ) : (
                <p className="text-forest-700">{profile.bio}</p>
              )}
            </div>

            <div className="flex items-center gap-2 text-forest-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Member since {profile.joinedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications & Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-forest-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-forest-900 mb-4">Certifications</h3>
          <div className="flex flex-wrap gap-2">
            {profile.certifications.map((cert, index) => (
              <Badge key={index} className="bg-forest-100 text-forest-700 border-forest-200">
                {cert}
              </Badge>
            ))}
          </div>
        </div>
        <div className="bg-white border border-forest-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-forest-900 mb-4">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((lang, index) => (
              <Badge key={index} className="bg-mint-100 text-mint-700 border-mint-200">
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
