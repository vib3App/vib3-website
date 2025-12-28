'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { userApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

interface ProfileData {
  username: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  onSave: (updates: Partial<ProfileData>) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: EditProfileModalProps) {
  const { user, setUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [profilePicture, setProfilePicture] = useState(profile.profilePicture || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setProfilePicture(profile.profilePicture || '');
      setImagePreview(null);
      setError('');
    }
  }, [isOpen, profile]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError('');

    try {
      // If there's a new image, upload it first
      let newProfilePicture = profilePicture;
      if (imagePreview && fileInputRef.current?.files?.[0]) {
        const formData = new FormData();
        formData.append('image', fileInputRef.current.files[0]);
        const uploadResult = await userApi.uploadProfilePicture(formData);
        newProfilePicture = uploadResult.url;
      }

      // Update profile
      const updates = {
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        profilePicture: newProfilePicture,
      };

      await userApi.updateProfile(updates);

      // Update local auth store
      if (user) {
        setUser({
          ...user,
          profilePicture: newProfilePicture,
        });
      }

      onSave(updates);
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#1A1F2E] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1A1F2E] border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <button onClick={onClose} className="text-white/70 hover:text-white">
            Cancel
          </button>
          <h2 className="text-white font-semibold">Edit Profile</h2>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="text-[#6366F1] font-semibold hover:opacity-80 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-3">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#0A0E1A]">
                {imagePreview || profilePicture ? (
                  <Image
                    src={imagePreview || profilePicture}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white/50">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#6366F1] rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[#6366F1] text-sm font-medium"
            >
              Change Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-white/70 text-sm mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={profile.username}
              maxLength={50}
              className="w-full bg-[#0A0E1A] text-white px-4 py-3 rounded-xl outline-none placeholder:text-white/30 focus:ring-2 focus:ring-[#6366F1]"
            />
            <p className="text-white/30 text-xs mt-1">{displayName.length}/50</p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-white/70 text-sm mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={150}
              rows={3}
              className="w-full bg-[#0A0E1A] text-white px-4 py-3 rounded-xl outline-none placeholder:text-white/30 focus:ring-2 focus:ring-[#6366F1] resize-none"
            />
            <p className="text-white/30 text-xs mt-1">{bio.length}/150</p>
          </div>

          {/* Username (read-only) */}
          <div>
            <label className="block text-white/70 text-sm mb-2">Username</label>
            <div className="w-full bg-[#0A0E1A]/50 text-white/50 px-4 py-3 rounded-xl">
              @{profile.username}
            </div>
            <p className="text-white/30 text-xs mt-1">Username cannot be changed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
