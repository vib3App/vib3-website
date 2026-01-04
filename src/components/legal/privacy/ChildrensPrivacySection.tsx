import { LegalSection, SubSection, BulletList } from '../LegalSection';

export function ChildrensPrivacySection() {
  return (
    <LegalSection title="5. Children's Privacy (COPPA Compliance)">
      <SubSection title="5.1 Age Requirement">
        <p className="font-semibold">You must be at least 13 years old to use our Services.</p>
        <p>
          We do not knowingly collect personal information from children under 13. If we discover we have collected information from a child under 13, we will delete it immediately.
        </p>
      </SubSection>

      <SubSection title="5.2 Parental Rights">
        <p>
          If you are a parent or guardian and believe your child under 13 has provided us with personal information, please contact us at: privacy@docsmarketplacellc.com
        </p>
      </SubSection>

      <SubSection title="5.3 Information from Children 13-17">
        <p>If you are between 13 and 17 years old:</p>
        <BulletList items={[
          'Your account will have enhanced privacy settings by default',
          'We limit data collection to what is necessary for the service',
          'Parents may request access to or deletion of their child\'s information',
        ]} />
      </SubSection>
    </LegalSection>
  );
}
