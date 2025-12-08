# COMPONENT LIBRARY MANIFEST
# The Builder Agent must ONLY use these components.

---

## 1. Hero Components

- `<HeroSimple heading="" subhead="" primaryCtaLabel="" primaryCtaHref="" />` // Centered hero with headline, subhead, and single CTA button
- `<HeroSplit heading="" subhead="" imageSrc="" imageAlt="" primaryCtaLabel="" primaryCtaHref="" imagePosition="left" | "right" />` // Two-column hero with image on one side
- `<HeroSaaS badgeText="" heading="" subhead="" primaryCtaLabel="" primaryCtaHref="" secondaryCtaLabel="" secondaryCtaHref="" />` // SaaS-style hero with badge, headline, and dual CTAs
- `<HeroVideo heading="" subhead="" videoThumbnailSrc="" videoUrl="" primaryCtaLabel="" primaryCtaHref="" />` // Hero with video thumbnail and play button overlay
- `<HeroStats heading="" subhead="" stats={[{ value: "", label: "" }]} primaryCtaLabel="" primaryCtaHref="" />` // Centered hero with statistics row below headline
- `<HeroCentered eyebrow="" heading="" subhead="" primaryCtaLabel="" primaryCtaHref="" backgroundImageSrc="" />` // Full-width centered hero with background image
- `<HeroMinimal heading="" primaryCtaLabel="" primaryCtaHref="" />` // Ultra-minimal hero with just headline and CTA

---

## 2. Feature Components

- `<FeatureGrid eyebrow="" heading="" subhead="" features={[{ title: "", description: "", icon: "zap" | "shield" | "check" | "clock" | "star" | "heart" | "target" | "award" }]} columns={2 | 3 | 4} />` // Grid of feature cards with icons
- `<FeatureAlternating eyebrow="" heading="" features={[{ title: "", description: "", imageSrc: "", imageAlt: "" }]} />` // Alternating image-text rows for features
- `<FeatureSteps eyebrow="" heading="" subhead="" steps={[{ stepNumber: "", title: "", description: "" }]} />` // Numbered "how it works" steps section
- `<FeatureIconList heading="" subhead="" features={[{ title: "", description: "", icon: "check" | "zap" | "shield" | "star" }]} />` // Vertical list of features with icons
- `<FeatureCards eyebrow="" heading="" features={[{ title: "", description: "", icon: "zap" | "shield" | "check" | "clock" | "star" }]} />` // Elevated card-based feature showcase
- `<FeatureShowcase eyebrow="" heading="" description="" imageSrc="" imageAlt="" bulletPoints={[""]} imagePosition="left" | "right" />` // Single feature spotlight with image and bullets
- `<FeatureBento heading="" subhead="" features={[{ title: "", description: "", icon: "zap" | "shield" | "check", size: "small" | "medium" | "large" }]} />` // Bento grid layout for features

---

## 3. Trust & Social Proof

- `<LogoCloud eyebrow="" logos={[{ src: "", alt: "" }]} />` // Horizontal strip of trusted company logos
- `<TestimonialCards eyebrow="" heading="" testimonials={[{ quote: "", name: "", role: "", company: "", avatarSrc: "" }]} />` // Grid of testimonial cards with avatars
- `<TestimonialSlider eyebrow="" heading="" testimonials={[{ quote: "", name: "", role: "", company: "", avatarSrc: "" }]} />` // Carousel slider of testimonials
- `<TestimonialQuote quote="" name="" role="" company="" avatarSrc="" />` // Single large featured testimonial quote
- `<FeaturedIn eyebrow="" logos={[{ src: "", alt: "" }]} />` // "As seen in" media outlet logos band
- `<StatsHighlight eyebrow="" heading="" stats={[{ value: "", label: "", icon: "users" | "star" | "check" | "award" | "clock" | "zap" }]} />` // Big numbers statistics section
- `<TrustBadges heading="" badges={[{ icon: "shield" | "lock" | "check-circle" | "award" | "star", label: "" }]} />` // Row of trust and security badges
- `<SocialProofBar text="" metric="" icon="users" | "star" | "check" />` // Slim social proof banner with metric

