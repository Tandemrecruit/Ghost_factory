# Ghost Factory

Automated landing page generation service using Next.js 15, React 19, and Tailwind CSS.

## Overview

Ghost Factory automates the creation of high-converting landing pages. The system watches for client briefs in the `clients/` directory and uses AI to generate complete, production-ready pages using a predefined component library.

## How It Works

1. **Intake**: Drop client materials into `clients/[client-id]/`
2. **Brief Generation**: The Strategist agent creates a `brief.md` with positioning and content strategy
3. **Content Writing**: The Copywriter agent produces `content.md` with all page copy
4. **Page Building**: The Builder agent assembles components into `page.tsx`
5. **QA**: Automated checks verify the page renders correctly

## Project Structure

```
ghost-factory/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles & Tailwind
│   └── clients/
│       └── [clientId]/     # Dynamic client pages
├── components/             # Reusable UI components
│   ├── HeroSimple.tsx
│   ├── HeroSplit.tsx
│   ├── FeatureGrid.tsx
│   └── ...
├── lib/                    # Utilities
│   ├── utils.ts            # cn() helper
│   └── icons.tsx           # Icon mapping
├── clients/                # Client data (watched by factory)
│   └── [client-id]/
│       ├── intake.md       # Input brief
│       ├── brief.md        # Generated strategy
│       ├── content.md      # Generated copy
│       └── assets/         # Client images
├── automation/             # Python automation pipeline
│   └── factory.py          # Main orchestrator
└── design-system/
    └── manifest.md         # Component API reference
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Running the Factory

```bash
# Start the automation pipeline
python automation/factory.py
```

## Component Library

The Builder agent uses components from `design-system/manifest.md`. Key components include:

### Hero Components
- `HeroSimple` - Centered hero with headline and CTA
- `HeroSplit` - Two-column hero with image

### Feature Components
- `FeatureGrid` - Grid of feature cards with icons
- `FeatureSteps` - Numbered "how it works" steps

### Social Proof
- `TestimonialCards` - Grid of testimonial cards
- `TrustBadges` - Row of trust badges
- `StatsHighlight` - Big numbers statistics

### Pricing & FAQ
- `PricingSimple` - Single plan pricing display
- `FaqAccordion` - Expandable FAQ list

### Contact
- `ContactForm` - Configurable contact form

### Layout
- `NavSimple` - Basic navigation bar
- `FooterSimple` - Simple footer
- `SectionWrapper` - Section styling wrapper
- `CtaBanner` - Call-to-action banner
- `GuaranteeBlock` - Money-back guarantee block

## Theming

Components use CSS variables for theming. Each client can define custom colors:

```css
:root {
  --color-primary: #2563eb;
  --color-secondary: #64748b;
  --color-accent: #f59e0b;
}
```

Use Tailwind classes like `bg-primary`, `text-accent`, etc.

## Coding Standards

See `.cursorrules` for full guidelines:

- Server Components by default
- `'use client'` only for interactivity
- Use `next/image` for all images
- Use `next/link` for all links
- Icons from `lucide-react`
- No hardcoded colors - use Tailwind variables

## License

Private - All rights reserved.
