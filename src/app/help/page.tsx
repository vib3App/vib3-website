import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Help Center | VIB3',
  description: 'Get help with VIB3 - FAQs, account support, and contact information.',
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm mb-8 inline-block">&larr; Back to Home</Link>
        <div className="border-b border-purple-500/30 pb-6 mb-10">
          <h1 className="text-4xl font-bold mb-3">Help Center</h1>
          <p className="text-white/50">Find answers and get support for VIB3.</p>
        </div>
        <div className="space-y-8">
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Getting Started</h2>
            <div className="space-y-4 text-white/70 text-sm">
              <div>
                <h3 className="text-white font-medium mb-1">How do I create an account?</h3>
                <p>Download VIB3 from the App Store or Google Play, then sign up with your email, Google, or Apple account. You must be 13 years or older to use VIB3.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">How do I post a video?</h3>
                <p>Tap the + button on the bottom navigation bar to record or upload a video. Add effects, filters, text, and music before posting.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">How do I go live?</h3>
                <p>Tap the + button and select &ldquo;Go Live.&rdquo; Give your stream a title and start broadcasting to your followers in real time.</p>
              </div>
            </div>
          </section>
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Account &amp; Privacy</h2>
            <div className="space-y-4 text-white/70 text-sm">
              <div>
                <h3 className="text-white font-medium mb-1">How do I delete my account?</h3>
                <p>Go to Settings &rarr; Delete Account. Your data will be permanently removed after a 30-day grace period.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">How do I download my data?</h3>
                <p>Go to Settings &rarr; Download My Data to export your information in JSON format.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">How do I make my account private?</h3>
                <p>Go to Settings &rarr; Privacy to control who can see your content, send you messages, and interact with your profile.</p>
              </div>
            </div>
          </section>
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Monetization</h2>
            <div className="space-y-4 text-white/70 text-sm">
              <div>
                <h3 className="text-white font-medium mb-1">How do I earn money on VIB3?</h3>
                <p>Creators can earn through tips and gifts from viewers, subscriber-only content, and the Creator Fund (coming soon).</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">How do I withdraw earnings?</h3>
                <p>Go to Settings &rarr; Monetization &rarr; Payouts to connect your Stripe account and withdraw your balance.</p>
              </div>
            </div>
          </section>
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Reporting &amp; Safety</h2>
            <div className="space-y-4 text-white/70 text-sm">
              <div>
                <h3 className="text-white font-medium mb-1">How do I report content or a user?</h3>
                <p>Tap the &ldquo;...&rdquo; menu on any video or profile and select &ldquo;Report.&rdquo; Our moderation team reviews all reports.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">How do I block someone?</h3>
                <p>Go to their profile, tap the &ldquo;...&rdquo; menu, and select &ldquo;Block.&rdquo; Blocked users cannot see your content or contact you.</p>
              </div>
            </div>
          </section>
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Still Need Help?</h2>
            <div className="text-white/70 text-sm space-y-2">
              <p>If you can&rsquo;t find the answer you&rsquo;re looking for, reach out to us:</p>
              <p>Email: <a href="mailto:vibe@docsmarketplacellc.com" className="text-purple-400 hover:text-purple-300">vibe@docsmarketplacellc.com</a></p>
              <p>We typically respond within 24-48 hours.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
