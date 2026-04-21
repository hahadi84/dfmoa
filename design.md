# DFMOA Linear-Inspired Design System

This file records the M3 visual direction for the DFMOA redesign. It is intentionally narrow: P1 establishes tokens and global primitives only; component and page rewrites follow in P2 and P3.

## Principles

- Use borders before shadows. Standard surfaces are separated with `1px` borders.
- Keep radii low: `4px` by default, `6px` for media and dense cards, pill radii only for badges.
- Prefer neutral grays and white backgrounds. The only primary accent is Linear-like purple `#5e6ad2`.
- Let typography carry hierarchy. Use weight, size, and spacing before color.
- Avoid gradients and decorative color fields. A hover state should be a subtle background or border change.
- Keep commerce readability: prices stay bold and high-contrast; product images retain a small radius.

## Core Tokens

### Color

- Background: `#ffffff`
- Subtle background: `#fafbfc`
- Muted background: `#f4f5f8`
- Border: `#e4e6eb`
- Strong border: `#d0d3d9`
- Text: `#0d0e10`
- Secondary text: `#3c4049`
- Muted text: `#6b7180`
- Disabled text: `#9ca0ab`
- Accent: `#5e6ad2`
- Accent hover: `#4e5bc6`
- Accent subtle: `#eeeffa`
- Accent border: `#d9dbf5`

### Type

- Sans: Pretendard first, then the loaded Korean font variable and system fallbacks.
- Body size: `15px`
- Small labels: `12px` to `13px`
- Page titles: `30px` to `36px`
- Default tracking: `-0.01em`

### Layout

- Narrow content: `720px`
- Standard content: `960px`
- Wide grids: `1200px`
- Section spacing should stay at or below `64px` unless a page-specific layout requires otherwise.

### Motion

- Fast: `100ms`
- Normal: `160ms`
- Easing: `cubic-bezier(0.2, 0, 0, 1)`

## DFMOA-Specific Rules

- Store logos sit inside neutral muted containers to prevent brand-color collisions.
- Lowest-price badges use accent subtle background and accent text.
- Status colors are limited to success, danger, and warning.
- Product image corners may use `6px`; general cards should use `4px` or `6px`.
- SEO, metadata, JSON-LD, copy, and price logic are out of scope for design passes.
