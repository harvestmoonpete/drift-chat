# drift

[Live demo](https://harvestmoonpete.github.io/drift-chat/) · [Source](https://github.com/harvestmoonpete/drift-chat)

A UI-first anonymous chat prototype built with React, TypeScript, and Vite. Rooms use UUIDs as their identity, with optional topics to help people discover conversations. Anonymous aliases replace profiles.

## Run

Use Node.js 22.12+ or 24:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5184. `npm run build` runs strict TypeScript checking and produces `dist/`; `npm run preview` serves the production build. Dependencies are pinned and the npm lockfile is included with the source. Asset paths are relative so the build can also live under a hosting subpath.

## Try it

1. Send a message in the starting room and watch a scripted reply.
2. Select a participant to start a direct conversation.
3. Discover rooms, search by topic or UUID, or use **Surprise me**.
4. Create a room. It receives a new UUID and starts with only you.
5. Copy a room ID, toggle a reaction, or insert an emoji.
6. Use **Reset demo** in the bottom of the rail to restore the fixtures.

The top navigation opens room and participant pickers on narrow screens. Press Ctrl+K (or Cmd+K on macOS) to filter rooms, people, and actions in the command palette. Tab moves between results, Enter opens the focused result, and Escape closes the palette. Each conversation keeps its own draft while you move around. Native dialogs support keyboard focus containment and Escape; controls have accessible names and visible focus styles.

## Demo boundary

All participants and replies are fixtures or canned scripts. Rooms, drafts, and messages exist only in React memory and disappear on refresh. Room IDs cannot invite another browser yet. There is no backend, authentication, real delivery, persistence, encryption protocol, or AI. Anonymous aliases are presentation, not a guarantee of anonymity. Typography uses local system sans-serif fonts for reading and system monospace for identifiers and terminal controls; no external font requests are made.

The UI is split into typed fixtures (`src/data.ts`), functional icons (`src/Icon.tsx`), application interactions (`src/main.tsx`), and responsive styles (`src/style.css`). The next implementation can replace local state operations with a typed transport and server-issued anonymous sessions, followed by real room membership and message delivery.

## Interface direction

The workspace borrows from Linux terminals and tiling window managers: a horizontal workspace bar, a directory of rooms and private sessions, timestamped conversation logs, a prompt-style composer, square borders, soft blue accents, and a compact status line. Proportional message text balances the terminal styling with comfortable reading. Room details and participants live in a dialog so the conversation has more space. These are interface conventions, not a terminal emulator; commands never execute on your computer.

## Dark theme and typography rationale

The palette is an evidence-informed design choice, not a scientifically proven universal aesthetic preference. The source guidance constrains contrast, saturation, type size, weight, and spacing; it does not prescribe these exact hex codes or establish a winning font.

- Charcoal background `#16181d`, surface `#1e2128`, and raised surface `#252a33` create a neutral hierarchy. [Material’s dark-theme guidance](https://github.com/material-components/material-components-android/blob/master/docs/theming/Dark.md) uses dark grey backgrounds and surfaces. This replaces the previous green cast.
- Soft blue `#91baff` is reserved for active controls, focus, and selected states. [NN/g’s dark-mode usability research](https://www.nngroup.com/articles/dark-mode-users-issues/) identifies poor contrast, saturated colors, and extreme font weights as legibility pitfalls. Blue itself is an aesthetic decision, not a claim that blue reduces eye strain.
- Main text `#e3e7ed`, secondary text `#bcc4d0`, and muted text `#9ca8ba` are opaque colors with predictable contrast. [WCAG 2.2 SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) sets 4.5:1 for normal text and 3:1 for large text. All core text tokens are tested to 4.5:1 across all four surfaces, including selected rows. The lowest is 5.14:1; message text against its background is 14.31:1. Essential control borders exceed 3:1 against the tested surfaces. Decorative separators are intentionally subtler.
- Messages use the native proportional system font: San Francisco on Apple devices, Segoe UI on Windows, with Roboto/Helvetica Neue/Arial fallbacks. Regular 400 weight, 16px size, 1.65 line height, and a maximum width of 68ch follow [USWDS guidance](https://designsystem.digital.gov/components/typography/) on reading size, spacing, and line length. A ch is a font-relative width, not a guarantee of an exact character count. Monospace remains on UUIDs, timestamps, and terminal controls. Metadata is smaller than body copy.
- [Font research summarized by NN/g](https://www.nngroup.com/articles/best-font-for-online-reading/) finds substantial individual variation. The system stack is a pragmatic default, not a demonstrated best font for every reader. No claim is made that dark mode is universally healthier or faster to read.

Run `npm run check:contrast` to verify the actual CSS color tokens. This focused test does not certify complete WCAG compliance; browser inspection covers visible text and interaction states separately.

## Deployment

GitHub Actions installs the locked dependencies, checks color contrast, and type-checks and builds the app. Successful checks on `main` deploy the static build to GitHub Pages. Pull requests run checks without deploying. The public demo contains only synthetic browser-side conversations and makes no backend chat requests.
