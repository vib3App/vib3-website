import { LegalSection, BulletList } from '../LegalSection';

export function ChangesSection() {
  return (
    <LegalSection title="9. Changes to This Privacy Policy">
      <p>We may update this Privacy Policy from time to time. We will notify you of any changes by:</p>
      <BulletList items={[
        'Posting the new Privacy Policy in the app',
        'Updating the "Last Updated" date',
        'Sending you a notification (for material changes)',
      ]} />
      <p className="font-semibold">
        Your continued use of the Services after changes constitutes acceptance of the updated Privacy Policy.
      </p>
    </LegalSection>
  );
}
