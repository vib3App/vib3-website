import { LegalSection, BulletList } from '../LegalSection';

export function InternationalTransfersSection() {
  return (
    <LegalSection title="8. International Data Transfers">
      <p>
        Our Services are operated primarily in the United States. When you access our Services from outside the US, your information may be transferred to, stored, and processed in:
      </p>
      <BulletList items={[
        'United States - Backend servers, database, payment processing, AI services',
        'European Union - Video content delivery (Bunny CDN - Slovenia/Germany)',
      ]} />
      <p>
        For transfers to countries without an EU adequacy decision, we rely on Standard Contractual Clauses (SCCs) approved by the European Commission.
      </p>
    </LegalSection>
  );
}
