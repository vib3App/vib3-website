import { LegalSection, SubSection, BulletList } from '../LegalSection';

export function AccountSection() {
  return (
    <LegalSection title="2. Account Registration">
      <SubSection title="2.1 Account Creation">
        <p>To use certain features of the Services, you must create an account. When creating an account, you agree to:</p>
        <BulletList items={[
          'Provide accurate, current, and complete information',
          'Maintain and update your information to keep it accurate',
          'Keep your password secure and confidential',
          'Notify us immediately of any unauthorized use of your account',
          'Accept responsibility for all activities under your account',
        ]} />
      </SubSection>

      <SubSection title="2.2 Account Security">
        <p className="font-semibold">
          You are responsible for all activity on your account. We are not liable for any loss or damage from unauthorized use of your account due to your failure to maintain security.
        </p>
      </SubSection>

      <SubSection title="2.3 Account Termination">
        <p>We reserve the right to suspend or terminate your account at any time, with or without notice, for:</p>
        <BulletList items={[
          'Violation of these Terms',
          'Fraudulent, abusive, or illegal activity',
          'Extended periods of inactivity',
          'Any reason at our sole discretion',
        ]} />
      </SubSection>
    </LegalSection>
  );
}
