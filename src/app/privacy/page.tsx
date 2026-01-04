import { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal';
import {
  IntroSection, InformationCollectedSection, HowWeUseSection, HowWeShareSection,
  ChildrensPrivacySection, YourRightsSection, DataSecuritySection,
  InternationalTransfersSection, ChangesSection, ContactSection, SummarySection,
} from '@/components/legal/privacy';

export const metadata: Metadata = {
  title: 'Privacy Policy | VIB3',
  description: 'VIB3 Privacy Policy - Learn how we collect, use, and protect your information.',
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      effectiveDate="December 12, 2025"
      lastUpdated="December 26, 2025"
    >
      <IntroSection />
      <InformationCollectedSection />
      <HowWeUseSection />
      <HowWeShareSection />
      <ChildrensPrivacySection />
      <YourRightsSection />
      <DataSecuritySection />
      <InternationalTransfersSection />
      <ChangesSection />
      <ContactSection />
      <SummarySection />
    </LegalPageLayout>
  );
}
