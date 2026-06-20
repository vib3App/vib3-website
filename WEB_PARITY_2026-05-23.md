# VIB3 Web vs Flutter — Deep-Dive Parity Assessment

> **Generated:** 2026-05-23
> **Supersedes:** `FEATURE_GAP_ANALYSIS.md` (2026-02-15)
> **Method:** Parallel audit across four verticals (creation/editor, feed/live, social, creator/monetization/settings); every claim grounded in source file paths in both repos.
> **Flutter app:** `/Users/vib3/Projects/VIB3-PRODUCTION/vib3-app-final` (79 screens, 167 services)
> **Web app:** `/Users/vib3/Projects/VIB3-PRODUCTION/vib3-web` (Next.js 16, ~70 routes)

## Headline

The Feb 15 gap doc is **partially stale**. Shipped since then: Stories, Live Battles, Gauntlets/brackets, Watch Party, Snapchat OAuth, Onboarding, Voice Message components, Circles, Location/Meetups, most admin tooling, Double-tap like animation.

A new category of gap has emerged that's arguably worse than "missing": **UI shells without working backends** — speed ramp, reverse, beat sync, AI auto-edit, Snap Camera Kit. They look done but produce no real output. Fix these before adding new features; users testing the app will lose trust faster from a button that lies than from a feature that doesn't exist.

---

## POST-SHIP VERIFICATION (2026-05-30) — independent re-audit of the 5 Tier-1 commits

The 5 Tier-1 commits (2eef227…bb9420d) were shipped gated only on `tsc` + `eslint` + "dev server returns 200." None of those gates can exercise canvas / FFmpeg.wasm / getUserMedia paths, which is exactly where the bugs live. CLAUDE.md requires manual browser testing before "done"; that gate was skipped. Independent re-read verdict:

| Commit | Feature | Verdict | Evidence |
|--------|---------|---------|----------|
| 2eef227 | Multi-clip merge | ⚠️ **PARTIAL — silent regression** | `advancedProcessing.ts:368` injects the raw UI transition id into `xfade=transition=`, bypassing the correct map at `filters.ts:366`. 13 of 15 transitions throw → returns `null` → silent fallback to single-clip original output. Works only for Fade/None. |
| d06656e | Green-screen | ✅ REAL | Chroma-keyed canvas stream is fed to the recorder (`useCameraRecording.ts:75`). Caveats: hardcoded `#00ff00`, presets are flat color fills not images. |
| 3158697 | Face AR | ❌ **LIES in practice** | Built on Shape Detection `FaceDetector` API (`useFaceAR.ts:30`) which ships in no default browser → `faceArStream` null, and `camera/page.tsx:148` hides the live camera when active → blank viewfinder, records nothing. |
| b56b5f1 | Scene + beat suggestions | ✅ REAL | Real frame-diff scene detection; `audioProcessing/beatDetection.ts` is genuine DSP (OfflineAudioContext, RMS windows, BPM histogram, honest confidence). |
| bb9420d | Beat-synced slideshow | ✅ REAL | `perSlideDurations` flows into real per-image FFmpeg `-loop 1 -t` args; uses valid xfade names so not exposed to the merge bug. |

