import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Safety Center | VIB3',
  description: 'VIB3 Safety Center - Learn how we keep our community safe.',
};

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm mb-8 inline-block">&larr; Back to Home</Link>
        <div className="border-b border-purple-500/30 pb-6 mb-10">
          <h1 className="text-4xl font-bold mb-3">Safety Center</h1>
          <p className="text-white/50">How we keep VIB3 safe for everyone.</p>
        </div>
        <div className="space-y-8">
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Our Commitment to Safety</h2>
            <p className="text-white/70 text-sm leading-relaxed">VIB3 is committed to creating a safe, welcoming environment for all users. We use a combination of automated technology and human review to enforce our community standards and keep harmful content off the platform.</p>
          </section>
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Child Safety</h2>
            <div className="text-white/70 text-sm space-y-3 leading-relaxed">
              <p>Protecting minors is our top priority. We enforce strict policies:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Users must be 13 years or older (COPPA compliance)</li>
                <li>Age verification at signup</li>
                <li>Automated CSAM detection using Google Cloud Vision API</li>
                <li>Immediate removal and reporting to NCMEC for detected CSAM</li>
                <li>Accounts of underage users are deleted upon discovery</li>
                <li>Zero tolerance policy for content that exploits minors</li>
              </ul>
            </div>
          </section>
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Content Moderation</h2>
            <div className="text-white/70 text-sm space-y-3 leading-relaxed">
              <p>We prohibit content that includes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Hate speech, harassment, and bullying</li>
                <li>Violence, graphic content, and gore</li>
                <li>Spam, scams, and misinformation</li>
                <li>Copyright-infringing material</li>
                <li>Sexually explicit content without appropriate context</li>
              </ul>
              <p>Violations result in content removal. Repeated violations lead to account suspension or permanent ban.</p>
            </div>
          </section>
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Your Safety Tools</h2>
            <div className="text-white/70 text-sm space-y-3 leading-relaxed">
              <ul className="list-disc list-inside space-y-1">
                <li><span className="text-white font-medium">Block users</span> &mdash; Prevent someone from seeing your content or contacting you</li>
                <li><span className="text-white font-medium">Report content</span> &mdash; Flag videos, comments, or profiles for review</li>
                <li><span className="text-white font-medium">Privacy settings</span> &mdash; Control who can message you, duet with you, and view your profile</li>
                <li><span className="text-white font-medium">Comment filters</span> &mdash; Filter or disable comments on your videos</li>
                <li><span className="text-white font-medium">Restricted mode</span> &mdash; Limit the appearance of content that may not be appropriate</li>
              </ul>
            </div>
          </section>
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">For Parents &amp; Guardians</h2>
            <div className="text-white/70 text-sm space-y-3 leading-relaxed">
              <p>We encourage parents to stay involved in their teen&rsquo;s online activity:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Review privacy settings together</li>
                <li>Enable restricted mode for content filtering</li>
                <li>Discuss safe online behavior and what to do if they encounter something uncomfortable</li>
                <li>Contact us at <a href="mailto:vibe@docsmarketplacellc.com" className="text-purple-400 hover:text-purple-300">vibe@docsmarketplacellc.com</a> with any concerns</li>
              </ul>
            </div>
          </section>
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Report a Safety Concern</h2>
            <div className="text-white/70 text-sm space-y-2">
              <p>If you encounter any safety issues on VIB3, please reach out immediately:</p>
              <p>Email: <a href="mailto:vibe@docsmarketplacellc.com" className="text-purple-400 hover:text-purple-300">vibe@docsmarketplacellc.com</a></p>
              <p>You can also use the in-app Report feature on any video, comment, or profile.</p>
              <p className="mt-3">If someone is in immediate danger, please contact local law enforcement or call 911.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
