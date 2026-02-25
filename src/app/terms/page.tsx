import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | VIB3',
  description: 'VIB3 Terms of Service - Rules and guidelines for using the platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm mb-8 inline-block">&larr; Back to Home</Link>
        <div className="border-b border-purple-500/30 pb-6 mb-10">
          <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-white/40 text-sm">Last Updated: December 12, 2025 &middot; Effective: December 12, 2025</p>
        </div>
        <div className="space-y-10 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing or using VIB3 or ViralVIB3 (&ldquo;Services&rdquo;), you agree to these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, do not use our Services.</p>
            <p className="mt-2"><span className="text-white font-medium">Operator:</span> Docs Marketplace LLC</p>
            <p><span className="text-white font-medium">Contact:</span> vibe@docsmarketplacellc.com</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Eligibility</h2>
            <p className="mb-2">You must be:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><span className="text-white font-medium">13 years or older</span> (COPPA requirement)</li>
              <li>Capable of forming a binding contract</li>
              <li>Not prohibited from using the Services under applicable law</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. User Content</h2>
            <h3 className="text-lg font-medium text-white/90 mb-2">3.1 Your Content</h3>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>You retain ownership of content you post</li>
              <li>You grant us a non-exclusive, worldwide license to use, display, and distribute your content</li>
            </ul>
            <h3 className="text-lg font-medium text-white/90 mb-2">3.2 Prohibited Content</h3>
            <p className="mb-2">You may NOT post:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Child sexual abuse material (CSAM)</li>
              <li>Hate speech, harassment, bullying</li>
              <li>Violence, graphic content, gore</li>
              <li>Sexually explicit content (except educational/artistic with warnings)</li>
              <li>Spam, scams, or misleading information</li>
              <li>Copyright-infringing content</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Copyright Policy (DMCA)</h2>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm space-y-1 mb-4">
              <p className="font-semibold text-white">DMCA Designated Agent</p>
              <p>Docs Marketplace LLC</p>
              <p>Email: dmca@docsmarketplacellc.com</p>
              <p>DMCA Registration: DMCA-1069216</p>
            </div>
            <h3 className="text-lg font-medium text-white/90 mb-2">4.1 Repeat Infringer Policy</h3>
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-sm">
              <p className="font-semibold text-yellow-400">Warning:</p>
              <p>Users with 3 or more valid DMCA strikes will be permanently banned.</p>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. CSAM Detection</h2>
            <p className="mb-2">We use automated systems to detect child sexual abuse material. Detected content is:</p>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>Immediately removed</li>
              <li>Reported to NCMEC (National Center for Missing &amp; Exploited Children)</li>
              <li>May result in account termination and law enforcement contact</li>
            </ul>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm">
              <p className="font-semibold text-red-400">Federal Crime:</p>
              <p>Uploading CSAM is a federal crime (18 U.S.C. &sect; 2252).</p>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Account Termination</h2>
            <p className="mb-2">We may suspend or terminate accounts for violations including:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Posting prohibited content</li>
              <li>Copyright infringement (3-strike policy)</li>
              <li>Harassment or bullying</li>
              <li>Violating these Terms</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6.1 Appeals Process</h2>
            <p className="mb-2">If your content was removed or account suspended in error, you may appeal:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><span className="text-white font-medium">Email:</span> appeals@docsmarketplacellc.com</li>
              <li><span className="text-white font-medium">Include:</span> Your username, description of the action, and why you believe it was incorrect</li>
              <li><span className="text-white font-medium">Response Time:</span> We acknowledge appeals within 48 hours and provide a decision within 7 business days</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Disclaimers</h2>
            <p className="mb-2">Services are provided &ldquo;AS IS&rdquo; without warranties. We are not liable for:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>User-generated content</li>
              <li>Service interruptions</li>
              <li>Data loss</li>
              <li>Third-party actions</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Contact Us</h2>
            <p className="mb-3">For questions about these Terms:</p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm space-y-1">
              <p>General: vibe@docsmarketplacellc.com</p>
              <p>Privacy: privacy@docsmarketplacellc.com</p>
              <p>DMCA: dmca@docsmarketplacellc.com</p>
              <p>Appeals: appeals@docsmarketplacellc.com</p>
              <p>Legal: legal@docsmarketplacellc.com</p>
            </div>
          </section>
          <p className="text-center text-white/30 text-sm pt-8 border-t border-white/5">&copy; 2025 Docs Marketplace LLC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
