import Image from 'next/image'
import Link from 'next/link'
import {
  HeroSimple,
  TrustBadges,
  FeatureGrid,
  FeatureSteps,
  SectionWrapper,
  CtaBanner,
  ContactForm,
  FooterSimple,
  NavSimple
} from '@/components'

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <NavSimple
        logoSrc="/images/logo.svg"
        logoAlt="Comfort Breeze Heating & Air"
        links={[
          { label: 'Services', href: '#services' },
          { label: 'Why Choose Us', href: '#why-choose-us' },
          { label: 'Service Area', href: '#service-area' },
          { label: 'About', href: '#about' }
        ]}
        ctaLabel="Call Now"
        ctaHref="tel:+15551234567"
      />

      <HeroSimple
        heading="Stop Sweating and Freezing in Your Own Home"
        subhead="Sterling Heights' trusted HVAC team — honest pricing, on-time service, real comfort."
        primaryCtaLabel="Call Now to Schedule Service"
        primaryCtaHref="tel:+15551234567"
        blockId="hero_main"
      />

      <SectionWrapper background="gray" paddingY="small">
        <TrustBadges
          heading=""
          badges={[
            { icon: 'award', label: 'Family-Owned & Operated' },
            { icon: 'shield', label: 'Licensed & Insured' },
            { icon: 'clock', label: 'Serving Sterling Heights' },
            { icon: 'zap', label: 'Same-Day Emergency Service' }
          ]}
        />
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <FeatureGrid
          eyebrow="Our Services"
          heading="Heating, Cooling & Air Quality Services for Your Home"
          subhead=""
          features={[
            {
              title: 'AC Installation & Changeouts',
              description: 'Upgrade to efficient cooling that actually keeps up.',
              icon: 'sparkles'
            },
            {
              title: 'Furnace Replacement & Repair',
              description: 'Stay warm with a system that runs safely and reliably.',
              icon: 'zap'
            },
            {
              title: 'Spring AC Tune-Ups',
              description: 'Get ahead of the heat with a quick system check.',
              icon: 'check'
            },
            {
              title: 'Fall Furnace Inspections',
              description: 'Prep your furnace before the first freeze.',
              icon: 'shield'
            },
            {
              title: 'Emergency No-Heat Service',
              description: 'Furnace out? We offer same-day response.',
              icon: 'clock'
            },
            {
              title: 'Indoor Air Quality Options',
              description: 'Breathe easier with cleaner air solutions.',
              icon: 'heart'
            }
          ]}
          columns={3}
        />
      </SectionWrapper>

      <SectionWrapper background="gray" paddingY="large">
        <FeatureGrid
          eyebrow="Why Choose Us"
          heading="Why Homeowners Around Sterling Heights Call Us"
          subhead=""
          features={[
            {
              title: 'Honest, Upfront Pricing',
              description: 'No surprise fees. We explain your options — good, better, and best — so you choose what\'s right for your budget.',
              icon: 'target'
            },
            {
              title: 'Same Crew, Every Time',
              description: 'We\'re a small local team. You\'ll see the same familiar faces, not a rotating cast of strangers.',
              icon: 'star'
            },
            {
              title: 'We Fix, Not Push',
              description: 'Need a repair? We\'ll repair it. We only recommend replacement when it truly makes sense — and we\'ll show you why.',
              icon: 'check'
            }
          ]}
          columns={3}
        />
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <FeatureSteps
          eyebrow="How It Works"
          heading="Getting Comfortable Is Easy"
          subhead=""
          steps={[
            {
              stepNumber: '1',
              title: 'Call or Request Online',
              description: 'Reach a real person during business hours. No phone trees, no runaround.'
            },
            {
              stepNumber: '2',
              title: 'We Inspect & Explain',
              description: 'Our technician arrives on time, diagnoses the issue, and walks you through what we find.'
            },
            {
              stepNumber: '3',
              title: 'You Pick Your Option',
              description: 'Choose the solution that fits your needs and budget. We get to work.'
            }
          ]}
        />
      </SectionWrapper>

      <SectionWrapper background="primary" paddingY="medium">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h2 className="font-['Inter'] text-3xl md:text-4xl font-bold text-white mb-4">
            Your Family's Safety Matters to Us
          </h2>
          <p className="font-['Inter'] text-lg text-white/90 max-w-2xl mx-auto">
            Every furnace inspection includes a carbon monoxide safety check. It's a quick step that gives you peace of mind — and it's part of every visit, not an upsell.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <div className="max-w-4xl mx-auto text-center px-4">
          <p className="font-['Inter'] text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4">
            Service Area
          </p>
          <h2 className="font-['Inter'] text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Proudly Serving Our Neighbors
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="font-['Inter'] text-lg text-gray-700 font-medium">Sterling Heights</div>
            <div className="font-['Inter'] text-lg text-gray-700 font-medium">Warren</div>
            <div className="font-['Inter'] text-lg text-gray-700 font-medium">Troy</div>
            <div className="font-['Inter'] text-lg text-gray-700 font-medium">Shelby Township</div>
            <div className="font-['Inter'] text-lg text-gray-700 font-medium">Clinton Township</div>
            <div className="font-['Inter'] text-lg text-gray-700 font-medium">Surrounding Areas</div>
          </div>
          <p className="font-['Inter'] text-base text-gray-600 italic">
            We're based right here in Sterling Heights — not a call center hours away.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper background="gray" paddingY="large">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="font-['Inter'] text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4">
              About Us
            </p>
            <h2 className="font-['Inter'] text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Meet Your Local HVAC Team
            </h2>
            <p className="font-['Inter'] text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Comfort Breeze is family-owned and operated right here in Sterling Heights. We're not a franchise or a big corporate outfit — just a small crew of HVAC pros who take pride in doing honest work for our neighbors.
            </p>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <ContactForm
          eyebrow="Get Started"
          heading="Request a Quote"
          subhead="Fill out the form below and we'll get back to you within 24 hours."
          fields={[
            { name: 'name', type: 'text', placeholder: 'Your Name', required: true },
            { name: 'phone', type: 'phone', placeholder: 'Phone Number', required: true },
            { name: 'email', type: 'email', placeholder: 'Email Address', required: true },
            { name: 'service', type: 'text', placeholder: 'Service Needed', required: true },
            { name: 'message', type: 'textarea', placeholder: 'Brief Description (Optional)', required: false }
          ]}
          submitLabel="Submit Request"
          successMessage="Thank you! We'll contact you within 24 hours."
        />
      </SectionWrapper>

      <CtaBanner
        eyebrow="Ready to Get Comfortable?"
        heading="Call now for same-day service or schedule your tune-up online"
        subhead="Financing available for larger replacements — ask us for details."
        primaryCtaLabel="Call Now to Schedule Service"
        primaryCtaHref="tel:+15551234567"
        secondaryCtaLabel="Request a Quote"
        secondaryCtaHref="#contact"
        background="primary"
        blockId="cta_final"
      />

      <FooterSimple
        companyName="Comfort Breeze Heating & Air"
        links={[
          { label: 'AC Services', href: '#services' },
          { label: 'Furnace Services', href: '#services' },
          { label: 'Tune-Ups & Maintenance', href: '#services' },
          { label: 'Emergency Service', href: 'tel:+15551234567' },
          { label: 'Service Area', href: '#service-area' }
        ]}
        socialLinks={[
          { platform: 'facebook', href: 'https://facebook.com' }
        ]}
        copyrightText="Licensed & Insured | Michigan License Number on File. Serving Sterling Heights, Warren, Troy, Shelby Township, Clinton Township, and surrounding communities."
      />
    </div>
  )
}