import { LegalSection, SubSection, BulletList, CategoryLabel } from '../LegalSection';

export function ProhibitedConductSection() {
  return (
    <LegalSection title="4. Prohibited Conduct">
      <SubSection title="4.1 You May NOT:" />

      <CategoryLabel>Illegal Activity:</CategoryLabel>
      <BulletList items={[
        'Violate any local, state, national, or international law',
        'Upload content depicting illegal activities',
        'Engage in fraud, theft, or deceptive practices',
      ]} />

      <CategoryLabel>Harmful Content:</CategoryLabel>
      <BulletList items={[
        'Post content containing violence, gore, or graphic injury',
        'Share content promoting self-harm or suicide',
        'Upload content depicting abuse or exploitation of minors (CSAM)',
        'Share content promoting terrorism or extremism',
      ]} />

      <CategoryLabel>Hateful Conduct:</CategoryLabel>
      <BulletList items={[
        'Post content that promotes hatred, discrimination, or violence against individuals or groups',
        'Use slurs, derogatory terms, or hateful symbols',
      ]} />

      <CategoryLabel>Harassment and Bullying:</CategoryLabel>
      <BulletList items={[
        'Harass, threaten, intimidate, or bully other users',
        'Share private information of others without consent (doxxing)',
        'Impersonate others or create fake accounts',
      ]} />

      <CategoryLabel>Sexual Content:</CategoryLabel>
      <BulletList items={[
        'Post pornography or sexually explicit content',
        'Share content depicting nudity or sexual activity',
        'Solicit sexual content or services',
      ]} />

      <CategoryLabel>Spam and Manipulation:</CategoryLabel>
      <BulletList items={[
        'Send spam, junk mail, chain letters, or unsolicited messages',
        'Artificially inflate views, likes, or followers',
        'Use bots, scripts, or automated tools to interact with the Services',
      ]} />

      <CategoryLabel>Platform Integrity:</CategoryLabel>
      <BulletList items={[
        'Circumvent or disable security features',
        "Access other users' accounts without permission",
        'Reverse engineer, decompile, or disassemble the Services',
        'Introduce viruses, malware, or harmful code',
      ]} />

      <SubSection title="4.2 Consequences">
        <p>Violation of these Terms may result in:</p>
        <BulletList items={[
          'Content removal',
          'Account suspension or termination',
          'Legal action',
          'Reporting to law enforcement (for illegal content)',
        ]} />
      </SubSection>
    </LegalSection>
  );
}
