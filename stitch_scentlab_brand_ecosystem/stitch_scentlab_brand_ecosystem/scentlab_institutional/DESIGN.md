---
name: Scentlab Institutional
colors:
  surface: '#faf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#faf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1a'
  on-surface-variant: '#444748'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f2f1ee'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#605e5c'
  on-secondary: '#ffffff'
  secondary-container: '#e6e2de'
  on-secondary-container: '#666461'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#261900'
  on-tertiary-container: '#9b804a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#e6e2de'
  secondary-fixed-dim: '#c9c6c3'
  on-secondary-fixed: '#1c1b1a'
  on-secondary-fixed-variant: '#484644'
  tertiary-fixed: '#ffdea1'
  tertiary-fixed-dim: '#e2c286'
  on-tertiary-fixed: '#261900'
  on-tertiary-fixed-variant: '#594313'
  background: '#faf9f6'
  on-background: '#1a1c1a'
  surface-variant: '#e3e2e0'
typography:
  display-hero:
    fontFamily: Bodoni Moda
    fontSize: 80px
    fontWeight: '400'
    lineHeight: 96px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '500'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1440px
  margin-desktop: 64px
  margin-mobile: 20px
  gutter: 24px
  section-gap: 120px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is rooted in the concept of "The Modern Atelier"—a fusion of high-end clinical precision and quiet luxury. It serves a dual role: reflecting the industrial reliability of a fragrance supplier while maintaining the aesthetic prestige of a luxury fashion house.

The style is **Minimalist-Editorial**. It prioritizes extreme whitespace, rhythmic alignment, and a "less is more" philosophy. The interface should feel like a premium catalog or a high-end laboratory manual. Visual interest is generated through high-contrast typography and expansive layouts rather than decorative ornaments or shadows.

## Colors

The palette is anchored by **Warm White (#FAF9F6)** to avoid the clinical harshness of pure white, providing a gallery-like backdrop for product photography. 

- **Deep Black (#111111)** is used for all primary text, icons, and high-impact UI elements to ensure a grounded, authoritative presence.
- **Charcoal (#2A2927)** acts as a softer alternative for secondary text and surface layers.
- **Muted Champagne (#B89B62)** is reserved strictly for functional indicators (e.g., active states, stock alerts, or small decorative accents) to maintain the "Quiet Luxury" aesthetic.
- **Border (#DEDCD6)** is used for thin, structural lines that define the grid without creating visual noise.

## Typography

Typography is the primary driver of the brand's premium feel. This design system utilizes a high-contrast pairing:

1.  **Bodoni Moda (Display):** Used exclusively for large hero statements and editorial section headers. It brings a classical, "Vogue-esque" sophistication.
2.  **Inter (UI & Body):** Used for all functional interface elements, body copy, and labels. It provides a precise, modern, and clinical feel.

**Key Rules:**
- **Letter Spacing:** Apply generous tracking (0.1em) to all uppercase labels to evoke high-end branding.
- **Scale:** Maintain a strict hierarchy where headlines are significantly larger than body text to create a dynamic editorial flow.
- **Alignment:** Prefer left-aligned text for readability, with centered alignment reserved only for minimal hero modules.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop to maintain editorial control over whitespace, transitioning to a fluid model for mobile devices.

- **Grid:** A 12-column grid with generous 64px outer margins on desktop.
- **Rhythm:** Use a vertical rhythm based on 8px increments. 
- **Whitespace:** Emphasize "negative space" as a luxury feature. Section gaps should be aggressive (120px+) to allow the eye to rest between product categories.
- **Mobile Reflow:** On mobile, margins shrink to 20px, and section gaps reduce to 64px. Multi-column product grids should collapse to a single or dual-column view depending on image complexity.

## Elevation & Depth

This design system avoids traditional shadows to maintain its minimal, "flat-luxury" aesthetic. Depth is communicated through:

- **Tonal Layering:** Using the `surface_muted` (#F2F0EB) color against the `neutral` background (#FAF9F6) to define distinct areas like sidebars or footer sections.
- **Low-Contrast Outlines:** Using 1px solid lines (#DEDCD6) to define inputs, cards, and structural dividers. 
- **Overlay Sheets:** For the Cart Drawer and Modals, use a solid surface with a very subtle, large-radius ambient shadow (0px 20px 50px rgba(0,0,0,0.05)) to separate the interaction layer from the background.
- **Glassmorphism (Selective):** Use a subtle backdrop blur on the sticky navigation header to allow content to "ghost" through as the user scrolls, maintaining a sense of light and air.

## Shapes

The shape language is primarily **Sharp**, favoring 90-degree angles for structural elements (buttons, inputs, and layout containers) to reinforce the "professional/laboratory" persona.

- **UI Elements:** Buttons and form inputs use 0px radius.
- **Cards & Photography:** A very slight "Soft" rounding (4px) is permitted for product cards to prevent images from feeling overly aggressive and to add a touch of modern approachability.
- **Iconography:** Icons should use sharp terminals and consistent stroke widths.

## Components

### Buttons
- **Primary:** Solid #111111 background, #FAF9F6 text. Sharp corners. Hover state: slight opacity reduction (90%) or a subtle transition to #2A2927.
- **Secondary:** Transparent background, 1px border (#111111), #111111 text. Sharp corners.
- **Tertiary/Ghost:** Text only, with a 1px underline that appears on hover.

### Inputs & Forms
- **Style:** Underlined (bottom border only) or full 1px border (#DEDCD6). 
- **Focus State:** Border color changes to #111111. No outer glows or shadows.
- **Labels:** Always use `label-caps` (Inter, Bold, All Caps) positioned above the input field.

### Cards
- **Product Cards:** Image-centric. Title and price set in Inter, left-aligned. No borders around the card; use the image edge to define the shape.
- **Rounding:** 4px max on images.

### Drawers (Cart)
- **Animation:** Slides in from the right.
- **Overlay:** A 40% opacity black backdrop (`#111111`).
- **Header:** Large "Your Selection" headline in `headline-md`.

### Navigation
- **Top Bar:** Minimal height, sticky, with a thin bottom border. Use `label-caps` for menu items with generous horizontal spacing.

### Icons
- **System:** Use a 24px grid, 1.5px stroke weight. Avoid filled variants; stick to outlines for a lighter, more technical appearance.