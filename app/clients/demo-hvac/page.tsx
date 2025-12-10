import { 
  HeroSimple,
  FeatureGrid,
  FeatureSteps,
  TestimonialCards,
  StatsHighlight,
  FaqAccordion,
  ContactForm,
  CtaBanner,
  SectionWrapper,
  LogoCloud,
  FooterSimple,
  NavSimple
} from '@/components'

export default function Page() {
  return (
    <>
      <NavSimple
        logoSrc="/images/comfort-breeze-logo.svg"
        logoAlt="Comfort Breeze Heating & Air"
        links={[
          { label: "Services", href: "#services" },
          { label: "Why Choose Us", href: "#why-us" },
          { label: "Service Area", href: "#service-area" },
          { label: "About", href: "#about" }
        ]}
        ctaLabel="Call (586) XXX-XXXX"
        ctaHref="tel:586XXXXXXX"
      />

      <HeroSimple
        blockId="hero_main"
        heading="Stop Sweating and Freezing in Your Own House"
        subhead="Sterling Heights' trusted HVAC team — on-time service, upfront pricing, no surprises."
        primaryCtaLabel="Call Now to Schedule Service"
        primaryCtaHref="tel:586XXXXXXX"
      />

      <SectionWrapper background="gray" paddingY="small">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">AC Installation & Replacement</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">Furnace Repair & Replacement</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">Spring AC Tune-Ups</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">Fall Furnace Checks</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">Emergency No-Heat Service</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">Indoor Air Quality</span>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="small">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏠</span>
              <span className="font-semibold text-gray-900">Family-Owned & Operated</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span className="font-semibold text-gray-900">Licensed & Insured in Michigan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="font-semibold text-gray-900">Serving Metro Detroit Since 2012</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="font-semibold text-gray-900">Upfront Pricing — No Surprise Fees</span>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <div id="services" className="scroll-mt-20">
          <FeatureGrid
            eyebrow="What We Do"
            heading="Services We Offer"
            subhead="Honest HVAC solutions for every season and situation"
            features={[
              {
                title: "AC Installation & Replacement",
                description: "Time for a new system? We'll assess your home, explain your options clearly, and install a unit that fits your budget and cooling needs. No confusing jargon — just honest advice about what makes sense for your house and your family.",
                icon: "zap"
              },
              {
                title: "Furnace Repair & Replacement",
                description: "Whether it's a minor fix or time for a new furnace, we'll give you honest recommendations — not a hard sell. We've repaired 20-year-old furnaces and installed brand-new systems. We'll tell you which option makes the most sense for you.",
                icon: "zap"
              },
              {
                title: "Spring AC Tune-Up",
                description: "Get your AC ready before the heat hits. A quick tune-up catches small problems before they become expensive repairs. We'll clean, inspect, and make sure everything's running efficiently — so you're not caught off guard during the first heat wave.",
                icon: "check"
              },
              {
                title: "Fall Furnace Check",
                description: "Our seasonal inspection includes a carbon monoxide safety check, so your family stays warm and safe all winter. We'll test all the important stuff, replace your filter, and let you know if anything needs attention before the cold weather arrives.",
                icon: "shield"
              },
              {
                title: "Emergency No-Heat Service",
                description: "Furnace quit on the coldest night? We offer same-day emergency service to get your heat back fast. We know you can't wait until next Tuesday when it's 15 degrees outside — we'll prioritize your call and get someone out quickly.",
                icon: "clock"
              },
              {
                title: "Indoor Air Quality",
                description: "From air purifiers to humidity control, we can help improve the air your family breathes every day. If you've noticed more dust, dry air in winter, or allergies acting up at home, we can suggest solutions that actually work.",
                icon: "heart"
              }
            ]}
            columns={3}
          />
        </div>
      </SectionWrapper>

      <SectionWrapper background="gray" paddingY="large">
        <div id="why-us" className="scroll-mt-20">
          <FeatureGrid
            eyebrow="The Comfort Breeze Difference"
            heading="Why Sterling Heights Homeowners Call Us"
            subhead="Local service you can trust, without the pressure or surprises"
            features={[
              {
                title: "Upfront, Honest Pricing",
                description: "We give you clear options — good, better, best — with pricing you see before we start. No surprise fees, no pressure. You'll know exactly what you're paying for and why. If something unexpected comes up, we'll explain it and get your approval before proceeding.",
                icon: "target"
              },
              {
                title: "Local Crew, Familiar Faces",
                description: "We're not a franchise or a 1-800 number. When you call, you talk to real people who live and work in this community. When we visit, you'll see the same trusted technicians — not a different stranger every time. We're your neighbors, not a call center three states away.",
                icon: "heart"
              },
              {
                title: "We Fix What Needs Fixing",
                description: "Not every problem needs a new system. We'll tell you honestly whether a repair makes sense or it's time to replace — and explain why. If your 8-year-old AC just needs a $200 part, we're not going to tell you to spend $5,000 on a new unit.",
                icon: "check"
              },
              {
                title: "On-Time, Every Time",
                description: "Your time matters. We show up when we say we will and keep you informed if anything changes. You'll get a call when we're on our way, and if we're running late (it happens), you'll know ahead of time. No waiting around all day wondering when we'll arrive.",
                icon: "clock"
              }
            ]}
            columns={2}
          />
        </div>
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <FeatureSteps
          eyebrow="Simple Process"
          heading="How It Works"
          subhead="From your first call to completed service — straightforward and pressure-free"
          steps={[
            {
              stepNumber: "1",
              title: "Call or Schedule Online",
              description: "Give us a call at (586) XXX-XXXX or fill out our quick online form. We'll find a time that works for your schedule — including evenings and weekends when needed. We'll also let you know what to expect during the visit."
            },
            {
              stepNumber: "2",
              title: "We Inspect & Explain",
              description: "Our technician assesses the situation, explains what's going on in plain English, and gives you options. We'll show you what we're seeing, answer your questions, and provide clear pricing for each solution. Take your time — we're not here to rush you."
            },
            {
              stepNumber: "3",
              title: "You Decide, We Deliver",
              description: "Choose what works for you — no pressure, no sales tactics. We complete the work carefully, clean up after ourselves, and make sure you're comfortable with everything before we leave. You'll also get straightforward advice on maintenance so you can avoid future problems."
            }
          ]}
        />
      </SectionWrapper>

      <SectionWrapper background="primary" paddingY="large">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            Your Family's Safety Is Part of Every Visit
          </h2>
          <p className="text-lg text-white/90 mb-6 max-w-3xl mx-auto leading-relaxed">
            Every furnace inspection includes a carbon monoxide check. It's not about scaring you — it's about making sure your home is as safe as it is comfortable.
          </p>
          <p className="text-base text-white/80 max-w-3xl mx-auto leading-relaxed">
            Carbon monoxide is invisible and odorless, and a cracked heat exchanger or blocked vent can create a dangerous situation without you knowing. We test during every visit because it takes two minutes and could save your family's life. If we find an issue, we'll explain exactly what it is, why it matters, and what your options are to fix it safely.
          </p>
          <p className="text-lg font-semibold text-white mt-6">
            Peace of mind comes standard with every service call.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <TestimonialCards
          eyebrow="Customer Reviews"
          heading="What Sterling Heights Homeowners Are Saying"
          testimonials={[
            {
              quote: "Our furnace went out on a Saturday night in January. Comfort Breeze had someone here Sunday morning. The technician was professional, explained everything clearly, and had us back up and running in a couple hours. Price was fair and they didn't try to sell us a new system we didn't need.",
              name: "Linda M.",
              role: "Homeowner",
              company: "Sterling Heights",
              avatarSrc: "/images/avatar-1.jpg"
            },
            {
              quote: "I called three companies about replacing our AC. Two tried to upsell me immediately. Comfort Breeze actually looked at our system, fixed a minor issue for under $200, and said we'd probably get another 3-4 years out of it. That kind of honesty earned my business for life.",
              name: "Robert T.",
              role: "Homeowner",
              company: "Warren",
              avatarSrc: "/images/avatar-2.jpg"
            },
            {
              quote: "Sounds simple, but it's rare. Every appointment has been on time. They call when they're on the way. The same technician has come out twice now and remembers our setup. It's refreshing to work with a local company that actually cares.",
              name: "Jennifer K.",
              role: "Homeowner",
              company: "Troy",
              avatarSrc: "/images/avatar-3.jpg"
            },
            {
              quote: "Needed a new furnace and was dreading the sales pitch. The Comfort Breeze team gave me three options at different price points, explained the pros and cons of each, and let me decide. No pressure, no tricks. Installation was clean and professional.",
              name: "Mike D.",
              role: "Homeowner",
              company: "Shelby Township",
              avatarSrc: "/images/avatar-4.jpg"
            },
            {
              quote: "I hired Comfort Breeze to do a furnace inspection for my elderly parents. They were patient, thorough, and made sure my mom understood everything. They found a small carbon monoxide concern and fixed it same-day. Can't thank them enough.",
              name: "Susan L.",
              role: "Homeowner",
              company: "Clinton Township",
              avatarSrc: "/images/avatar-5.jpg"
            }
          ]}
        />
      </SectionWrapper>

      <SectionWrapper background="gray" paddingY="large">
        <div id="service-area" className="scroll-mt-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
            Service Area
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">
            Proudly Serving Sterling Heights & Surrounding Communities
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            We provide reliable HVAC service throughout Metro Detroit, typically within a 30-40 minute drive of Sterling Heights.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-left mb-8">
            {[
              "Sterling Heights",
              "Warren",
              "Troy",
              "Shelby Township",
              "Clinton Township",
              "Macomb Township",
              "Rochester Hills",
              "Utica",
              "Fraser",
              "Roseville",
              "St. Clair Shores",
              "Harrison Township"
            ].map((city) => (
              <div key={city} className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 font-medium">{city}</span>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <p className="text-gray-800 font-medium">
              <strong>Not sure if we cover your area?</strong> Give us a call at <a href="tel:586XXXXXXX" className="text-blue-600 hover:text-blue-800 underline">(586) XXX-XXXX</a> — we're happy to check. If we're a bit outside your area but can still help, we'll let you know. And if we can't make it work, we'll try to point you toward someone who can.
            </p>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <div id="about" className="scroll-mt-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
              About Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">
              Real People, Real Service, Real Commitment to This Community
            </h2>
          </div>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p>
              Comfort Breeze Heating & Air is a family-owned HVAC company based right here in Sterling Heights. We're not the biggest operation in Metro Detroit, and that's by design.
            </p>
            <p>
              We started this business because we were tired of seeing homeowners treated like transaction numbers — pressured into unnecessary replacements, hit with surprise charges, or left waiting for service trucks that never showed up on time.
            </p>
            <p>
              We believe you deserve better than that. You deserve clear answers, honest recommendations, and technicians who respect your home and your budget. You deserve to work with people who'll still be here next year when you need your annual tune-up.
            </p>
            <p>
              Our team lives in the communities we serve. We're licensed and insured professionals who take pride in doing things right — the first time, every time. We don't do high-pressure sales. We don't pad estimates. We don't disappear after the job is done.
            </p>
            <p>
              We show up on time, explain what's happening with your system in terms you can understand, give you real options at honest prices, and stand behind our work. That's it. That's the whole business model.
            </p>
            <p className="text-xl font-semibold text-gray-900 text-center mt-8">
              When your heating or cooling isn't working the way it should, we're here to help — honestly, reliably, and without the runaround.
            </p>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <FaqAccordion
          eyebrow="Common Questions"
          heading="What Homeowners Ask Us"
          subhead="Honest answers to help you make informed decisions"
          faqs={[
            {
              question: "Do you offer emergency service?",
              answer: "Yes. We offer same-day emergency service when your furnace goes out or your AC stops working. Call us at (586) XXX-XXXX and we'll prioritize your call, especially during extreme weather. We understand you can't wait days when it's 15 degrees outside or 95 degrees inside."
            },
            {
              question: "How much does a service call cost?",
              answer: "Our standard service call is a flat diagnostic fee. If you proceed with the repair, that fee is applied toward the work. We'll give you clear pricing options before we start any work — no surprise charges. Emergency calls after hours may have an additional fee, which we'll tell you about upfront when you call."
            },
            {
              question: "Should I repair or replace my HVAC system?",
              answer: "It depends on the age of your system, the cost of the repair, and how long you plan to stay in your home. We'll give you honest guidance. If your system is under 10 years old and the repair is reasonable, we'll usually recommend fixing it. If it's 15+ years old with expensive repairs needed, replacement often makes more sense. We'll explain the math clearly so you can decide."
            },
            {
              question: "Do you offer financing?",
              answer: "Yes, we work with financing partners to offer payment plans for larger installations and replacements. We'll walk you through the options when we give you a quote. Our goal is to make quality HVAC work affordable and accessible."
            },
            {
              question: "How often should I get my HVAC system serviced?",
              answer: "We recommend a tune-up twice a year — spring for your AC and fall for your furnace. Regular maintenance catches small problems early, improves efficiency, and extends the life of your system. Think of it like an oil change for your car. We'll send you a reminder when it's time."
            },
            {
              question: "What areas do you service?",
              answer: "We primarily serve Sterling Heights and surrounding Metro Detroit communities within a 30-40 minute radius, including Warren, Troy, Shelby Township, Clinton Township, and more. Not sure if we cover your area? Give us a call and we'll let you know."
            }
          ]}
        />
      </SectionWrapper>

      <CtaBanner
        blockId="cta_final"
        eyebrow="Ready to Get Started?"
        heading="Ready for Comfort You Can Count On?"
        subhead="Whether you need an emergency repair, a seasonal tune-up, or honest advice about replacement, we're here to help."
        primaryCtaLabel="Call (586) XXX-XXXX"
        primaryCtaHref="tel:586XXXXXXX"
        secondaryCtaLabel="Schedule Online"
        secondaryCtaHref="#contact"
        background="primary"
      />

      <SectionWrapper background="white" paddingY="large">
        <div id="contact" className="scroll-mt-20">
          <ContactForm
            eyebrow="Get in Touch"
            heading="Schedule Your Service"
            subhead="Fill out the form below and we'll call you back within 2 hours during business hours."
            fields={[
              {
                name: "name",
                type: "text",
                placeholder: "Your Name",
                required: true
              },
              {
                name: "phone",
                type: "phone",
                placeholder: "Phone Number",
                required: true
              },
              {
                name: "email",
                type: "email",
                placeholder: "Email Address",
                required: true
              },
              {
                name: "service",
                type: "text",
                placeholder: "What service do you need?",
                required: false
              },
              {
                name: "message",
                type: "textarea",
                placeholder: "Tell us more about your HVAC needs (optional)",
                required: false
              }
            ]}
            submitLabel="Request Service"
            successMessage="Thank you! We'll contact you within 2 hours during business hours."
          />
        </div>
      </SectionWrapper>

      <FooterSimple
        companyName="Comfort Breeze Heating & Air"
        links={[
          { label: "Services", href: "#services" },
          { label: "Why Choose Us", href: "#why-us" },
          { label: "Service Area", href: "#service-area" },
          { label: "About", href: "#about" },
          { label: "Contact", href: "#contact" }
        ]}
        socialLinks={[
          { platform: "facebook", href: "https://facebook.com" },
          { platform: "instagram", href: "https://instagram.com" }
        ]}
        copyrightText="© 2024 Comfort Breeze Heating & Air. All rights reserved. Licensed & Insured in Michigan."
      />
    </>
  )
}