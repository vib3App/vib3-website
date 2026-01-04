import { LegalSection, SubSection, BulletList } from '../LegalSection';

export function ModerationSection() {
  return (
    <LegalSection title="5. Content Moderation">
      <SubSection title="5.1 Our Rights">
        <p>We reserve the right to:</p>
        <BulletList items={[
          'Remove or refuse to post any User Content',
          'Suspend or terminate accounts',
          'Investigate violations',
          'Cooperate with law enforcement',
          'Moderate content at our sole discretion',
        ]} />
      </SubSection>

      <SubSection title="5.2 Reporting Violations">
        <p>If you encounter content that violates these Terms:</p>
        <BulletList items={[
          'Tap the flag icon on the content',
          'Select the reason for reporting',
          'Submit your report',
        ]} />
      </SubSection>

      <SubSection title="5.3 Repeat Infringer Policy">
        <p>Users who repeatedly violate these Terms will have their accounts permanently terminated.</p>
        <p className="font-semibold">
          Copyright Repeat Infringers: Users who receive three (3) valid DMCA takedown notices will be permanently banned (Three Strikes Rule).
        </p>
      </SubSection>

      <SubSection title="5.4 Appeals Process">
        <p>If your content was removed or your account was suspended and you believe this was done in error, you may submit an appeal:</p>
        <ul>
          <li><strong>Email:</strong> appeals@docsmarketplacellc.com</li>
          <li><strong>Subject Line:</strong> &quot;Content Removal Appeal&quot; or &quot;Account Suspension Appeal&quot;</li>
        </ul>
        <p>Appeals are reviewed within 7 business days.</p>
      </SubSection>
    </LegalSection>
  );
}
