import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us | VIB3',
  description: 'Contact VIB3 - Get in touch with our team.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm mb-8 inline-block">&larr; Back to Home</Link>
        <div className="border-b border-purple-500/30 pb-6 mb-10">
          <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-white/50">We&rsquo;d love to hear from you.</p>
        </div>
        <div className="space-y-8">
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">General Inquiries</h2>
            <div className="text-white/70 text-sm space-y-2">
              <p>For general questions, feedback, or partnership opportunities:</p>
              <p>Email: <a href="mailto:vibe@docsmarketplacellc.com" className="text-purple-400 hover:text-purple-300">vibe@docsmarketplacellc.com</a></p>
            </div>
          </section>
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Privacy Concerns</h2>
            <div className="text-white/70 text-sm space-y-2">
              <p>For data requests, privacy questions, or exercising your GDPR/CCPA rights:</p>
              <p>Email: <a href="mailto:privacy@docsmarketplacellc.com" className="text-purple-400 hover:text-purple-300">privacy@docsmarketplacellc.com</a></p>
            </div>
          </section>
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Copyright Claims (DMCA)</h2>
            <div className="text-white/70 text-sm space-y-2">
              <p>To submit a DMCA takedown notice or counter-notice:</p>
              <p>Email: <a href="mailto:dmca@docsmarketplacellc.com" className="text-purple-400 hover:text-purple-300">dmca@docsmarketplacellc.com</a></p>
              <p>See our <Link href="/dmca" className="text-purple-400 hover:text-purple-300">DMCA Policy</Link> for details.</p>
            </div>
          </section>
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Appeals</h2>
            <div className="text-white/70 text-sm space-y-2">
              <p>If your content was removed or account suspended and you believe it was in error:</p>
              <p>Email: <a href="mailto:appeals@docsmarketplacellc.com" className="text-purple-400 hover:text-purple-300">appeals@docsmarketplacellc.com</a></p>
              <p>We acknowledge appeals within 48 hours and provide a decision within 7 business days.</p>
            </div>
          </section>
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Legal</h2>
            <div className="text-white/70 text-sm space-y-2">
              <p>For legal inquiries and law enforcement requests:</p>
              <p>Email: <a href="mailto:legal@docsmarketplacellc.com" className="text-purple-400 hover:text-purple-300">legal@docsmarketplacellc.com</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
