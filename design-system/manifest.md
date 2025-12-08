# COMPONENT LIBRARY MANIFEST
# The Builder Agent must ONLY use these components.

---

## 1. Hero Components

- `<HeroSimple heading="" subhead="" primaryCtaLabel="" primaryCtaHref="" />` // Centered hero with headline, subhead, and single CTA button
- `<HeroSplit heading="" subhead="" imageSrc="" imageAlt="" primaryCtaLabel="" primaryCtaHref="" imagePosition="left" | "right" />` // Two-column hero with image on one side

---

## 2. Feature Components

- `<FeatureGrid eyebrow="" heading="" subhead="" features={[{ title: "", description: "", icon: "zap" | "shield" | "check" | "clock" | "star" | "heart" | "target" | "award" | "globe" | "trending-up" | "briefcase" | "sparkles" }]} columns={2 | 3 | 4} />` // Grid of feature cards with icons
- `<FeatureSteps eyebrow="" heading="" subhead="" steps={[{ stepNumber: "", title: "", description: "" }]} />` // Numbered "how it works" steps section
- `<BentoGrid eyebrow="" heading="" subhead="" items={[{ title: "", description: "", icon: "zap" | "shield" | "check" | "star" | "target" | "sparkles", imageSrc: "", imageAlt: "", size: "small" | "medium" | "large" }]} />` // Modern asymmetric feature grid with mixed sizes

---

## 3. Trust & Social Proof

- `<TestimonialCards eyebrow="" heading="" testimonials={[{ quote: "", name: "", role: "", company: "", avatarSrc: "" }]} />` // Grid of testimonial cards with avatars
- `<StatsHighlight eyebrow="" heading="" stats={[{ value: "", label: "", icon: "users" | "star" | "check" | "award" | "clock" | "zap" | "trending-up" | "globe" }]} />` // Big numbers statistics section
- `<TrustBadges heading="" badges={[{ icon: "shield" | "lock" | "check-circle" | "award" | "star", label: "" }]} />` // Row of trust and security badges
- `<LogoCloud eyebrow="" heading="" logos={[{ name: "", src: "", href: "" }]} grayscale={true | false} />` // Client or partner logo showcase ("Trusted by", "As seen on")

---

## 4. Pricing & Packages

- `<PricingSimple eyebrow="" heading="" price="" period="month" | "year" | "one-time" description="" features={[""]} ctaLabel="" ctaHref="" guaranteeText="" />` // Single plan pricing display
- `<PricingTiers eyebrow="" heading="" subhead="" tiers={[{ name: "", price: "", period: "month" | "year" | "one-time", description: "", features: [""], ctaLabel: "", ctaHref: "", highlighted: true | false, badge: "" }]} />` // Multiple pricing plans side-by-side with highlight option

---

## 5. FAQs & Objections

- `<FaqAccordion eyebrow="" heading="" subhead="" faqs={[{ question: "", answer: "" }]} />` // Expandable accordion-style FAQ list
- `<GuaranteeBlock heading="" description="" badgeText="" icon="shield" | "check-circle" | "award" />` // Money-back guarantee or promise block

---

## 6. Contact & Lead Capture

- `<ContactForm eyebrow="" heading="" subhead="" fields={[{ name: "", type: "text" | "email" | "phone" | "textarea", placeholder: "", required: true | false }]} submitLabel="" successMessage="" />` // Configurable contact form UI
- `<NewsletterSignup eyebrow="" heading="" subhead="" placeholder="" submitLabel="" successMessage="" privacyText="" layout="stacked" | "inline" />` // Simple email signup component

---

## 7. Navigation & Layout

- `<NavSimple logoSrc="" logoAlt="" links={[{ label: "", href: "" }]} ctaLabel="" ctaHref="" />` // Basic navbar with logo, links, and CTA
- `<FooterSimple companyName="" links={[{ label: "", href: "" }]} socialLinks={[{ platform: "twitter" | "facebook" | "linkedin" | "instagram" | "youtube", href: "" }]} copyrightText="" />` // Basic single-row footer

---

## 8. Utility Blocks

- `<SectionWrapper background="white" | "gray" | "dark" | "primary" | "gradient" paddingY="small" | "medium" | "large">{children}</SectionWrapper>` // Wrapper component for section styling
- `<CtaBanner eyebrow="" heading="" subhead="" primaryCtaLabel="" primaryCtaHref="" secondaryCtaLabel="" secondaryCtaHref="" background="primary" | "dark" | "gradient" />` // Call-to-action banner section

---

## 9. Media & Content

- `<VideoEmbed eyebrow="" heading="" subhead="" thumbnailSrc="" thumbnailAlt="" videoUrl="" aspectRatio="16:9" | "4:3" | "1:1" />` // Video section with thumbnail and play button (supports YouTube/Vimeo)
- `<ComparisonTable eyebrow="" heading="" subhead="" columns={["Us", "Competitor"]} features={[{ name: "", values: ["yes" | "no" | "partial" | "custom text"] }]} highlightColumn={0} />` // Side-by-side feature comparison table

---

## 10. Team & About

- `<TeamGrid eyebrow="" heading="" subhead="" members={[{ name: "", role: "", bio: "", imageSrc: "", socialLinks: [{ platform: "twitter" | "linkedin" | "instagram", href: "" }] }]} columns={2 | 3 | 4} />` // Team member cards with photos and social links

---

## Usage Notes for Builder Agent

1. **Icon Values**: All icon props accept lucide-react icon names as strings (e.g., "zap", "shield", "check", "star", "heart", "clock", "users", "award", "mail", "phone", "map-pin", "lock", "check-circle", "alert-circle", "x", "target", "building", "globe", "trending-up", "briefcase", "calendar", "crown", "gift", "sparkles", "quote", "minus").

2. **Image Paths**: All `imageSrc`, `logoSrc`, `avatarSrc`, and `thumbnailSrc` props expect relative paths (e.g., "/images/hero.jpg") or absolute URLs.

3. **Link Hrefs**: All `href` and `ctaHref` props accept relative paths (e.g., "/pricing") or absolute URLs (e.g., "https://calendly.com/...").

4. **Arrays**: When a prop expects an array, provide at least 1 item. Most components work best with 3-6 items for visual balance.

5. **Composition**: Build pages by stacking components vertically. Use `SectionWrapper` to control background colors and spacing between sections.

6. **Responsive**: All components are mobile-responsive by default. No additional props needed for responsive behavior.

7. **Total Components Available**: 22 components across 10 categories. Do NOT invent new components - use only what is listed in this manifest.
