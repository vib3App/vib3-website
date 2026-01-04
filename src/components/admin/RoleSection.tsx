'use client';

import Link from 'next/link';
import type { TeamMember } from '@/services/api';
import { TeamMemberCard } from './TeamMemberCard';

interface RoleSectionProps {
  title: string;
  count?: number;
  color: 'purple' | 'red' | 'blue';
  members: TeamMember[];
  role: 'owner' | 'admin' | 'moderator';
  isOwner: boolean;
  actionLoading: string | null;
  emptyText: string;
  emptyLinkText: string;
  onDemote?: (userId: string) => void;
  onPromote?: (userId: string) => void;
  onRemove?: (userId: string) => void;
}

const COLORS = {
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
};

export function RoleSection({
  title, count, color, members, role, isOwner, actionLoading,
  emptyText, emptyLinkText, onDemote, onPromote, onRemove,
}: RoleSectionProps) {
  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className={`w-2 h-2 ${COLORS[color]} rounded-full`}></span>
        {title}{count !== undefined && ` (${count})`}
      </h2>
      {members.length === 0 ? (
        <EmptyState text={emptyText} linkText={emptyLinkText} />
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <TeamMemberCard
              key={member._id}
              member={member}
              role={role}
              isOwner={isOwner}
              actionLoading={actionLoading}
              onDemote={onDemote ? () => onDemote(member._id) : undefined}
              onPromote={onPromote ? () => onPromote(member._id) : undefined}
              onRemove={onRemove ? () => onRemove(member._id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ text, linkText }: { text: string; linkText: string }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
      <p className="text-neutral-400">{text}</p>
      <Link href="/admin/users" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">
        {linkText}
      </Link>
    </div>
  );
}

interface OwnerSectionProps {
  owner: TeamMember;
  actionLoading: string | null;
}

export function OwnerSection({ owner, actionLoading }: OwnerSectionProps) {
  return (
    <RoleSection
      title="Owner"
      color="purple"
      members={[owner]}
      role="owner"
      isOwner={false}
      actionLoading={actionLoading}
      emptyText=""
      emptyLinkText=""
    />
  );
}
