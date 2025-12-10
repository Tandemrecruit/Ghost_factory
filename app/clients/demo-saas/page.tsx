import {
  HeroSplit,
  LogoCloud,
  FeatureGrid,
  FeatureSteps,
  BentoGrid,
  TestimonialCards,
  PricingTiers,
  FaqAccordion,
  CtaBanner,
  SectionWrapper,
  NavSimple,
  FooterSimple,
} from '@/components'

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <NavSimple
        logoSrc="/images/productflow-logo.svg"
        logoAlt="ProductFlow"
        links={[
          { label: 'Features', href: '#features' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'FAQ', href: '#faq' },
        ]}
        ctaLabel="Start Free Trial"
        ctaHref="https://app.productflow.io/signup"
      />

      <HeroSplit
        heading="Stop Managing Your Product Across 5 Different Tools"
        subhead="ProductFlow consolidates your roadmap planning, user feedback, and sprint execution into one platform. Get your entire product team aligned—finally."
        imageSrc="/images/productflow-dashboard.jpg"
        imageAlt="ProductFlow dashboard showing unified product management interface"
        primaryCtaLabel="Start Free Trial"
        primaryCtaHref="https://app.productflow.io/signup"
        imagePosition="right"
      />

      <SectionWrapper background="gray" paddingY="small">
        <LogoCloud
          eyebrow="Trusted by 500+ product teams worldwide"
          heading=""
          logos={[
            { name: 'SOC 2 Type II Certified', src: '/images/soc2-badge.svg', href: '#' },
            { name: 'GDPR Compliant', src: '/images/gdpr-badge.svg', href: '#' },
            { name: '4.8/5.0 Rating', src: '/images/rating-badge.svg', href: '#' },
          ]}
          grayscale={false}
        />
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <FeatureGrid
          eyebrow="Everything you need"
          heading="One Platform. Every Product Workflow."
          subhead="Consolidate your entire product management stack into a single, powerful platform"
          features={[
            {
              title: 'Roadmap Planning',
              description: 'Build and share roadmaps that actually stay updated. Drag-and-drop prioritization with automatic stakeholder visibility—no more stale spreadsheets.',
              icon: 'target',
            },
            {
              title: 'User Feedback Hub',
              description: 'Capture, organize, and prioritize feedback from customers, support, and sales in one place. Connect insights directly to roadmap items.',
              icon: 'sparkles',
            },
            {
              title: 'Sprint Planning',
              description: 'Plan sprints with full roadmap context. Your engineering team sees the why behind every ticket without switching tools.',
              icon: 'zap',
            },
            {
              title: 'Team Alignment',
              description: 'Real-time visibility for product, engineering, and design. Everyone sees the same priorities, updated automatically.',
              icon: 'check',
            },
          ]}
          columns={2}
        />
      </SectionWrapper>

      <SectionWrapper background="gray" paddingY="medium">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-6">
            <span className="text-blue-900 font-semibold">🔌 50+ Integrations</span>
          </div>
          <h3 className="text-3xl font-bold text-blue-900 mb-4">
            One-click connections to Slack, GitHub, Figma, Jira, Linear, and more
          </h3>
          <p className="text-lg text-gray-700">
            Your data syncs automatically—no developer required
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <FeatureSteps
          eyebrow="Simple setup"
          heading="Up and Running in Minutes, Not Months"
          subhead="Most teams are fully onboarded in under 5 minutes. Need help? Free training sessions included."
          steps={[
            {
              stepNumber: '1',
              title: 'Connect Your Tools',
              description: 'Link your existing tools with one-click integrations. Your data imports automatically.',
            },
            {
              stepNumber: '2',
              title: 'Plan Your Roadmap',
              description: 'Drag and drop to prioritize. Share with stakeholders instantly. Update once, sync everywhere.',
            },
            {
              stepNumber: '3',
              title: 'Execute Sprints',
              description: 'Break roadmap items into tasks. Track progress in real-time. Keep engineering aligned.',
            },
          ]}
        />
      </SectionWrapper>

      <SectionWrapper background="gray" paddingY="large">
        <LogoCloud
          eyebrow="Integrations"
          heading="Works With the Tools You Already Use"
          logos={[
            { name: 'Slack', src: '/images/slack-logo.svg', href: '#' },
            { name: 'GitHub', src: '/images/github-logo.svg', href: '#' },
            { name: 'Figma', src: '/images/figma-logo.svg', href: '#' },
            { name: 'Jira', src: '/images/jira-logo.svg', href: '#' },
            { name: 'Linear', src: '/images/linear-logo.svg', href: '#' },
            { name: 'Notion', src: '/images/notion-logo.svg', href: '#' },
            { name: 'Intercom', src: '/images/intercom-logo.svg', href: '#' },
            { name: 'Zendesk', src: '/images/zendesk-logo.svg', href: '#' },
          ]}
          grayscale={true}
        />
        <div className="text-center mt-8">
          <p className="text-gray-700 mb-4">
            <span className="text-green-600 font-semibold">✓</span> No developer required • 
            <span className="text-green-600 font-semibold"> ✓</span> One-click connections • 
            <span className="text-green-600 font-semibold"> ✓</span> Data syncs automatically
          </p>
          <a href="#" className="text-blue-900 font-semibold hover:text-blue-700">
            See all 50+ integrations →
          </a>
        </div>
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <TestimonialCards
          eyebrow="Customer success stories"
          heading="Product Teams Love ProductFlow"
          testimonials={[
            {
              quote: 'ProductFlow cut our roadmap planning time in half. We went from weekly alignment meetings to real-time visibility.',
              name: 'Sarah Chen',
              role: 'Product Manager',
              company: 'TechStart Inc.',
              avatarSrc: '/images/sarah-chen.jpg',
            },
            {
              quote: 'Finally, one tool that our entire product team actually uses. No more which spreadsheet has the latest roadmap?',
              name: 'Marcus Rodriguez',
              role: 'Head of Product',
              company: 'ScaleUp Co.',
              avatarSrc: '/images/marcus-rodriguez.jpg',
            },
            {
              quote: 'The integrations alone saved us 15 hours per week. Everything syncs automatically—our engineers love it.',
              name: 'Jennifer Park',
              role: 'Product Lead',
              company: 'Growth Labs',
              avatarSrc: '/images/jennifer-park.jpg',
            },
          ]}
        />
      </SectionWrapper>

      <SectionWrapper background="gray" paddingY="large">
        <div className="max-w-7xl mx-auto" id="pricing">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 border-2 border-green-500 rounded-full mb-6">
              <span className="text-green-900 font-bold text-lg">
                🎉 Limited Time: First 100 customers get 20% off for life
              </span>
            </div>
          </div>

          <PricingTiers
            eyebrow="Choose your plan"
            heading="Simple, Transparent Pricing"
            subhead="Start free for 14 days. No credit card required. Cancel anytime."
            tiers={[
              {
                name: 'Starter',
                price: '$29',
                period: 'month',
                description: 'Perfect for small teams just getting started',
                features: [
                  'Up to 10 users',
                  'Unlimited roadmaps',
                  'User feedback hub',
                  'Sprint planning',
                  '10 integrations',
                  'Email support',
                  'SOC 2 Type II certified',
                  'GDPR compliant',
                ],
                ctaLabel: 'Start Free Trial',
                ctaHref: 'https://app.productflow.io/signup',
                highlighted: false,
              },
              {
                name: 'Professional',
                price: '$49',
                period: 'month',
                description: 'Most popular for growing product teams',
                features: [
                  '11-50 users',
                  'Everything in Starter',
                  'All 50+ integrations',
                  'Advanced reporting',
                  'Custom fields',
                  'Priority email & chat support',
                  'Role-based permissions',
                  '24-hour response time',
                ],
                ctaLabel: 'Start Free Trial',
                ctaHref: 'https://app.productflow.io/signup',
                highlighted: true,
                badge: 'MOST POPULAR',
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: 'month',
                description: 'For large teams with advanced needs',
                features: [
                  '50+ users',
                  'Everything in Professional',
                  'SSO/SAML',
                  'Custom contracts',
                  'Dedicated support',
                  'Dedicated account manager',
                  'Custom SLA',
                  'Advanced security controls',
                  'Custom data retention',
                ],
                ctaLabel: 'Contact Sales',
                ctaHref: '#contact',
                highlighted: false,
              },
            ]}
          />

          <div className="text-center mt-12">
            <p className="text-gray-700 text-lg">
              <span className="font-semibold text-gray-900">All plans include:</span>{' '}
              14-day free trial • No credit card required • Free onboarding • Data migration assistance • Cancel anytime
            </p>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <FaqAccordion
          eyebrow="Common questions"
          heading="Frequently Asked Questions"
          subhead="Everything you need to know about ProductFlow"
          faqs={[
            {
              question: 'How long does implementation take?',
              answer: 'Most teams are up and running in under 5 minutes. Simply connect your existing tools, import your data automatically, and start building your roadmap. We also offer free onboarding sessions if you need guidance.',
            },
            {
              question: 'Do I need technical resources to set up integrations?',
              answer: 'No developer required. All 50+ integrations connect with one click through OAuth. Your data syncs automatically in real-time.',
            },
            {
              question: 'What happens to our data if we cancel?',
              answer: 'You own your data, always. Export everything in standard formats (CSV, JSON) at any time. We will retain your data for 30 days after cancellation, then permanently delete it per your request.',
            },
            {
              question: 'Is ProductFlow secure enough for enterprise use?',
              answer: 'Yes. We are SOC 2 Type II certified, GDPR compliant, and use bank-level 256-bit encryption. Enterprise plans include SSO/SAML, advanced security controls, and custom data retention policies.',
            },
            {
              question: 'Can we migrate from our current tools?',
              answer: 'Absolutely. We provide free data migration assistance for all paid plans. Our team will help you import roadmaps, feedback, and historical data from spreadsheets, Trello, Jira, or any other tool.',
            },
            {
              question: 'What if our team grows beyond our plan limit?',
              answer: 'You can upgrade anytime with prorated billing. We will only charge for the difference based on your remaining billing period.',
            },
            {
              question: 'Do you offer refunds?',
              answer: 'Yes. If you are not satisfied within the first 30 days, we will refund your money—no questions asked.',
            },
            {
              question: 'Can we try before committing to a paid plan?',
              answer: 'Yes! Every plan includes a 14-day free trial with full feature access. No credit card required to start.',
            },
          ]}
        />
      </SectionWrapper>

      <SectionWrapper background="primary" paddingY="large">
        <CtaBanner
          eyebrow="Get started today"
          heading="Ready to Stop Juggling Tools?"
          subhead="Join 500+ product teams who consolidated their workflows with ProductFlow. Start your free trial today—no credit card required."
          primaryCtaLabel="Start Free Trial"
          primaryCtaHref="https://app.productflow.io/signup"
          secondaryCtaLabel="Schedule a Demo"
          secondaryCtaHref="#demo"
          background="primary"
        />
        <div className="text-center mt-8">
          <div className="flex flex-wrap justify-center gap-6 text-white/95">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              14-day free trial
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Free onboarding included
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Cancel anytime
            </span>
          </div>
        </div>
      </SectionWrapper>

      <FooterSimple
        companyName="ProductFlow"
        links={[
          { label: 'Features', href: '#features' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'FAQ', href: '#faq' },
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms of Service', href: '/terms' },
        ]}
        socialLinks={[
          { platform: 'twitter', href: 'https://twitter.com/productflow' },
          { platform: 'linkedin', href: 'https://linkedin.com/company/productflow' },
        ]}
        copyrightText="© 2024 ProductFlow. All rights reserved."
      />
    </div>
  )
}