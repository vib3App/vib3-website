import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | VIB3',
  description: 'VIB3 Privacy Policy - Learn how we collect, use, and protect your information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <article className="prose prose-invert prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-neutral-400 mb-8">
            <strong>Effective Date:</strong> December 12, 2025 | <strong>Last Updated:</strong> December 26, 2025
          </p>

          <hr className="border-neutral-800 my-8" />

          <Section title="1. Introduction">
            <p>
              Welcome to VIB3 and ViralVIB3 (collectively, the &quot;Services&quot;), operated by Docs Marketplace LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile applications and services.
            </p>
            <p className="font-semibold">
              By using the Services, you agree to the collection and use of information in accordance with this Privacy Policy.
            </p>
            <p>
              If you do not agree with the terms of this Privacy Policy, please do not access or use the Services.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <h3 className="text-xl font-semibold text-white mt-6">2.1 Information You Provide</h3>
            <p><strong>Account Information:</strong></p>
            <ul>
              <li>Email address</li>
              <li>Password (encrypted)</li>
              <li>Username</li>
              <li>Date of birth (for age verification)</li>
              <li>Profile information (bio, profile picture)</li>
            </ul>
            <p><strong>Content You Create:</strong></p>
            <ul>
              <li>Videos you upload</li>
              <li>Comments and messages</li>
              <li>Likes, follows, and interactions</li>
              <li>Captions, hashtags, and metadata</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">2.2 Information Collected Automatically</h3>
            <p><strong>Device Information:</strong></p>
            <ul>
              <li>Device model and manufacturer</li>
              <li>Operating system version</li>
              <li>Unique device identifiers</li>
              <li>Mobile network information</li>
              <li>IP address</li>
              <li>Browser type and version</li>
            </ul>
            <p><strong>Usage Information:</strong></p>
            <ul>
              <li>Video views and watch time</li>
              <li>Search queries</li>
              <li>Features used</li>
              <li>Interaction with content</li>
              <li>App crashes and errors</li>
              <li>Performance metrics</li>
            </ul>
            <p><strong>Location Information:</strong></p>
            <ul>
              <li>General location based on IP address</li>
              <li>We do NOT collect precise GPS location</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">2.3 Information from Third Parties</h3>
            <p><strong>Authentication Services:</strong></p>
            <p>If you sign in with Google or Apple, we receive:</p>
            <ul>
              <li>Name</li>
              <li>Email address</li>
              <li>Profile picture</li>
              <li>Unique identifier from the authentication provider</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">2.4 Biometric Data</h3>
            <p><strong>Face Detection:</strong></p>
            <ul>
              <li>Our video editing features use Google ML Kit for face detection to apply filters and effects</li>
              <li>Face data is processed locally on your device and is NOT stored or transmitted to our servers</li>
              <li>We do NOT create face templates or store biometric identifiers</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <h3 className="text-xl font-semibold text-white mt-6">3.1 Provide and Improve Services</h3>
            <ul>
              <li>Create and manage your account</li>
              <li>Process and deliver your content</li>
              <li>Personalize your experience</li>
              <li>Recommend content you may like</li>
              <li>Improve app performance and features</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">3.2 Communications</h3>
            <ul>
              <li>Send you service-related notifications</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Send updates about our Services (you can opt out)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">3.3 Safety and Security</h3>
            <ul>
              <li>Detect and prevent fraud, spam, and abuse</li>
              <li>Enforce our Terms of Service</li>
              <li>Comply with legal obligations</li>
              <li>Protect the rights and safety of our users</li>
            </ul>
          </Section>

          <Section title="4. How We Share Your Information">
            <h3 className="text-xl font-semibold text-white mt-6">4.1 Public Information</h3>
            <p><strong>Your profile and content are PUBLIC by default:</strong></p>
            <ul>
              <li>Videos you upload</li>
              <li>Your username, profile picture, and bio</li>
              <li>Comments and likes</li>
              <li>Followers and following lists</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">4.2 Service Providers</h3>
            <p>
              We share information with third-party service providers who help us operate our Services. We have executed Data Processing Agreements (DPAs) with each provider that include Standard Contractual Clauses (SCCs) approved by the European Commission.
            </p>
            <ul>
              <li><strong>Bunny CDN:</strong> Video hosting and delivery (Slovenia, EU)</li>
              <li><strong>MongoDB Atlas:</strong> Database hosting (United States)</li>
              <li><strong>DigitalOcean:</strong> Backend server hosting (United States)</li>
              <li><strong>Google LLC:</strong> Authentication, ML Kit, Gemini AI, Firebase (United States)</li>
              <li><strong>Apple Inc.:</strong> Authentication (United States)</li>
              <li><strong>Stripe, Inc.:</strong> Payment processing (United States)</li>
              <li><strong>xAI Corp.:</strong> AI content analysis (United States)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">4.3 Legal Requirements</h3>
            <p>We may disclose your information if required by law or in response to:</p>
            <ul>
              <li>Court orders or subpoenas</li>
              <li>Government or law enforcement requests</li>
              <li>National security requirements</li>
              <li>Protection against legal liability</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">4.4 Child Safety</h3>
            <p className="font-semibold">
              We are required by federal law to report suspected child sexual abuse material (CSAM) to the National Center for Missing &amp; Exploited Children (NCMEC).
            </p>
          </Section>

          <Section title="5. Children's Privacy (COPPA Compliance)">
            <h3 className="text-xl font-semibold text-white mt-6">5.1 Age Requirement</h3>
            <p className="font-semibold">You must be at least 13 years old to use our Services.</p>
            <p>
              We do not knowingly collect personal information from children under 13. If we discover we have collected information from a child under 13, we will delete it immediately.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">5.2 Parental Rights</h3>
            <p>
              If you are a parent or guardian and believe your child under 13 has provided us with personal information, please contact us at: privacy@docsmarketplacellc.com
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">5.3 Information from Children 13-17</h3>
            <p>If you are between 13 and 17 years old:</p>
            <ul>
              <li>Your account will have enhanced privacy settings by default</li>
              <li>We limit data collection to what is necessary for the service</li>
              <li>Parents may request access to or deletion of their child&apos;s information</li>
            </ul>
          </Section>

          <Section title="6. Your Privacy Rights">
            <h3 className="text-xl font-semibold text-white mt-6">6.1 Access and Portability</h3>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Request a copy of your data in a portable format</li>
              <li>Contact us at: privacy@docsmarketplacellc.com</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">6.2 Deletion</h3>
            <p>You have the right to:</p>
            <ul>
              <li>Delete your account (Settings → Account Security → Delete Account)</li>
              <li>Request deletion of your personal information</li>
              <li><strong>Note:</strong> Deletion is permanent after a 30-day grace period</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">6.3 Do Not Sell My Personal Information (CCPA)</h3>
            <p className="font-semibold">We do NOT sell your personal information to third parties.</p>

            <h3 className="text-xl font-semibold text-white mt-6">6.4 GDPR Rights (EU Residents)</h3>
            <p>If you are in the European Union, you have additional rights:</p>
            <ul>
              <li><strong>Right to Access:</strong> Request copies of your personal data</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
              <li><strong>Right to Restriction:</strong> Request limitation of processing</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured format</li>
              <li><strong>Right to Object:</strong> Object to processing of your data</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p>To exercise these rights, contact us at: privacy@docsmarketplacellc.com</p>
          </Section>

          <Section title="7. Data Security">
            <h3 className="text-xl font-semibold text-white mt-6">7.1 Security Measures</h3>
            <p>We implement appropriate technical and organizational measures to protect your information:</p>
            <ul>
              <li><strong>Encryption:</strong> HTTPS for all data transmission, encrypted passwords (bcrypt)</li>
              <li><strong>Access Controls:</strong> Limited employee access to personal data</li>
              <li><strong>Monitoring:</strong> Regular security audits and monitoring</li>
              <li><strong>Secure Infrastructure:</strong> Cloud providers with SOC 2 compliance</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">7.2 Data Retention</h3>
            <p><strong>Retention Periods:</strong></p>
            <ul>
              <li>Active accounts: Indefinitely until deletion requested</li>
              <li>Deleted accounts: 30-day grace period, then permanently deleted</li>
              <li>Crash reports: 90 days</li>
              <li>Legal compliance records: As required by law</li>
            </ul>
          </Section>

          <Section title="8. International Data Transfers">
            <p>
              Our Services are operated primarily in the United States. When you access our Services from outside the US, your information may be transferred to, stored, and processed in:
            </p>
            <ul>
              <li><strong>United States</strong> - Backend servers, database, payment processing, AI services</li>
              <li><strong>European Union</strong> - Video content delivery (Bunny CDN - Slovenia/Germany)</li>
            </ul>
            <p>
              For transfers to countries without an EU adequacy decision, we rely on Standard Contractual Clauses (SCCs) approved by the European Commission.
            </p>
          </Section>

          <Section title="9. Changes to This Privacy Policy">
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by:</p>
            <ul>
              <li>Posting the new Privacy Policy in the app</li>
              <li>Updating the &quot;Last Updated&quot; date</li>
              <li>Sending you a notification (for material changes)</li>
            </ul>
            <p className="font-semibold">
              Your continued use of the Services after changes constitutes acceptance of the updated Privacy Policy.
            </p>
          </Section>

          <Section title="10. Contact Us">
            <p>If you have questions about this Privacy Policy or our privacy practices, contact us:</p>
            <div className="bg-neutral-900 p-6 rounded-lg mt-4">
              <p className="font-semibold text-white mb-4">Docs Marketplace LLC</p>
              <ul className="space-y-2">
                <li><strong>Email:</strong> privacy@docsmarketplacellc.com</li>
                <li><strong>Legal Email:</strong> vibe@docsmarketplacellc.com</li>
                <li><strong>Copyright (DMCA):</strong> dmca@docsmarketplacellc.com</li>
              </ul>
              <p className="mt-4 text-neutral-400">
                <strong>Response Time:</strong> We will respond to privacy requests within 30 days.
              </p>
            </div>
          </Section>

          <hr className="border-neutral-800 my-8" />

          <div className="bg-neutral-900 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Summary of Key Points</h3>
            <ul className="space-y-2">
              <li>We collect account info, content, device info, and usage data</li>
              <li>Your content is PUBLIC by default</li>
              <li>We use third-party services (Bunny CDN, MongoDB, DigitalOcean, Google, Apple)</li>
              <li>You must be 13+ to use our Services</li>
              <li>You can delete your account and data</li>
              <li>We do NOT sell your personal information</li>
              <li>We are required to report CSAM to authorities</li>
              <li>Face detection is processed locally on your device</li>
              <li>Contact privacy@docsmarketplacellc.com for privacy questions</li>
            </ul>
          </div>

          <p className="text-center text-neutral-400 mt-8">
            <strong>By using VIB3 or ViralVIB3, you agree to this Privacy Policy.</strong>
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
