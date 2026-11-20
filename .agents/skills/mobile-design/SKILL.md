---
name: mobile-design
description: Guidance for choosing a distinctive color palette and visual theme for a mobile app, then previewing several genuinely different directions side by side on one held-constant screen (e.g. a register or sign-up screen) so they can be compared and picked from. Use this whenever the ask is about a mobile app's color scheme, palette, theme, "vibe," light/dark styling, or "give me some options to look at" for colors — not for general layout, IA, or copy work. Make sure to trigger this even when the user just says something like "make this feel less generic" or "try a different color direction" about a mobile screen.
---

# Mobile Color & Theme Design

Act as the color and materials lead at a design studio that mobile app clients hire specifically because every palette feels made for their product, never recycled from the last client. This skill covers **color palette and theme only** — not layout, not information architecture, not copy. Layout is treated as fixed scaffolding on purpose, so that palette options can be judged like-for-like instead of being confused with layout changes.

## Scope

In scope: background/surface colors, text colors, accent/action colors, borders and dividers, semantic colors (success/error/warning), and "theme" as material and mood — flat vs. soft-elevation vs. glass vs. outlined vs. gradient-forward, corner-radius scale, shadow/elevation depth, icon style (line vs. filled), and imagery/texture treatment.

Out of scope for this pass: page structure, navigation pattern, type scale, copywriting, motion design. If any of these need to change too, say so, but don't let them creep into a "just compare the colors" round.

## Ground the palette in the subject

Before choosing colors, know what the app is, who it's for, and what job this specific screen does. If the brief doesn't say, propose one concrete read (app category, audience, tone) and confirm. The palette should come from the product's world — a kids' habit tracker, a private-banking app, and a late-night ride-share app should never default to the same blues and radii. Use anything already known about the client's brand or prior preferences as a starting hint, but still ground the actual hues in the subject matter, not in what's fashionable in app-store screenshots generally.

## The one-screen preview method

1. **Pick one screen to hold constant.** Unless the brief names a different screen, default to the **register / sign-up screen** — it has enough surface area (background, a card or sheet, input fields, a primary button, a secondary link, a logo mark, and room for an error state) to show off a full theme without requiring multiple screens to be built.
2. **Build that screen's layout once, at real mobile size** (e.g. a 390×844-style frame), with ordinary one-handed mobile spacing and native-feeling controls. This layout does not change between options — only color and material do.
3. **Draft 3–4 genuinely distinct directions**, not 3–4 tints of the same idea. For each, write a compact token set before building anything:
   - **Palette** — 4–6 named hex values: background/surface, primary text, secondary text, accent/primary action, border/divider, plus a semantic color if the screen needs one (e.g. an error state under a field).
   - **Theme/material** — flat, soft-elevation, glass, outlined, or gradient-forward; corner-radius scale; shadow or elevation approach; icon style.
   - **One-line rationale** — why this direction fits this specific app, in a sentence. If you can't tie it to the brief, it's a default, not a choice.
4. **Check each draft against the tell-list below** before building it. Revise or drop any direction that turns out to be a generic default in disguise.
5. **Render all surviving options applied to the same held-constant screen**, arranged so they can be seen together (side by side, tabbed, or swipeable) at true mobile proportions, each labeled with a short name — not "Option 1/2/3," a name that says what the direction is (e.g. "Warm paper," "Deep terminal").
6. **Ask which direction to run with or refine** rather than picking one for the user.

## Tells to avoid

These recur regardless of subject matter because they're the model's defaults, not choices. All of them are legitimate if the brief specifically calls for them — the brief's own words win — but don't spend free creative latitude on them by reflex:

1. **Cream-and-terracotta**: a warm cream background (near `#F4F1EA`) paired with a terracotta/clay accent (often near `#D97757`).
2. **Near-black with one bright accent**: a near-black background (`#0B0B0B`/`#111`) with a single acid-green or vermilion accent doing all the work.
3. **Blue-to-purple / "electric indigo-violet"** — this is the mobile-specific one to watch for: a full-bleed gradient from indigo (near `#6366F1`) into violet (near `#8B5CF6`) behind onboarding, auth, or paywall screens; or flat royal-blue (`#2563EB`-ish) as the reflexive "fintech/SaaS" accent; or a pale lavender/periwinkle surface as the "soft" alternative. Any of these showing up because it's the "safe tech" color rather than because the brief calls for it is the same generic reflex as #1 above.
4. **The SaaS-card kit**: everything chopped into identically rounded cards, one border-radius applied regardless of hierarchy, and the same soft grey drop shadow (`rgba(0,0,0,.1)`) under each one, with gradient washes used purely as decoration.
5. **Fake-black as a personality trait**: reaching for a tinted near-black (`#0B0B0B`, `#111`) as if it were more "designed" than true black, applied without a reason tied to the brand.
6. **Broadsheet flatness carried into mobile**: zero border-radius and hairline rules everywhere, imported from print/desktop conventions without checking it still reads well as a touch surface.

## Restraint and self-critique

Spend the one bold move in one place per direction — an accent, a texture, a gradient — and keep the rest of that direction quiet and consistent. Before presenting any direction, check it against a quality floor:

- Text and icon contrast passes WCAG AA at the actual mobile font sizes used, including secondary/placeholder text.
- If the app supports both light and dark mode, either show both for each surviving direction or say clearly that only one mode was explored.
- Pressed/focused/disabled states use colors drawn from that direction's own palette, not a generic grey fallback.
- Skim all 3–4 directions together: if two of them are really the same hue at different lightness, cut one and use the slot for something actually different.

Note anything you tried and rejected, briefly, so a later round doesn't re-propose the same discarded direction.