import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Community Guidelines | VIB3',
  description: 'VIB3 Community Guidelines - Rules for a safe and positive community.',
};

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm mb-8 inline-block">&larr; Back to Home</Link>
        <div className="border-b border-purple-500/30 pb-6 mb-10">
          <h1 className="text-4xl font-bold mb-3">Community Guidelines</h1>
          <p className="text-white/50">Our rules for a safe and positive community.</p>
        </div>
        <div className="space-y-10 text-white/70 leading-relaxed">
          <section>
            <p>VIB3 is built for creators to express themselves freely while keeping our community safe and welcoming. These guidelines apply to all content, comments, messages, and interactions on the platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Be Respectful</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Treat everyone with respect, even when you disagree</li>
              <li>No harassment, bullying, or intimidation</li>
              <li>No hate speech based on race, ethnicity, religion, gender, sexual orientation, disability, or any protected characteristic</li>
              <li>No doxxing or sharing someone&rsquo;s personal information without consent</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Keep It Safe</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>No content that promotes violence, self-harm, or dangerous activities</li>
              <li>No graphic violence or gore</li>
              <li>No threats of any kind</li>
              <li>No content that glorifies or promotes terrorism or extremism</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Protect Minors</h2>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm mb-4">
              <p className="font-semibold text-red-400">Zero Tolerance</p>
              <p>Any content that sexualizes, exploits, or endangers minors will be immediately removed, reported to NCMEC and law enforcement, and result in a permanent ban.</p>
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>Users must be 13 years or older</li>
              <li>Do not contact minors in an inappropriate manner</li>
              <li>Do not share content featuring minors in unsafe situations</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Be Authentic</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>No spam, scams, or misleading content</li>
              <li>No impersonation of other people or brands</li>
              <li>No artificially inflating views, likes, or followers</li>
              <li>Clearly label sponsored content and advertisements</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Respect Intellectual Property</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Only post content you own or have permission to use</li>
              <li>Give credit to original creators when using their work</li>
              <li>Copyright infringement is subject to our <Link href="/dmca" className="text-purple-400 hover:text-purple-300">DMCA Policy</Link></li>
              <li>3 copyright strikes result in a permanent ban</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">No Illegal Activity</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>No promotion or sale of illegal drugs or substances</li>
              <li>No promotion of illegal weapons or firearms</li>
              <li>No content that facilitates or promotes any criminal activity</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Enforcement</h2>
            <p className="mb-2">Violations of these guidelines may result in:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Content removal</li>
              <li>Temporary account suspension</li>
              <li>Permanent ban for severe or repeated violations</li>
              <li>Reporting to law enforcement when required by law</li>
            </ul>
            <p className="mt-3">If you believe enforcement action was taken in error, you can appeal at <a href="mailto:appeals@docsmarketplacellc.com" className="text-purple-400 hover:text-purple-300">appeals@docsmarketplacellc.com</a>.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Report a Violation</h2>
            <p>Use the in-app Report feature or email us at <a href="mailto:vibe@docsmarketplacellc.com" className="text-purple-400 hover:text-purple-300">vibe@docsmarketplacellc.com</a>.</p>
          </section>
          <p className="text-center text-white/30 text-sm pt-8 border-t border-white/5">&copy; 2025 Docs Marketplace LLC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
