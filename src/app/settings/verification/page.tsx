'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/services/api/client';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { StatusCards, VerificationSteps } from '@/components/verification';
import type { VerificationStatus, VerificationRequest, VerificationFormData } from '@/components/verification';

export default function VerificationRequestPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified, user } = useAuthStore();
  const [status, setStatus] = useState<VerificationStatus>('none');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthVerified) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/settings/verification');
      return;
    }
    checkVerificationStatus();
  }, [isAuthenticated, isAuthVerified, router]);

  const checkVerificationStatus = async () => {
    try {
      const { data } = await apiClient.get<VerificationRequest>('/user/verification-status');
      setStatus(data.status);
      if (data.rejectionReason) setRejectionReason(data.rejectionReason);
    } catch {
      setStatus('none');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: VerificationFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fullName', data.fullName);
      formData.append('category', data.category);
      formData.append('reason', data.reason);
      formData.append('links', JSON.stringify(data.links));
      formData.append('idDocument', data.idDocument);

      await apiClient.post('/user/verification-request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus('pending');
    } catch (error) {
      console.error('Failed to submit verification request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthVerified || !isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  const showForm = (status === 'none' || status === 'rejected') && !user?.isVerified;

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />

      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10 mx-4 mb-6">
          <div className="flex items-center gap-4 px-4 h-14">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-white">Verification Request</h1>
              <p className="text-white/50 text-xs">Get a verified badge</p>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4">
          <StatusCards
            status={status}
            isVerified={user?.isVerified ?? false}
            rejectionReason={rejectionReason}
          />

          {showForm && (
            <VerificationSteps onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          )}
        </div>
      </main>
    </div>
  );
}
