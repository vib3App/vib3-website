import { LegalSection, SubSection, BulletList } from '../LegalSection';

export function ContentSection() {
  return (
    <LegalSection title="3. User Content">
      <SubSection title="3.1 Your Content">
        <p>You retain all rights to the content you upload, post, or share on the Services (&quot;User Content&quot;), including:</p>
        <BulletList items={['Videos', 'Comments', 'Messages', 'Profile information', 'Any other content you create']} />
      </SubSection>

      <SubSection title="3.2 License to Use Your Content">
        <p>By posting User Content, you grant us a <strong>worldwide, non-exclusive, royalty-free, transferable, sublicensable license</strong> to:</p>
        <BulletList items={[
          'Use, reproduce, distribute, and display your User Content',
          'Modify, adapt, and create derivative works of your User Content',
          'Promote and distribute your User Content across our Services and third-party platforms',
          'Allow other users to access, view, and share your User Content',
        ]} />
        <p className="font-semibold">
          This license continues even if you stop using the Services, but ends when you delete your User Content or account (subject to a 30-day cache/backup grace period).
        </p>
      </SubSection>

      <SubSection title="3.3 Content Ownership">
        <p>You represent and warrant that:</p>
        <BulletList items={[
          'You own or have the necessary rights to all User Content you post',
          'Your User Content does not infringe any third-party rights',
          'Your User Content complies with these Terms and all applicable laws',
        ]} />
      </SubSection>
    </LegalSection>
  );
}
