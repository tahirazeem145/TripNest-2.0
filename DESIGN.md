---
name: Midnight Horizon
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#bec7d3'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#88929d'
  outline-variant: '#3e4851'
  surface-tint: '#94ccff'
  primary: '#94ccff'
  on-primary: '#003352'
  primary-container: '#00a6fb'
  on-primary-container: '#00385a'
  inverse-primary: '#006399'
  secondary: '#40efb7'
  on-secondary: '#003827'
  secondary-container: '#00d29c'
  on-secondary-container: '#00543d'
  tertiary: '#edc157'
  on-tertiary: '#3f2e00'
  tertiary-container: '#c19933'
  on-tertiary-container: '#453300'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#cde5ff'
  primary-fixed-dim: '#94ccff'
  on-primary-fixed: '#001d32'
  on-primary-fixed-variant: '#004b74'
  secondary-fixed: '#54fdc4'
  secondary-fixed-dim: '#27e0a9'
  on-secondary-fixed: '#002116'
  on-secondary-fixed-variant: '#00513b'
  tertiary-fixed: '#ffdf9b'
  tertiary-fixed-dim: '#edc157'
  on-tertiary-fixed: '#251a00'
  on-tertiary-fixed-variant: '#5b4300'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Montserrat, sans-serif
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Montserrat, sans-serif
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Montserrat, sans-serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter, sans-serif
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter, sans-serif
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter, sans-serif
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style

The design system embodies a premium, immersive social discovery experience tailored for modern travelers. The personality is sophisticated yet adventurous, evoking the feeling of a late-night flight over a glowing cityscape. 

The aesthetic leverages **Glassmorphism** and **Modern Minimalism** to create depth and hierarchy without clutter. Surfaces should feel like layered panes of smoked glass, allowing the vibrant photography of travel destinations to bleed through the interface. The emotional response is one of calm exploration, high-end exclusivity, and digital craftsmanship.

## Colors

The palette is anchored by a "Midnight" foundation. Use `#121212` for primary surfaces and `#0A1128` for deep backgrounds or immersive sections. 

- **Primary (Sky Blue #00A6FB):** Used for primary actions, progress indicators, and key navigational highlights.
- **Secondary (Emerald #06D6A0):** Reserved for success states, booking confirmations, and "Verified" travel badges.
- **Tertiary (Sunset Gold #FFD166):** High-intent interactive elements, such as "Save to Trip," "Favorite," or premium member features.
- **Gradients:** Use a 45-degree linear gradient from Sky Blue to Emerald for active states and "glowing" borders.

## Typography

This design system uses a dual-type scale:
- **Montserrat** for expressive headlines, destination titles, and brand elements.
- **Inter** for all functional UI text, body copy, and metadata tags.

## Elevation & Depth

1. **Base Layer:** The deep `#0A1128` background.
2. **Surface Layer:** `#121212` with a 1px subtle border (`rgba(255, 255, 255, 0.08)`) to define edges.
3. **Glass Layer:** Translucent overlays with `20px` backdrop-blur and 60% opacity.
4. **Active State:** Soft outer glow shadow color-matched to the primary accent.
