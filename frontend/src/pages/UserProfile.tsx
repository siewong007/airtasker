import { useState, useEffect, useRef } from 'react';
import { Camera, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/users';
import { fileService } from '@/services/files';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setPhone(user.phone || '');
      setSkills(user.skills?.join(', ') || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [isAuthenticated, user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingAvatar(true);
    try {
      const url = await fileService.uploadFile(file);
      setAvatarUrl(url);
      await userService.updateUser(user.id, { avatarUrl: url });
      await refreshUser();
      toast.success('Avatar updated');
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await userService.updateUser(user.id, {
        name,
        bio,
        location,
        phone,
        skills: skills.split(',').map(skill => skill.trim()).filter(Boolean),
        avatarUrl: avatarUrl || undefined,
      });
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user || !oldPassword || !newPassword) return;
    setIsUpdating(true);
    try {
      await userService.changePassword(user.id, oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      toast.success('Password changed successfully');
    } catch {
      toast.error('Failed to change password');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-500">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Profile</h1>

      {/* Avatar Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 flex items-center gap-6">
        <div className="relative group">
          <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-primary-600" />
            )}
          </div>
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isUploadingAvatar ? (
              <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Camera className="h-6 w-6 text-white" />
            )}
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">{user.name}</h2>
          <p className="text-sm text-gray-500">Click the avatar to upload a new photo</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Cleaning, Handyman, Moving"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="button"
            onClick={handleUpdateProfile}
            disabled={isUpdating}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isUpdating ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="button"
            onClick={handlePasswordChange}
            disabled={isUpdating || !oldPassword || !newPassword}
            className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 disabled:opacity-50 transition-colors"
          >
            {isUpdating ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
