import { BulletList } from '../LegalSection';

export function SummarySection() {
  return (
    <>
      <hr className="border-neutral-800 my-8" />
      <div className="bg-neutral-900 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Summary of Key Points</h3>
        <BulletList items={[
          'We collect account info, content, device info, and usage data',
          'Your content is PUBLIC by default',
          'We use third-party services (Bunny CDN, MongoDB, DigitalOcean, Google, Apple)',
          'You must be 13+ to use our Services',
          'You can delete your account and data',
          'We do NOT sell your personal information',
          'We are required to report CSAM to authorities',
          'Face detection is processed locally on your device',
          'Contact privacy@docsmarketplacellc.com for privacy questions',
        ]} />
      </div>
      <p className="text-center text-neutral-400 mt-8">
        <strong>By using VIB3 or ViralVIB3, you agree to this Privacy Policy.</strong>
      </p>
    </>
  );
}
