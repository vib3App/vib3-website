import { LegalSection, SubSection, BulletList, HighlightBox } from '../LegalSection';

export function CopyrightSection() {
  return (
    <LegalSection title="6. Copyright and DMCA">
      <SubSection title="6.1 Copyright Policy">
        <p>We respect intellectual property rights. If you believe your copyright has been infringed, you may submit a DMCA takedown notice.</p>
      </SubSection>

      <SubSection title="6.2 DMCA Takedown Procedure">
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
      </SubSection>
    </LegalSection>
  );
}

export function PrivacySection() {
  return (
    <LegalSection title="7. Privacy">
      <p>Your use of the Services is also governed by our Privacy Policy, which is incorporated into these Terms by reference.</p>
      <p><strong>Privacy Policy:</strong> <a href="/privacy" className="text-blue-400 hover:text-blue-300">https://vib3.app/privacy</a></p>
      <p>By using the Services, you consent to our collection, use, and sharing of your information as described in the Privacy Policy.</p>
    </LegalSection>
  );
}

export function DisclaimersSection() {
  return (
    <LegalSection title="8. Disclaimers">
      <SubSection title="8.1 AS-IS and AS-AVAILABLE">
        <p className="font-semibold uppercase">
          THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
        </p>
        <p>We disclaim all warranties, including:</p>
        <BulletList items={[
          'Merchantability',
          'Fitness for a particular purpose',
          'Non-infringement',
          'Accuracy, reliability, or availability',
          'Freedom from errors, viruses, or harmful components',
        ]} />
      </SubSection>
    </LegalSection>
  );
}

export function LiabilitySection() {
  return (
    <LegalSection title="9. Limitation of Liability">
      <SubSection title="9.1 Liability Cap">
        <p className="font-semibold uppercase">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
        </p>
      </SubSection>

      <SubSection title="9.2 Maximum Liability">
        <p className="font-semibold">
          OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM OR RELATED TO THE SERVICES SHALL NOT EXCEED $100 USD.
        </p>
      </SubSection>
    </LegalSection>
  );
}

export function DisputeSection() {
  return (
    <LegalSection title="10. Dispute Resolution">
      <SubSection title="10.1 Governing Law">
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the <strong>State of Delaware</strong>, without regard to its conflict of law provisions.
        </p>
      </SubSection>

      <SubSection title="10.2 Arbitration Agreement">
        <p className="font-semibold">
          YOU AND DOCS MARKETPLACE LLC AGREE TO RESOLVE ANY DISPUTES THROUGH BINDING INDIVIDUAL ARBITRATION (except for small claims court actions and intellectual property disputes).
        </p>
      </SubSection>

      <SubSection title="10.3 Class Action Waiver">
        <p className="font-semibold">
          YOU AGREE TO WAIVE YOUR RIGHT TO PARTICIPATE IN CLASS ACTIONS, CLASS ARBITRATIONS, OR REPRESENTATIVE ACTIONS. You may only resolve disputes with us on an individual basis.
        </p>
      </SubSection>

      <SubSection title="10.4 Opt-Out of Arbitration">
        <p>You may opt out of arbitration within 30 days of first accepting these Terms by sending written notice to:</p>
        <ul>
          <li><strong>Email:</strong> legal@docsmarketplacellc.com</li>
          <li><strong>Subject:</strong> &quot;Arbitration Opt-Out&quot;</li>
        </ul>
      </SubSection>
    </LegalSection>
  );
}

export function TerminationSection() {
  return (
    <LegalSection title="11. Termination">
      <SubSection title="11.1 Termination by You">
        <p>You may terminate your account at any time by:</p>
        <ul>
          <li>Going to Settings → Account Security → Delete Account</li>
          <li>Contacting us at vibe@docsmarketplacellc.com</li>
        </ul>
        <p>Your account will be deleted after a 30-day grace period.</p>
      </SubSection>

      <SubSection title="11.2 Termination by Us">
        <p>We may suspend or terminate your account immediately, without notice, for:</p>
        <BulletList items={[
          'Violation of these Terms',
          'Illegal activity',
          'Abuse, harassment, or spam',
          'Any reason at our sole discretion',
        ]} />
      </SubSection>
    </LegalSection>
  );
}

export function ChildSafetySection() {
  return (
    <LegalSection title="12. Child Safety">
      <HighlightBox variant="warning">
        <p className="font-semibold text-red-400">We have zero tolerance for child sexual abuse material (CSAM).</p>
        <ul className="mt-4">
          <li>Uploading CSAM is a <strong>federal crime</strong></li>
          <li>We will report CSAM to the National Center for Missing &amp; Exploited Children (NCMEC) and law enforcement</li>
          <li>Violators will be permanently banned and prosecuted to the fullest extent of the law</li>
        </ul>
      </HighlightBox>
    </LegalSection>
  );
}

export function ContactSection() {
  return (
    <LegalSection title="13. Contact Information">
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
    </LegalSection>
  );
}
