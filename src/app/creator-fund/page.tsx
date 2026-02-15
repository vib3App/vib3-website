'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { TopNav } from '@/components/ui/TopNav';
import { creatorFundApi } from '@/services/api';
import { useToastStore } from '@/stores/toastStore';
import {
  CreatorFundHero,
  TierProgressSection,
  EligibilityRequirements,
  EarningsHistoryTable,
  ApplyModal,
  WithdrawModal,
  PaymentMethodModal,
  EarnMoreTips,
} from '@/components/creator-fund';
import type { DashboardData, EligibilityResponse, EarningPeriod, EarningsSummary } from '@/types/creatorFund';
import { logger } from '@/utils/logger';

export default function CreatorFundPage() {
  const addToast = useToastStore(s => s.addToast);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
  const [earnings, setEarnings] = useState<EarningPeriod[]>([]);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);

  // Modal states
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Form states
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [paymentType, setPaymentType] = useState<'paypal' | 'bank'>('paypal');
  const [paymentEmail, setPaymentEmail] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await creatorFundApi.getDashboard();
      setDashboard(dashboardData);

      if (dashboardData.isEnrolled) {
        const earningsData = await creatorFundApi.getEarnings(12);
        setEarnings(earningsData.earnings);
        setSummary(earningsData.summary);
      } else {
        const eligibilityData = await creatorFundApi.checkEligibility();
        setEligibility(eligibilityData);
      }
    } catch (err) {
      logger.error('Error fetching creator fund data:', err);
      setError('Failed to load creator fund data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApply = async () => {
    try {
      setApplying(true);
      await creatorFundApi.apply();
      setShowApplyModal(false);
      await fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      addToast(error.response?.data?.error || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 50) { addToast('Minimum withdrawal is $50'); return; }
    if (summary && amount > summary.availableBalance) { addToast('Insufficient balance'); return; }

    try {
      setWithdrawing(true);
      const result = await creatorFundApi.withdraw(amount);
      addToast(`Withdrawal requested! ${result.withdrawal.estimatedProcessing}`, 'success');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      await fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      addToast(error.response?.data?.error || 'Failed to request withdrawal');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleSavePaymentMethod = async () => {
    if (paymentType === 'paypal' && !paymentEmail) { addToast('Please enter your PayPal email'); return; }
    try {
      setSavingPayment(true);
      await creatorFundApi.updatePaymentMethod(paymentType, { email: paymentType === 'paypal' ? paymentEmail : undefined });
      setShowPaymentModal(false);
      await fetchData();
    } catch (err) {
      logger.error('Error saving payment method:', err);
      addToast('Failed to save payment method');
    } finally {
      setSavingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen aurora-bg">
        <TopNav />
        <div className="flex items-center justify-center py-40">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen aurora-bg">
        <TopNav />
        <div className="text-center py-40">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={fetchData} className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isEnrolled = dashboard?.isEnrolled || false;
  const membership = dashboard?.membership;
  const balances = dashboard?.balances;
  const tiers = dashboard?.tiers || [];

  return (
    <div className="min-h-screen aurora-bg">
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8">
        <header className="sticky top-16 z-40 glass-heavy mx-4 mt-3 rounded-2xl mb-4">
          <div className="flex items-center gap-3 px-4 h-14">
            <Link href="/feed" className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </Link>
            <h1 className="text-xl font-bold text-white">Creator Fund</h1>
          </div>
        </header>

        <CreatorFundHero
          isEnrolled={isEnrolled}
          balances={balances}
          membership={membership}
          onWithdraw={() => setShowWithdrawModal(true)}
          onUpdatePayment={() => setShowPaymentModal(true)}
          onApply={() => setShowApplyModal(true)}
        />

        <div className="p-6 space-y-8">
          <TierProgressSection tiers={tiers} isEnrolled={isEnrolled} />

          {!isEnrolled && eligibility && (
            <EligibilityRequirements requirements={eligibility.requirements} isEligible={eligibility.isEligible} />
          )}

          {isEnrolled && <EarningsHistoryTable earnings={earnings} />}

          <EarnMoreTips />
        </div>

        <ApplyModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          onApply={handleApply}
          applying={applying}
          isEligible={eligibility?.isEligible || false}
          potentialTier={eligibility?.potentialTier}
        />

        <WithdrawModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          onWithdraw={handleWithdraw}
          withdrawing={withdrawing}
          availableBalance={balances?.availableBalance || 0}
          hasPaymentMethod={!!membership?.paymentMethod}
          paymentMethodDisplay={membership?.paymentMethod?.display}
          withdrawAmount={withdrawAmount}
          onAmountChange={setWithdrawAmount}
        />

        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSave={handleSavePaymentMethod}
          saving={savingPayment}
          paymentType={paymentType}
          onPaymentTypeChange={setPaymentType}
          paymentEmail={paymentEmail}
          onEmailChange={setPaymentEmail}
        />
      </main>
    </div>
  );
}
