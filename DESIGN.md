# TripNest 2.0 — Black & Electric Blue Design System

> **Theme**: Obsidian Black & Electric Sapphire Blue (`#070A12` / `#3B82F6` / `#38BDF8`)  
> **Typography**: Plus Jakarta Sans, JetBrains Mono  
> **Aesthetic**: Deep contrast cyberpunk minimalism, glassmorphism, luminous neon accents, and fluid micro-motion.

---

## 🎨 Color Palette & Design Tokens

### 1. Primary & Brand Accents
| Token | Hex / Value | Role / Usage |
| :--- | :--- | :--- |
| `--tn-primary` | `#3b82f6` | Primary interactive color, CTA buttons, active tab indicators |
| `--tn-primary-hover` | `#2563eb` | Hover state for primary buttons and interactive components |
| `--tn-primary-light` | `#60a5fa` | Text highlights, icon glows, active states |
| `--tn-cyan` | `#38bdf8` | Neon cyan secondary accent, logos, badges, live indicators |
| `--tn-primary-glow` | `rgba(59, 130, 246, 0.35)` | Box-shadow drop illumination and focus outlines |
| `--tn-primary-subtle`| `rgba(59, 130, 246, 0.12)` | Chip backgrounds, subtle hover backgrounds |

### 2. Surface & Background Tokens
| Token | Hex / Value | Role / Usage |
| :--- | :--- | :--- |
| `--tn-bg` | `#070a12` | Root viewport canvas, deep obsidian backdrop |
| `--tn-bg-card` | `#0e1526` | Card backgrounds, sidebar panel, modal containers |
| `--tn-bg-surface` | `#131c31` | Elevated component surfaces, action button backgrounds |
| `--tn-bg-hover` | `#1a2744` | Hover states for list items, dropdown options |
| `--tn-border` | `#1e293b` | Structural borders, dividers, subtle outlines |
| `--tn-border-glow` | `rgba(59, 130, 246, 0.3)` | Card hover outline, active input glow |

### 3. Typography & Text Colors
| Token | Hex / Value | Role / Usage |
| :--- | :--- | :--- |
| `--tn-text` | `#f8fafc` | Primary titles, headlines, input text, body text |
| `--tn-text-secondary`| `#94a3b8` | Subheadings, navigation labels, timestamps |
| `--tn-text-muted` | `#64748b` | Placeholders, disabled states, captions |

---

## 📐 Typography Hierarchy

- **Brand & Headings**: `Plus Jakarta Sans`, Weights `700`, `800`
- **Body & Controls**: `Plus Jakarta Sans`, Weights `400`, `500`, `600`
- **Metadata & Numbers**: `Plus Jakarta Sans` / `JetBrains Mono` for counts & metrics

---

## 🪟 Component Patterns & Elevation

### 1. Navigation & Header
- **Desktop Sidebar**: Fixed left, background `#0e1526`, border right `1px solid #1e293b`.
- **Active Navigation Pill**: Gradient `linear-gradient(90deg, rgba(59, 130, 246, 0.18), rgba(59, 130, 246, 0.04))`, color `#38bdf8`, left accent line `3px solid #3b82f6`.
- **Mobile Header**: Fixed top with `backdrop-filter: blur(16px)` and translucent `#0e1526`.

### 2. Cards & Content Tiles
- **Travel Post Card**: Surface `#0e1526`, border `#1e293b`, radius `16px`.
- **Card Hover Elevation**: `box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.6), 0 0 20px rgba(59, 130, 246, 0.08)`.
- **Destination Chips**: Background `rgba(59, 130, 246, 0.15)`, text `#60a5fa`, border `1px solid rgba(59, 130, 246, 0.3)`.

### 3. Interactive Buttons & Controls
- **Primary CTA**: `linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)`, hover `linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)`.
- **Glow Effect**: `box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35)`.
- **Form Controls**: Background `#0b101c`, border `#1e293b`, focus ring `0 0 0 4px rgba(59, 130, 246, 0.35)`.

---

## ⚡ Micro-Interactions & Animations

1. **Double-Tap Like Heart Animation**:
   - Dynamic pop scaling: `0% scale(0) -> 20% scale(1.25) -> 45% scale(1) -> 100% scale(1.4) fade out`.
2. **Carousel Transitions**: Smooth 350ms ease-in-out slider motion for multi-photo posts.
3. **Button Press Reaction**: `transform: scale(0.98)` on `:active`.
