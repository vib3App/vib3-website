export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface VerificationRequest {
  status: VerificationStatus;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export const verificationCategories = [
  'Music',
  'Sports',
  'Fashion',
  'Beauty',
  'Entertainment',
  'Gaming',
  'News/Media',
  'Business',
  'Government/Politics',
  'Other',
];
