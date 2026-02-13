import { LegalSection, SubSection, BulletList } from '../LegalSection';

export function InformationCollectedSection() {
  return (
    <LegalSection title="2. Information We Collect">
      <SubSection title="2.1 Information You Provide">
        <p><strong>Account Information:</strong></p>
        <BulletList items={['Email address', 'Password (encrypted)', 'Username', 'Date of birth (for age verification)', 'Profile information (bio, profile picture)']} />
        <p><strong>Content You Create:</strong></p>
        <BulletList items={['Videos you upload', 'Comments and messages', 'Likes, follows, and interactions', 'Captions, hashtags, and metadata']} />
      </SubSection>

      <SubSection title="2.2 Information Collected Automatically">
        <p><strong>Device Information:</strong></p>
        <BulletList items={['Device model and manufacturer', 'Operating system version', 'Unique device identifiers', 'Mobile network information', 'IP address', 'Browser type and version']} />
        <p><strong>Usage Information:</strong></p>
        <BulletList items={['Video views and watch time', 'Search queries', 'Features used', 'Interaction with content', 'App crashes and errors', 'Performance metrics']} />
        <p><strong>Location Information:</strong></p>
        <BulletList items={[
          'General location based on IP address',
          'Precise GPS location when you enable location sharing features (e.g., sharing your location with friends on the map)',
          'Background location when you opt in to continuous location sharing — you can disable this at any time in your device settings or in-app privacy settings',
          'Location privacy settings (ghost mode, who can see your location, always/never share lists) are stored on our servers to sync across sessions',
        ]} />
      </SubSection>

      <SubSection title="2.3 Information from Third Parties">
        <p><strong>Authentication Services:</strong></p>
        <p>If you sign in with Google, Apple, or Snapchat, we receive:</p>
        <BulletList items={['Name', 'Email address', 'Profile picture', 'Unique identifier from the authentication provider']} />
      </SubSection>

      <SubSection title="2.4 Biometric Data">
        <p><strong>Face Detection:</strong></p>
        <BulletList items={[
          'Our video editing features use Google ML Kit for face detection to apply filters and effects',
          'Face data is processed locally on your device and is NOT stored or transmitted to our servers',
          'We do NOT create face templates or store biometric identifiers',
        ]} />
      </SubSection>
    </LegalSection>
  );
}
