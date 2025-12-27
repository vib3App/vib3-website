# VIB3 Web App - Session Handoff

**Date:** December 27, 2025
**Last Updated:** End of session

---

## CRITICAL: READ CLAUDE.md FIRST

The `CLAUDE.md` file contains non-negotiable expectations:
1. **One step at a time** - Complete ONE feature fully before moving on
2. **No fake "done"** - Test and verify before claiming completion
3. **No god objects** - Files under 300 lines, single responsibility
4. **Honest status** - Be direct about what works vs doesn't

---

## CURRENT STATE

### What Exists

**Project Location:** `/Users/vib3/Projects/VIB3-PRODUCTION/vib3-web/`

**Tech Stack:**
- Next.js 16 with App Router
- TypeScript (strict)
- Tailwind CSS
- HLS.js for video playback
- Zustand for state management
- React Query for server state

**Git Status:** Local commits exist, NOT pushed to GitHub (gh auth required)

### Current Task: Landing Page

**Status: IN PROGRESS - Needs visual verification from user**

**Components Created:**
```
src/components/landing/
├── Header.tsx        (53 lines) - Logo + navigation
├── Hero.tsx          (76 lines) - Headline, CTA, stats
├── AppStoreButtons.tsx (44 lines) - iOS/Android buttons
├── Features.tsx      (79 lines) - 6 feature cards
├── Creators.tsx      (128 lines) - Monetization section
├── Footer.tsx        (126 lines) - Links, legal, social
└── index.ts          (8 lines)  - Exports
```

**Main Page:** `src/app/page.tsx` (19 lines) - Composes all sections

**Design System (from Viral Vib3):**
- Primary: `#6366F1` (Indigo)
- Secondary: `#14B8A6` (Teal)
- Accent: `#F97316` (Coral/Orange)
- Background: `#0A0E1A` (Deep blue-black)
- Surface: `#1A1F2E` (Blue-tinted surface)
- Card: `#252B3B`

### What Needs Verification

User needs to check http://localhost:3000 and confirm:
- [ ] Visual appearance is good
- [ ] All navigation links work
- [ ] Footer links go to correct pages (vib3app.net legal pages)
- [ ] Responsive design works on mobile
- [ ] No console errors
- [ ] Hover effects work
- [ ] Gradient text displays correctly

### Dev Server

To start dev server:
```bash
cd /Users/vib3/Projects/VIB3-PRODUCTION/vib3-web
SSL_CERT_FILE=/etc/ssl/cert.pem NODE_TLS_REJECT_UNAUTHORIZED=0 ~/homebrew/bin/npm run dev
```

---

## PROJECT ARCHITECTURE

### Folder Structure
```
vib3-web/
├── CLAUDE.md              # CRITICAL expectations - READ FIRST
├── DEVELOPMENT_NOTES.md   # Phase notes and decisions
├── ROADMAP.md             # 282 features across 15 phases
├── HANDOFF.md             # This file
├── src/
│   ├── app/               # Next.js pages
│   │   ├── page.tsx       # Landing page
│   │   ├── layout.tsx     # Root layout
│   │   ├── globals.css    # Global styles
│   │   └── providers.tsx  # React Query provider
│   ├── components/
│   │   ├── landing/       # Landing page components
│   │   ├── ui/            # Generic UI (empty)
│   │   ├── video/         # Video components (empty)
│   │   ├── feed/          # Feed components (empty)
│   │   └── layout/        # Layout components (empty)
│   ├── features/
│   │   ├── video-player/  # HLS video player (scaffolded)
│   │   ├── auth/          # Auth feature (empty)
│   │   ├── feed/          # Feed feature (empty)
│   │   └── profile/       # Profile feature (empty)
│   ├── services/
│   │   └── api/           # API client + video endpoints
│   ├── stores/            # Zustand stores (auth, ui)
│   ├── types/             # TypeScript types
│   ├── hooks/             # Custom hooks (empty)
│   ├── utils/             # Utilities (empty)
│   └── config/            # Environment config
```

### What's Scaffolded But NOT Functional

These exist as file structure only:
- `features/video-player/` - Has code but NOT tested end-to-end
- `services/api/client.ts` - API client written but NOT tested
- `stores/authStore.ts` - Store written but NOT tested
- `stores/uiStore.ts` - Store written but NOT tested

**DO NOT claim these work.** They need testing.

---

## REFERENCE APPS

### Design Reference: Viral Vib3
**Location:** `/Volumes/Backup Plus/VIB3-PRODUCTION/viralvib3-app-final/`

Key files for design:
- `lib/app/theme/app_theme.dart` - Color scheme, typography
- `lib/features/auth/screens/login_screen.dart` - Login UI pattern

### Feature Reference: VIB3 App Final
**Location:** `/Users/vib3/Projects/VIB3-PRODUCTION/vib3-app-final/`

This is the Flutter app with 105+ services, 48+ widgets. Use for feature parity.

### Backend
**Production API:** https://api.vib3app.net
**Same backend** as Flutter app - shared data, shared auth

### Static Website
**URL:** https://vib3app.net
**Location:** `/Users/vib3/Projects/VIB3-PRODUCTION/vib3-website/`
**Contains:** Privacy policy, terms, community guidelines, contact, etc.

---

## ROADMAP SUMMARY

