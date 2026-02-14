import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | VIB3',
  description: 'VIB3 Privacy Policy - How we collect, use, and protect your information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm mb-8 inline-block">&larr; Back to Home</Link>
        <div className="border-b border-purple-500/30 pb-6 mb-10">
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-white/40 text-sm">Last Updated: December 12, 2025 &middot; Effective: December 12, 2025</p>
        </div>
        <div className="space-y-10 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>Docs Marketplace LLC (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates VIB3 and ViralVIB3 (the &ldquo;Services&rdquo;), short-form video sharing platforms. This Privacy Policy explains how we collect, use, disclose, and protect your information.</p>
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 text-sm">
              <p className="font-semibold text-white mb-1">Contact Information</p>
              <p>Email: vibe@docsmarketplacellc.com</p>
              <p>Address: 4605 E 179th Pl S, Bixby, OK 74008</p>
              <p>Phone: (832) 622-0646</p>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>
            <h3 className="text-lg font-medium text-white/90 mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>Account information (name, email, username, birthdate)</li>
              <li>Profile information (bio, profile picture)</li>
              <li>Content you create (videos, comments, messages)</li>
              <li>Communications with us</li>
            </ul>
            <h3 className="text-lg font-medium text-white/90 mb-2">2.2 Information Collected Automatically</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Device information (model, OS, identifiers)</li>
              <li>Usage data (videos watched, interactions, session duration)</li>
              <li>Location data (approximate location from IP address)</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p className="mb-2">We use your information to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Provide and improve our Services</li>
              <li>Personalize content and recommendations</li>
              <li>Communicate with you</li>
              <li>Ensure safety and security</li>
              <li>Comply with legal obligations</li>
              <li>Detect and prevent fraud, abuse, and illegal activity</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Legal Basis for Processing (GDPR)</h2>
            <p className="mb-2">We process your data under the following legal bases:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><span className="text-white font-medium">Consent:</span> Cookie tracking, marketing communications</li>
              <li><span className="text-white font-medium">Contract:</span> Providing Services you signed up for</li>
              <li><span className="text-white font-medium">Legitimate Interest:</span> Security, fraud prevention, service improvement</li>
              <li><span className="text-white font-medium">Legal Obligation:</span> COPPA, CSAM detection, law enforcement requests</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Child Safety (COPPA Compliance)</h2>
            <p className="mb-2">Our Services are NOT intended for children under 13. We:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Require users to be 13+ years old</li>
              <li>Verify age at signup</li>
              <li>Delete accounts of users found to be under 13</li>
              <li>Do not knowingly collect data from children under 13</li>
            </ul>
            <p className="mt-3">If you believe a child under 13 is using our Services, contact us immediately at vibe@docsmarketplacellc.com.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. CSAM Detection</h2>
            <p className="mb-2">We use automated systems (Google Cloud Vision API) to detect child sexual abuse material (CSAM). Detected content is:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Immediately removed</li>
              <li>Reported to the National Center for Missing & Exploited Children (NCMEC)</li>
              <li>Preserved for law enforcement (90 days minimum)</li>
              <li>Investigated by our team</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Your Rights (GDPR &amp; CCPA)</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li><span className="text-white font-medium">Access:</span> Request a copy of your data</li>
              <li><span className="text-white font-medium">Delete:</span> Request deletion of your account (30-day grace period)</li>
              <li><span className="text-white font-medium">Export:</span> Download your data in JSON format</li>
              <li><span className="text-white font-medium">Correct:</span> Update incorrect information</li>
              <li><span className="text-white font-medium">Object:</span> Opt-out of certain processing</li>
            </ul>
            <p className="font-medium text-white mb-2">To exercise your rights:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Account Deletion: Settings &rarr; Delete Account</li>
              <li>Data Export: Settings &rarr; Download My Data</li>
              <li>Other requests: vibe@docsmarketplacellc.com</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Data Retention</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><span className="text-white font-medium">Active accounts:</span> Data retained while account is active</li>
              <li><span className="text-white font-medium">Deleted accounts:</span> 30-day grace period, then permanent deletion</li>
              <li><span className="text-white font-medium">Compliance logs:</span> 7 years (legal requirement)</li>
              <li><span className="text-white font-medium">CSAM reports:</span> 90 days minimum (federal law)</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. Data Security</h2>
            <p className="mb-2">We implement:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Encryption in transit (HTTPS/TLS)</li>
              <li>Encryption at rest (database encryption)</li>
              <li>Access controls and authentication</li>
              <li>Regular security audits</li>
              <li>CSAM detection and content moderation</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">10. Contact Us</h2>
            <p className="mb-3">For questions about this Privacy Policy:</p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm space-y-1">
              <p>Privacy: privacy@docsmarketplacellc.com</p>
              <p>General: vibe@docsmarketplacellc.com</p>
              <p>DMCA: dmca@docsmarketplacellc.com</p>
              <p>Mail: Docs Marketplace LLC, 4605 E 179th Pl S, Bixby, OK 74008</p>
              <p>Phone: (832) 622-0646</p>
            </div>
          </section>
          <p className="text-center text-white/30 text-sm pt-8 border-t border-white/5">&copy; 2025 Docs Marketplace LLC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
