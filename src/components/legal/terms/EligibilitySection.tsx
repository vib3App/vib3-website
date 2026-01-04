import { LegalSection, SubSection, BulletList } from '../LegalSection';

export function EligibilitySection() {
  return (
    <LegalSection title="1. Eligibility">
      <SubSection title="1.1 Age Requirement">
        <p>
          You must be at least <strong>13 years of age</strong> to use the Services. If you are under 18 years of age, you represent that you have your parent or legal guardian&apos;s permission to use the Services.
        </p>
        <p><strong>By using the Services, you represent and warrant that:</strong></p>
        <BulletList items={[
          'You are at least 13 years old',
          'You have not been previously suspended or removed from the Services',
          'You are not prohibited from using the Services under applicable law',
        ]} />
      </SubSection>

      <SubSection title="1.2 Geographic Restrictions">
        <p>
          The Services are intended for users in the United States. If you access the Services from outside the United States, you are responsible for compliance with local laws.
        </p>
      </SubSection>
    </LegalSection>
  );
}
