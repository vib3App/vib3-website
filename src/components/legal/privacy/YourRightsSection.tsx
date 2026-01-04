import { LegalSection, SubSection, BulletList } from '../LegalSection';

export function YourRightsSection() {
  return (
    <LegalSection title="6. Your Privacy Rights">
      <SubSection title="6.1 Access and Portability">
        <p>You have the right to:</p>
        <BulletList items={[
          'Access the personal information we hold about you',
          'Request a copy of your data in a portable format',
          'Contact us at: privacy@docsmarketplacellc.com',
        ]} />
      </SubSection>

      <SubSection title="6.2 Deletion">
        <p>You have the right to:</p>
        <BulletList items={[
          'Delete your account (Settings → Account Security → Delete Account)',
          'Request deletion of your personal information',
          'Note: Deletion is permanent after a 30-day grace period',
        ]} />
      </SubSection>

      <SubSection title="6.3 Do Not Sell My Personal Information (CCPA)">
        <p className="font-semibold">We do NOT sell your personal information to third parties.</p>
      </SubSection>

      <SubSection title="6.4 GDPR Rights (EU Residents)">
        <p>If you are in the European Union, you have additional rights:</p>
        <BulletList items={[
          'Right to Access: Request copies of your personal data',
          'Right to Rectification: Request correction of inaccurate data',
          'Right to Erasure: Request deletion of your data ("right to be forgotten")',
          'Right to Restriction: Request limitation of processing',
          'Right to Data Portability: Receive your data in a structured format',
          'Right to Object: Object to processing of your data',
          'Right to Withdraw Consent: Withdraw consent at any time',
        ]} />
        <p>To exercise these rights, contact us at: privacy@docsmarketplacellc.com</p>
      </SubSection>
    </LegalSection>
  );
}
