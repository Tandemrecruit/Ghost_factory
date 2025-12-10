import {
  NavSimple,
  HeroSimple,
  FeatureGrid,
  FeatureSteps,
  TestimonialCards,
  StatsHighlight,
  FaqAccordion,
  GuaranteeBlock,
  ContactForm,
  CtaBanner,
  FooterSimple,
  SectionWrapper,
  LogoCloud,
} from '@/components'

export default function Page() {
  return (
    <div className="min-h-screen bg-white font-[Inter]">
      {/* Navigation */}
      <NavSimple
        logoSrc="/images/logo.svg"
        logoAlt="Comfort Breeze Heating & Air"
        links={[
          { label: 'Services', href: '#services' },
          { label: 'Why Choose Us', href: '#why' },
          { label: 'Service Area', href: '#area' },
          { label: 'About', href: '#about' },
        ]}
        ctaLabel="Call Now: (586) XXX-XXXX"
        ctaHref="tel:586XXXXXXX"
      />

      {/* Hero Section */}
      <SectionWrapper background="gradient" paddingY="large">
        <HeroSimple
          blockId="hero_main"
          heading="Stop Sweating and Freezing in Your Own House"
          subhead="Sterling Heights' trusted HVAC team — on-time service, upfront pricing, no surprises."
          primaryCtaLabel="Call Now to Schedule Service"
          primaryCtaHref="tel:586XXXXXXX"
        />
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ✓ Same-day emergency service available • Licensed & Insured in Michigan
          </p>
        </div>
      </SectionWrapper>

      {/* Trust Indicators */}
      <SectionWrapper background="white" paddingY="small">
        <StatsHighlight
          eyebrow=""
          heading=""
          stats={[
            { value: 'Family-Owned', label: '& Operated', icon: 'users' },
            { value: 'Licensed', label: '& Insured in Michigan', icon: 'shield' },
            { value: 'Since 2012', label: 'Serving Metro Detroit', icon: 'award' },
            { value: 'Upfront Pricing', label: 'No Surprise Fees', icon: 'check-circle' },
          ]}
        />
      </SectionWrapper>

      {/* Service Overview Bar */}
      <SectionWrapper background="gray" paddingY="medium">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {[
              'AC Installation & Replacement',
              'Furnace Repair & Replacement',
              'Spring AC Tune-Ups',
              'Fall Furnace Checks',
              'Emergency No-Heat Service',
              'Indoor Air Quality',
            ].map((service, idx) => (
              <div key={idx} className="p-4">
                <p className="text-sm font-medium text-gray-800">{service}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Services We Offer */}
      <SectionWrapper background="white" paddingY="large">
        <FeatureGrid
          eyebrow="Our Services"
          heading="Services We Offer"
          subhead="From routine maintenance to emergency repairs, we've got you covered."
          features={[
            {
              title: 'AC Installation & Replacement',
              description:
                "Time for a new system? We'll assess your home, explain your options clearly, and install a unit that fits your budget and cooling needs. No confusing jargon — just honest advice about what makes sense for your house and your family.",
              icon: 'sparkles',
            },
            {
              title: 'Furnace Repair & Replacement',
              description:
                "Whether it's a minor fix or time for a new furnace, we'll give you honest recommendations — not a hard sell. We've repaired 20-year-old furnaces and installed brand-new systems. We'll tell you which option makes the most sense for you.",
              icon: 'zap',
            },
            {
              title: 'Spring AC Tune-Up',
              description:
                "Get your AC ready before the heat hits. A quick tune-up catches small problems before they become expensive repairs. We'll clean, inspect, and make sure everything's running efficiently — so you're not caught off guard during the first heat wave.",
              icon: 'check',
            },
            {
              title: 'Fall Furnace Check',
              description:
                "Our seasonal inspection includes a carbon monoxide safety check, so your family stays warm and safe all winter. We'll test all the important stuff, replace your filter, and let you know if anything needs attention before the cold weather arrives.",
              icon: 'shield',
            },
            {
              title: 'Emergency No-Heat Service',
              description:
                "Furnace quit on the coldest night? We offer same-day emergency service to get your heat back fast. We know you can't wait until next Tuesday when it's 15 degrees outside — we'll prioritize your call and get someone out quickly.",
              icon: 'clock',
            },
            {
              title: 'Indoor Air Quality',
              description:
                "From air purifiers to humidity control, we can help improve the air your family breathes every day. If you've noticed more dust, dry air in winter, or allergies acting up at home, we can suggest solutions that actually work.",
              icon: 'heart',
            },
          ]}
          columns={3}
        />
      </SectionWrapper>

      {/* Why Sterling Heights Homeowners Call Us */}
      <SectionWrapper background="gray" paddingY="large">
        <FeatureGrid
          eyebrow="Why Choose Us"
          heading="Why Sterling Heights Homeowners Call Us"
          subhead="We're not just another HVAC company — we're your neighbors."
          features={[
            {
              title: 'Upfront, Honest Pricing',
              description:
                "We give you clear options — good, better, best — with pricing you see before we start. No surprise fees, no pressure. You'll know exactly what you're paying for and why. If something unexpected comes up, we'll explain it and get your approval before proceeding.",
              icon: 'target',
            },
            {
              title: 'Local Crew, Familiar Faces',
              description:
                "We're not a franchise or a 1-800 number. When you call, you talk to real people who live and work in this community. When we visit, you'll see the same trusted technicians — not a different stranger every time. We're your neighbors, not a call center three states away.",
              icon: 'users',
            },
            {
              title: 'We Fix What Needs Fixing',
              description:
                "Not every problem needs a new system. We'll tell you honestly whether a repair makes sense or it's time to replace — and explain why. If your 8-year-old AC just needs a $200 part, we're not going to tell you to spend $5,000 on a new unit.",
              icon: 'check-circle',
            },
            {
              title: 'On-Time, Every Time',
              description:
                "Your time matters. We show up when we say we will and keep you informed if anything changes. You'll get a call when we're on our way, and if we're running late (it happens), you'll know ahead of time. No waiting around all day wondering when we'll arrive.",
              icon: 'clock',
            },
          ]}
          columns={2}
        />
      </SectionWrapper>

      {/* How It Works */}
      <SectionWrapper background="white" paddingY="large">
        <FeatureSteps
          eyebrow="Simple Process"
          heading="How It Works"
          subhead="Getting comfortable in your home shouldn't be complicated."
          steps={[
            {
              stepNumber: '1',
              title: 'Call or Schedule Online',
              description:
                "Give us a call at (586) XXX-XXXX or fill out our quick online form. We'll find a time that works for your schedule — including evenings and weekends when needed. We'll also let you know what to expect during the visit.",
            },
            {
              stepNumber: '2',
              title: 'We Inspect & Explain',
              description:
                "Our technician assesses the situation, explains what's going on in plain English, and gives you options. We'll show you what we're seeing, answer your questions, and provide clear pricing for each solution. Take your time — we're not here to rush you.",
            },
            {
              stepNumber: '3',
              title: 'You Decide, We Deliver',
              description:
                "Choose what works for you — no pressure, no sales tactics. We complete the work carefully, clean up after ourselves, and make sure you're comfortable with everything before we leave. You'll also get straightforward advice on maintenance so you can avoid future problems.",
            },
          ]}
        />
      </SectionWrapper>

      {/* Safety & Peace of Mind */}
      <SectionWrapper background="primary" paddingY="large">
        <GuaranteeBlock
          heading="Your Family's Safety Is Part of Every Visit"
          description="Every furnace inspection includes a carbon monoxide check. It's not about scaring you — it's about making sure your home is as safe as it is comfortable. Carbon monoxide is invisible and odorless, and a cracked heat exchanger or blocked vent can create a dangerous situation without you knowing. We test during every visit because it takes two minutes and could save your family's life. Peace of mind comes standard with every service call."
          badgeText="Safety First"
          icon="shield"
        />
      </SectionWrapper>

      {/* Service Area */}
      <SectionWrapper background="white" paddingY="large">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4">
            Our Service Area
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-[Inter]">
            Proudly Serving Sterling Heights & Surrounding Communities
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            We provide reliable HVAC service throughout Metro Detroit, typically within a 30-40
            minute drive of Sterling Heights.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {[
              'Sterling Heights',
              'Warren',
              'Troy',
              'Shelby Township',
              'Clinton Township',
              'Macomb Township',
              'Rochester Hills',
              'Utica',
              'Fraser',
              'Roseville',
              'St. Clair Shores',
              'Harrison Township',
            ].map((city, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">{city}</p>
              </div>
            ))}
          </div>
          <p className="text-base text-gray-600">
            Not sure if we cover your area? Give us a call at{' '}
            <a href="tel:586XXXXXXX" className="text-blue-600 font-semibold hover:underline">
              (586) XXX-XXXX
            </a>{' '}
            — we're happy to check.
          </p>
        </div>
      </SectionWrapper>

      {/* About Comfort Breeze */}
      <SectionWrapper background="gray" paddingY="large">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4 text-center">
            About Us
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center font-[Inter]">
            Real People, Real Service, Real Commitment to This Community
          </h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p>
              Comfort Breeze Heating & Air is a family-owned HVAC company based right here in
              Sterling Heights. We're not the biggest operation in Metro Detroit, and that's by
              design.
            </p>
            <p>
              We started this business because we were tired of seeing homeowners treated like
              transaction numbers — pressured into unnecessary replacements, hit with surprise
              charges, or left waiting for service trucks that never showed up on time.
            </p>
            <p>
              We believe you deserve better than that. You deserve clear answers, honest
              recommendations, and technicians who respect your home and your budget. You deserve to
              work with people who'll still be here next year when you need your annual tune-up.
            </p>
            <p>
              Our team lives in the communities we serve. We're licensed and insured professionals
              who take pride in doing things right — the first time, every time. We don't do
              high-pressure sales. We don't pad estimates. We don't disappear after the job is done.
            </p>
            <p>
              We show up on time, explain what's happening with your system in terms you can
              understand, give you real options at honest prices, and stand behind our work. That's
              it. That's the whole business model.
            </p>
            <p className="font-semibold text-gray-900">
              When your heating or cooling isn't working the way it should, we're here to help —
              honestly, reliably, and without the runaround.
            </p>
          </div>
        </div>
      </SectionWrapper>

      {/* Customer Testimonials */}
      <SectionWrapper background="white" paddingY="large">
        <TestimonialCards
          eyebrow="Customer Reviews"
          heading="What Sterling Heights Homeowners Are Saying"
          testimonials={[
            {
              quote:
                "Our furnace went out on a Saturday night in January. Comfort Breeze had someone here Sunday morning. The technician was professional, explained everything clearly, and had us back up and running in a couple hours. Price was fair and they didn't try to sell us a new system we didn't need.",
              name: 'Linda M.',
              role: 'Homeowner',
              company: 'Sterling Heights',
              avatarSrc: '/images/avatar-1.jpg',
            },
            {
              quote:
                "I called three companies about replacing our AC. Two tried to upsell me immediately. Comfort Breeze actually looked at our system, fixed a minor issue for under $200, and said we'd probably get another 3-4 years out of it. That kind of honesty earned my business for life.",
              name: 'Robert T.',
              role: 'Homeowner',
              company: 'Warren',
              avatarSrc: '/images/avatar-2.jpg',
            },
            {
              quote:
                "Sounds simple, but it's rare. Every appointment has been on time. They call when they're on the way. The same technician has come out twice now and remembers our setup. It's refreshing to work with a local company that actually cares.",
              name: 'Jennifer K.',
              role: 'Homeowner',
              company: 'Troy',
              avatarSrc: '/images/avatar-3.jpg',
            },
            {
              quote:
                "Needed a new furnace and was dreading the sales pitch. The Comfort Breeze team gave me three options at different price points, explained the pros and cons of each, and let me decide. No pressure, no tricks. Installation was clean and professional.",
              name: 'Mike D.',
              role: 'Homeowner',
              company: 'Shelby Township',
              avatarSrc: '/images/avatar-4.jpg',
            },
          ]}
        />
      </SectionWrapper>

      {/* Final CTA Block */}
      <SectionWrapper background="gradient" paddingY="large">
        <CtaBanner
          blockId="cta_final"
          eyebrow="Ready to Get Started?"
          heading="Ready for Comfort You Can Count On?"
          subhead="Whether you need an emergency repair, a seasonal tune-up, or honest advice about replacement, we're here to help."
          primaryCtaLabel="Call Now: (586) XXX-XXXX"
          primaryCtaHref="tel:586XXXXXXX"
          secondaryCtaLabel="Schedule Service Online"
          secondaryCtaHref="#contact"
          background="primary"
        />
        <div className="mt-8 text-center">
          <p className="text-sm text-white">
            Same-day emergency service • Licensed & insured • Upfront pricing • No surprise fees
          </p>
          <p className="text-sm text-white mt-4">
            <strong>Office Hours:</strong> Monday-Friday: 7:00 AM - 7:00 PM | Saturday: 8:00 AM -
            5:00 PM | Sunday: Emergency service available
          </p>
        </div>
      </SectionWrapper>

      {/* Contact Form */}
      <SectionWrapper background="white" paddingY="large">
        <ContactForm
          eyebrow="Get In Touch"
          heading="Schedule Your Service"
          subhead="Fill out the form below and we'll call you back within 2 hours during business hours."
          fields={[
            { name: 'name', type: 'text', placeholder: 'Your Name', required: true },
            { name: 'email', type: 'email', placeholder: 'Your Email', required: true },
            { name: 'phone', type: 'phone', placeholder: 'Your Phone Number', required: true },
            {
              name: 'service',
              type: 'text',
              placeholder: 'What service do you need?',
              required: false,
            },
            {
              name: 'message',
              type: 'textarea',
              placeholder: 'Tell us more about your needs',
              required: false,
            },
          ]}
          submitLabel="Request Service"
          successMessage="Thank you! We'll be in touch soon."
        />
      </SectionWrapper>

      {/* Footer */}
      <FooterSimple
        companyName="Comfort Breeze Heating & Air"
        links={[
          { label: 'Services', href: '#services' },
          { label: 'Why Choose Us', href: '#why' },
          { label: 'Service Area', href: '#area' },
          { label: 'About Us', href: '#about' },
          { label: 'Contact', href: '#contact' },
        ]}
        socialLinks={[
          { platform: 'facebook', href: 'https://facebook.com' },
          { platform: 'twitter', href: 'https://twitter.com' },
        ]}
        copyrightText="© 2024 Comfort Breeze Heating & Air. All rights reserved. Licensed & Insured in Michigan. We respect your privacy."
      />
    </div>
  )
}