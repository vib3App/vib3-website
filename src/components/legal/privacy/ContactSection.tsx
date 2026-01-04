import { LegalSection } from '../LegalSection';

export function ContactSection() {
  return (
    <LegalSection title="10. Contact Us">
      <p>If you have questions about this Privacy Policy or our privacy practices, contact us:</p>
      <div className="bg-neutral-900 p-6 rounded-lg mt-4">
        <p className="font-semibold text-white mb-4">Docs Marketplace LLC</p>
        <ul className="space-y-2">
          <li><strong>Email:</strong> privacy@docsmarketplacellc.com</li>
          <li><strong>Legal Email:</strong> vibe@docsmarketplacellc.com</li>
          <li><strong>Copyright (DMCA):</strong> dmca@docsmarketplacellc.com</li>
        </ul>
        <p className="mt-4 text-neutral-400">
          <strong>Response Time:</strong> We will respond to privacy requests within 30 days.
        </p>
      </div>
    </LegalSection>
  );
}
