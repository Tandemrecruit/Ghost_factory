import Image from 'next/image'
import {
  HeroSimple,
  LogoCloud,
  FeatureGrid,
  FeatureSteps,
  VideoEmbed,
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
    <div className="min-h-screen bg-white font-['Inter']">
      {/* Navigation */}
      <NavSimple
        logoSrc="/images/productflow-logo.svg"
        logoAlt="ProductFlow"
        links={[
          { label: 'Features', href: '#features' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'Integrations', href: '#integrations' },
          { label: 'Customers', href: '#testimonials' },
        ]}
        ctaLabel="Start Free Trial"
        ctaHref="#trial"
      />

      {/* Hero Section */}
      <SectionWrapper background="white" paddingY="large">
        <HeroSimple
          blockId="hero_simple_v1"
          heading="Stop Managing Your Product Across 5 Different Tools"
          subhead="ProductFlow consolidates your roadmap, user feedback, and sprint planning into one platform your entire team will actually use."
          primaryCtaLabel="Start Free Trial"
          primaryCtaHref="#trial"
        />
      </SectionWrapper>

      {/* Social Proof Bar */}
      <SectionWrapper background="gray" paddingY="small">
        <LogoCloud
          eyebrow="Trusted by 500+ product teams worldwide"
          heading=""
          logos={[
            { name: 'SOC 2 Type II', src: '/images/soc2-badge.svg', href: '#' },
            { name: 'GDPR Compliant', src: '/images/gdpr-badge.svg', href: '#' },
            { name: '4.8/5 Rating', src: '/images/rating-badge.svg', href: '#' },
          ]}
          grayscale={false}
        />
      </SectionWrapper>

      {/* Problem/Pain Agitation */}
      <SectionWrapper background="white" paddingY="large">
        <FeatureGrid
          eyebrow="Sound Familiar?"
          heading="You don't need another tool. You need fewer tools that do more."
          subhead=""
          features={[
            {
              title: 'Your roadmap lives in one tool, feedback in another, and sprints in a third',
              description: "You've tried to make it work, but context gets lost in translation. Every handoff is a potential miscommunication.",
              icon: 'alert-circle',
            },
            {
              title: 'You spend hours every week updating stakeholders because no one has visibility',
              description: "Engineering asks about priorities. Design needs context. Leadership wants status updates. You're a human API between disconnected systems.",
              icon: 'clock',
            },
            {
              title: 'Every quick sync turns into a 30-minute alignment meeting',
              description: "Without a shared source of truth, your calendar fills with meetings that exist solely to answer what are we building and why?",
              icon: 'calendar',
            },
          ]}
          columns={3}
        />
      </SectionWrapper>

      {/* Solution Overview */}
      <SectionWrapper background="gradient" paddingY="large">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-['Inter']">
            One Platform. Complete Alignment.
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            ProductFlow gives your team a single source of truth for product planning, feedback management, and sprint execution. See what you're building, why it matters, and who it's for—all in one place.
          </p>
          <div className="bg-white rounded-lg shadow-2xl p-4">
            <div className="relative w-full aspect-video rounded overflow-hidden">
              <Image
                src="/images/productflow-dashboard.png"
                alt="The ProductFlow dashboard showing roadmaps, feedback, and sprints working together"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1152px"
              />
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Features & Benefits */}
      <SectionWrapper background="white" paddingY="large">
        <FeatureGrid
          eyebrow="Everything Your Product Team Needs"
          heading="Nothing You Don't"
          subhead=""
          features={[
            {
              title: 'Roadmaps that stay current',
              description: 'Visual roadmaps that sync with your sprints automatically. Update once, and everyone from engineering to executives sees the same plan. No more Monday morning update scrambles.',
              icon: 'calendar',
            },
            {
              title: 'Feedback that fuels decisions',
              description: "Capture user insights from support tickets, surveys, and direct conversations in one place. Tag, categorize, and link feedback directly to roadmap items so you're building what matters.",
              icon: 'sparkles',
            },
            {
              title: 'Sprints your team actually follows',
              description: "Plan sprints that pull directly from your prioritized roadmap. Your team sees what's shipping, why it matters, and how it connects to the bigger picture.",
              icon: 'zap',
            },
            {
              title: 'Stakeholders, finally in the loop',
              description: "Real-time visibility for engineering, design, and leadership without endless status meetings. Everyone knows what's happening without interrupting your team's flow.",
              icon: 'users',
            },
          ]}
          columns={2}
        />
      </SectionWrapper>

      {/* How It Works */}
      <SectionWrapper background="gray" paddingY="large">
        <FeatureSteps
          eyebrow="Up and Running in Minutes"
          heading="Not Months"
          subhead="Getting started with ProductFlow is straightforward. No lengthy implementation, no consultant required."
          steps={[
            {
              stepNumber: '1',
              title: 'Connect Your Tools',
              description: 'One-click integrations with Slack, GitHub, Figma, and 50+ more. Your existing data syncs automatically—no manual imports or spreadsheet wrangling.',
            },
            {
              stepNumber: '2',
              title: 'Build Your Roadmap',
              description: 'Import existing plans or start fresh. Drag, drop, and prioritize your way. Add context, attach feedback, and set timelines that work for your team.',
            },
            {
              stepNumber: '3',
              title: 'Align & Execute',
              description: 'Your team sees the plan, the feedback behind it, and the current sprint in one view. Ship with confidence, knowing everyone understands the why behind the work.',
            },
          ]}
        />
      </SectionWrapper>

      {/* Integration Showcase */}
      <SectionWrapper background="white" paddingY="large">
        <LogoCloud
          eyebrow="Works With the Tools You Already Use"
          heading="50+ Native Integrations"
          logos={[
            { name: 'Slack', src: '/images/logos/slack.svg', href: '#' },
            { name: 'GitHub', src: '/images/logos/github.svg', href: '#' },
            { name: 'Figma', src: '/images/logos/figma.svg', href: '#' },
            { name: 'Linear', src: '/images/logos/linear.svg', href: '#' },
            { name: 'Jira', src: '/images/logos/jira.svg', href: '#' },
            { name: 'Notion', src: '/images/logos/notion.svg', href: '#' },
            { name: 'Google Workspace', src: '/images/logos/google.svg', href: '#' },
            { name: 'Microsoft Teams', src: '/images/logos/microsoft.svg', href: '#' },
            { name: 'Zapier', src: '/images/logos/zapier.svg', href: '#' },
            { name: 'Intercom', src: '/images/logos/intercom.svg', href: '#' },
            { name: 'Zendesk', src: '/images/logos/zendesk.svg', href: '#' },
            { name: 'Asana', src: '/images/logos/asana.svg', href: '#' },
          ]}
          grayscale={true}
        />
      </SectionWrapper>

      {/* Testimonials */}
      <SectionWrapper background="gray" paddingY="large">
        <TestimonialCards
          eyebrow="What Product Teams Are Saying"
          heading=""
          testimonials={[
            {
              quote: 'ProductFlow cut our roadmap planning time in half. What used to take me three hours every week now takes 90 minutes, and the output is clearer for everyone on the team.',
              name: 'Sarah Chen',
              role: 'Product Manager',
              company: 'TechStart Inc.',
              avatarSrc: '/images/avatars/sarah-chen.jpg',
            },
            {
              quote: "Finally, one tool that our entire product team actually uses. Our engineers check ProductFlow for context. Our designers use it to understand priorities. I use it to communicate with stakeholders. Everyone's looking at the same information.",
              name: 'Marcus Rodriguez',
              role: 'Head of Product',
              company: 'ScaleUp Co.',
              avatarSrc: '/images/avatars/marcus-rodriguez.jpg',
            },
            {
              quote: "The feedback hub changed how we prioritize. Instead of scattered notes and half-remembered conversations, we have organized insights linked to actual roadmap decisions. Our team knows we're building based on real user needs, not assumptions.",
              name: 'Jennifer Park',
              role: 'Senior Product Manager',
              company: 'DataFlow',
              avatarSrc: '/images/avatars/jennifer-park.jpg',
            },
          ]}
        />
      </SectionWrapper>

      {/* Pricing */}
      <SectionWrapper background="white" paddingY="large">
        <PricingTiers
          eyebrow="Straightforward Pricing"
          heading="For Growing Teams"
          subhead="All plans include unlimited roadmaps, feedback items, and integrations. Start with what you need, scale as you grow."
          tiers={[
            {
              name: 'Starter',
              price: '$29',
              period: 'month',
              description: 'Perfect for small product teams getting started',
              features: [
                'Up to 5 users',
                'Unlimited roadmaps',
                'Feedback management',
                'Sprint planning',
                '50+ integrations',
                'Email support',
              ],
              ctaLabel: 'Start Free Trial',
              ctaHref: '#trial',
              highlighted: false,
              badge: '',
            },
            {
              name: 'Professional',
              price: '$49',
              period: 'month',
              description: 'For growing teams that need advanced collaboration',
              features: [
                'Up to 25 users',
                'Everything in Starter, plus:',
                'Custom fields and views',
                'Advanced permissions',
                'Priority support',
                'Onboarding session',
                'API access',
              ],
              ctaLabel: 'Start Free Trial',
              ctaHref: '#trial',
              highlighted: true,
              badge: 'MOST POPULAR',
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              period: 'month',
              description: 'For larger organizations with specific needs',
              features: [
                'Unlimited users',
                'Everything in Professional, plus:',
                'SSO/SAML authentication',
                'Dedicated success manager',
                'Custom integrations',
                'SLA guarantee',
                'Advanced security controls',
              ],
              ctaLabel: 'Schedule Demo',
              ctaHref: '#demo',
              highlighted: false,
              badge: '',
            },
          ]}
        />
      </SectionWrapper>

      {/* FAQ */}
      <SectionWrapper background="gray" paddingY="large">
        <FaqAccordion
          eyebrow="Frequently Asked Questions"
          heading=""
          subhead=""
          faqs={[
            {
              question: 'How long does implementation take?',
              answer: 'Most teams are up and running within 30 minutes. Connect your tools, import your roadmap (or build one from scratch), and invite your team. We provide onboarding guides and our support team is available if you need help.',
            },
            {
              question: 'What happens to our data if we decide ProductFlow isn\'t right for us?',
              answer: 'You can export all your data (roadmaps, feedback, notes) at any time. We provide clean CSV and JSON exports. No lock-in, no hassle.',
            },
            {
              question: 'Can we migrate from our current tools?',
              answer: 'Yes. ProductFlow has import tools for common platforms, and our support team can help with migration planning. Many teams run ProductFlow alongside existing tools during a transition period.',
            },
            {
              question: 'Do you offer training for our team?',
              answer: 'Professional and Enterprise plans include an onboarding session. We also provide documentation, video tutorials, and responsive support. Most teams find ProductFlow intuitive enough that formal training isn\'t necessary.',
            },
            {
              question: 'How does pricing work as we add more team members?',
              answer: 'You only pay for active users. Add or remove team members anytime—billing adjusts automatically. No annual commitments required.',
            },
            {
              question: 'Is our data secure?',
              answer: 'Yes. ProductFlow is SOC 2 Type II certified and GDPR compliant. All data is encrypted in transit and at rest. We conduct regular security audits and maintain comprehensive backup systems.',
            },
          ]}
        />
      </SectionWrapper>

      {/* Final CTA */}
      <SectionWrapper background="primary" paddingY="large">
        <CtaBanner
          blockId="cta_banner_v1"
          eyebrow="Join 500+ product teams"
          heading="See How Much Time Your Team Can Save"
          subhead="Start your free trial today—no credit card required. Setup in under 30 minutes."
          primaryCtaLabel="Start Free Trial"
          primaryCtaHref="#trial"
          secondaryCtaLabel="Schedule Demo"
          secondaryCtaHref="#demo"
          background="primary"
        />
      </SectionWrapper>

      {/* Footer */}
      <FooterSimple
        companyName="ProductFlow"
        links={[
          { label: 'Features', href: '#features' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'Integrations', href: '#integrations' },
          { label: 'Documentation', href: '/docs' },
          { label: 'Help Center', href: '/help' },
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms of Service', href: '/terms' },
        ]}
        socialLinks={[
          { platform: 'twitter', href: 'https://twitter.com/productflow' },
          { platform: 'linkedin', href: 'https://linkedin.com/company/productflow' },
        ]}
        copyrightText="© 2024 ProductFlow. All rights reserved. SOC 2 Type II Certified • GDPR Compliant"
      />
    </div>
  )
}