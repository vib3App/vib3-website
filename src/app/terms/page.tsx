import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | VIB3',
  description: 'VIB3 Terms of Service - Rules and guidelines for using our platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <article className="prose prose-invert prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-neutral-400 mb-8">
            <strong>Effective Date:</strong> December 12, 2025 | <strong>Last Updated:</strong> December 12, 2025
          </p>

          <hr className="border-neutral-800 my-8" />

          <div className="bg-neutral-900 p-6 rounded-lg mb-8">
            <p className="text-white font-semibold">
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and Docs Marketplace LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) concerning your access to and use of the VIB3 and ViralVIB3 mobile applications and services (collectively, the &quot;Services&quot;).
            </p>
            <p className="text-white font-semibold mt-4">
              BY ACCESSING OR USING THE SERVICES, YOU AGREE TO BE BOUND BY THESE TERMS. IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THE SERVICES.
            </p>
          </div>

          <Section title="1. Eligibility">
            <h3 className="text-xl font-semibold text-white mt-6">1.1 Age Requirement</h3>
            <p>
              You must be at least <strong>13 years of age</strong> to use the Services. If you are under 18 years of age, you represent that you have your parent or legal guardian&apos;s permission to use the Services.
            </p>
            <p><strong>By using the Services, you represent and warrant that:</strong></p>
            <ul>
              <li>You are at least 13 years old</li>
              <li>You have not been previously suspended or removed from the Services</li>
              <li>You are not prohibited from using the Services under applicable law</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">1.2 Geographic Restrictions</h3>
            <p>
              The Services are intended for users in the United States. If you access the Services from outside the United States, you are responsible for compliance with local laws.
            </p>
          </Section>

          <Section title="2. Account Registration">
            <h3 className="text-xl font-semibold text-white mt-6">2.1 Account Creation</h3>
            <p>To use certain features of the Services, you must create an account. When creating an account, you agree to:</p>
            <ul>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">2.2 Account Security</h3>
            <p className="font-semibold">
              You are responsible for all activity on your account. We are not liable for any loss or damage from unauthorized use of your account due to your failure to maintain security.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">2.3 Account Termination</h3>
            <p>We reserve the right to suspend or terminate your account at any time, with or without notice, for:</p>
            <ul>
              <li>Violation of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Extended periods of inactivity</li>
              <li>Any reason at our sole discretion</li>
            </ul>
          </Section>

          <Section title="3. User Content">
            <h3 className="text-xl font-semibold text-white mt-6">3.1 Your Content</h3>
            <p>You retain all rights to the content you upload, post, or share on the Services (&quot;User Content&quot;), including:</p>
            <ul>
              <li>Videos</li>
              <li>Comments</li>
              <li>Messages</li>
              <li>Profile information</li>
              <li>Any other content you create</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">3.2 License to Use Your Content</h3>
            <p>
              By posting User Content, you grant us a <strong>worldwide, non-exclusive, royalty-free, transferable, sublicensable license</strong> to:
            </p>
            <ul>
              <li>Use, reproduce, distribute, and display your User Content</li>
              <li>Modify, adapt, and create derivative works of your User Content</li>
              <li>Promote and distribute your User Content across our Services and third-party platforms</li>
              <li>Allow other users to access, view, and share your User Content</li>
            </ul>
            <p className="font-semibold">
              This license continues even if you stop using the Services, but ends when you delete your User Content or account (subject to a 30-day cache/backup grace period).
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">3.3 Content Ownership</h3>
            <p>You represent and warrant that:</p>
            <ul>
              <li>You own or have the necessary rights to all User Content you post</li>
              <li>Your User Content does not infringe any third-party rights</li>
              <li>Your User Content complies with these Terms and all applicable laws</li>
            </ul>
          </Section>

          <Section title="4. Prohibited Conduct">
            <h3 className="text-xl font-semibold text-white mt-6">4.1 You May NOT:</h3>

            <p className="font-semibold text-red-400">Illegal Activity:</p>
            <ul>
              <li>Violate any local, state, national, or international law</li>
              <li>Upload content depicting illegal activities</li>
              <li>Engage in fraud, theft, or deceptive practices</li>
            </ul>

            <p className="font-semibold text-red-400 mt-4">Harmful Content:</p>
            <ul>
              <li>Post content containing violence, gore, or graphic injury</li>
              <li>Share content promoting self-harm or suicide</li>
              <li>Upload content depicting abuse or exploitation of minors (CSAM)</li>
              <li>Share content promoting terrorism or extremism</li>
            </ul>

            <p className="font-semibold text-red-400 mt-4">Hateful Conduct:</p>
            <ul>
              <li>Post content that promotes hatred, discrimination, or violence against individuals or groups</li>
              <li>Use slurs, derogatory terms, or hateful symbols</li>
            </ul>

            <p className="font-semibold text-red-400 mt-4">Harassment and Bullying:</p>
            <ul>
              <li>Harass, threaten, intimidate, or bully other users</li>
              <li>Share private information of others without consent (doxxing)</li>
              <li>Impersonate others or create fake accounts</li>
            </ul>

            <p className="font-semibold text-red-400 mt-4">Sexual Content:</p>
            <ul>
              <li>Post pornography or sexually explicit content</li>
              <li>Share content depicting nudity or sexual activity</li>
              <li>Solicit sexual content or services</li>
            </ul>

            <p className="font-semibold text-red-400 mt-4">Spam and Manipulation:</p>
            <ul>
              <li>Send spam, junk mail, chain letters, or unsolicited messages</li>
              <li>Artificially inflate views, likes, or followers</li>
              <li>Use bots, scripts, or automated tools to interact with the Services</li>
            </ul>

            <p className="font-semibold text-red-400 mt-4">Platform Integrity:</p>
            <ul>
              <li>Circumvent or disable security features</li>
              <li>Access other users&apos; accounts without permission</li>
              <li>Reverse engineer, decompile, or disassemble the Services</li>
              <li>Introduce viruses, malware, or harmful code</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">4.2 Consequences</h3>
            <p>Violation of these Terms may result in:</p>
            <ul>
              <li>Content removal</li>
              <li>Account suspension or termination</li>
              <li>Legal action</li>
              <li>Reporting to law enforcement (for illegal content)</li>
            </ul>
          </Section>

          <Section title="5. Content Moderation">
            <h3 className="text-xl font-semibold text-white mt-6">5.1 Our Rights</h3>
            <p>We reserve the right to:</p>
            <ul>
              <li>Remove or refuse to post any User Content</li>
              <li>Suspend or terminate accounts</li>
              <li>Investigate violations</li>
              <li>Cooperate with law enforcement</li>
              <li>Moderate content at our sole discretion</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">5.2 Reporting Violations</h3>
            <p>If you encounter content that violates these Terms:</p>
            <ul>
              <li>Tap the flag icon on the content</li>
              <li>Select the reason for reporting</li>
              <li>Submit your report</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">5.3 Repeat Infringer Policy</h3>
            <p>Users who repeatedly violate these Terms will have their accounts permanently terminated.</p>
            <p className="font-semibold">
              Copyright Repeat Infringers: Users who receive three (3) valid DMCA takedown notices will be permanently banned (Three Strikes Rule).
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">5.4 Appeals Process</h3>
            <p>If your content was removed or your account was suspended and you believe this was done in error, you may submit an appeal:</p>
            <ul>
              <li><strong>Email:</strong> appeals@docsmarketplacellc.com</li>
              <li><strong>Subject Line:</strong> &quot;Content Removal Appeal&quot; or &quot;Account Suspension Appeal&quot;</li>
            </ul>
            <p>Appeals are reviewed within 7 business days.</p>
          </Section>

          <Section title="6. Copyright and DMCA">
            <h3 className="text-xl font-semibold text-white mt-6">6.1 Copyright Policy</h3>
            <p>We respect intellectual property rights. If you believe your copyright has been infringed, you may submit a DMCA takedown notice.</p>

            <h3 className="text-xl font-semibold text-white mt-6">6.2 DMCA Takedown Procedure</h3>
            <p>To file a DMCA notice, provide the following to our designated agent:</p>
            <ol>
              <li>Physical or electronic signature of the copyright owner</li>
              <li>Description of the copyrighted work claimed to be infringed</li>
              <li>Description of where the infringing material is located</li>
              <li>Your contact information (email, address, phone)</li>
              <li>A statement that you have a good faith belief the use is unauthorized</li>
              <li>A statement that the information is accurate and you are authorized to act on behalf of the copyright owner</li>
            </ol>
            <p><strong>Send DMCA notices to:</strong> dmca@docsmarketplacellc.com</p>
          </Section>

          <Section title="7. Privacy">
            <p>Your use of the Services is also governed by our Privacy Policy, which is incorporated into these Terms by reference.</p>
            <p><strong>Privacy Policy:</strong> <a href="/privacy" className="text-blue-400 hover:text-blue-300">https://vib3.app/privacy</a></p>
            <p>By using the Services, you consent to our collection, use, and sharing of your information as described in the Privacy Policy.</p>
          </Section>

          <Section title="8. Disclaimers">
            <h3 className="text-xl font-semibold text-white mt-6">8.1 AS-IS and AS-AVAILABLE</h3>
            <p className="font-semibold uppercase">
              THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            </p>
            <p>We disclaim all warranties, including:</p>
            <ul>
              <li>Merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Accuracy, reliability, or availability</li>
              <li>Freedom from errors, viruses, or harmful components</li>
            </ul>
          </Section>

          <Section title="9. Limitation of Liability">
            <h3 className="text-xl font-semibold text-white mt-6">9.1 Liability Cap</h3>
            <p className="font-semibold uppercase">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">9.2 Maximum Liability</h3>
            <p className="font-semibold">
              OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM OR RELATED TO THE SERVICES SHALL NOT EXCEED $100 USD.
            </p>
          </Section>

          <Section title="10. Dispute Resolution">
            <h3 className="text-xl font-semibold text-white mt-6">10.1 Governing Law</h3>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the <strong>State of Delaware</strong>, without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">10.2 Arbitration Agreement</h3>
            <p className="font-semibold">
              YOU AND DOCS MARKETPLACE LLC AGREE TO RESOLVE ANY DISPUTES THROUGH BINDING INDIVIDUAL ARBITRATION (except for small claims court actions and intellectual property disputes).
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">10.3 Class Action Waiver</h3>
            <p className="font-semibold">
              YOU AGREE TO WAIVE YOUR RIGHT TO PARTICIPATE IN CLASS ACTIONS, CLASS ARBITRATIONS, OR REPRESENTATIVE ACTIONS. You may only resolve disputes with us on an individual basis.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">10.4 Opt-Out of Arbitration</h3>
            <p>You may opt out of arbitration within 30 days of first accepting these Terms by sending written notice to:</p>
            <ul>
              <li><strong>Email:</strong> legal@docsmarketplacellc.com</li>
              <li><strong>Subject:</strong> &quot;Arbitration Opt-Out&quot;</li>
            </ul>
          </Section>

          <Section title="11. Termination">
            <h3 className="text-xl font-semibold text-white mt-6">11.1 Termination by You</h3>
            <p>You may terminate your account at any time by:</p>
            <ul>
              <li>Going to Settings → Account Security → Delete Account</li>
              <li>Contacting us at vibe@docsmarketplacellc.com</li>
            </ul>
            <p>Your account will be deleted after a 30-day grace period.</p>

            <h3 className="text-xl font-semibold text-white mt-6">11.2 Termination by Us</h3>
            <p>We may suspend or terminate your account immediately, without notice, for:</p>
            <ul>
              <li>Violation of these Terms</li>
              <li>Illegal activity</li>
              <li>Abuse, harassment, or spam</li>
              <li>Any reason at our sole discretion</li>
            </ul>
          </Section>

          <Section title="12. Child Safety">
            <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-lg">
              <p className="font-semibold text-red-400">We have zero tolerance for child sexual abuse material (CSAM).</p>
              <ul className="mt-4">
                <li>Uploading CSAM is a <strong>federal crime</strong></li>
                <li>We will report CSAM to the National Center for Missing &amp; Exploited Children (NCMEC) and law enforcement</li>
                <li>Violators will be permanently banned and prosecuted to the fullest extent of the law</li>
              </ul>
            </div>
          </Section>

          <Section title="13. Contact Information">
            <p>For questions about these Terms, contact us:</p>
            <div className="bg-neutral-900 p-6 rounded-lg mt-4">
              <p className="font-semibold text-white mb-4">Docs Marketplace LLC</p>
              <ul className="space-y-2">
                <li><strong>General Inquiries:</strong> vibe@docsmarketplacellc.com</li>
                <li><strong>Privacy Questions:</strong> privacy@docsmarketplacellc.com</li>
                <li><strong>Copyright (DMCA):</strong> dmca@docsmarketplacellc.com</li>
                <li><strong>Content Appeals:</strong> appeals@docsmarketplacellc.com</li>
                <li><strong>Legal Matters:</strong> legal@docsmarketplacellc.com</li>
              </ul>
              <p className="mt-4 text-neutral-400">
                <strong>Response Time:</strong> We will respond to inquiries within 5-7 business days.
              </p>
            </div>
          </Section>

          <hr className="border-neutral-800 my-8" />

          <div className="bg-neutral-900 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Summary (Not Legally Binding)</h3>
            <ul className="space-y-2">
              <li>You must be 13+ to use the Services</li>
              <li>You are responsible for your account security</li>
              <li>You retain rights to your content, but grant us a license to use it</li>
              <li>No illegal, harmful, hateful, or spam content</li>
              <li>We can remove content and ban accounts for violations</li>
              <li>DMCA takedown process for copyright infringement</li>
              <li>Services provided &quot;as is&quot; with no guarantees</li>
              <li>Limited liability ($100 maximum)</li>
              <li>Disputes resolved through arbitration (opt-out available)</li>
              <li>Zero tolerance for CSAM</li>
            </ul>
          </div>

          <p className="text-center text-neutral-400 mt-8">
            <strong>BY USING THE SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.</strong>
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
