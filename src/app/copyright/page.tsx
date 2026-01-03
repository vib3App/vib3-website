import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Copyright Policy | VIB3',
  description: 'VIB3 Copyright Policy - DMCA procedures and intellectual property guidelines.',
};

export default function CopyrightPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <article className="prose prose-invert prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-white mb-2">Copyright Policy</h1>
          <p className="text-neutral-400 mb-8">
            <strong>Effective Date:</strong> January 2, 2026 | <strong>Last Updated:</strong> January 2, 2026
          </p>

          <hr className="border-neutral-800 my-8" />

          <div className="bg-neutral-900 p-6 rounded-lg mb-8">
            <p className="text-white font-semibold">
              VIB3 respects the intellectual property rights of others and expects users to do the same. This Copyright Policy explains how we handle copyright infringement claims under the Digital Millennium Copyright Act (DMCA).
            </p>
          </div>

          <Section title="Respect for Intellectual Property">
            <p>
              VIB3 is committed to protecting the rights of copyright owners. We promptly respond to notices of alleged copyright infringement that comply with applicable law.
            </p>
            <p>
              If you believe your copyrighted work has been copied and posted on VIB3 in a way that constitutes copyright infringement, please follow the DMCA takedown procedure below.
            </p>
          </Section>

          <Section title="DMCA Takedown Procedure">
            <h3 className="text-xl font-semibold text-white mt-6">Filing a DMCA Notice</h3>
            <p>
              To file a valid DMCA takedown notice, you must provide the following information in writing to our designated DMCA agent:
            </p>
            <ol>
              <li>
                <strong>Identification of the copyrighted work:</strong> Describe the copyrighted work you claim has been infringed. If multiple works are covered by a single notification, provide a representative list.
              </li>
              <li>
                <strong>Identification of the infringing material:</strong> Provide the URL or other specific identification of the content you claim is infringing, with enough detail for us to locate it.
              </li>
              <li>
                <strong>Your contact information:</strong> Include your name, address, telephone number, and email address.
              </li>
              <li>
                <strong>Good faith statement:</strong> A statement that you have a good faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law.
              </li>
              <li>
                <strong>Accuracy statement:</strong> A statement, made under penalty of perjury, that the information in the notification is accurate and that you are authorized to act on behalf of the copyright owner.
              </li>
              <li>
                <strong>Signature:</strong> A physical or electronic signature of the copyright owner or person authorized to act on their behalf.
              </li>
            </ol>

            <div className="bg-neutral-900 p-6 rounded-lg mt-6">
              <p className="font-semibold text-white mb-4">Send DMCA Notices To:</p>
              <p className="text-white">Docs Marketplace LLC</p>
              <p className="text-white">DMCA Agent</p>
              <p className="text-white">Email: <strong>dmca@docsmarketplacellc.com</strong></p>
            </div>

            <h3 className="text-xl font-semibold text-white mt-6">What Happens After You File</h3>
            <ol>
              <li>We review the notice for completeness and validity</li>
              <li>If valid, we remove or disable access to the allegedly infringing content</li>
              <li>We notify the user who posted the content</li>
              <li>We provide the user with information about filing a counter-notification</li>
            </ol>
          </Section>

          <Section title="Counter-Notification">
            <h3 className="text-xl font-semibold text-white mt-6">If Your Content Was Removed</h3>
            <p>
              If you believe your content was removed by mistake or misidentification, you may file a counter-notification. Your counter-notification must include:
            </p>
            <ol>
              <li>
                <strong>Identification of the removed material:</strong> Describe the material that was removed and where it appeared before removal.
              </li>
              <li>
                <strong>Good faith statement:</strong> A statement under penalty of perjury that you have a good faith belief the material was removed as a result of mistake or misidentification.
              </li>
              <li>
                <strong>Consent to jurisdiction:</strong> A statement that you consent to the jurisdiction of the Federal District Court for the judicial district in which your address is located (or any judicial district if outside the US).
              </li>
              <li>
                <strong>Your contact information:</strong> Your name, address, and telephone number.
              </li>
              <li>
                <strong>Signature:</strong> Your physical or electronic signature.
              </li>
            </ol>

            <div className="bg-neutral-900 p-6 rounded-lg mt-6">
              <p className="font-semibold text-white mb-4">Send Counter-Notifications To:</p>
              <p className="text-white">Email: <strong>dmca@docsmarketplacellc.com</strong></p>
              <p className="text-white">Subject: Counter-Notification</p>
            </div>

            <h3 className="text-xl font-semibold text-white mt-6">What Happens After Counter-Notification</h3>
            <ol>
              <li>We forward your counter-notification to the original complainant</li>
              <li>We inform them they have 10-14 business days to file a court action</li>
              <li>If no court action is filed, we may restore the removed content</li>
            </ol>
          </Section>

          <Section title="Repeat Infringer Policy">
            <p className="font-semibold">
              VIB3 has a policy of terminating, in appropriate circumstances, the accounts of users who are repeat infringers.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">Three Strikes Rule</h3>
            <ul>
              <li><strong>First Strike:</strong> Warning and content removal</li>
              <li><strong>Second Strike:</strong> 7-day account suspension and content removal</li>
              <li><strong>Third Strike:</strong> Permanent account termination</li>
            </ul>
            <p className="mt-4">
              Strikes remain on your account for 12 months. After 12 months without additional strikes, they expire.
            </p>

            <div className="bg-yellow-900/20 border border-yellow-500/30 p-6 rounded-lg mt-6">
              <p className="font-semibold text-yellow-400">Important Note</p>
              <p className="text-white mt-2">
                Filing a false DMCA notice or counter-notification is illegal. You could be liable for damages, including costs and attorney&apos;s fees, if you misrepresent that content is infringing or was removed by mistake.
              </p>
            </div>
          </Section>

          <Section title="Fair Use">
            <p>
              We recognize that copyright law includes provisions for fair use, including:
            </p>
            <ul>
              <li><strong>Commentary and criticism:</strong> Using copyrighted material to comment on or critique the original work</li>
              <li><strong>Parody:</strong> Creating a new work that comments on the original through humor</li>
              <li><strong>News reporting:</strong> Using copyrighted material to report on newsworthy events</li>
              <li><strong>Education:</strong> Using copyrighted material for educational purposes</li>
            </ul>
            <p className="mt-4">
              Fair use is a legal doctrine and is determined on a case-by-case basis considering factors such as:
            </p>
            <ul>
              <li>The purpose and character of the use (commercial vs. educational)</li>
              <li>The nature of the copyrighted work</li>
              <li>The amount and substantiality of the portion used</li>
              <li>The effect on the potential market for the original work</li>
            </ul>
            <p className="mt-4">
              If you believe your use of copyrighted material constitutes fair use, you may include this in your counter-notification.
            </p>
          </Section>

          <Section title="Music and Audio">
            <h3 className="text-xl font-semibold text-white mt-6">Licensed Music</h3>
            <p>
              VIB3 provides a library of licensed music that you may use in your videos. Using music from this library does not constitute copyright infringement.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">Third-Party Music</h3>
            <p>
              If you use music that is not from our licensed library, you are responsible for obtaining the necessary rights and licenses. Using unlicensed music may result in:
            </p>
            <ul>
              <li>Automatic muting of audio</li>
              <li>Content removal due to DMCA claims</li>
              <li>Account strikes</li>
            </ul>
          </Section>

          <Section title="Trademark Notice">
            <p>
              VIB3 also respects trademark rights. If you believe your trademark has been violated on our platform, please contact us at: <strong>legal@docsmarketplacellc.com</strong>
            </p>
          </Section>

          <Section title="Contact Information">
            <div className="bg-neutral-900 p-6 rounded-lg mt-4">
              <p className="font-semibold text-white mb-4">DMCA Agent</p>
              <p className="text-white">Docs Marketplace LLC</p>
              <ul className="space-y-2 mt-4">
                <li><strong>Email:</strong> dmca@docsmarketplacellc.com</li>
                <li><strong>Legal:</strong> legal@docsmarketplacellc.com</li>
              </ul>
              <p className="mt-4 text-neutral-400">
                <strong>Response Time:</strong> We respond to valid DMCA notices within 24-48 hours.
              </p>
            </div>
          </Section>

          <hr className="border-neutral-800 my-8" />

          <div className="bg-neutral-900 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Summary</h3>
            <ul className="space-y-2">
              <li>We respect intellectual property rights</li>
              <li>We comply with the DMCA</li>
              <li>Copyright owners can submit takedown notices to dmca@docsmarketplacellc.com</li>
              <li>Users can file counter-notifications if content was removed in error</li>
              <li>Repeat infringers will have their accounts terminated (Three Strikes)</li>
              <li>Fair use is recognized and considered</li>
              <li>Use our licensed music library to avoid copyright issues</li>
            </ul>
          </div>

          <p className="text-center text-neutral-400 mt-8">
            <strong>For copyright questions, contact: dmca@docsmarketplacellc.com</strong>
          </p>
        </article>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="text-neutral-300 space-y-4">{children}</div>
    </section>
  );
}
