# Design System Inspired by Tumblr

> Auto-extracted from `https://www.tumblr.com/explore/staff-picks` on 2026-07-26

## 1. Visual Theme & Atmosphere

Refined dark mode with muted tones — cinematic and premium.

The hero section leads with "Mermaid Artist".

**Key Characteristics:**
- Favorit as the heading font
- Favorit as the body font for all running text
- Heading weight 400
- Dark background (#0d0d0d) as the primary canvas
- Primary accent `#00b8ff` used for CTAs and brand highlights
- 3 shadow level(s) detected — standard shadows
- Rounded corners (16px+) creating a friendly, approachable feel
- Tags: dark, rounded, accented, compact, sans-serif

## 2. Color Palette & Roles

### Primary
- **Primary Accent** (`#00b8ff`) · `--color-primary`: Brand color, CTA backgrounds, link text, interactive highlights.
- **Secondary Accent** (`#7c5cff`) · `--color-secondary`: Secondary brand, hover states, complementary highlights.
- **Background** (`#0d0d0d`) · `--color-bg`: Page background, primary canvas.

### Text
- **Text Primary** (`#000000`) · `--color-text`: Headings and body text.
- **Text Secondary** (`#999999`) · `--color-text-secondary`: Muted text, captions, placeholders.

### Borders & Surfaces
- **Border** (`#1a1a1a`) · `--color-border`: Dividers, outlines, input borders.

### Full Extracted Palette

| # | Hex | CSS Variable | Role | Area | Contrast |
|---|---|---|---|---|---|
| 1 | `#1a1a1a` | `--palette-1` | section | large | text-light |
| 2 | `#0d0d0d` | `--palette-2` | block | large | text-light |
| 3 | `#ffffff` | `--palette-3` | button | large | text-dark |
| 4 | `#7c5cff` | `--palette-4` | block | large | text-light |
| 5 | `#000000` | `--palette-5` | button | medium | text-light |
| 6 | `#00b8ff` | `--palette-6` | button | small | text-dark |
| 7 | `#999999` | `--palette-7` | badge | small | text-dark |

## 3. Typography Rules

- **Heading Font:** `Favorit`, sans-serif
- **Body Font:** `Favorit`, sans-serif

### Type Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| H1 | Favorit | 26px | 400 | 33.9999px | normal |
| Body | Favorit | 16px | 400 | 24px | normal |

### Type Scale

| Token | Size | Suggested Usage |
|---|---|---|
| Display | `26px` | headings |
| H1 | `21px` | headings |
| H2 | `18px` | headings |
| H3 | `16px` | headings |
| H4 | `14px` | headings |
| Body L | `12.5px` | body / supporting text |
| Body | `12px` | body / supporting text |

## 4. Component Stylings

### Primary Button

```css
.btn-primary {
  background: transparent;
  color: #999999;
  border-radius: 0px;
  padding: 0px 0px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
```

### Pill Button

```css
.btn-pill {
  background: #00b8ff;
  color: #000000;
  border-radius: 9999px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
```

### Pill Button 2

```css
.btn-pill-2 {
  background: #ffffff;
  color: #ffffff;
  border-radius: 9999px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
```

### Pill Button 3

```css
.btn-pill-3 {
  background: #000000;
  color: #ffffff;
  border-radius: 9999px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
```

### Pill Button 4

```css
.btn-pill-4 {
  background: transparent;
  color: #999999;
  border-radius: 9999px;
  padding: 8px 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
```

### Ghost Button

```css
.btn-ghost {
  background: transparent;
  color: #ffffff;
  border-radius: 4px;
  padding: 0px 0px;
  font-size: 16px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Card

```css
.card {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 0px;
  box-shadow: rgb(38, 38, 38) 0px 0px 0px 1px;
}
```

## 5. Layout Principles

- **Base spacing unit:** `2px` — use multiples (4px, 6px, 8px, etc.)

### Spacing Scale (extracted from real elements)

| Token | Value | Role |
|---|---|---|
| spacing-1 | `2px` | element |
| spacing-2 | `4px` | element |
| spacing-3 | `12px` | element |
| spacing-4 | `8px` | element |
| spacing-5 | `14px` | element |
| spacing-6 | `10px` | element |
| spacing-7 | `16px` | element |
| spacing-8 | `15px` | element |

### Border Radius Scale

| Token | Value | Element |
|---|---|---|
| radius-card | `16px` | card |
| radius-button | `8px` | button |
| radius-subtle | `4px` | subtle |
| radius-subtle | `3px` | subtle |
| radius-subtle | `5px` | subtle |
| radius-pill | `100px` | pill |

## 6. Depth & Elevation

| Level | Shadow | Usage |
|---|---|---|
| Low | `rgb(38, 38, 38) 0px 0px 0px 1px` | Cards, subtle elevation |
| High | `rgba(0, 0, 0, 0.5) 0px 0px 15px 0px` | Modals, floating elements |
| Low | `rgb(0, 184, 255) 0px -2px 0px 0px inset` | Cards, subtle elevation |


## 7. Do's and Don'ts

### Do
- Use `#0d0d0d` as the primary background color
- Use `Favorit` for all headings and `Favorit` for body text
- Use `#00b8ff` as the single dominant accent/CTA color
- Maintain `2px` as the base spacing unit — all gaps should be multiples
- Keep the overall feel dark — use dark surfaces throughout
- Use rounded corners (`16px`+) consistently for all interactive elements
- Apply the shadow system for elevation — use the extracted shadow values
- Use weight 400 for headings to match the brand's typographic voice

### Don't
- Don't use colors outside the extracted palette without justification
- Don't substitute Favorit/Favorit with generic alternatives
- Don't use irregular spacing — stick to 2px grid
- Don't introduce bright white surfaces — they break the dark palette
- Don't use sharp corners — they feel hostile in this rounded design language
- Don't use oversized hero text — this brand uses restrained type
- Don't use pure black (#000000) for text — use `#000000` instead
- Don't add decorative elements not present in the original design — no badges, ribbons, banners, or ornaments unless the source site uses them
- Don't invent UI patterns the source site doesn't have — if the original has no NEW badge, don't add one just because a red is in the palette

## 8. Responsive Behavior

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640px | Single column, stack sections, reduce font sizes ~80% |
| Tablet | 640–1024px | 2-column where appropriate, maintain spacing ratios |
| Desktop | 1024–1440px | Full layout as designed |
| Wide | > 1440px | Max-width container, center content |

- Touch targets: minimum 44×44px on mobile
- Maintain 2px base unit across breakpoints — only scale multipliers

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:  #0d0d0d
Text:        #000000
Accent:      #00b8ff
Secondary:   #7c5cff
Border:      #1a1a1a
```

### Example Prompts

1. "Build a hero section with a `#0d0d0d` background, `Favorit` heading in `#000000`, and a `#00b8ff` CTA button with 9999px radius."
2. "Create a pricing card using background `#0d0d0d`, border `#1a1a1a`, `Favorit` for text, and 6px padding."
3. "Design a navigation bar — `#0d0d0d` background, `#000000` links, `#00b8ff` for active state."
4. "Build a feature grid with 3 columns, 6px gap, each card using the card component style."
5. "Create a footer with `#0d0d0d` background, `#000000` text, and 4px padding."

### Iteration Guide

1. Start with layout structure (sections, grid, spacing)
2. Apply colors from the palette — background first, then text, then accents
3. Set typography — font families, sizes from the type scale, weights
4. Add components — buttons, cards, inputs using the specs above
5. Apply border-radius consistently across all elements
6. Add shadows for depth — use the extracted shadow values, not defaults
7. Check responsive behavior — test mobile and tablet layouts
8. Final pass — verify all colors match, spacing is consistent, fonts are correct

## 10. CSS Custom Properties

> 197 custom properties extracted from `:root` / `html` stylesheets.

### Color Variables

| Variable | Value |
|---|---|
| `--color-title` | `rgb(var(--white-on-dark))` |
| `--color-text` | `rgb(var(--white-on-dark))` |
| `--color-subtext` | `rgb(var(--white-on-dark))` |
| `--color-primary-link` | `rgb(var(--deprecated-accent))` |
| `--color-bluespace-background` | `rgb(var(--navy))` |
| `--color-bluespace-card-background` | `rgba(var(--white-on-dark), 0.07)` |
| `--color-modal-close-button` | `rgb(var(--navy))` |
| `--color-modal-close-button-background` | `rgb(var(--white-on-dark))` |
| `--accent` | `rgba(0, 184, 255, 1)` |
| `--accent-fg` | `rgba(0, 0, 0, 1)` |
| `--accent-fg-light` | `rgba(255, 255, 255, 1)` |
| `--accent-hover` | `rgba(51, 198, 255, 1)` |
| `--accent-pressed` | `rgba(102, 212, 255, 1)` |
| `--accent-tint` | `rgba(0, 184, 255, 0.1)` |
| `--accent-tint-strong` | `rgba(0, 184, 255, 0.2)` |
| `--accent-tint-heavy` | `rgba(0, 184, 255, 0.3)` |
| `--chrome` | `rgba(0, 25, 53, 1)` |
| `--chrome-panel` | `rgba(13, 36, 63, 1)` |
| `--chrome-panel-border` | `rgba(255, 255, 255, 0.05)` |
| `--chrome-tint` | `rgba(255, 255, 255, 0.05)` |
| `--chrome-tint-strong` | `rgba(255, 255, 255, 0.1)` |
| `--chrome-tint-heavy` | `rgba(255, 255, 255, 0.15)` |
| `--chrome-mobile` | `rgba(0, 25, 53, 1)` |
| `--chrome-fg` | `rgba(255, 255, 255, 1)` |
| `--chrome-fg-secondary` | `rgba(153, 163, 174, 1)` |
| `--chrome-fg-tertiary` | `rgba(102, 117, 134, 1)` |
| `--content-panel` | `rgba(255, 255, 255, 1)` |
| `--content-panel-border` | `rgba(255, 255, 255, 0)` |
| `--content-tint` | `rgba(0, 25, 53, 0.05)` |
| `--content-tint-strong` | `rgba(0, 25, 53, 0.1)` |
| ... | *(150 more)* |

### Spacing Variables

| Variable | Value |
|---|---|
| `--border-radius-small` | `3px` |

### Typography Variables

| Variable | Value |
|---|---|
| `--font-family` | `"Favorit",
    "Helvetica Neue",
    "HelveticaNeue",
    Helvetica,
    Arial,
    sans-serif` |
| `--font-family-modern` | `"Favorit Modern",
    "Helvetica Neue",
    "HelveticaNeue",
    Helvetica,
    Arial,
    sans-serif` |

### Other Variables

| Variable | Value |
|---|---|
| `--black` | `0, 0, 0` |
| `--white` | `255, 255, 255` |
| `--white-on-dark` | `255, 255, 255` |
| `--navy` | `0, 25, 53` |
| `--red` | `255, 73, 48` |
| `--orange` | `255, 138, 0` |
| `--yellow` | `232, 215, 56` |
| `--green` | `0, 207, 53` |
| `--blue` | `0, 184, 255` |
| `--purple` | `124, 92, 255` |
| `--pink` | `255, 98, 206` |
| `--deprecated-accent` | `0, 184, 255` |
| `--secondary-accent` | `229, 231, 234` |
| `--follow` | `243, 248, 251` |
