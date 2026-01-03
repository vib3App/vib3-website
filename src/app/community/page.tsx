import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Guidelines | VIB3',
  description: 'VIB3 Community Guidelines - Our rules for creating a safe and positive community.',
};

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <article className="prose prose-invert prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-white mb-2">Community Guidelines</h1>
          <p className="text-neutral-400 mb-8">
            <strong>Effective Date:</strong> January 2, 2026 | <strong>Last Updated:</strong> January 2, 2026
          </p>

          <hr className="border-neutral-800 my-8" />

          <div className="bg-neutral-900 p-6 rounded-lg mb-8">
            <p className="text-white font-semibold">
              VIB3 is a platform for creative expression, connection, and community. These Community Guidelines help ensure VIB3 remains a safe, inclusive, and positive space for everyone.
            </p>
            <p className="text-white mt-4">
              We take these guidelines seriously. Violations may result in content removal, account suspension, or permanent ban.
            </p>
          </div>

          <Section title="Our Mission">
            <p>
              VIB3 exists to empower creators to share their authentic selves with the world. We believe in fostering a community where creativity thrives, diverse voices are celebrated, and everyone feels safe to express themselves.
            </p>
          </Section>

          <Section title="Content Standards">
            <h3 className="text-xl font-semibold text-white mt-6">Violence and Graphic Content</h3>
            <p className="font-semibold text-red-400">We do NOT allow:</p>
            <ul>
              <li>Content that depicts or promotes violence against people or animals</li>
              <li>Graphic content showing death, injury, or gore</li>
              <li>Content that glorifies or incites violence</li>
              <li>Threats of violence against individuals or groups</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">Hate Speech and Discrimination</h3>
            <p className="font-semibold text-red-400">We do NOT allow:</p>
            <ul>
              <li>Content that attacks individuals or groups based on race, ethnicity, national origin, religion, sex, gender identity, sexual orientation, disability, or caste</li>
              <li>Slurs, dehumanizing language, or hateful symbols</li>
              <li>Content promoting hate groups or extremist ideologies</li>
              <li>Denying well-documented violent events</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">Harassment and Bullying</h3>
            <p className="font-semibold text-red-400">We do NOT allow:</p>
            <ul>
              <li>Targeted harassment of individuals</li>
              <li>Bullying, intimidation, or threats</li>
              <li>Sharing private information without consent (doxxing)</li>
              <li>Encouraging others to harass someone</li>
              <li>Impersonation with malicious intent</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">Sexual Content</h3>
            <p className="font-semibold text-red-400">We do NOT allow:</p>
            <ul>
              <li>Pornography or sexually explicit content</li>
              <li>Nudity (except in educational, documentary, or artistic contexts with appropriate labels)</li>
              <li>Sexual solicitation</li>
              <li>Non-consensual intimate imagery</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">Self-Harm and Dangerous Activities</h3>
            <p className="font-semibold text-red-400">We do NOT allow:</p>
            <ul>
              <li>Content that promotes or glorifies self-harm or suicide</li>
              <li>Content depicting or promoting eating disorders</li>
              <li>Dangerous challenges that could cause injury</li>
              <li>Content promoting drug abuse</li>
            </ul>
            <p className="mt-4">
              <strong>If you or someone you know is struggling:</strong> National Suicide Prevention Lifeline: 988 (US)
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">Misinformation</h3>
            <p className="font-semibold text-red-400">We do NOT allow:</p>
            <ul>
              <li>Content that could cause real-world harm (e.g., dangerous health misinformation)</li>
              <li>Election misinformation</li>
              <li>Manipulated media intended to deceive</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">Spam and Manipulation</h3>
            <p className="font-semibold text-red-400">We do NOT allow:</p>
            <ul>
              <li>Spam, scams, or phishing</li>
              <li>Artificially inflating engagement (fake views, likes, followers)</li>
              <li>Coordinated inauthentic behavior</li>
              <li>Bots and automated accounts (except disclosed)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">Illegal Activity</h3>
            <p className="font-semibold text-red-400">We do NOT allow:</p>
            <ul>
              <li>Content depicting or promoting illegal activities</li>
              <li>Sale of illegal goods or services</li>
              <li>Content that violates intellectual property rights</li>
            </ul>
          </Section>

          <Section title="Child Safety">
            <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-lg">
              <p className="font-semibold text-red-400">Zero Tolerance Policy</p>
              <p className="text-white mt-2">
                VIB3 has <strong>zero tolerance</strong> for child sexual abuse material (CSAM) or any content that sexualizes, exploits, or endangers minors.
              </p>
              <ul className="mt-4 text-white">
                <li>Uploading CSAM is a <strong>federal crime</strong></li>
                <li>We report all suspected CSAM to the National Center for Missing & Exploited Children (NCMEC) and law enforcement</li>
                <li>Violators will be permanently banned and prosecuted</li>
              </ul>
            </div>
            <p className="mt-4">
              Users must be at least 13 years old. We have enhanced protections for users under 18, including restricted messaging from adults and limited content exposure.
            </p>
          </Section>

          <Section title="Age-Appropriate Content">
            <p>
              All content on VIB3 must be appropriate for users 13 and older. Content that is appropriate for adults but not children should be clearly labeled.
            </p>
            <p>
              We use a combination of automated systems and human review to identify and label age-restricted content.
            </p>
          </Section>

          <Section title="Intellectual Property">
            <p>
              Respect the creative work of others. Only post content you have the right to share.
            </p>
            <ul>
              <li>Do not upload content you did not create without permission</li>
              <li>Give credit to original creators when using their work (with permission)</li>
              <li>Respect DMCA takedown requests</li>
            </ul>
            <p>
              For copyright concerns, see our <a href="/copyright" className="text-blue-400 hover:text-blue-300">Copyright Policy</a>.
            </p>
          </Section>

          <Section title="Reporting Violations">
            <p>Help us keep VIB3 safe by reporting content that violates these guidelines:</p>
            <ol>
              <li>Tap the <strong>flag icon</strong> on the content</li>
              <li>Select the reason for your report</li>
              <li>Submit your report</li>
            </ol>
            <p className="mt-4">
              All reports are reviewed by our Trust & Safety team. We do not disclose who made a report.
            </p>
          </Section>

          <Section title="Enforcement">
            <h3 className="text-xl font-semibold text-white mt-6">What Happens When You Violate Guidelines</h3>
            <p>Depending on the severity of the violation, we may:</p>
            <ul>
              <li><strong>Content Removal:</strong> Delete the violating content</li>
              <li><strong>Warning:</strong> Issue a warning to your account</li>
              <li><strong>Temporary Suspension:</strong> Suspend your account for 24 hours to 30 days</li>
              <li><strong>Permanent Ban:</strong> Permanently remove your account</li>
              <li><strong>Legal Action:</strong> Report to law enforcement (for illegal content)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">Strike System</h3>
            <ul>
              <li><strong>Strike 1:</strong> Warning and content removal</li>
              <li><strong>Strike 2:</strong> 7-day account suspension</li>
              <li><strong>Strike 3:</strong> Permanent ban</li>
            </ul>
            <p>
              Strikes expire after 90 days of good behavior. Severe violations (CSAM, terrorism, etc.) result in immediate permanent ban.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">Appeals</h3>
            <p>If you believe your content was removed or your account was suspended in error, you may appeal:</p>
            <ul>
              <li><strong>Email:</strong> appeals@docsmarketplacellc.com</li>
              <li><strong>Subject:</strong> &quot;Content Appeal&quot; or &quot;Account Appeal&quot;</li>
            </ul>
            <p>Appeals are reviewed within 7 business days.</p>
          </Section>

          <Section title="Contact Us">
            <p>For questions about these Community Guidelines, contact us:</p>
            <div className="bg-neutral-900 p-6 rounded-lg mt-4">
              <p className="font-semibold text-white mb-4">Docs Marketplace LLC</p>
              <ul className="space-y-2">
                <li><strong>General Inquiries:</strong> vibe@docsmarketplacellc.com</li>
                <li><strong>Safety Concerns:</strong> safety@docsmarketplacellc.com</li>
                <li><strong>Content Appeals:</strong> appeals@docsmarketplacellc.com</li>
                <li><strong>Privacy Questions:</strong> privacy@docsmarketplacellc.com</li>
              </ul>
            </div>
          </Section>

          <hr className="border-neutral-800 my-8" />

          <div className="bg-neutral-900 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Summary</h3>
            <ul className="space-y-2">
              <li>Be kind and respectful to others</li>
              <li>No violence, hate speech, or harassment</li>
              <li>No nudity or sexual content</li>
              <li>No content that harms minors (zero tolerance)</li>
              <li>No dangerous challenges or self-harm promotion</li>
              <li>No spam, scams, or fake engagement</li>
              <li>Respect intellectual property</li>
              <li>Report violations to help keep VIB3 safe</li>
            </ul>
          </div>

          <p className="text-center text-neutral-400 mt-8">
            <strong>Thank you for being part of the VIB3 community!</strong>
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
