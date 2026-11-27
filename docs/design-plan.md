# Backcast design plan

Status: Steps 1 and 2 complete. Overall progress: **50%**

| Step | What | Status |
|---|---|---|
| 1 | Design plan: tokens, type, layout, principles, cliché review | 🟩 Done |
| 2 | `theme.ts` tokens + font loading, pilot on the goals screen | 🟩 Done |
| 3 | Roll tokens out to onboarding, dashboard, log, about, index | 🟥 To Do |
| 4 | Replace exercise animations | 🟨 In Progress (deadlift, overhead press, tread water done; 3 left) |

---

## 1. What Backcast is, and who it's for

You pick what you want to still be able to do at 70, 80, 90 or 100. Backcast works backward along an age-related decline curve and shows the strength targets you should hit today. Then you log progress.

- **Audience:** adults about 35 to 60, planning ahead. Type and contrast are sized as if they were 65.
- **The job of the design:** make the future self feel concrete, and make today's number feel doable.
- **The one idea the design carries:** time runs backward. Your goal age is the fixed point, and today is measured from it.

## 2. What's in the code today

- `src/constants/theme.ts` is still the Expo template. No screen imports it. Every screen hard-codes its own colors (`#4A9EFF` appears 24 times, `#666` 18 times).
- Fonts are the system defaults.
- The dashboard header is `45 → 80` with an arrow. There's no curve on screen. A curve prototype exists in `src/prototypes/decline-curve/`.
- Earlier decision to keep (from `session_handoff.md`): **on dashboard cards, the target number is the hero.**

### Contrast failures today (WCAG AA needs 4.5:1 for normal text)

| Pair | Ratio | Where |
|---|---|---|
| `#666` on `#151520` | 3.15 | exercise subtitles on goal cards |
| `#666` on `#0A0A0F` | 3.44 | Attia attribution, link arrows, secondary labels |

## 3. Tokens

### Color, light (the default)

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `paper` | `#F3F5F2` | background: cool chalk, not cream | — |
| `ink` | `#1D2B2A` | primary text: deep spruce, not a tinted black | 13.38 on paper |
| `muted` | `#56635F` | secondary text | 5.73 on paper |
| `today` | `#1F6F5C` | actions and anything about *now* | 5.49 on paper, white text on it 6.02 |
| `future` | `#8A5D0B` | text about your *goal age* | 5.25 on paper |
| `futureFill` | `#E9B949` | goal-age markers and fills (never text on paper) | ink on it 8.04 |
| `line` | `#C9D1CC` | dividers only (decorative, not text) | 1.42 |

### Color, dark (follows the phone's setting)

| Token | Hex | Contrast on `#141B1A` |
|---|---|---|
| `paper` | `#141B1A` | — |
| `ink` | `#E8EDEA` | 14.76 |
| `muted` | `#9AA8A3` | 7.08 |
| `today` | `#5FC3A6` | 8.19 |
| `future` | `#F0C25A` | 10.46 |

**Color encodes time.** Green always means *today*, ochre always means *your goal age*. This reuses the amber already in the app (`#FBBF24`), so the change has some continuity.

### Type

