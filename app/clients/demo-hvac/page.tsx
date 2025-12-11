import Image from 'next/image'
import Link from 'next/link'
import {
  HeroSimple,
  TrustBadges,
  FeatureGrid,
  FeatureSteps,
  SectionWrapper,
  GuaranteeBlock,
  ContactForm,
  CtaBanner,
  NavSimple,
  FooterSimple,
  MetricsProvider
} from '@/components'

export default async function Page({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params
  const metricsEnabled = process.env.GF_METRICS_ENABLED === 'true'

  return (
    <MetricsProvider clientId={clientId} enabled={metricsEnabled}>
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <NavSimple
          logoSrc="/images/logo.svg"
          logoAlt="Comfort Breeze Heating & Air"
          links={[
            { label: "Services", href: "#services" },
            { label: "Why Choose Us", href: "#why-choose" },
            { label: "Service Area", href: "#service-area" },
            { label: "About", href: "#about" }
          ]}
          ctaLabel="Call Now"
          ctaHref="tel:+1234567890"
        />

        {/* Hero Section */}
        <HeroSimple
          heading="Stop Sweating and Freezing in Your Own House"
          subhead="Your neighbors in Sterling Heights trust Comfort Breeze for honest HVAC service—no surprises, no upsells"
          primaryCtaLabel="Call Now to Schedule Service"
          primaryCtaHref="tel:+1234567890"
        />

        {/* Trust Indicators */}
        <SectionWrapper background="gray" paddingY="small">
          <TrustBadges
            heading=""
            badges={[
              { icon: "shield", label: "Licensed & Insured" },
              { icon: "award", label: "Family-Owned & Local" },
              { icon: "check-circle", label: "Upfront Pricing—No Surprise Fees" },
              { icon: "check", label: "Real Humans Answer the Phone" }
            ]}
          />
        </SectionWrapper>

        {/* Services Overview */}
        <SectionWrapper background="white" paddingY="large">
          <FeatureGrid
            eyebrow="OUR SERVICES"
            heading="HVAC Services That Keep Your Home Comfortable Year-Round"
            subhead="Questions about what you need? Call us—we'll explain your options clearly."
            features={[
              {
                title: "AC Installation & Changeouts",
                description: "Efficient cooling systems sized right for your home—because one-size-fits-all never works in Michigan summers.",
                icon: "zap"
              },
              {
                title: "Furnace Replacement & Repair",
                description: "Reliable heat when Michigan winters hit. We'll help you decide if repair or replacement makes more sense for your situation.",
                icon: "sparkles"
              },
              {
                title: "Spring AC Tune-Ups",
                description: "Get ready before the heat waves arrive. A spring check catches small problems before they become expensive emergencies.",
                icon: "check"
              },
              {
                title: "Fall Furnace Checks",
                description: "Ensure safe, efficient heating all season. Includes carbon monoxide safety inspection with every visit.",
                icon: "shield"
              },
              {
                title: "Emergency No-Heat Service",
                description: "Same-day response when you need it most. We know a broken furnace in January can't wait until next week.",
                icon: "clock"
              },
              {
                title: "Indoor Air Quality Options",
                description: "Cleaner air for healthier homes. We'll explain what makes sense for your family without overselling equipment you don't need.",
                icon: "heart"
              }
            ]}
            columns={3}
          />
        </SectionWrapper>

        {/* Why Choose Us */}
        <SectionWrapper background="gray" paddingY="large">
          <FeatureGrid
            eyebrow="WHY COMFORT BREEZE"
            heading="Why Sterling Heights Homeowners Choose Comfort Breeze"
            subhead=""
            features={[
              {
                title: "Honest Options, No Pressure",
                description: "We give you good, better, and best choices with upfront pricing. We'll tell you if a repair makes more sense than a replacement—because it's your money, not ours.",
                icon: "check-circle"
              },
              {
                title: "Small Crew, Familiar Faces",
                description: "You'll see the same local technicians who know your system. We're not a rotating cast of strangers—we're your neighbors.",
                icon: "users"
              },
              {
                title: "We Actually Show Up",
                description: "Real humans answer during business hours. We arrive when we say we will. If something changes, we call you first.",
                icon: "clock"
              }
            ]}
            columns={3}
          />
        </SectionWrapper>

        {/* How It Works */}
        <SectionWrapper background="white" paddingY="large">
          <FeatureSteps
            eyebrow="GETTING STARTED"
            heading="Getting Started Is Simple"
            subhead="Ready to get started? Call now or schedule online."
            steps={[
              {
                stepNumber: "1",
                title: "Call or Request Online",
                description: "Reach out by phone or fill out our quick online form. We'll find a time that works for your schedule."
              },
              {
                stepNumber: "2",
                title: "We Inspect & Explain",
                description: "Our technician arrives on time, diagnoses the issue, and walks you through what we find—no confusing jargon."
              },
              {
                stepNumber: "3",
                title: "You Choose Your Option",
                description: "We present clear choices with upfront pricing. You decide what's right for your home and budget."
              }
            ]}
          />
        </SectionWrapper>

        {/* Safety Message */}
        <SectionWrapper background="primary" paddingY="medium">
          <GuaranteeBlock
            heading="Your Family's Safety Matters"
            description="A fall furnace tune-up isn't just about comfort—it includes a carbon monoxide check to make sure your system is running safely. It's one of those things that's easy to overlook but important to get right. We handle it as part of every inspection."
            badgeText="Safety First"
            icon="shield"
          />
        </SectionWrapper>

        {/* Service Area */}
        <SectionWrapper background="white" paddingY="large">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-accent font-semibold text-sm uppercase tracking-wide mb-4">SERVICE AREA</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-[family-name:var(--font-heading)]">
              Proudly Serving Sterling Heights & Surrounding Communities
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto font-[family-name:var(--font-body)]">
              We're based in Sterling Heights and serve homeowners within about 30–40 minutes of our location. Communities we frequently serve include:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-left max-w-2xl mx-auto">
              <div className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                <span className="text-gray-700">Sterling Heights</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                <span className="text-gray-700">Warren</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                <span className="text-gray-700">Troy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                <span className="text-gray-700">Shelby Township</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                <span className="text-gray-700">Clinton Township</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                <span className="text-gray-700">Utica</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                <span className="text-gray-700">Macomb Township</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                <span className="text-gray-700">Rochester Hills</span>
              </div>
            </div>
            <p className="text-gray-600 font-[family-name:var(--font-body)]">
              <strong>Not sure if we cover your area?</strong> Give us a call—we're happy to confirm we can reach you.
            </p>
            <p className="text-sm text-gray-500 mt-4 italic font-[family-name:var(--font-body)]">
              Note: Our service area does not include downtown Detroit.
            </p>
          </div>
        </SectionWrapper>

        {/* About / Local Story */}
        <SectionWrapper background="gray" paddingY="large">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-accent font-semibold text-sm uppercase tracking-wide mb-4">OUR STORY</p>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-[family-name:var(--font-heading)]">
                  Local, Family-Owned, and Proud of It
                </h2>
                <div className="space-y-4 text-gray-700 font-[family-name:var(--font-body)]">
                  <p>
                    Comfort Breeze isn't a franchise or a call center. We're a small HVAC team based right here in Sterling Heights. When you call during business hours, you talk to a real person. When we come to your home, you'll see familiar faces who take pride in doing the job right.
                  </p>
                  <p>
                    We believe in straightforward service: show up on time, explain your options clearly, and fix the problem without surprise fees. That's it. No gimmicks, no pressure—just honest work for our neighbors.
                  </p>
                </div>
              </div>
              <div className="relative h-96 rounded-lg overflow-hidden bg-gray-300">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <p className="text-center px-4">Team Photo Placeholder<br /><span className="text-sm">(Client to provide authentic team/owner photo)</span></p>
                </div>
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Contact & Scheduling */}
        <SectionWrapper background="white" paddingY="large">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-[family-name:var(--font-heading)]">
                Let's Fix Your Comfort Problem
              </h2>
              <div className="grid md:grid-cols-3 gap-8 text-left max-w-3xl mx-auto mb-12">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-accent">📞</span> Call Us
                  </h3>
                  <p className="text-lg font-bold text-primary mb-1">[Client Phone Number]</p>
                  <p className="text-sm text-gray-600">Real humans answer during business hours.</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-accent">🕒</span> Business Hours
                  </h3>
                  <p className="text-sm text-gray-700 mb-1">[Client to Provide Hours]</p>
                  <p className="text-sm text-gray-600">Monday – Friday</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-accent">✉️</span> Email
                  </h3>
                  <p className="text-sm text-gray-700 mb-1">[Client Email]</p>
                  <p className="text-sm text-gray-600">We respond within 1 business day.</p>
                </div>
              </div>
            </div>

            <ContactForm
              eyebrow="REQUEST SERVICE"
              heading="Request Service Online"
              subhead="Fill out the form below and we'll get back to you within 1 business day to schedule your appointment."
              fields={[
                { name: "name", type: "text", placeholder: "Full Name", required: true },
                { name: "phone", type: "phone", placeholder: "Phone Number", required: true },
                { name: "email", type: "email", placeholder: "Email Address", required: true },
                { name: "address", type: "text", placeholder: "Street Address", required: true },
                { name: "city", type: "text", placeholder: "City", required: true },
                { name: "message", type: "textarea", placeholder: "Tell us more about your situation (optional)", required: false }
              ]}
              submitLabel="Request Service"
              successMessage="Thank you for contacting Comfort Breeze! We've received your service request and will get back to you within 1 business day to schedule your appointment."
            />
          </div>
        </SectionWrapper>

        {/* Final CTA Banner */}
        <CtaBanner
          eyebrow="READY FOR COMFORT?"
          heading="Stop Suffering in Your Own Home"
          subhead="Call now or request service online—we're here to help"
          primaryCtaLabel="Call Now"
          primaryCtaHref="tel:+1234567890"
          secondaryCtaLabel="Request Service"
          secondaryCtaHref="#contact"
          background="primary"
        />

        {/* Footer */}
        <FooterSimple
          companyName="Comfort Breeze Heating & Air"
          links={[
            { label: "Services", href: "#services" },
            { label: "Service Area", href: "#service-area" },
            { label: "About Us", href: "#about" },
            { label: "Contact", href: "#contact" }
          ]}
          socialLinks={[]}
          copyrightText="Licensed & Insured | Sterling Heights, MI"
        />

        {/* Sticky Mobile CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-50 shadow-lg">
          <div className="flex gap-3 max-w-md mx-auto">
            <a
              href="tel:+1234567890"
              className="flex-1 bg-primary text-white py-3 px-4 rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors"
              data-gf-cta="primary"
            >
              📞 Call Now
            </a>
            <a
              href="#contact"
              className="flex-1 bg-secondary text-white py-3 px-4 rounded-lg font-semibold text-center hover:bg-orange-600 transition-colors"
            >
              📝 Request Service
            </a>
          </div>
        </div>
      </div>
    </MetricsProvider>
  )
}