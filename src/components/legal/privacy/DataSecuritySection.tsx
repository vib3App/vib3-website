import { LegalSection, SubSection, BulletList } from '../LegalSection';

export function DataSecuritySection() {
  return (
    <LegalSection title="7. Data Security">
      <SubSection title="7.1 Security Measures">
        <p>We implement appropriate technical and organizational measures to protect your information:</p>
        <BulletList items={[
          'Encryption: HTTPS for all data transmission, encrypted passwords (bcrypt)',
          'Access Controls: Limited employee access to personal data',
          'Monitoring: Regular security audits and monitoring',
          'Secure Infrastructure: Cloud providers with SOC 2 compliance',
        ]} />
      </SubSection>

      <SubSection title="7.2 Data Retention">
        <p><strong>Retention Periods:</strong></p>
        <BulletList items={[
          'Active accounts: Indefinitely until deletion requested',
          'Deleted accounts: 30-day grace period, then permanently deleted',
          'Crash reports: 90 days',
          'Legal compliance records: As required by law',
        ]} />
      </SubSection>
    </LegalSection>
  );
}
