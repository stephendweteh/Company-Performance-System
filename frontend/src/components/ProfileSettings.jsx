import React, { useEffect, useMemo, useState } from 'react';
import axios from '../services/api';

const ProfileSettings = ({ user, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      current_password: '',
      password: '',
      password_confirmation: '',
    });
    setPreviewUrl('');
    setPhotoFile(null);
  }, [user]);

  const displayPhoto = useMemo(() => previewUrl || user?.profile_photo_url || '', [previewUrl, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('phone', formData.phone);
      payload.append('bio', formData.bio);
      payload.append('current_password', formData.current_password || '');
      payload.append('password', formData.password || '');
      payload.append('password_confirmation', formData.password_confirmation || '');
      if (photoFile) {
        payload.append('profile_photo', photoFile);
      }

      await axios.post('/api/user/profile', payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
          'X-HTTP-Method-Override': 'PUT',
        },
      });

      setMessage('Profile updated successfully.');
      setPhotoFile(null);
      setPreviewUrl('');
      if (onProfileUpdated) {
        await onProfileUpdated();
      }
    } catch (error) {
      const validationMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(' ')
        : null;
      setMessage(validationMessage || error.response?.data?.message || 'Failed to update profile.');
    }

    setSaving(false);
  };

  return (
    <div className="ta-card">
      <div className="ta-card-header">
        <h3 className="font-semibold text-sidebar">My Profile</h3>
      </div>
      <div className="ta-card-body">
        {message && (
          <div className="mb-4 rounded border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-sm border border-stroke p-5">
            <p className="text-sm font-semibold text-sidebar">Profile Photo</p>
            <div className="mt-4 flex justify-center">
              {displayPhoto ? (
                <img src={displayPhoto} alt="Profile" className="h-28 w-28 rounded-full object-cover border border-stroke" />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <label className="ta-label mt-4">Upload new photo</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="ta-input" />
            <p className="mt-2 text-xs text-gray-400">JPG, PNG, WEBP. Max 2MB.</p>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="ta-label">Full Name</label>
              <input name="name" value={formData.name} onChange={handleChange} required className="ta-input" />
            </div>
            <div>
              <label className="ta-label">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="ta-input" />
            </div>
            <div>
              <label className="ta-label">Phone</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="ta-input" placeholder="Optional phone number" />
            </div>
            <div>
              <label className="ta-label">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows={5} className="ta-input resize-none" placeholder="Tell us about yourself" />
            </div>
            <div className="grid grid-cols-1 gap-4 rounded-sm border border-stroke p-4 md:grid-cols-3">
              <div>
                <label className="ta-label">Current Password</label>
                <input type="password" name="current_password" value={formData.current_password} onChange={handleChange} className="ta-input" placeholder="Required to change password" />
              </div>
              <div>
                <label className="ta-label">New Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="ta-input" placeholder="Leave blank to keep current" />
              </div>
              <div>
                <label className="ta-label">Confirm New Password</label>
                <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} className="ta-input" placeholder="Repeat new password" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="ta-btn-primary disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
