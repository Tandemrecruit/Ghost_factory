import {
  HeroSimple,
  FeatureSteps,
  FeatureGrid,
  BentoGrid,
  LogoCloud,
  PricingTiers,
  TestimonialCards,
  FaqAccordion,
  CtaBanner,
  SectionWrapper,
  NavSimple,
  FooterSimple
} from '@/components'

export default function Page() {
  return (
    <div className="min-h-screen bg-stone-100">
      <NavSimple
        logoSrc="/images/ember-logo.svg"
        logoAlt="Ember Roasters"
        links={[
          { label: "How It Works", href: "#how-it-works" },
          { label: "Our Coffee", href: "#origins" },
          { label: "Pricing", href: "#pricing" },
          { label: "About", href: "#story" }
        ]}
        ctaLabel="Start Subscription"
        ctaHref="#pricing"
      />

      {/* Hero Section */}
      <SectionWrapper background="dark" paddingY="large">
        <HeroSimple
          heading="Your Mornings Deserve Better Than Last Month's Coffee"
          subhead="Fresh-roasted specialty coffee delivered to your door—every bag roasted to order, never sitting on a shelf. Subscribe and taste the difference freshness makes."
          primaryCtaLabel="Start Your Subscription"
          primaryCtaHref="#pricing"
        />
        <div className="text-center mt-6">
          <a href="#pricing" className="text-accent hover:text-secondary transition-colors text-sm font-medium">
            Or try a single bag first
          </a>
        </div>
        <div className="flex justify-center mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-lg">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium text-stone-900">Ships within 48 hours of roasting • Roast date on every bag</span>
          </div>
        </div>
      </SectionWrapper>

      {/* Social Proof Bar */}
      <SectionWrapper background="white" paddingY="small">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-primary mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            Trusted by coffee lovers nationwide
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
          <div>
            <div className="text-3xl font-bold text-primary mb-2">⭐ 4.9/5</div>
            <p className="text-stone-700 text-sm">from 2,400+ reviews</p>
          </div>
          <div>
            <div className="text-sm font-semibold text-stone-900 mb-2">Featured in:</div>
            <p className="text-stone-700 text-sm italic">Bon Appétit • Portland Monthly • Sprudge</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">12,000+</div>
            <p className="text-stone-700 text-sm">subscribers brewing better mornings</p>
          </div>
        </div>
      </SectionWrapper>

      {/* How It Works */}
      <SectionWrapper background="gray" paddingY="large">
        <div id="how-it-works">
          <FeatureSteps
            eyebrow="Simple Process"
            heading="Three Steps to Your Best Coffee"
            subhead=""
            steps={[
              {
                stepNumber: "1",
                title: "Pick Your Frequency",
                description: "Select how much coffee you need—from casual sipper to full-blown obsessed. Adjust or pause anytime."
              },
              {
                stepNumber: "2",
                title: "We Roast Fresh",
                description: "Every Monday, we roast your order. No warehouses. No sitting around. Just fresh beans on their way to you."
              },
              {
                stepNumber: "3",
                title: "Delivered to Your Door",
                description: "Your coffee arrives in 2-3 days with the roast date stamped right on the bag. Brew within two weeks for peak flavor."
              }
            ]}
          />
        </div>
      </SectionWrapper>

      {/* Why Ember */}
      <SectionWrapper background="white" paddingY="large">
        <FeatureGrid
          eyebrow="What Makes Us Different"
          heading="Why Coffee Nerds (and Regular Humans) Choose Ember"
          subhead=""
          features={[
            {
              title: "Roasted Fresh Weekly",
              description: "Most grocery store coffee was roasted months ago. Ours? Days ago. Every batch is roasted to order, and every bag is stamped with its roast date. You'll taste the difference in that first sip—brighter, more complex, actually fresh. Because coffee is produce, not a pantry staple.",
              icon: "zap"
            },
            {
              title: "Direct From Farmers",
              description: "We work directly with farming families in Ethiopia, Colombia, and Guatemala—cutting out the middlemen and paying fair prices. Better relationships mean better coffee. You get exceptional beans with actual stories, and farmers get the sustainability to invest in next year's harvest.",
              icon: "globe"
            },
            {
              title: "Stupid-Simple Subscription",
              description: "Pause when you're traveling. Cancel if you want. Change your plan or frequency whenever. No contracts, no phone calls, no \"are you sure?\" guilt trips. We're confident you'll stick around because the coffee's that good—not because we've trapped you.",
              icon: "check"
            }
          ]}
          columns={3}
        />
      </SectionWrapper>

      {/* Coffee Origins */}
      <SectionWrapper background="gray" paddingY="large">
        <div id="origins" className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-secondary font-semibold mb-2 text-sm uppercase tracking-wide">Our Sources</p>
            <h2 className="text-4xl font-bold text-primary mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Meet Your Coffee
            </h2>
          </div>
          
          <BentoGrid
            eyebrow=""
            heading=""
            subhead=""
            items={[
              {
                title: "Ethiopia – Yirgacheffe",
                description: "Bright, floral, almost tea-like. Our Ethiopian beans come from smallholder farmers in Yirgacheffe, where coffee grows wild in the highlands. Expect notes of bergamot, jasmine, and stone fruit. This is coffee that tastes like sunshine feels. Partners: Kebel Cooperative • Altitude: 1,900-2,200m",
                icon: "sparkles",
                size: "large"
              },
              {
                title: "Colombia – Huila",
                description: "Smooth, chocolatey, crowd-pleasing. From the mountains of Huila, these beans are grown by third-generation farmers who know their craft. Rich caramel sweetness with a bright citrus finish. This is the coffee that makes everyone happy. Partners: Finca El Paraíso • Altitude: 1,600-1,850m",
                icon: "star",
                size: "medium"
              },
              {
                title: "Guatemala – Antigua",
                description: "Full-bodied with a satisfying richness. Antigua's volcanic soil produces coffee with deep chocolate notes, hints of spice, and a velvety texture. This is your \"I need to focus\" morning coffee or your \"I deserve this\" afternoon ritual. Partners: Bella Vista Estate • Altitude: 1,500-1,700m",
                icon: "target",
                size: "medium"
              }
            ]}
          />
        </div>
      </SectionWrapper>

      {/* Pricing Tiers */}
      <SectionWrapper background="white" paddingY="large">
        <div id="pricing">
          <PricingTiers
            eyebrow="Choose Your Plan"
            heading="Choose Your Coffee Commitment"
            subhead="All plans include free shipping, flexible scheduling, and the freedom to pause or cancel anytime."
            tiers={[
              {
                name: "Explorer",
                price: "$24",
                period: "month",
                description: "Perfect for: Casual drinkers, coffee curious, or \"I just need my morning cup\" folks",
                features: [
                  "12oz bag (20-24 cups)",
                  "Your choice of origin or rotating selection",
                  "Roasted fresh weekly",
                  "Free shipping",
                  "Cancel anytime",
                  "~$1.00 per cup"
                ],
                ctaLabel: "Choose Explorer",
                ctaHref: "/checkout/explorer",
                highlighted: false
              },
              {
                name: "Enthusiast",
                price: "$42",
                period: "month",
                description: "Perfect for: Daily drinkers, work-from-home warriors, households of 2",
                features: [
                  "2 × 12oz bags (40-48 cups)",
                  "Mix & match origins or try our rotating selection",
                  "Roasted fresh weekly",
                  "Free shipping",
                  "Cancel anytime",
                  "Early access to limited micro-lots",
                  "~$0.88 per cup • Save $6"
                ],
                ctaLabel: "Choose Enthusiast",
                ctaHref: "/checkout/enthusiast",
                highlighted: true,
                badge: "MOST POPULAR"
              },
              {
                name: "Obsessed",
                price: "$72",
                period: "month",
                description: "Perfect for: True coffee lovers, espresso addicts, generous sharers",
                features: [
                  "4 × 12oz bags (80-96 cups)",
                  "Mix & match any origins",
                  "Roasted fresh weekly",
                  "Free shipping",
                  "Cancel anytime",
                  "Exclusive micro-lots + experimental roasts",
                  "Quarterly brewing tips from our roasting team",
                  "~$0.75 per cup • Save $24"
                ],
                ctaLabel: "Choose Obsessed",
                ctaHref: "/checkout/obsessed",
                highlighted: false
              }
            ]}
          />
          <div className="text-center mt-12 max-w-2xl mx-auto">
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-primary mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Less than your weekly latte habit
              </h3>
              <p className="text-stone-700">
                That $5 daily café Americano? That's $150/month. Our Enthusiast plan delivers better coffee—fresher, ethically sourced, brewed exactly how you like it—for $42.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Testimonials */}
      <SectionWrapper background="gray" paddingY="large">
        <TestimonialCards
          eyebrow="Customer Love"
          heading="What Our Subscribers Are Saying"
          testimonials={[
            {
              quote: "I didn't realize how stale my old coffee was until I tried Ember. The difference is insane—it actually smells like *coffee* when I open the bag. I'm three months in and honestly can't go back to grocery store beans.",
              name: "Marcus T.",
              role: "Enthusiast Subscriber",
              company: "Seattle, WA",
              avatarSrc: "/images/avatar-marcus.jpg"
            },
            {
              quote: "The subscription is so easy. I never run out, I never have to think about it, and every bag has been consistently excellent. Plus, I love that I know exactly where my coffee comes from and that farmers are getting paid fairly.",
              name: "Jennifer K.",
              role: "Explorer Subscriber",
              company: "Austin, TX",
              avatarSrc: "/images/avatar-jennifer.jpg"
            },
            {
              quote: "I'm picky about my espresso, and Ember's Guatemala roast is *chef's kiss*. Rich, smooth, pulls beautifully every time. And when I had a question about grind size, their team responded within an hour with genuinely helpful advice. These folks care.",
              name: "David L.",
              role: "Obsessed Subscriber",
              company: "Portland, OR",
              avatarSrc: "/images/avatar-david.jpg"
            }
          ]}
        />
      </SectionWrapper>

      {/* Our Story */}
      <SectionWrapper background="white" paddingY="large">
        <div id="story" className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              We're Coffee Nerds (But We Promise Not to Be Annoying About It)
            </h2>
          </div>
          <div className="prose prose-lg max-w-3xl mx-auto">
            <p className="text-stone-700 leading-relaxed mb-4">
              Ember Roasters started in 2019 in a tiny Portland warehouse when founder Maya Chen couldn't find coffee that was both exceptional *and* unpretentious. Too much specialty coffee culture felt exclusive—like you needed a degree in coffee science just to order a bag. Meanwhile, mass-market coffee tasted like, well, nothing.
            </p>
            <p className="text-stone-700 leading-relaxed mb-4">
              So we built something different. A roastery obsessed with freshness, direct farmer relationships, and actual flavor—without the gatekeeping. We roast small batches every week, work directly with farming families who care as much about quality as we do, and ship beans while they're still singing.
            </p>
            <p className="text-stone-700 leading-relaxed mb-4">
              We're here for the ritual of morning coffee, the comfort of a perfect cup, and the simple joy of something made with care. Whether you're brewing pourover at 6am or just need fuel to survive Monday, you deserve better than stale beans.
            </p>
            <p className="text-primary font-bold text-xl text-center mt-8" style={{ fontFamily: 'Playfair Display, serif' }}>
              Welcome to Ember. Let's make your mornings better.
            </p>
          </div>
        </div>
      </SectionWrapper>

      {/* FAQ */}
      <SectionWrapper background="gray" paddingY="large">
        <FaqAccordion
          eyebrow="Common Questions"
          heading="Questions? We've Got Answers."
          subhead=""
          faqs={[
            {
              question: "How fresh is the coffee when it arrives?",
              answer: "Extremely fresh. We roast every Monday and ship orders within 48 hours of roasting. Your coffee typically arrives 2-4 days after roasting (depending on your location), and every bag is stamped with its roast date. For reference, most grocery store coffee was roasted 3-6 months before it hits shelves. Freshness matters—a lot."
            },
            {
              question: "Can I pause or cancel my subscription?",
              answer: "Absolutely. Log into your account anytime to pause, skip a delivery, or cancel. No phone calls, no hassles, no \"are you sure?\" guilt trips. We want you to stay because you love the coffee, not because we've made it difficult to leave."
            },
            {
              question: "What if I don't like the coffee I receive?",
              answer: "We'll make it right. If you're not happy with your order, email us within 30 days and we'll send a replacement or issue a full refund—your choice. We're confident you'll love our coffee, but if something's off, we want to know."
            },
            {
              question: "Do you ship nationwide? How much is shipping?",
              answer: "We ship to all 50 states, and shipping is always free on subscriptions. One-time purchases get free shipping on orders over $30. We ship via USPS Priority Mail, so most orders arrive within 2-3 business days."
            },
            {
              question: "Can I customize my subscription?",
              answer: "Yes! You can choose specific origins or get our rotating selection, adjust frequency (weekly, bi-weekly, or monthly), mix and match different coffees in multi-bag plans, change your plan level anytime, and add one-time purchases to any subscription order. Just log into your account to make changes."
            },
            {
              question: "How is your coffee sourced?",
              answer: "We work directly with farming families and cooperatives in Ethiopia, Colombia, and Guatemala—relationships we've built over years, not transactions with brokers. We pay well above Fair Trade minimums, visit farms regularly, and prioritize long-term partnerships that let farmers invest in quality and sustainability. Every bean has a story, and we're happy to share it."
            },
            {
              question: "What roast levels do you offer?",
              answer: "Most of our coffees are light-to-medium roasts that highlight origin characteristics—bright, complex, and flavorful without being sour or overly acidic. We believe great beans deserve roasting that showcases their natural qualities rather than covering them up. If you prefer darker roasts, our Guatemala Antigua has more body and richness."
            },
            {
              question: "What grind should I choose?",
              answer: "We recommend ordering whole beans and grinding fresh at home for maximum flavor, but we're happy to grind for you. Options include: Whole bean (our recommendation), Coarse (French press, cold brew), Medium (drip coffee makers), and Fine (espresso machines, Aeropress). Select your preference at checkout or in your subscription settings."
            }
          ]}
        />
      </SectionWrapper>

      {/* Final CTA */}
      <SectionWrapper background="primary" paddingY="large">
        <CtaBanner
          eyebrow="Ready to Upgrade?"
          heading="Your Best Mornings Start Here"
          subhead="Join 12,000+ subscribers who've upgraded their coffee ritual. Fresh-roasted, ethically sourced, delivered to your door. Cancel anytime, satisfaction guaranteed."
          primaryCtaLabel="Start Your Subscription"
          primaryCtaHref="#pricing"
          secondaryCtaLabel="Try a single bag first"
          secondaryCtaHref="/shop"
          background="primary"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
          <div className="text-center">
            <svg className="w-8 h-8 text-accent mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-white text-sm font-medium">Cancel anytime, no commitments</p>
          </div>
          <div className="text-center">
            <svg className="w-8 h-8 text-accent mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-white text-sm font-medium">Free shipping on all subscriptions</p>
          </div>
          <div className="text-center">
            <svg className="w-8 h-8 text-accent mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-white text-sm font-medium">30-day satisfaction guarantee</p>
          </div>
          <div className="text-center">
            <svg className="w-8 h-8 text-accent mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-white text-sm font-medium">Roasted fresh weekly</p>
          </div>
        </div>
      </SectionWrapper>

      {/* Footer */}
      <FooterSimple
        companyName="Ember Roasters"
        links={[
          { label: "About", href: "#story" },
          { label: "FAQ", href: "#faq" },
          { label: "Contact", href: "/contact" },
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" }
        ]}
        socialLinks={[
          { platform: "instagram", href: "https://instagram.com/emberroasters" },
          { platform: "facebook", href: "https://facebook.com/emberroasters" },
          { platform: "twitter", href: "https://twitter.com/emberroasters" }
        ]}
        copyrightText="© 2025 Ember Roasters. Fresh-roasted in Portland, Oregon."
      />
    </div>
  )
}