---

## 4. Pricing & Packages

- `<PricingTable eyebrow="" heading="" subhead="" plans={[{ name: "", price: "", period: "month" | "year" | "one-time", description: "", features: [""], ctaLabel: "", ctaHref: "", highlighted: false }]} />` // Side-by-side pricing cards comparison
- `<PricingSimple eyebrow="" heading="" price="" period: "month" | "year" | "one-time" description="" features={[""]} ctaLabel="" ctaHref="" guaranteeText="" />` // Single plan pricing display
- `<PricingTiers eyebrow="" heading="" subhead="" tiers={[{ name: "", tagline: "", price: "", period: "month" | "year" | "one-time", features: [""], ctaLabel: "", ctaHref: "", highlighted: false, badge: "" }]} />` // Good/better/best tiered pricing
- `<PricingToggle eyebrow="" heading="" subhead="" monthlyPlans={[{ name: "", price: "", features: [""], ctaLabel: "", highlighted: false }]} annualPlans={[{ name: "", price: "", features: [""], ctaLabel: "", highlighted: false }]} annualDiscount="" />` // Monthly/annual toggle pricing table
- `<PricingFeatureCompare heading="" features={[{ name: "", basic: true | false | "", pro: true | false | "", enterprise: true | false | "" }]} plans={[{ name: "", price: "", ctaLabel: "", ctaHref: "" }]} />` // Detailed feature comparison table

---

## 5. FAQs & Objections

- `<FaqAccordion eyebrow="" heading="" subhead="" faqs={[{ question: "", answer: "" }]} />` // Expandable accordion-style FAQ list
- `<FaqGrid eyebrow="" heading="" faqs={[{ question: "", answer: "" }]} columns={2 | 3} />` // Two or three column FAQ grid layout
- `<FaqSplit heading="" subhead="" faqs={[{ question: "", answer: "" }]} ctaLabel="" ctaHref="" ctaText="" />` // FAQ with side CTA panel
- `<ObjectionHandler eyebrow="" heading="" objections={[{ objection: "", response: "", icon: "x" | "check" | "alert-circle" }]} />` // "Is this for me?" objection handling section
- `<GuaranteeBlock heading="" description="" badgeText="" icon="shield" | "check-circle" | "award" />` // Money-back guarantee or promise block

---

## 6. Contact & Lead Capture

- `<ContactForm eyebrow="" heading="" subhead="" fields={[{ name: "", type: "text" | "email" | "phone" | "textarea", placeholder: "", required: true | false }]} submitLabel="" successMessage="" />` // Configurable contact form UI
- `<LeadMagnetForm eyebrow="" heading="" subhead="" incentive="" imageSrc="" emailPlaceholder="" submitLabel="" privacyText="" />` // Email capture form with lead magnet offer
- `<ConsultationCta eyebrow="" heading="" subhead="" benefits={[""]} ctaLabel="" ctaHref="" avatarSrc="" consultantName="" />` // Book a call / consultation section
- `<NewsletterSignup heading="" subhead="" emailPlaceholder="" submitLabel="" privacyText="" />` // Simple email newsletter signup
- `<ContactInfo heading="" email="" phone="" address="" hours="" mapEmbedUrl="" />` // Contact details display with optional map
- `<ContactSplit heading="" subhead="" contactMethods={[{ icon: "mail" | "phone" | "map-pin" | "clock", label: "", value: "" }]} formHeading="" formFields={[{ name: "", type: "text" | "email" | "phone" | "textarea", placeholder: "" }]} submitLabel="" />` // Two-column contact info and form

---

## 7. Navigation & Layout

