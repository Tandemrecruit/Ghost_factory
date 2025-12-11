import {
  NavSimple,
  HeroSimple,
  TrustBadges,
  FeatureGrid,
  SectionWrapper,
  FeatureSteps,
  GuaranteeBlock,
  TestimonialCards,
  CtaBanner,
  FooterSimple
} from '@/components'

export default function ComfortBreezeHeatingAirPage() {
  return (
    <div className="min-h-screen bg-white font-['Inter']">
      {/* Navigation */}
      <NavSimple
        logoSrc="/images/comfort-breeze-logo.svg"
        logoAlt="Comfort Breeze Heating & Air"
        links={[
          { label: 'Services', href: '#services' },
          { label: 'Why Choose Us', href: '#why-choose-us' },
          { label: 'Service Area', href: '#service-area' },
          { label: 'About', href: '#about' }
        ]}
        ctaLabel="Call (586) XXX-XXXX"
        ctaHref="tel:586XXXXXXX"
      />

      {/* Hero Section */}
      <SectionWrapper background="white" paddingY="large">
        <HeroSimple
          blockId="hero_main"
          heading="When Your Furnace Quits at Midnight, We Answer"
          subhead="Family-owned HVAC experts serving Sterling Heights homeowners with honest pricing, reliable repairs, and the same friendly faces every visit. No surprises. No pressure. Just comfort."
          primaryCtaLabel="Call (586) XXX-XXXX"
          primaryCtaHref="tel:586XXXXXXX"
        />
      </SectionWrapper>

      {/* Trust Bar */}
      <SectionWrapper background="gray" paddingY="small">
        <TrustBadges
          heading=""
          badges={[
            { icon: 'shield', label: 'Licensed & Insured' },
            { icon: 'award', label: 'Family-Owned & Local' },
            { icon: 'check-circle', label: 'Serving Sterling Heights Since 2010' },
            { icon: 'lock', label: 'No Hidden Fees, Ever' }
          ]}
        />
      </SectionWrapper>

      {/* Services Overview */}
      <SectionWrapper background="white" paddingY="large">
        <div id="services">
          <FeatureGrid
            eyebrow="Our Services"
            heading="HVAC Services You Can Count On"
            subhead="From seasonal tune-ups to emergency repairs, we handle all your heating and cooling needs with honest, upfront pricing."
            features={[
              {
                title: 'AC Installation & Replacement',
                description: 'Beat the Michigan heat with efficient AC systems sized right for your home. We help you choose the best fit for your budget.',
                icon: 'sparkles'
              },
              {
                title: 'Furnace Replacement & Repair',
                description: "From minor repairs to full replacements, we'll get your furnace running safely and efficiently—without pushing upgrades you don't need.",
                icon: 'zap'
              },
              {
                title: 'Spring AC Tune-Up',
                description: "Don't wait for the first 85-degree day. Our seasonal tune-up catches small issues before they become expensive breakdowns.",
                icon: 'check'
              },
              {
                title: 'Fall Furnace Check',
                description: 'A pre-season inspection ensures your family stays warm and safe, with carbon monoxide testing included in every visit.',
                icon: 'shield'
              },
              {
                title: 'Emergency No-Heat Service',
                description: 'Furnace down in the middle of winter? We understand the urgency. Call us for fast, professional emergency service.',
                icon: 'clock'
              },
              {
                title: 'Indoor Air Quality',
                description: 'From air purifiers to humidity control, we help you create healthier indoor air for your family—especially important for allergies.',
                icon: 'heart'
              }
            ]}
            columns={3}
          />
        </div>
      </SectionWrapper>

      {/* Why Choose Us */}
      <SectionWrapper background="gray" paddingY="large">
        <div id="why-choose-us">
          <FeatureGrid
            eyebrow="Why Choose Us"
            heading="Why Your Sterling Heights Neighbors Keep Calling Us Back"
            subhead="We're not just another HVAC company. We're your neighbors, and we treat your home like we'd treat our own."
            features={[
              {
                title: 'Honest, Upfront Pricing',
                description: "We present clear options—good, better, and best—and explain what each one means. No hidden fees. No pressure. When a repair makes sense, we'll repair it. The decision is always yours.",
                icon: 'target'
              },
              {
                title: 'Real People, Real Answers',
                description: "Call us and talk to an actual human who knows Sterling Heights. Our technicians aren't rotating strangers; they're your neighbors, and you'll see the same friendly faces on every visit.",
                icon: 'heart'
              },
              {
                title: 'We Fix First, Replace When It Makes Sense',
                description: "If your system can be repaired affordably and will give you a few more good years, we'll tell you. We only recommend replacement when it genuinely makes financial sense—or when safety is at risk.",
                icon: 'award'
              }
            ]}
            columns={3}
          />
        </div>
      </SectionWrapper>

      {/* How It Works */}
      <SectionWrapper background="white" paddingY="large">
        <FeatureSteps
          eyebrow="Our Process"
          heading="Getting Comfortable Again Is This Easy"
          subhead="From your first call to a warm, safe home, we make the entire process simple and stress-free."
          steps={[
            {
              stepNumber: '1',
              title: 'Call or Schedule Online',
              description: 'Give us a call and talk to someone who cares, or fill out our simple online form to request service at your convenience. Either way, we respond quickly.'
            },
            {
              stepNumber: '2',
              title: 'We Inspect & Explain Everything',
              description: "Our technician arrives on time, thoroughly diagnoses your system, and walks you through exactly what we found—in plain English. We'll answer every question you have."
            },
            {
              stepNumber: '3',
              title: 'You Choose Your Best Option',
              description: 'We present your options with transparent, upfront pricing for each one. Then you decide what works for your home, your family, and your budget. No pressure. No rush.'
            }
          ]}
        />
      </SectionWrapper>

      {/* Safety & Peace of Mind */}
      <SectionWrapper background="primary" paddingY="large">
        <GuaranteeBlock
          heading="Your Family's Safety Is Part of Every Job"
          description="Keeping your home comfortable means keeping it safe. That's why every furnace inspection we perform includes a carbon monoxide test—at no extra charge. It's a simple step that protects what matters most. Carbon monoxide is odorless and invisible, but it's preventable. Our technicians check for leaks, test your system's ventilation, and make sure your furnace is operating safely."
          badgeText="Safe homes. Warm homes. That's the Comfort Breeze promise."
          icon="shield"
        />
      </SectionWrapper>

      {/* Testimonials */}
      <SectionWrapper background="white" paddingY="large">
        <TestimonialCards
          eyebrow="Customer Reviews"
          heading="What Your Neighbors Are Saying"
          testimonials={[
            {
              quote: "Our furnace went out on a Sunday night, and I was panicking. I called Comfort Breeze first thing Monday morning, and they had someone here by noon. The technician was professional, explained everything, and had us up and running within two hours. No pressure to replace anything—just an honest repair at a fair price.",
              name: 'Jennifer M.',
              role: 'Homeowner',
              company: 'Sterling Heights',
              avatarSrc: '/images/avatar-female-1.jpg'
            },
            {
              quote: "We've used other companies before, and they always wanted to replace everything. Comfort Breeze came out for our annual furnace check, found a minor issue, fixed it for under $200, and told us we'd get several more good years out of our system. That kind of honesty is rare.",
              name: 'Robert T.',
              role: 'Homeowner',
              company: 'Warren',
              avatarSrc: '/images/avatar-male-1.jpg'
            },
            {
              quote: "What I appreciate most is the consistency. It's the same technician every visit, and he remembers our house and our system. He takes the time to answer my husband's questions and never makes us feel rushed. It's like having a trusted friend who happens to be an HVAC expert.",
              name: 'Linda K.',
              role: 'Homeowner',
              company: 'Troy',
              avatarSrc: '/images/avatar-female-2.jpg'
            },
            {
              quote: "From the moment they arrived, I knew we'd made the right choice. They wore shoe covers, laid down mats, and cleaned up everything before they left. The technician was respectful, knowledgeable, and didn't talk down to me when I asked basic questions.",
              name: 'David S.',
              role: 'Homeowner',
              company: 'Shelby Township',
              avatarSrc: '/images/avatar-male-2.jpg'
            },
            {
              quote: "After they replaced our old furnace, the technician walked me through the carbon monoxide test and showed me how to change filters. He even programmed our new thermostat. I feel so much safer knowing our system was installed by people who actually care.",
              name: 'Maria G.',
              role: 'Homeowner',
              company: 'Clinton Township',
              avatarSrc: '/images/avatar-female-3.jpg'
            },
            {
              quote: "Another company quoted us $8,000 for a full AC replacement. We called Comfort Breeze for a second opinion, and they diagnosed a $400 repair that's been working perfectly for two years now. They could have easily agreed with the first quote, but instead they gave us the truth.",
              name: 'Michael and Susan P.',
              role: 'Homeowners',
              company: 'Macomb',
              avatarSrc: '/images/avatar-couple-1.jpg'
            }
          ]}
        />
      </SectionWrapper>

      {/* Service Area */}
      <SectionWrapper background="gray" paddingY="large">
        <div id="service-area" className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">
            Local Service
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-['Inter']">
            Proudly Serving Your Neighborhood
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            We're based in Sterling Heights and serve homeowners throughout the surrounding communities:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-800 text-base">
            <div className="flex items-center justify-center gap-2">
              <span className="text-orange-600">✓</span> Sterling Heights
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-orange-600">✓</span> Warren
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-orange-600">✓</span> Troy
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-orange-600">✓</span> Shelby Township
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-orange-600">✓</span> Clinton Township
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-orange-600">✓</span> Utica
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-orange-600">✓</span> Macomb
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-orange-600">✓</span> Fraser
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-orange-600">✓</span> Roseville
            </div>
          </div>
          <p className="text-gray-600 mt-6 italic">
            And surrounding areas within 30-40 minutes
          </p>
          <p className="text-gray-700 mt-4">
            If you're not sure whether we serve your area, give us a call—we're happy to help.
          </p>
        </div>
      </SectionWrapper>

      {/* About Section */}
      <SectionWrapper background="white" paddingY="large">
        <div id="about" className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">
              About Us
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-['Inter']">
              A Local Team You Can Trust in Your Home
            </h2>
          </div>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              Comfort Breeze Heating & Air is a family-owned business built on a simple belief: your home deserves honest service from people who care. For over a decade, we've been serving Sterling Heights and the surrounding communities with reliable HVAC solutions that put homeowners first—not sales quotas.
            </p>
            <p>
              We're not a faceless corporate chain. We're your neighbors. We live here, work here, and raise our families here. When you invite us into your home, we treat it with the same respect we'd want for our own. That means showing up on time, explaining everything clearly, cleaning up after ourselves, and standing behind our work.
            </p>
            <p>
              We got into this business because we genuinely love helping homeowners stay comfortable and safe. Whether it's a quick repair that saves you thousands or an honest conversation about when replacement makes sense, we're here to be the HVAC company you can trust for the long haul.
            </p>
          </div>
          <div className="mt-8 text-center">
            <div className="inline-block bg-gray-200 rounded-lg px-6 py-4 text-gray-600 italic">
              [Team photo placeholder - upload your actual team photo here]
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Final CTA */}
      <SectionWrapper background="gradient" paddingY="large">
        <CtaBanner
          blockId="cta_final"
          eyebrow="Ready for Service?"
          heading="Ready for Reliable Comfort?"
          subhead="Call now to schedule your seasonal tune-up, get help with an emergency, or just ask a question. We're here to help."
          primaryCtaLabel="Call (586) XXX-XXXX"
          primaryCtaHref="tel:586XXXXXXX"
          secondaryCtaLabel="Or request service online →"
          secondaryCtaHref="/contact"
          background="primary"
        />
        <div className="text-center mt-6">
          <p className="text-sm text-white opacity-90 italic">
            Flexible financing available for qualifying installations and replacements. Ask us for details.
          </p>
        </div>
      </SectionWrapper>

      {/* Footer */}
      <FooterSimple
        companyName="Comfort Breeze Heating & Air"
        links={[
          { label: 'Services', href: '#services' },
          { label: 'Service Area', href: '#service-area' },
          { label: 'About Us', href: '#about' },
          { label: 'Request Service', href: '/contact' },
          { label: 'Emergency Service', href: 'tel:586XXXXXXX' },
          { label: 'Financing Options', href: '/financing' },
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms of Service', href: '/terms' }
        ]}
        socialLinks={[
          { platform: 'facebook', href: 'https://facebook.com/comfortbreezeheating' },
          { platform: 'instagram', href: 'https://instagram.com/comfortbreezeheating' }
        ]}
        copyrightText="© 2024 Comfort Breeze Heating & Air. All rights reserved. Licensed and insured in the State of Michigan."
      />
    </div>
  )
}