- **One family: Atkinson Hyperlegible Next.** It was designed by the Braille Institute for readers with low vision. For an app about your body at 80, that history is the point, not trivia. It's on npm as `@expo-google-fonts/atkinson-hyperlegible-next` (confirmed reachable), and it works on web, iOS and Android.
- **Scale** (from Bringhurst's classic scale, bumped up for older eyes):

| Role | Size / line height | Weight |
|---|---|---|
| Age numerals (the hero) | 72 / 72 | 800 |
| Screen title | 36 / 42 | 700 |
| Section heading | 24 / 30 | 700 |
| Card title | 21 / 28 | 600 |
| Body | 18 / 27 | 400 |
| Small (minimum anywhere) | 14 / 20 | 500 |

- Sentence case everywhere. No all-caps labels. Numbers use tabular figures where the font supports them (to verify in Step 2).

### Shape and spacing

- **Three radii, tied to hierarchy:** `6` for rows and inputs, `14` for sheets and modals, `999` for checkboxes and pills. Today there are 11 different values.
- **Spacing:** keep the existing `Spacing` scale in `theme.ts` (4, 8, 16, 24, 32, 64).
- **Content width:** keep the existing `MaxContentWidth` of 800, and 560 for reading screens.

## 4. Layout

### Goals screen (the pilot)

The big age numeral is the one bold element. Tapping it switches between 70, 80, 90 and 100, and the targets update. Everything else stays quiet: plain rows, not identical cards.

```
┌──────────────────────────────┐
│ What do you want to do at    │
│                              │
│  80                    ▾     │  ← age numeral in ochre, tap to change
│                              │
│ Pick what matters to you.    │
│ Each one maps to an exercise │
│ with a target to train for.  │
│──────────────────────────────│
│ ○ Put a suitcase in an       │
│   overhead bin               │
│   Overhead press             │
│──────────────────────────────│
│ ● Carry 4 bags of groceries  │  ← selected: green check, ink text
│   up 2 flights of stairs     │
│   Farmer's walk              │
│──────────────────────────────│
│ ...                          │
├──────────────────────────────┤
│ Select all     [Continue with 2 goals] │
└──────────────────────────────┘
```

- Left aligned throughout. No centered text except the button label.
- Main button disabled until at least one goal is picked, with "Pick at least one goal" underneath. "Select all" becomes a quiet text button.
- Targets without an age read "Target appears after you add your age" instead of "lbs (5 reps)" with no number.

### Dashboard header (Step 3)

The arrow becomes a lifeline: today on the left in green, the goal age on the right in ochre, decades marked between them.

```
 45 ─────┼─────────┼─────────┼──── 80
 today   55        65        75    goal
         3.5 decades to build your future self
```

The cards below keep the target number as the hero, per the earlier decision.

## 5. Principles

1. **Time has two colors.** Green is now, ochre is your goal age. Never swap them, and never use them as decoration.
2. **Legible at 80.** 18px body, AA contrast on every text pair, 44pt minimum touch targets.
3. **One bold moment per screen.** On goals it's the age numeral, on the dashboard the lifeline. Everything else is quiet.
4. **Plain words.** Buttons say what happens ("Continue with 2 goals"), and the toast that follows uses the same verb.
5. **One motion moment.** When the goal age changes, the targets recount. Nothing else animates on its own. Reduced-motion settings turn it off.

## 6. Cliché review (what I changed and why)

| First instinct | Why it's a default | Revised to |
|---|---|---|
| Keep near-black with a bright blue accent | The most common AI dark theme | Light chalk default, with green and ochre that encode time |
| A soft serif for the big question | Fraunces-style serifs are a generated-page tell | One family, Atkinson Hyperlegible Next, chosen for the audience |
| Identical rounded cards for goals | The SaaS card kit | Divided rows; cards are kept for the dashboard, where they hold data |
| A big stat with a small label in the header | The skill's default hero | A lifeline that shows the backward direction of time |
| Cream background | Cliché #1 | Cool, slightly green chalk (`#F3F5F2`) |

## 7. Exercise animations

### What's wrong with the current set

- **Five are crude stick figures with form errors.** The deadlift's knees bend backward on the way down. The front squat's arms point straight ahead instead of holding a front rack. The overhead press bar finishes behind the head.
- **The Turkish get-up is a stock video, not an illustration.** At 1.8 MB it's 17 times bigger than the others, and its style doesn't match.
- **The license documentation is wrong.** `LICENSES-thirdparty.md` and the About page both say the animations are original illustrations with no stock footage, and `scripts/build-exercise-images.py` says the opposite (Pexels videos). The get-up clearly comes from stock video. The docs also list file names (`farmers-walk.gif`, `front-squat.gif`) that don't match the files (`farmerswalk.gif`, `frontsquat.gif`).

### What "better" means (proposed requirements)

1. Shows the correct movement through one full rep, checked against a reputable coaching reference.
2. One consistent visual style across all six.
3. Women as subjects (your earlier request, from `session_handoff.md`).
4. A license that allows use in an app, recorded per file.
5. Under about 300 KB each, so the dashboard loads fast on a phone.

### The blocker

This sandbox can't reach Pexels or Wikimedia (connections refused). I can't download or review new footage until the network allows those hosts, or until you supply the files.

## 8. Step 2 notes (what shipped in the pilot)

- **Files:** `src/constants/theme.ts` (new `Palette`, `FontFamily`, `Type`, `Radius`, `MinTouch`), `src/hooks/use-palette.ts`, `src/hooks/use-count-up.ts`, `src/app/_layout.tsx` (font loading), `src/app/goals.tsx` (rebuilt).
- **Bug fixed:** the goals title was hard-coded to "80" and ignored the goal age picked in onboarding. It now reads `targetAge` from the store.
- **Changed from the plan:** the age choices are 75, 80, 85, 90 and 100, matching onboarding, instead of 70, 80, 90 and 100. Two screens offering different ages would be confusing.
- **Added token:** `onFuture`, for text on the ochre fill. Dark mode needed a dark text color there to pass contrast.
- **Behavior change:** "Continue" is disabled until one goal is picked. Before, tapping it with nothing selected silently selected all seven.
- **Targets on each row** now show today's number (same math as the dashboard, custom targets included) and recount when the goal age changes. Reduced-motion settings skip the animation.
- **Bundle:** web JavaScript went from 1.3 MB to 1.4 MB. Reanimated's reduced-motion hook was tried first and added 0.8 MB, so it was replaced with React Native's built-in `AccessibilityInfo`.
- **Verified:** type check passes (one existing error in the unused template file `animated-icon.web.tsx`), static web export builds, screenshots checked in light, dark, picker open and nothing selected.
- **Open design question:** Atkinson Hyperlegible's zero carries a slash (to tell it apart from the letter O), so the hero numeral reads "8Ø". It's a legibility feature, but it's prominent at 72px.
- **Not yet verified:** iOS and Android builds. Only the web export was run here.

## 9. Step 4 notes (exercise videos)

- **Source search:** Pexels has good footage of women for only two of the six movements. Farmer's walk, Turkish get-up and front squat clips were the wrong movement, and the tread-water clip barely shows treading.
- **Decision:** the faster fallback. Deadlift and overhead press use Pexels footage now; the other four keep their current animations until they're filmed.
- **Format:** short muted MP4 loops instead of GIFs, played with `expo-video`. 123 KB and 130 KB, against about 4.5 MB for the same footage as a GIF.
- **Files:** `assets/exercises/deadlift.mp4`, `assets/exercises/ohp.mp4`, `src/components/exercise-media.tsx` (video if present, else image), `src/hooks/use-reduce-motion.ts`, and the dashboard and log screens now render through `ExerciseMedia`.
- **Reduced motion:** videos hold on their first frame instead of playing.
- **Kept, not deleted:** `ohp.gif` and `deadlift.gif` stay in the folder but are no longer bundled. Deleting them needs Rachael's approval.
- **Tread water:** an Instagram reel by @swim_mydream, used with the creator's permission (obtained by Rachael). The eggbeater-kick section, filmed at the waterline so the head above and the legs below both show. Caption text cropped out; the tall phone video sits over a blurred copy of itself to fill the wide banner. 178 KB.
- **Known limits:** the overhead press lifter dips her knees (a push press, not a strict press), the bar touches the top edge at lockout, and the camera drifts. Mixed styles (footage next to line drawings) until the other four are filmed.
- **Verified on web:** both videos load, play muted on a loop, and pause under reduced motion. Not yet verified on iOS or Android.

## 10. Not in scope

- The 47 npm vulnerabilities in the last Vercel build. Worth a separate session.
- Any change to the backcast math.
