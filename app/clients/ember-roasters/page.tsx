import {
  HeroSplit,
  FeatureGrid,
  FeatureSteps,
  SectionWrapper,
  PricingTiers,
  TestimonialCards,
  FaqAccordion,
  CtaBanner,
  FooterSimple,
  NavSimple,
  TrustBadges,
} from "@/components";

export default function Home() {
  return (
    <>
      <NavSimple
        logoSrc="/images/ember-logo.svg"
        logoAlt="Ember Roasters"
        links={[
          { label: "How It Works", href: "#how-it-works" },
          { label: "Pricing", href: "#pricing" },
          { label: "Our Story", href: "#story" },
          { label: "FAQ", href: "#faq" },
        ]}
        ctaLabel="Start Your Subscription"
        ctaHref="#pricing"
      />

      <HeroSplit
        heading="Coffee Worth Waking Up For"
        subhead="Small-batch coffee roasted fresh every week and delivered to your door. Every bag shows the roast date—because freshness isn't a feature, it's everything."
        imageSrc="/images/hero-coffee.jpg"
        imageAlt="Fresh roasted coffee beans being poured"
        primaryCtaLabel="Start Your Subscription"
        primaryCtaHref="#pricing"
        imagePosition="right"
      />

      <SectionWrapper background="white" paddingY="small">
        <TrustBadges
          heading=""
          badges={[
            { icon: "check-circle", label: "Free shipping on all subscriptions" },
            { icon: "clock", label: "Roasted within 7 days of delivery" },
            { icon: "check-circle", label: "Pause or cancel anytime" },
          ]}
        />
      </SectionWrapper>

      <SectionWrapper background="gray" paddingY="large">
        <FeatureGrid
          eyebrow="Our Promise"
          heading="Three Things We'll Never Compromise On"
          subhead=""
          features={[
            {
              title: "Roasted Fresh, Weekly",
              description:
                "Every bag leaves our roastery within days of roasting—not weeks or months. You'll see the exact roast date printed on every package, guaranteeing you're brewing coffee at its peak flavor window. No stale beans. No mystery dates. Just coffee the way it's meant to taste.",
              icon: "calendar",
            },
            {
              title: "Sourced Direct from Farmers",
              description:
                "We work directly with small farms in Ethiopia, Colombia, and Guatemala—building relationships that let us secure exceptional beans while ensuring farmers get paid fairly. You get better coffee. They get a better deal. Everyone wins.",
              icon: "globe",
            },
            {
              title: "Free Shipping, Always",
              description:
                "All subscription orders ship free, every single time. No minimums. No surprises at checkout. Just fresh coffee showing up like clockwork. Because a $7 shipping charge shouldn't stand between you and great coffee.",
              icon: "gift",
            },
          ]}
          columns={3}
        />
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <FeatureSteps
          eyebrow="Simple Process"
          heading="Dead Simple (Just Like We Like It)"
          subhead=""
          steps={[
            {
              stepNumber: "1",
              title: "Choose Your Plan",
              description:
                "Pick the subscription that matches your coffee habit. One bag monthly, two bags, or go all-in with our Obsessed tier. Switch anytime.",
            },
            {
              stepNumber: "2",
              title: "We Roast & Ship",
              description:
                "Every week, we roast small batches and ship them out fresh. Your coffee arrives within days of roasting—not weeks.",
            },
            {
              stepNumber: "3",
              title: "Brew & Enjoy",
              description:
                "Open the bag. Smell that? That's what fresh coffee actually smells like. Now brew it however you love it and taste the difference roast dates make.",
            },
          ]}
        />
      </SectionWrapper>

      <SectionWrapper background="primary" paddingY="large">
        <div className="max-w-4xl mx-auto text-center text-white mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-90">
            Our Story
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            The Beans Behind Your Brew
          </h2>
          <div className="prose prose-lg prose-invert mx-auto text-left">
            <p>
              Great coffee starts long before we fire up the roaster. It starts
              with farmers who care as much about quality as we do.
            </p>
            <p>
              We've spent years building direct relationships with small farms
              in Ethiopia's Yirgacheffe region, Colombia's coffee-growing
              mountains, and the volcanic soils of Guatemala. These aren't
              transactional relationships—we return to the same farms season
              after season, working together to improve quality and ensure
              everyone gets paid fairly.
            </p>
            <p>
              When you cut out the middlemen and work directly with producers,
              something magic happens: farmers can focus on quality over
              quantity, and you get beans that actually taste like something.
            </p>
            <p className="font-semibold">
              No jargon. No pretension. Just honest coffee from people who give
              a damn.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Ethiopia — Yirgacheffe</h3>
            <p className="opacity-90">
              Bright, floral, complex. The birthplace of coffee.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Colombia — Huila</h3>
            <p className="opacity-90">
              Balanced, sweet, classic. Crowd-pleaser for a reason.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Guatemala — Antigua</h3>
            <p className="opacity-90">
              Rich, chocolatey, bold. Built for morning rituals.
            </p>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <div id="pricing">
          <PricingTiers
            eyebrow="Plans & Pricing"
            heading="Choose Your Coffee Commitment"
            subhead="All plans include free shipping and the freedom to pause, skip, or cancel anytime. About $0.50 per cup—less than your daily coffee shop run."
            tiers={[
              {
                name: "Explorer",
                price: "$24",
                period: "month",
                description: "Solo coffee drinkers or those testing the waters",
                features: [
                  "1 bag (12 oz) monthly",
                  "Rotates through our featured origins",
                  "Roasted fresh weekly",
                  "Free shipping",
                ],
                ctaLabel: "Start Exploring",
                ctaHref: "#checkout",
                highlighted: false,
              },
              {
                name: "Enthusiast",
                price: "$42",
                period: "month",
                description:
                  "Households with multiple coffee drinkers or variety seekers",
                features: [
                  "2 bags (12 oz each) monthly",
                  "Choose your own origins or let us surprise you",
                  "Roasted fresh weekly",
                  "Free shipping",
                  "Early access to limited micro-lots",
                ],
                ctaLabel: "Choose Enthusiast",
                ctaHref: "#checkout",
                highlighted: true,
                badge: "MOST POPULAR",
              },
              {
                name: "Obsessed",
                price: "$72",
                period: "month",
                description: "True coffee devotees who go through multiple cups daily",
                features: [
                  "4 bags (12 oz each) monthly",
                  "Full control over origin selection",
                  "Roasted fresh weekly",
                  "Free shipping",
                  "First access to all exclusive micro-lots",
                  "Quarterly bonus: surprise tasting pack",
                ],
                ctaLabel: "Go All In",
                ctaHref: "#checkout",
                highlighted: false,
              },
            ]}
          />
        </div>

        <div className="max-w-4xl mx-auto mt-12 text-center space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
              <span className="text-2xl">🛡️</span> Money-Back Guarantee
            </h3>
            <p className="text-gray-700">
              If your first bag doesn't blow you away, we'll replace it free or
              refund you completely. No hard feelings.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">Pause or Cancel Anytime</h3>
            <p className="text-gray-700">
              Life happens. Manage your subscription online in seconds—no phone
              calls, no hassles.
            </p>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper background="gray" paddingY="large">
        <TestimonialCards
          eyebrow="Social Proof"
          heading="What People Are Saying"
          testimonials={[
            {
              quote:
                "I thought I knew what good coffee tasted like until I tried Ember. The difference fresh roasting makes is absolutely wild. I'm never going back.",
              name: "Sarah M.",
              role: "Enthusiast subscriber since 2023",
              company: "Seattle, WA",
              avatarSrc: "/images/testimonial-sarah.jpg",
            },
            {
              quote:
                "Finally, a subscription that doesn't feel like I'm locked into some sketchy contract. I paused for a month when I traveled, restarted when I got back—easy as that. And the coffee? Incredible.",
              name: "Marcus T.",
              role: "Explorer subscriber since 2024",
              company: "Austin, TX",
              avatarSrc: "/images/testimonial-marcus.jpg",
            },
            {
              quote:
                "As someone with a $2,000 espresso setup, I'm picky about my beans. Ember's roast dates and sourcing transparency sold me immediately. These are the only beans I use now.",
              name: "Jennifer K.",
              role: "Obsessed subscriber since 2023",
              company: "Denver, CO",
              avatarSrc: "/images/testimonial-jennifer.jpg",
            },
            {
              quote:
                "I was spending $6 a day at coffee shops. Now I'm spending $42 a month and drinking better coffee at home. The math checks out, and my mornings are infinitely better.",
              name: "David L.",
              role: "Enthusiast subscriber since 2024",
              company: "Portland, OR",
              avatarSrc: "/images/testimonial-david.jpg",
            },
          ]}
        />
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <div id="faq">
          <FaqAccordion
            eyebrow="Support"
            heading="Questions We Get Asked A Lot"
            subhead=""
            faqs={[
              {
                question: 'How fresh is "fresh," really?',
                answer:
                  "We roast every Monday and Thursday. Most subscriptions ship within 2-3 days of roasting, and you'll receive your coffee within a week of the roast date. Every bag is clearly marked so you know exactly how fresh your beans are. Compare that to grocery store coffee (often 3-6 months old) or even other 'specialty' subscriptions (2-4 weeks old). The difference in taste is dramatic.",
              },
              {
                question: "Is this actually cheaper than my daily coffee shop run?",
                answer:
                  "Let's do the math: Our Enthusiast plan breaks down to about $0.50 per cup. If you're buying one $5 latte daily, you're spending $150/month. Even cutting that to 3x weekly is $60/month—and you're still drinking better coffee at home with our subscription.",
              },
              {
                question: "Can I really cancel anytime? What's the catch?",
                answer:
                  'Really. No catch. Log into your account, click "cancel," done. We\'d rather you come back on your own terms than feel trapped. Coffee should make you happy, not stressed. You can also pause deliveries if you\'re traveling or drowning in beans—we get it.',
              },
              {
                question: "What if I don't like the coffee?",
                answer:
                  "If your first bag doesn't meet your expectations, reach out. We'll send a replacement free, or refund you completely. We're confident you'll love it, but if you don't, we want to make it right.",
              },
              {
                question: "How do you ship? How long does it take?",
                answer:
                  "We ship via USPS Priority Mail. Most orders arrive within 2-4 business days. You'll get tracking info as soon as your order ships. All subscription orders ship free—that's our promise.",
              },
              {
                question: "Can I choose which origins I receive?",
                answer:
                  "Explorer subscribers get our featured monthly selections. Enthusiast and Obsessed subscribers can customize their origin choices through your account dashboard. Or just let us surprise you—we're pretty good at this.",
              },
              {
                question: "What brewing methods work best?",
                answer:
                  "Our coffee is roasted to shine across all brewing methods: pour-over, French press, drip, espresso, AeroPress—you name it. We provide brewing tips with each order, but honestly, good beans are pretty forgiving.",
              },
              {
                question: "Do you offer decaf?",
                answer:
                  "Not yet, but we're working on sourcing a decaf that meets our quality standards. It's harder than you'd think. Join our email list and we'll let you know when we nail it.",
              },
              {
                question: 'What\'s a "micro-lot" and why should I care?',
                answer:
                  "Micro-lots are small-batch, ultra-premium coffees—think limited harvest from a specific section of a farm. They're often experimental varieties or special processing methods. Enthusiast and Obsessed subscribers get early or exclusive access to these when we source them. They're special, and they don't last long.",
              },
            ]}
          />
        </div>
      </SectionWrapper>

      <SectionWrapper background="gradient" paddingY="large">
        <CtaBanner
          eyebrow="Ready to Start?"
          heading="Still Reading? You Must Really Love Coffee."
          subhead="Join hundreds of coffee lovers who've upgraded their mornings. First bag guaranteed or your money back."
          primaryCtaLabel="Start Your Subscription"
          primaryCtaHref="#pricing"
        />
      </SectionWrapper>

      <FooterSimple
        companyName="Ember Roasters"
        links={[
          { label: "Subscriptions", href: "#pricing" },
          { label: "Our Story", href: "#story" },
          { label: "FAQ", href: "#faq" },
          { label: "Contact", href: "#contact" },
        ]}
        socialLinks={[
          { platform: "instagram", href: "https://instagram.com/emberroasterspdx" },
        ]}
        copyrightText="© 2024 Ember Roasters. Portland, Oregon."
      />