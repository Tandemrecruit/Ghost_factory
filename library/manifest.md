# COMPONENT LIBRARY MANIFEST
# The Builder Agent must ONLY use these components.

## 1. Hero Components
- `<HeroSimple heading="" subhead="" ctaLabel="" onCtaClick={() => {}} />`
- `<HeroSplit heading="" subhead="" imagePath="" ctaLabel="" />`
- `<HeroSaaS badgeText="" heading="" subhead="" primaryCta="" secondaryCta="" />`

## 2. Feature Components
- `<FeatureGrid features={[{ title: "", description: "", icon: "zap" | "shield" | "chart" }]} />`
- `<FeatureAlternating features={[{ title: "", description: "", image: "" }]} />`

## 3. Trust & Social Proof
- `<LogoCloud title="Trusted By" logos={["/logos/acme.png", ...]} />`
- `<TestimonialSlider testimonials={[{ quote: "", author: "", role: "" }]} />`

## 4. CTA / Footer
- `<CtaBanner title="" subhead="" buttonText="" />`
- `<Footer companyName="" links={[{ label: "", href: "" }]} />`
