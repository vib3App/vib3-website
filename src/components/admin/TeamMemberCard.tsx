'use client';

import Image from 'next/image';
import type { TeamMember } from '@/services/api';

interface TeamMemberCardProps {
  member: TeamMember;
  role: 'owner' | 'admin' | 'moderator';
  isOwner: boolean;
  actionLoading: string | null;
  onDemote?: () => void;
  onPromote?: () => void;
  onRemove?: () => void;
}

const ROLE_ICONS = {
  owner: (
    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    </div>
  ),
  admin: (
    <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    </div>
  ),
  moderator: (
    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    </div>
  ),
};

const ROLE_BORDERS = {
  owner: 'border-purple-500/30',
  admin: 'border-red-500/20',
  moderator: 'border-blue-500/20',
};

export function TeamMemberCard({ member, role, isOwner, actionLoading, onDemote, onPromote, onRemove }: TeamMemberCardProps) {
  const isLoading = actionLoading === member._id;
  const isOwnerCard = role === 'owner';
  const avatarSize = isOwnerCard ? 'w-14 h-14' : 'w-12 h-12';

  return (
    <div className={`bg-neutral-900 border ${ROLE_BORDERS[role]} rounded-xl ${isOwnerCard ? 'p-6' : 'p-4'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {ROLE_ICONS[role]}
          <div className={`${avatarSize} bg-neutral-700 rounded-full flex items-center justify-center overflow-hidden`}>
            {member.profilePicture ? (
              <Image src={member.profilePicture} alt={member.username + "'s avatar"} width={isOwnerCard ? 56 : 48} height={isOwnerCard ? 56 : 48} className={`${avatarSize} object-cover`} />
            ) : (
              <span className={`text-white font-bold ${isOwnerCard ? 'text-xl' : ''}`}>
                {member.username?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className={`text-white font-medium ${isOwnerCard ? 'text-lg' : ''}`}>{member.username}</p>
            <p className={`text-neutral-400 ${isOwnerCard ? '' : 'text-sm'}`}>{member.email}</p>
            {isOwnerCard && <p className="text-purple-400 text-sm mt-1">Full system access. Cannot be modified.</p>}
            {!isOwnerCard && member.roleChangedAt && (
              <p className="text-neutral-500 text-xs mt-1">
                {role === 'admin' ? 'Promoted' : 'Added'} {new Date(member.roleChangedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        {!isOwnerCard && (
          <div className="flex gap-2">
            {isOwner && role === 'moderator' && onPromote && (
              <ActionButton onClick={onPromote} disabled={isLoading} variant="success">Promote to Admin</ActionButton>
            )}
            {isOwner && role === 'admin' && onDemote && (
              <ActionButton onClick={onDemote} disabled={isLoading} variant="warning">Demote to Moderator</ActionButton>
            )}
            {(isOwner || role === 'moderator') && onRemove && (
              <ActionButton onClick={onRemove} disabled={isLoading} variant="danger">Remove</ActionButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({ onClick, disabled, variant, children }: { onClick: () => void; disabled: boolean; variant: 'success' | 'warning' | 'danger'; children: React.ReactNode }) {
  const variants = {
    success: 'bg-green-600/20 text-green-400 hover:bg-green-600/30',
    warning: 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30',
    danger: 'bg-red-600/20 text-red-400 hover:bg-red-600/30',
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`px-3 py-1 ${variants[variant]} rounded text-sm disabled:opacity-50`}>
      {children}
    </button>
  );
}
