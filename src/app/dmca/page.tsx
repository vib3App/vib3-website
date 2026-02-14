import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'DMCA Copyright Notice | VIB3',
  description: 'VIB3 DMCA Copyright Infringement Notice - How to file takedown and counter notices.',
};

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm mb-8 inline-block">&larr; Back to Home</Link>
        <div className="border-b border-purple-500/30 pb-6 mb-10">
          <h1 className="text-4xl font-bold mb-3">DMCA Copyright Infringement Notice</h1>
        </div>
        <div className="space-y-10 text-white/70 leading-relaxed">
          <section>
            <p>Docs Marketplace LLC respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA), 17 U.S.C. &sect; 512.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Designated DMCA Agent</h2>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm space-y-1">
              <p><span className="text-white font-medium">Company:</span> Docs Marketplace LLC</p>
              <p><span className="text-white font-medium">Agent Name:</span> Tavis McDonald</p>
              <p><span className="text-white font-medium">Email:</span> vibe@docsmarketplacellc.com</p>
              <p><span className="text-white font-medium">Address:</span> 4605 E 179th Pl S, Bixby, OK 74008</p>
              <p><span className="text-white font-medium">Phone:</span> (832) 622-0646</p>
              <p><span className="text-white font-medium">DMCA Registration Number:</span> DMCA-1069216</p>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Filing a DMCA Takedown Notice</h2>
            <p className="mb-3">To file a copyright infringement notice, send an email to <span className="text-white font-medium">vibe@docsmarketplacellc.com</span> with the following information:</p>
            <ol className="list-decimal list-inside space-y-3">
              <li><span className="text-white font-medium">Identification of the copyrighted work</span> &mdash; Description of the work you own and copyright registration number (if applicable)</li>
              <li><span className="text-white font-medium">Identification of infringing material</span> &mdash; URL of the infringing content on VIB3 or ViralVIB3</li>
              <li><span className="text-white font-medium">Your contact information</span> &mdash; Full name, email address, physical address, phone number</li>
              <li><span className="text-white font-medium">Good faith statement:</span> &ldquo;I have a good faith belief that use of the copyrighted materials described above is not authorized by the copyright owner, its agent, or the law.&rdquo;</li>
              <li><span className="text-white font-medium">Accuracy statement:</span> &ldquo;I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or am authorized to act on behalf of the owner.&rdquo;</li>
              <li><span className="text-white font-medium">Signature:</span> Physical or electronic signature</li>
            </ol>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Response Time</h2>
            <p>We will respond to valid DMCA notices within <span className="text-white font-medium">24-48 hours</span>.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Filing a Counter-Notice</h2>
            <p className="mb-3">If your content was removed and you believe it was done in error, you may file a counter-notice to <span className="text-white font-medium">vibe@docsmarketplacellc.com</span> with:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Your contact information</li>
              <li>Identification of the removed content (URL)</li>
              <li>Statement under penalty of perjury that you have a good faith belief the content was removed by mistake</li>
              <li>Consent to jurisdiction of Federal District Court</li>
              <li>Physical or electronic signature</li>
            </ol>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Repeat Infringer Policy</h2>
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-sm">
              <p className="font-semibold text-yellow-400">Warning:</p>
              <p>Users with 3 or more validated copyright strikes will be permanently banned.</p>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">False Claims</h2>
            <p>Knowingly submitting false DMCA claims may result in legal liability under 17 U.S.C. &sect; 512(f).</p>
          </section>
          <section>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm space-y-1">
              <p><span className="text-white font-medium">For general inquiries:</span> vibe@docsmarketplacellc.com</p>
              <p><span className="text-white font-medium">For legal matters:</span> legal@docsmarketplacellc.com</p>
            </div>
          </section>
          <p className="text-center text-white/30 text-sm pt-8 border-t border-white/5">&copy; 2025 Docs Marketplace LLC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
