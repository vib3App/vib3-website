import { Metadata } from 'next';
import { LegalPageLayout, HighlightBox } from '@/components/legal';
import {
  EligibilitySection,
  AccountSection,
  ContentSection,
  ProhibitedConductSection,
  ModerationSection,
  CopyrightSection,
  PrivacySection,
  DisclaimersSection,
  LiabilitySection,
  DisputeSection,
  TerminationSection,
  ChildSafetySection,
  ContactSection,
} from '@/components/legal/terms';

export const metadata: Metadata = {
  title: 'Terms of Service | VIB3',
  description: 'VIB3 Terms of Service - Rules and guidelines for using our platform.',
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      effectiveDate="December 12, 2025"
      lastUpdated="December 12, 2025"
      summary={<IntroBox />}
      footer={<Footer />}
    >
      <EligibilitySection />
      <AccountSection />
      <ContentSection />
      <ProhibitedConductSection />
      <ModerationSection />
      <CopyrightSection />
      <PrivacySection />
      <DisclaimersSection />
      <LiabilitySection />
      <DisputeSection />
      <TerminationSection />
      <ChildSafetySection />
      <ContactSection />
    </LegalPageLayout>
  );
}

function IntroBox() {
  return (
    <HighlightBox>
      <p className="text-white font-semibold">
        These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and Docs Marketplace LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) concerning your access to and use of the VIB3 and ViralVIB3 mobile applications and services (collectively, the &quot;Services&quot;).
      </p>
      <p className="text-white font-semibold mt-4">
        BY ACCESSING OR USING THE SERVICES, YOU AGREE TO BE BOUND BY THESE TERMS. IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THE SERVICES.
      </p>
    </HighlightBox>
  );
}

function Footer() {
  return (
    <>
      <HighlightBox>
        <h3 className="text-xl font-semibold text-white mb-4">Quick Summary (Not Legally Binding)</h3>
        <ul className="space-y-2">
          <li>You must be 13+ to use the Services</li>
          <li>You are responsible for your account security</li>
          <li>You retain rights to your content, but grant us a license to use it</li>
          <li>No illegal, harmful, hateful, or spam content</li>
          <li>We can remove content and ban accounts for violations</li>
          <li>DMCA takedown process for copyright infringement</li>
          <li>Services provided &quot;as is&quot; with no guarantees</li>
          <li>Limited liability ($100 maximum)</li>
          <li>Disputes resolved through arbitration (opt-out available)</li>
          <li>Zero tolerance for CSAM</li>
        </ul>
      </HighlightBox>

      <p className="text-center text-neutral-400 mt-8">
        <strong>BY USING THE SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.</strong>
      </p>
    </>
  );
}
