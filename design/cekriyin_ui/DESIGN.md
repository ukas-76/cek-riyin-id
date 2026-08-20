---
name: Cekriyin UI
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#3d4947'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#575e70'
  on-secondary: '#ffffff'
  secondary-container: '#d9dff5'
  on-secondary-container: '#5c6274'
  tertiary: '#924628'
  on-tertiary: '#ffffff'
  tertiary-container: '#b05e3d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#dce2f7'
  secondary-fixed-dim: '#c0c6db'
  on-secondary-fixed: '#141b2b'
  on-secondary-fixed-variant: '#404758'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#773215'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.3'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container_max: 1200px
  page_margin: 32px
  section_gap: 64px
  component_gap: 16px
  gutter: 24px
---

## Brand & Style
The design system focuses on a **Practical Minimalist** aesthetic, prioritizing clarity and utility over decorative elements. It avoids the heavy gradients and high-tech glow common in cybersecurity, opting instead for a "utility-first" approach that feels like a trusted public service or a high-end editorial platform.

The UI should evoke a sense of calm and objectivity. By utilizing generous whitespace and a restricted color palette, the system directs the user's focus entirely toward information verification and status reporting.

## Colors
The palette is rooted in a neutral foundation to ensure the content remains the primary focus.

- **Primary Action:** A restrained Teal (#0D9488) is used for primary buttons and active states, offering a more approachable and modern feel than standard corporate blue.
- **Surface:** The background uses an off-white tint (#F9FAFB) to reduce screen glare, with pure white (#FFFFFF) reserved for the main content areas to create subtle separation.
- **Typography:** High-contrast Dark Charcoal (#111827) for primary reading and Muted Gray (#6B7280) for supporting metadata.
- **Semantic/Status:** Clear, standard colors for risk assessment. These should be used sparingly—only for status badges, icons, or critical alerts to maintain the minimalist aesthetic.

## Typography
The system uses **Inter** exclusively to achieve a clean, systematic, and highly legible interface. 

- **Hierarchy:** Contrast is created through weight and color rather than extreme size differences. Headlines use a tighter letter-spacing for a modern, editorial feel.
- **Readability:** Body text uses a generous 1.5x to 1.6x line height to ensure long-form reports or multi-line inputs remain easy to scan.
- **Alignment:** All text should follow a natural left-alignment to support the pragmatic and functional nature of the brand.

## Layout & Spacing
The layout follows a **Fixed Grid** model for desktop, centering content within a 1200px maximum width container.

- **Rhythm:** An 8px base unit governs all dimensions.
- **Padding:** A consistent 32px horizontal padding is maintained on the outer container across all screen sizes until the content hits the maximum width.
- **Structure:** Instead of heavy card containers, use vertical spacing (64px) to separate different functional sections of the page. Use subtle 1px dividers only when necessary for horizontal scanning in lists.
- **Mobile:** On mobile devices, page margins should reduce to 20px, and section gaps to 40px.

## Elevation & Depth
This design system utilizes **Low-contrast outlines** and **Tonal layers** rather than shadows to define hierarchy.

- **Flatness:** Avoid drop shadows entirely to maintain a modern, lightweight feel.
- **Borders:** Surfaces are defined by a 1px solid border (#E5E7EB).
- **Active State:** Focus states for inputs should use a 2px outer ring in the primary Teal color with a slight offset, creating a "halo" effect without adding artificial depth.
- **Hierarchy:** Primary content sits on a pure white surface. Secondary modules (like sidebars or history panels) can use the off-white background (#F9FAFB) to appear visually "behind" the main action area.

## Shapes
The shape language is **Soft** and professional.

- **Primary Radius:** Use a consistent 0.25rem (4px) for small components like checkboxes and small buttons.
- **Surface Radius:** Use 0.5rem (8px) for larger elements like text areas and container dividers.
- **Reasoning:** Sharp corners feel too aggressive for an approachable brand, while fully rounded "pill" shapes feel too playful/mobile-app focused. This middle ground maintains a serious, grounded utility.

## Components
- **Header:** A fixed-height (64px) white bar with a subtle bottom border. Contains only the logo, primary navigation links, and a simple "Login" button.
- **Large Textarea:** The primary interaction point. It should feature a subtle border (#D1D5DB) and a 16px internal padding. The placeholder text should be in the muted gray color to provide clear instruction without clutter.
- **Buttons:**
    - *Primary:* Solid Teal background with white text. No gradients.
    - *Secondary:* Ghost style—transparent background with a dark charcoal border and text.
- **Status Badges:** Small, rectangular tags with slightly rounded corners. Use a low-opacity background of the status color (e.g., 10% opacity) with a high-contrast dark text of the same hue for maximum accessibility.
- **History List Items:** Clean rows with a 1px bottom border. Display the timestamp, the queried item, and the status badge. On hover, the row should transition to a very light gray (#F3F4F6).
- **Search/Filter Inputs:** Use a standard height of 40px with the same border treatment as the main textarea to maintain consistency.