### Corrective actions — RESOLVED 2026-06-20 (all browser-verified)
1. ✅ **Merge transition mapping** (`aeb7ac8`) — extracted shared `mapToXfadeName`; all 15 UI transitions resolve to valid xfade names. Verified the camera-side `videoMerge.ts` has no sibling bug (pure concat, no xfade).
2. ✅ **Face AR — made REAL** (`2cb7745` honest gate → `8efb829` real impl). Replaced the dead Shape-Detection API with **MediaPipe FaceLandmarker** (`@mediapipe/tasks-vision`): WASM+model from CDN, GPU→CPU fallback, per-frame `detectForVideo` driving zoom/mask/crown/animal. Picker shows broadly; camera never blanks. Verified (model inits, effect composites).
3. ✅ **Real browser verification** — established a Playwright-against-cached-Chromium harness with a local expired-JWT session to reach gated UI. Every commit this pass was browser-driven, not just tsc+200. (This habit caught the #7 mobile tap bug below.)
4. ✅ **Green-screen honesty** (`f12b5a1`) — honest solid-color presets + custom color + real image-upload background + key-color control + sensitivity, extracted to `GreenScreenControls.tsx`.
5. ◑ **God-file debt** — `edit/page.tsx` **1058→451** via `useEditorState.ts` (`7718470`) + `EditorPanels.tsx` (`401d7ed`). Camera files (`camera/page.tsx`, `useCamera.ts`) remain a smaller, lower-priority follow-up.

**Also found+fixed via the new verification habit:** ✅ camera top controls (green-screen toggle, face-FX picker) were untappable under the ~141px mobile `TopNav` — measured the overlap, fixed with responsive `top-40 md:top-28` offsets (`6ccf14e`).

---

## TIER 1 — Critical (Core Feature Missing or Non-Functional)

### Creation / Editor

1. **AR filters / Snap Camera Kit** — Snap SDK loads in `useCameraKit.ts`, but lenses don't render to the video stream. Canvas fallback never engages. Effectively zero AR.
2. **Live green screen during recording** — Flutter uses `green_screen_compositor` native plugin for realtime chroma key. Web has `GreenScreenPanel` UI + FFmpeg chroma code but they aren't wired together. The button does nothing live.
3. **AR-baked FFmpeg effects** — `face_mask`, `accessories`, `makeup`, `body_tracking`, `face_zoom`, `3d_objects` (see Flutter `ar_bake_service.dart` + `ffmpeg_effects_service.dart:1389+`). Web has **zero** implementation of any of these.
4. **Auto-create / Slideshow editor** — Flutter has full AI music-selection + beat-sync + slot template flow (`auto_create_service.dart`, `auto_create_screen.dart`, `slideshow_editor_screen.dart`). Web: missing entirely. One of the biggest single-feature gaps.
5. **AI auto-edit** — Web's `AIAutoEditPanel` returns **mocked** suggestions. Flutter does real scene detection + beat-sync transitions in `ai_auto_edit_service.dart`.
6. **Multi-clip merging in editor** — Web can *split* one clip but cannot *merge* multiple recorded clips with transitions like Flutter does in its native export pipeline.

### UI-Only / Broken (looks done, doesn't work)

7. **Speed ramping** — `SpeedRampPanel` keyframe UI exists in web, but the export pipeline doesn't apply variable speed. Output is unchanged.
8. **Reverse video** — `reversed` state flag is in the editor; export doesn't honor it.
9. **Beat sync** — `BeatSyncPanel` UI is decorative; no audio DSP, no detected beats, no auto-cuts.

### Feed / Player

10. **Vertical swipe feed navigation** — Flutter has full up/down/left/right swipe gestures (next/prev video, profile, camera). Web has scroll-snap + keyboard shortcuts only. No mobile-style vertical swipe.
11. **Long-press context menu on videos** — Save / Share / Not Interested / Report / Hide Creator. Web only has a left-swipe action tray.
12. **Controller pool + network-adaptive quality** — Flutter's `controller_pool.dart` enforces budgets (20 iOS / 12 Android) and switches to MP4 360p on cellular. Web uses HLS.js but has no pool or cellular fallback strategy.

### Live / Realtime

13. **AR / beauty filters on live streams** — Flutter has ML Kit face detection + beauty + background replacement on live. Web has zero AR during live broadcasting.
14. **Multi-view: Feeds-mode** — Web has full grid/focus/pip layouts for picked videos (`useMultiView.ts`, 223 lines + components), but is **missing Feeds-mode** where each slot is a scrollable feed (Flutter `multi_view_screen.dart`, 826 lines).

### Social

15. **Echo (Duet)** — Web `/echo/[videoId]` is a **remix alias**, not actual side-by-side recording with layout options + FFmpeg compositing. Genuinely missing despite the URL existing.
16. **Verification badge request flow** — Web has `/settings/verification` but the badge display on profiles and the request/approval lifecycle UI is incomplete vs Flutter's `verification_request_screen.dart`.

### Creator / Monetization

17. **Scheduled Posts UI** — Flutter has full `scheduled_posts_screen.dart` (reschedule, cancel, publish-now). Web has **no** `/scheduled` route at all, even though the backend endpoint `/api/uploads/scheduled` exists.
18. **Shop affiliate / product overlay** — Web `/shop` shows products but the per-video shopping overlay and creator commission system (8-12%) isn't wired through.

### Privacy

19. **Privacy toggles don't actually persist** — Web's `PrivacySection.tsx` saves to `localStorage` only; no backend sync (except `callPermission` per `callsApi`). Flutter's `PrivacyService` calls `/api/privacy/settings` but **the backend route doesn't exist** — so Flutter silently falls back to defaults too. Real fix needs new backend endpoints + a `privacySettings` field on users OR a dedicated collection. **Neither client has working server-persisted privacy settings.**
20. **7 missing privacy toggles** vs Flutter's `privacy_screen.dart`: "Suggest your account to others" (the actual "hide from recommendations" toggle in Flutter), "Sync contacts", "Ads personalization", "Allow Echo" (separate from Duets), "Allow Bounce", "Allow Downloads", "Filter comments".
21. **2 missing privacy pickers**: "Who can send you direct messages" (granular: everyone/followers/mutual/nobody — web only has on/off Allow Messages), "Who can view your liked videos".
22. **2 missing safety links** from privacy screen: Location privacy, Location circles (the destination pages exist at `/location` and `/circles` — just not linked from privacy settings).

> ~~Anonymous mode, Hide from recommendations, Per-Circle privacy~~ — these were in the Feb 15 doc but **don't exist in Flutter either**; the Feb doc was extrapolating from service-file names. Removed from gap list 2026-05-23 after reading `lib/models/privacy_settings.dart` and `lib/screens/settings/privacy_screen.dart`.

---

## TIER 2 — Important Differentiators

22. **Notification granularity** — Web has 5 notification filter tabs; Flutter has 12+ types with per-type push toggle, quiet hours, DND, sound/vibration. (`notification_settings_screen.dart`)
23. **TUS resumable uploads** — Flutter uses `tus_upload_service.dart`. Web uses plain Axios; uploads restart on failure.
24. **Background uploads** — Flutter's WorkManager continues uploads while app is closed. Web pauses when tab closes (Service Worker + IndexedDB could partially fix).
25. **Pixabay/music library search** — Flutter's `pixabay_music_service.dart` has live search/filter. Web's `MusicLibraryPanel` is a placeholder with no backend.
26. **Color curves / RGB editor** — Flutter has `rgb_curve_editor.dart`; web only has brightness/contrast/saturation sliders.
27. **30+ transitions** — Web has ~10. No 3D picker, no beat-synced transitions.
28. **50+ filters** — Web has 9.
29. **Creator fund tier visualization** — Flutter shows tier roadmap + eligibility milestones; web is text/numeric only.
30. **Hashtag challenge submit/vote** — Web has `joinChallenge` API + ChallengeDetail UI, but no `submitToChallenge`/`voteForSubmission` flow. Flutter has full create → submit → vote lifecycle (`hashtag_challenge_screen.dart`).
31. **Capsule unlock notifications** — Flutter has `capsule_notification_service.dart`. Web has create/view UI but no scheduled unlock reminder logic visible.
32. **Background location tracking** — Flutter has `background_location_service.dart` with persistent updates. Web component exists but cannot survive tab close.

---

## TIER 3 — Polish / Enhancement

33. **First-frame peek between videos** — Flutter avoids the black flash; web blanks between videos.
34. **Position-resume on tab return** — Flutter restores playback position; web behavior inconsistent.
35. **Achievement progress bars** — Flutter shows progress toward next badge; web shows earned only.
36. **QR generation coverage** — Flutter generates QRs for profile/video/sound/challenge/gauntlet. Web's `/scan` is scanner-only; generation is partial.
37. **Drag-to-reorder playlists** — Flutter has it; web has `PlaylistCard` but reorder UI incomplete.
38. **Share to Circles** — Flutter `share_destination_screen.dart`. No web equivalent visible.
39. **Mentions parsing in comments** — Flutter renders `@user` as tappable; web comment item doesn't appear to parse mentions.

---

## Items From Feb Doc That Are NOW DONE (don't re-build) — CONFIRMED 2026-05-23

- Stories — create + viewer + reactions (6 quick emojis + text reply + DM reply) + replies, fully wired
- Live Battles 1v1 — split-screen + scoring + voting
- Gauntlets / Tournament brackets
- Watch Party — player + playlist + chat
- Snapchat OAuth login
- Onboarding flow
- Double-tap like animation
- DMs: voice messages (`VoiceRecorder` + `VoiceMessageBubble` wired in `[conversationId]/page.tsx`)
- DMs: message reactions (add/remove, optimistic UI, WebSocket broadcast in `useConversation.ts:70-85`)
- DMs: media (image/video) sharing via `MediaUploader`
- DMs: replies, message context menu, GIF picker, emoji picker
- Followers/Following pages at `/profile/[userId]/followers` and `/profile/[userId]/following`
- Blocked users UI at `/settings/blocked`
- Hashtag join (one-tap join challenge via `ChallengeDetail`)

---

## Where Web Beats Flutter (don't regress these)

- **Admin suite** — Web has `/admin/{users,reports,dmca,withdrawals,team,qoe,player-config,flagged-reporters}`. Flutter has only one moderation screen.
- **GIPHY in editor** — Web has GIPHY panel; Flutter doesn't.

---

## Browser-Imposed Limits (won't reach 100% — plan partial replacements)

- **Native CallKit / VoIP push** for incoming calls → fall back to Web Push + visible incoming-call modal.
- **Biometric auth** → WebAuthn covers ~80%.
- **True background upload while tab closed** → Service Worker + IndexedDB queue (~80% parity).
- **Native IAP via App/Play Store** → Stripe is the structural answer; not a "gap" so much as a different model.
- **OS-level contact sync** → users have to import a contact file (no native API).

---

## Recommended Build Order (10-pack)

If the goal is "make web emulate the Flutter app," attack in this order:

1. **Fix broken-but-shipped UI** — speed ramp export, reverse export, beat sync. These look done but lie. Fast wins, big trust impact.
2. **Scheduled Posts UI** at `/creator/scheduled` — backend exists, just need the screen.
3. **Echo (real duet)** — replace the remix alias with actual side-by-side recording + FFmpeg compositing.
4. **AR / Beauty filters on camera AND live** — wire the loaded Snap Camera Kit to actually render. Highest single-feature impact.
5. **Auto-create / Slideshow mode** — biggest missing creation flow. Pixabay music + beat sync are subcomponents.
6. **Privacy: backend persistence + 7 missing toggles + 2 pickers + 2 links** — current toggles are localStorage-only. Real fix needs a `/api/privacy/settings` endpoint on backend first, then the missing UI from Flutter's `privacy_screen.dart`.
7. **Notification settings depth** — 12 types + quiet hours + DND.
8. **Vertical swipe gestures + long-press context menu** — closes the "feels like a website" gap on mobile web.
9. **Multi-view Feeds-mode** — add the scrollable-feed-per-slot variant on top of existing layout system.
10. **Hashtag challenge submit/vote flow** — extend `challenges.ts` API + `ChallengeDetail` UI with video submission and per-submission voting.

---

## Caveats

- This is a reading-level audit. Code reading was supplemented with a ground-truth pass on items the sub-agents disagreed on; the resulting corrections are reflected in the "NOW DONE" section above.
- Items remaining as Tier 1 / Tier 2 have been re-verified against current source. If you still want a runtime sanity check before scheduling work, `npm run dev` and exercise each one.
