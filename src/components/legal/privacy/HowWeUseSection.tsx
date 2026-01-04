import { LegalSection, SubSection, BulletList } from '../LegalSection';

export function HowWeUseSection() {
  return (
    <LegalSection title="3. How We Use Your Information">
      <SubSection title="3.1 Provide and Improve Services">
        <BulletList items={[
          'Create and manage your account',
          'Process and deliver your content',
          'Personalize your experience',
          'Recommend content you may like',
          'Improve app performance and features',
        ]} />
      </SubSection>

      <SubSection title="3.2 Communications">
        <BulletList items={[
          'Send you service-related notifications',
          'Respond to your inquiries and support requests',
          'Send updates about our Services (you can opt out)',
        ]} />
      </SubSection>

      <SubSection title="3.3 Safety and Security">
        <BulletList items={[
          'Detect and prevent fraud, spam, and abuse',
          'Enforce our Terms of Service',
          'Comply with legal obligations',
          'Protect the rights and safety of our users',
        ]} />
      </SubSection>
    </LegalSection>
  );
}
