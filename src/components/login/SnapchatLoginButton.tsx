'use client';

const SNAP_CLIENT_ID = process.env.NEXT_PUBLIC_SNAPCHAT_CLIENT_ID || '';
const SNAP_REDIRECT_URI = typeof window !== 'undefined'
  ? `${window.location.origin}/auth/snapchat/callback`
  : '';

/**
 * Build Snapchat OAuth URL using Snap Kit Login API
 */
function getSnapchatOAuthUrl(): string {
  const state = Math.random().toString(36).substring(2, 15);
  // Store state for CSRF validation
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('snapchat_oauth_state', state);
  }

  const params = new URLSearchParams({
    client_id: SNAP_CLIENT_ID,
    redirect_uri: SNAP_REDIRECT_URI,
    response_type: 'code',
    scope: 'https://auth.snapchat.com/oauth2/api/user.display_name https://auth.snapchat.com/oauth2/api/user.bitmoji.avatar',
    state,
  });

  return `https://accounts.snapchat.com/accounts/oauth2/auth?${params.toString()}`;
}

interface SnapchatLoginButtonProps {
  disabled?: boolean;
  onClick?: () => void;
}

export function SnapchatLoginButton({ disabled, onClick }: SnapchatLoginButtonProps) {
  const handleClick = () => {
    if (!SNAP_CLIENT_ID) {
      console.warn('Snapchat Client ID not configured');
      return;
    }
    onClick?.();
    window.location.href = getSnapchatOAuthUrl();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || !SNAP_CLIENT_ID}
      className="flex items-center justify-center gap-2 glass border border-white/10 rounded-lg py-3 text-white hover:bg-white/5 transition-colors disabled:opacity-50 w-full"
    >
      <SnapchatIcon />
      Snapchat
    </button>
  );
}

function SnapchatIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.989-.232.15-.053.336-.093.488-.093.196 0 .389.06.519.165.15.117.24.294.27.495.045.3-.105.615-.373.765a7.04 7.04 0 01-1.026.449c-.09.03-.18.06-.27.105a1.245 1.245 0 00-.54.495c-.06.135-.075.3-.015.555.09.3.147.4.225.525l.008.014c.638 1.096 1.502 2.01 2.557 2.713.211.141.476.268.749.371.202.076.386.198.474.399.105.244.02.479-.09.674-.136.238-.39.39-.66.498-.42.165-.885.255-1.365.3-.18.016-.359.089-.45.284-.105.21-.105.464-.179.689-.089.27-.284.494-.569.539a2.77 2.77 0 01-.449.03c-.285 0-.614-.046-.929-.119a5.548 5.548 0 00-1.304-.165c-.191 0-.38.011-.555.034-.495.06-1.02.375-1.62.75-.89.554-2.01 1.244-3.615 1.244h-.075c-1.606 0-2.724-.69-3.615-1.244-.6-.375-1.125-.69-1.62-.75a5.16 5.16 0 00-.555-.034c-.449 0-.914.06-1.304.165-.316.074-.645.12-.93.12a2.7 2.7 0 01-.449-.031c-.284-.045-.464-.269-.569-.539-.074-.224-.074-.479-.179-.689-.09-.195-.27-.269-.45-.284a4.948 4.948 0 01-1.365-.3 1.179 1.179 0 01-.66-.498c-.109-.196-.195-.43-.09-.674.089-.201.272-.323.474-.399.273-.103.538-.23.749-.371 1.056-.703 1.919-1.617 2.557-2.713l.009-.014c.077-.125.135-.225.224-.525.06-.255.045-.42-.015-.555a1.244 1.244 0 00-.54-.495c-.09-.045-.18-.075-.27-.105a7.046 7.046 0 01-1.025-.449c-.27-.15-.42-.465-.375-.765.03-.201.12-.378.27-.495.13-.105.323-.165.519-.165.152 0 .338.04.488.093.33.112.689.248.989.232.198 0 .326-.045.401-.09-.007-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.653 1.069 11.016.793 12.006.793h.2z"/>
    </svg>
  );
}
