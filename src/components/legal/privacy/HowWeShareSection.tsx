import { LegalSection, SubSection, BulletList } from '../LegalSection';

export function HowWeShareSection() {
  return (
    <LegalSection title="4. How We Share Your Information">
      <SubSection title="4.1 Public Information">
        <p><strong>Your profile and content are PUBLIC by default:</strong></p>
        <BulletList items={['Videos you upload', 'Your username, profile picture, and bio', 'Comments and likes', 'Followers and following lists']} />
      </SubSection>

      <SubSection title="4.2 Service Providers">
        <p>
          We share information with third-party service providers who help us operate our Services. We have executed Data Processing Agreements (DPAs) with each provider that include Standard Contractual Clauses (SCCs) approved by the European Commission.
        </p>
        <BulletList items={[
          'Bunny CDN: Video hosting and delivery (Slovenia, EU)',
          'MongoDB Atlas: Database hosting (United States)',
          'DigitalOcean: Backend server hosting (United States)',
          'Google LLC: Authentication, ML Kit, Gemini AI, Firebase (United States)',
          'Apple Inc.: Authentication (United States)',
          'Stripe, Inc.: Payment processing (United States)',
          'xAI Corp.: AI content analysis (United States)',
          'Agora, Inc.: Real-time video collaboration rooms and live streaming (United States)',
          'Snap Inc.: Authentication and AR camera effects (United States)',
          'Google AdMob: Advertising (United States)',
        ]} />
      </SubSection>

      <SubSection title="4.3 Legal Requirements">
        <p>We may disclose your information if required by law or in response to:</p>
        <BulletList items={['Court orders or subpoenas', 'Government or law enforcement requests', 'National security requirements', 'Protection against legal liability']} />
      </SubSection>

      <SubSection title="4.4 Child Safety">
        <p className="font-semibold">
          We are required by federal law to report suspected child sexual abuse material (CSAM) to the National Center for Missing &amp; Exploited Children (NCMEC).
        </p>
      </SubSection>
    </LegalSection>
  );
}