- `<NavSimple logoSrc="" logoAlt="" links={[{ label: "", href: "" }]} ctaLabel="" ctaHref="" />` // Basic navbar with logo, links, and CTA
- `<NavSticky logoSrc="" logoAlt="" links={[{ label: "", href: "" }]} ctaLabel="" ctaHref="" />` // Sticky top navigation bar
- `<NavCentered logoSrc="" logoAlt="" links={[{ label: "", href: "" }]} ctaLabel="" ctaHref="" />` // Centered logo with links on sides
- `<FooterSimple companyName="" links={[{ label: "", href: "" }]} socialLinks={[{ platform: "twitter" | "facebook" | "linkedin" | "instagram" | "youtube", href: "" }]} copyrightText="" />` // Basic single-row footer
- `<FooterColumns companyName="" logoSrc="" description="" columns={[{ title: "", links: [{ label: "", href: "" }] }]} socialLinks={[{ platform: "twitter" | "facebook" | "linkedin" | "instagram" | "youtube", href: "" }]} copyrightText="" />` // Multi-column organized footer
- `<FooterMinimal companyName="" copyrightText="" links={[{ label: "", href: "" }]} />` // Minimal footer with copyright only
- `<FooterCta heading="" subhead="" ctaLabel="" ctaHref="" companyName="" links={[{ label: "", href: "" }]} copyrightText="" />` // Footer with CTA banner above links

---

## 8. Utility Blocks

- `<SectionWrapper background="white" | "gray" | "dark" | "primary" | "gradient" paddingY="small" | "medium" | "large" />` // Wrapper component for section styling
- `<ContentContainer maxWidth="narrow" | "medium" | "wide" | "full" align="left" | "center" />` // Centered content container with max-width
- `<TwoColumnLayout leftContent="" rightContent="" ratio="50-50" | "40-60" | "60-40" | "33-67" | "67-33" gap="small" | "medium" | "large" />` // Generic two-column section layout
- `<ChecklistBlock eyebrow="" heading="" subhead="" items={[{ text: "", checked: true | false }]} icon="check" | "check-circle" | "star" />` // Bulleted checklist section
- `<StatGrid stats={[{ value: "", label: "", description: "" }]} columns={2 | 3 | 4} />` // Grid of statistics with labels
- `<AnnouncementBanner text="" ctaLabel="" ctaHref="" dismissible={true | false} variant="info" | "success" | "warning" | "promo" />` // Top banner announcement bar
- `<Divider style="line" | "dots" | "gradient" | "space" spacing="small" | "medium" | "large" />` // Visual section divider
- `<QuoteBlock quote="" attribution="" />` // Simple pull quote block
- `<ImageSection imageSrc="" imageAlt="" caption="" fullWidth={true | false} />` // Full or contained image section
- `<VideoEmbed videoUrl="" thumbnailSrc="" title="" aspectRatio="16:9" | "4:3" | "1:1" />` // Embedded video player section
- `<CtaBanner eyebrow="" heading="" subhead="" primaryCtaLabel="" primaryCtaHref="" secondaryCtaLabel="" secondaryCtaHref="" background="primary" | "dark" | "gradient" />` // Call-to-action banner section
- `<TextBlock eyebrow="" heading="" body="" align="left" | "center" />` // Simple text content block

---

## Usage Notes for Builder Agent

1. **Icon Values**: All icon props accept lucide-react icon names as strings (e.g., "zap", "shield", "check", "star", "heart", "clock", "users", "award", "mail", "phone", "map-pin", "lock", "check-circle", "alert-circle", "x", "target").

2. **Image Paths**: All `imageSrc`, `logoSrc`, `avatarSrc`, and `thumbnailSrc` props expect relative paths (e.g., "/images/hero.jpg") or absolute URLs.

3. **Link Hrefs**: All `href` and `ctaHref` props accept relative paths (e.g., "/pricing") or absolute URLs (e.g., "https://calendly.com/...").

4. **Arrays**: When a prop expects an array, provide at least 1 item. Most components work best with 3-6 items for visual balance.

5. **Composition**: Build pages by stacking components vertically. Use `SectionWrapper` to control background colors and spacing between sections.

6. **Responsive**: All components are mobile-responsive by default. No additional props needed for responsive behavior.
