# Ghost Factory

Automated landing page generation service using Next.js 15, React 18, and Tailwind CSS.

## Overview

Ghost Factory automates the creation of high-converting landing pages. The system watches for client briefs in the `clients/` directory and uses AI to generate complete, production-ready pages using a predefined component library.

## How It Works

1. **Intake**: Drop client materials into `clients/[client-id]/`
2. **Brief Generation**: The Strategist agent creates a `brief.md` with positioning and content strategy
3. **Content Writing**: The Copywriter agent produces `content.md` with all page copy
4. **Page Building**: The Builder agent assembles components into `page.tsx`
5. **QA**: Automated checks verify the page renders correctly

## Project Structure

```text
ghost-factory/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles & Tailwind
│   ├── dashboard/          # Internal dashboard
│   └── clients/
│       └── [clientId]/     # Dynamic client pages
├── automation/             # Python automation pipeline
│   ├── factory.py          # Main orchestrator
│   ├── cost_tracker.py     # API cost tracking
│   ├── time_tracker.py     # Time logging
│   ├── revenue_tracker.py  # Revenue tracking
│   ├── intake_sanitizer.py # Input sanitization
│   ├── schema_validator.py # Data validation
│   └── ...                 # Additional utilities
├── clients/                # Client data (watched by factory)
│   └── [client-id]/
│       ├── intake.md       # Input brief
│       ├── brief.md        # Generated strategy
│       ├── content.md      # Generated copy
│       └── assets/         # Client images
├── components/             # Reusable UI components (23 total)
├── data/                   # Runtime data storage
│   ├── costs/              # API cost logs
│   ├── time_logs/          # Time tracking data
│   └── memory/             # Agent memory storage
├── design-system/
│   └── manifest.md         # Component API reference
├── docs/                   # Documentation
│   ├── business/           # Business policies & offers
│   ├── internal/           # Technical guides
│   └── operations/         # SOPs & checklists
├── lib/                    # TypeScript utilities
│   ├── utils.ts            # cn() helper
│   ├── icons.tsx           # Icon mapping
│   ├── metrics.ts          # Analytics tracking
│   ├── schema-validator.ts # Runtime validation
│   └── ...                 # Additional utilities
├── prompts/                # AI agent prompts
│   ├── strategy/           # Industry-specific strategies
│   ├── critique/           # Review agent prompts
│   └── design/             # Design generation prompts
├── tests/                  # Test suites
│   ├── *.py                # Python tests (pytest)
│   └── ts/                 # TypeScript tests (vitest)
└── templates/              # Page templates
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- npm or yarn

### Installation

```bash
# Install Node.js dependencies
npm install

# Install Python package in editable mode (required for tests)
pip install -e .

# Install Python dependencies
pip install -r requirements.txt

# Copy environment configuration
cp .env.example .env
# Edit .env with your API keys
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Required - AI API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional - Discord notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Optional - Metrics tracking
GF_METRICS_ENABLED=true
GF_METRICS_WEBHOOK_URL=
GF_METRICS_WEBHOOK_SECRET=
```

### Running the Development Server

```bash
npm run dev
```

### Running the Factory

```bash
# Start the automation pipeline
python automation/factory.py
```

## Testing

### TypeScript Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Python Tests

```bash
# Install test dependencies
pip install -r requirements-test.txt

# Run tests
pytest
```

## Component Library

The Builder agent uses components from `design-system/manifest.md`. All 23 components:

### Hero Components
- `HeroSimple` - Centered hero with headline and CTA
- `HeroSplit` - Two-column hero with image

### Feature Components
- `FeatureGrid` - Grid of feature cards with icons
- `FeatureSteps` - Numbered "how it works" steps
- `BentoGrid` - Asymmetric grid layout for features
- `ComparisonTable` - Side-by-side comparison table

### Social Proof
- `TestimonialCards` - Grid of testimonial cards
- `TrustBadges` - Row of trust badges
- `StatsHighlight` - Big numbers statistics
- `LogoCloud` - Client/partner logo display

### Pricing & FAQ
- `PricingSimple` - Single plan pricing display
- `PricingTiers` - Multiple pricing tier comparison
- `FaqAccordion` - Expandable FAQ list

### Contact & Lead Capture
- `ContactForm` - Configurable contact form
- `NewsletterSignup` - Email signup form

### Media
- `VideoEmbed` - Responsive video player
- `TeamGrid` - Team member cards

### Layout
- `NavSimple` - Basic navigation bar
- `FooterSimple` - Simple footer
- `SectionWrapper` - Section styling wrapper
- `CtaBanner` - Call-to-action banner
- `GuaranteeBlock` - Money-back guarantee block

### Analytics
- `MetricsProvider` - Page view and conversion tracking

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
