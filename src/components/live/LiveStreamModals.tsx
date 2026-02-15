'use client';

import Image from 'next/image';
import { XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import type { LiveGift } from '@/types';

interface GiftsModalProps {
  isOpen: boolean;
  gifts: LiveGift[];
  onClose: () => void;
  onSendGift: (giftId: string) => void;
}

export function GiftsModal({ isOpen, gifts, onClose, onSendGift }: GiftsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/80">
      <div className="w-full max-w-md bg-gray-900 rounded-t-3xl lg:rounded-3xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Send a Gift</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-4 gap-4 max-h-64 overflow-y-auto">
          {gifts.map((gift) => (
            <button
              key={gift.id}
              onClick={() => onSendGift(gift.id)}
              className="flex flex-col items-center gap-2 p-3 hover:bg-white/10 rounded-xl transition"
            >
              <Image src={gift.iconUrl} alt={gift.name} width={48} height={48} className="w-12 h-12 object-contain" />
              <div className="text-xs font-medium">{gift.name}</div>
              <div className="flex items-center gap-1 text-xs text-yellow-400">
                <span>💰</span>
                {gift.coinValue}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface GuestRequest {
  requestId: string;
  userId: string;
  username: string;
  avatar?: string;
}

interface GuestRequestsModalProps {
  isOpen: boolean;
  requests: GuestRequest[];
  onClose: () => void;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export function GuestRequestsModal({
  isOpen,
  requests,
  onClose,
  onAccept,
  onReject,
}: GuestRequestsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Guest Requests</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No pending requests
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.requestId}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden">
                  {request.avatar ? (
                    <Image src={request.avatar} alt={request.username + "'s avatar"} width={40} height={40} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                      {request.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{request.username}</div>
                  <div className="text-sm text-gray-400">wants to join</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onReject(request.requestId)}
                    className="p-2 hover:bg-white/10 rounded-full transition text-red-400"
                    aria-label="Reject request"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onAccept(request.requestId)}
                    className="p-2 bg-green-500 hover:bg-green-600 rounded-full transition"
                    aria-label="Accept request"
                  >
                    <UserPlusIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