See `ROADMAP.md` for full details. **282 features** across **15 phases**:

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Core Foundation | NOT STARTED |
| 2 | Social Interactions | NOT STARTED |
| 3 | Content Discovery | NOT STARTED |
| 4 | Upload & Management | NOT STARTED |
| 5 | Camera & Recording | NOT STARTED |
| 6 | Video Editing | NOT STARTED |
| 7 | Live Streaming | NOT STARTED |
| 8 | Collaboration | NOT STARTED |
| 9 | Creator Studio | NOT STARTED |
| 10 | Monetization | NOT STARTED |
| 11 | Unique Features | NOT STARTED |
| 12 | Power User | NOT STARTED |
| 13 | Settings | NOT STARTED |
| 14 | Infrastructure | NOT STARTED |
| 15 | Mobile Web | NOT STARTED |

**Current Focus:** Landing page must be 100% complete before Phase 1

---

## DIFFERENTIATION FEATURES

These are the "wow factor" features that set VIB3 apart:

1. **Multi-Stream Theater** - Watch 2-4 videos/streams simultaneously
2. **Persistent PiP** - Video keeps playing across browser tabs
3. **Command Palette** - Cmd+K for instant access to anything
4. **Full Keyboard Control** - Vim-style shortcuts
5. **Watch Parties** - Synchronized viewing with friends
6. **A/B Thumbnail Testing** - Test multiple thumbnails
7. **AI Auto-Generation** - Title, description, hashtags from video
8. **Trend Predictor** - AI predicts what's about to trend
9. **Searchable Transcripts** - Search spoken words in videos
10. **Screen Sharing for Lives** - For stock traders, gamers, tutorials

---

## KNOWN ISSUES & WORKAROUNDS

### SSL Certificate Issues
When running npm commands on this Mac:
```bash
SSL_CERT_FILE=/etc/ssl/cert.pem NODE_TLS_REJECT_UNAUTHORIZED=0 npm install <package>
```

### GitHub Not Authenticated
The `gh` CLI is not authenticated. To push to GitHub:
```bash
gh auth login
# Then:
gh repo create vib3App/vib3-web --public --source=. --remote=origin --push
```

### Backup Drive
Some reference files are on external drive:
- `/Volumes/Backup Plus/VIB3-PRODUCTION/viralvib3-app-final/`
- `/Volumes/Backup Plus/VIB3-PRODUCTION/viralvib3-backend-production/`

Check if drive is mounted with `ls /Volumes/`

---

## NEXT STEPS (IN ORDER)

### Immediate (This Session or Next)
1. **User verifies landing page** - Opens localhost:3000, confirms it looks good
2. **Fix any visual issues** - Based on user feedback
3. **Test all links** - Ensure footer/nav links work
4. **Test responsive** - Mobile view works
5. **Mark landing page COMPLETE** only after verification

### After Landing Page Complete
1. Authenticate GitHub and push repo
2. Deploy to DigitalOcean (like vib3-website)
3. Start Phase 1: Core Foundation
   - Authentication (JWT, Google, Apple OAuth)
   - Video player with real VIB3 content
   - Video feed from API

---

## FILE CHECKLIST

Before next session, verify these files exist:
- [x] `/Users/vib3/Projects/VIB3-PRODUCTION/vib3-web/CLAUDE.md`
- [x] `/Users/vib3/Projects/VIB3-PRODUCTION/vib3-web/DEVELOPMENT_NOTES.md`
- [x] `/Users/vib3/Projects/VIB3-PRODUCTION/vib3-web/ROADMAP.md`
- [x] `/Users/vib3/Projects/VIB3-PRODUCTION/vib3-web/HANDOFF.md`
- [x] `/Users/vib3/Projects/VIB3-PRODUCTION/vib3-web/src/components/landing/`
- [x] `/Users/vib3/Projects/VIB3-PRODUCTION/vib3-web/package.json`

---

## COMMANDS REFERENCE

```bash
# Navigate to project
cd /Users/vib3/Projects/VIB3-PRODUCTION/vib3-web

# Start dev server
SSL_CERT_FILE=/etc/ssl/cert.pem NODE_TLS_REJECT_UNAUTHORIZED=0 ~/homebrew/bin/npm run dev

# Build for production
SSL_CERT_FILE=/etc/ssl/cert.pem NODE_TLS_REJECT_UNAUTHORIZED=0 ~/homebrew/bin/npm run build

# Install packages
SSL_CERT_FILE=/etc/ssl/cert.pem NODE_TLS_REJECT_UNAUTHORIZED=0 ~/homebrew/bin/npm install <package>

# Check file line counts (no god objects)
for f in $(find src -type f \( -name "*.ts" -o -name "*.tsx" \)); do echo "$(wc -l < "$f") $f"; done | sort -rn | head -20
```

---

## CONTEXT FOR NEXT SESSION

**User's Core Expectations:**
1. Step-by-step completion - one thing at a time
2. Don't say done until it's tested and verified
3. No god objects - keep files small and focused
4. Changing one thing shouldn't break another
5. Ask for verification before moving on

**Project Goal:**
Build a web version of VIB3 that:
- Shares the same backend as the Flutter app
- Has feature parity (eventually)
- Includes differentiating "wow factor" features
- Uses modern clean architecture

**Design Goal:**
Match the Viral Vib3 app's modern, clean aesthetic with:
- Indigo/Teal gradient color scheme
- Dark background
- Rounded corners
- Subtle animations

---

*Last Updated: December 27, 2025 - End of Session*
