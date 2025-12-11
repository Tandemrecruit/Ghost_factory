import {
  HeroSimple,
  TrustBadges,
  FeatureGrid,
  FeatureSteps,
  TestimonialCards,
  ContactForm,
  CtaBanner,
  SectionWrapper,
  NavSimple,
  FooterSimple,
  LogoCloud
} from '@/components'

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <NavSimple
        logoSrc="/images/logo.png"
        logoAlt="Comfort Breeze Heating & Air"
        links={[
          { label: "Services", href: "#services" },
          { label: "Why Choose Us", href: "#why-us" },
          { label: "Service Area", href: "#service-area" },
          { label: "About", href: "#about" }
        ]}
        ctaLabel="Call Now: (586) 555-HVAC"
        ctaHref="tel:5865554822"
      />

      <HeroSimple
        heading="Stop Sweating—and Freezing—in Your Own Home"
        subhead="Sterling Heights families trust Comfort Breeze for honest HVAC service with upfront pricing and no surprises."
        primaryCtaLabel="Call Now: (586) 555-HVAC"
        primaryCtaHref="tel:5865554822"
      />

      <SectionWrapper background="gray" paddingY="small">
        <TrustBadges
          heading=""
          badges={[
            { icon: "shield", label: "Licensed & Insured" },
            { icon: "award", label: "Locally Owned & Operated" },
            { icon: "star", label: "15+ Years Serving Your Neighbors" },
            { icon: "check-circle", label: "Real Humans Answer the Phone" }
          ]}
        />
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <FeatureGrid
          eyebrow=""
          heading="What We Do Best"
          subhead=""
          features={[
            {
              title: "AC Installation & Replacement",
              description: "Cool comfort for Michigan summers",
              icon: "sparkles"
            },
            {
              title: "Furnace Repair & Replacement",
              description: "Heat you can count on all winter",
              icon: "zap"
            },
            {
              title: "Spring AC Tune-Ups",
              description: "Get ahead of the heat wave",
              icon: "check"
            },
            {
              title: "Fall Furnace Checkups",
              description: "Safe, efficient heating before the cold hits",
              icon: "shield"
            },
            {
              title: "Emergency No-Heat Service",
              description: "Same-day response when you need it most",
              icon: "clock"
            },
            {
              title: "Indoor Air Quality",
              description: "Breathe easier at home",
              icon: "heart"
            }
          ]}
          columns={3}
        />
        <div className="text-center mt-8">
          <p className="text-lg text-gray-700 mb-4">
            Not sure what you need? Call us — we'll help you figure it out.
          </p>
          <a
            href="tel:5865554822"
            className="inline-block bg-[#E85D04] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#D64E03] transition-colors"
          >
            (586) 555-HVAC
          </a>
        </div>
      </SectionWrapper>

      <SectionWrapper background="gray" paddingY="large">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E5B8C] text-center mb-12">
            Why Sterling Heights Homeowners Choose Us
          </h2>
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#E85D04] rounded-lg flex items-center justify-center text-white text-2xl">
                  💰
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1E5B8C] mb-2">
                    Upfront Pricing, No Surprise Fees
                  </h3>
                  <p className="text-gray-700">
                    We'll explain your options—good, better, and best—before any work begins. The price we quote is the price you pay. No hidden charges. No fine print. No "gotcha" moments when we hand you the bill.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#E85D04] rounded-lg flex items-center justify-center text-white text-2xl">
                  👥
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1E5B8C] mb-2">
                    Same Faces, Every Visit
                  </h3>
                  <p className="text-gray-700">
                    We're a small local crew, not a rotating cast of strangers. You'll see familiar faces who know your home and your system. Once you're a Comfort Breeze customer, you're part of the family.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#E85D04] rounded-lg flex items-center justify-center text-white text-2xl">
                  ⏰
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1E5B8C] mb-2">
                    We Show Up When We Say We Will
                  </h3>
                  <p className="text-gray-700">
                    Your time matters. We call ahead, arrive on schedule, and respect your home like it's our own. Need to leave a key? We treat that trust seriously. Expect courtesy calls, shoe covers, and clean workspaces.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#E85D04] rounded-lg flex items-center justify-center text-white text-2xl">
                  ✅
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1E5B8C] mb-2">
                    Honest Recommendations
                  </h3>
                  <p className="text-gray-700">
                    We'll only suggest replacement when repair isn't the smart choice. You get options and straight talk—never a hard sell. If patching your 8-year-old furnace buys you another three winters, we'll tell you. If it's time to replace, we'll explain exactly why.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <FeatureSteps
          eyebrow=""
          heading="Three Simple Steps to Home Comfort"
          subhead=""
          steps={[
            {
              stepNumber: "1",
              title: "Call or Request Online",
              description: "Reach a real person during business hours. Tell us what's going on—we'll ask a few quick questions to understand the issue. No phone trees. No 'press 1 for...' Just a conversation with someone who can actually help."
            },
            {
              stepNumber: "2",
              title: "We Come to You & Inspect",
              description: "Our technician arrives on time, takes a thorough look at your system, and explains exactly what's happening in plain English. No jargon. No upselling before we've even diagnosed the problem. Just honest assessment."
            },
            {
              stepNumber: "3",
              title: "You Choose Your Option",
              description: "We present clear options with upfront pricing. You decide what's right for your home and budget—no pressure, no surprises. Need time to think it over? That's fine. Need it done today? We'll make it happen."
            }
          ]}
        />
        <div className="text-center mt-8">
          <a
            href="tel:5865554822"
            className="inline-block bg-[#E85D04] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#D64E03] transition-colors"
          >
            Ready to get comfortable? Call (586) 555-HVAC
          </a>
        </div>
      </SectionWrapper>

      <SectionWrapper background="primary" paddingY="large">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl">
              🛡️
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Your Family's Safety Is Part of Every Visit
          </h2>
          <p className="text-lg text-white mb-6">
            Every furnace inspection includes a carbon monoxide check—because keeping your family safe matters as much as keeping them warm. It's just part of how we do things.
          </p>
          <p className="text-white">
            We take time to explain what we're checking, why it matters, and what you can do between professional visits. You'll never feel like we're creating problems to solve. You'll just have peace of mind that your system is working safely and efficiently.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E5B8C] text-center mb-6">
            Proudly Serving Sterling Heights & Surrounding Communities
          </h2>
          <p className="text-lg text-gray-700 text-center mb-8">
            We're based right here in Sterling Heights. When you call Comfort Breeze, you're calling your neighbors.
          </p>
          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-xl font-bold text-[#1E5B8C] mb-4 text-center">
              Communities We Serve:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="text-gray-700">Sterling Heights</div>
              <div className="text-gray-700">Warren</div>
              <div className="text-gray-700">Troy</div>
              <div className="text-gray-700">Shelby Township</div>
              <div className="text-gray-700">Clinton Township</div>
              <div className="text-gray-700">Utica</div>
              <div className="text-gray-700">Rochester Hills</div>
              <div className="text-gray-700">Fraser</div>
              <div className="text-gray-700">Roseville</div>
            </div>
            <p className="text-center text-gray-600 mt-6">
              ...and neighbors within 30-40 minutes
            </p>
            <p className="text-center text-gray-700 mt-4">
              Not sure if we serve your area? Give us a call—if we can't help you, we'll point you to someone local who can.
            </p>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper background="gray" paddingY="large">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E5B8C] text-center mb-8">
            Family-Owned, Locally Operated
          </h2>
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <p className="text-lg text-gray-700 mb-4">
              Comfort Breeze was founded by Mike Johnson right here in Sterling Heights. After 12 years working for the big HVAC companies, Mike saw too many homeowners get burned by surprise bills and technicians who treated them like a number.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              In 2008, he started Comfort Breeze to do things differently—honest work, fair prices, and neighbors helping neighbors stay comfortable year-round.
            </p>
            <p className="text-lg text-gray-700">
              Today, our small crew serves hundreds of families across the Sterling Heights area. We're not trying to be the biggest HVAC company in Michigan. We're just focused on being the most trustworthy one you'll ever call.
            </p>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper background="white" paddingY="large">
        <TestimonialCards
          eyebrow=""
          heading="What Your Neighbors Are Saying"
          testimonials={[
            {
              quote: "Mike came out the same day our furnace died—and it was 18 degrees outside. He had us up and running in under two hours, explained everything clearly, and didn't try to sell us a new system we didn't need. Can't recommend Comfort Breeze enough.",
              name: "Jennifer M.",
              role: "Homeowner",
              company: "Sterling Heights",
              avatarSrc: ""
            },
            {
              quote: "We've used Comfort Breeze for three years now. Spring tune-ups, fall checkups, and one emergency AC repair during a heat wave. They're always on time, always honest, and the price is always exactly what they quoted. Finally found an HVAC company we can trust.",
              name: "Robert & Linda T.",
              role: "Homeowners",
              company: "Troy",
              avatarSrc: ""
            },
            {
              quote: "What impressed me most was that Mike gave us three options—including one that saved us money in the short term even though it meant less profit for him. That's the kind of honesty you don't find anymore. These guys are the real deal.",
              name: "David K.",
              role: "Homeowner",
              company: "Warren",
              avatarSrc: ""
            }
          ]}
        />
      </SectionWrapper>

      <SectionWrapper background="primary" paddingY="large">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-6">
            Why Wait Until Your System Breaks?
          </h2>
          <p className="text-lg text-white text-center mb-8">
            Most HVAC emergencies happen at the worst possible time—the coldest night of winter or the hottest day of summer. Regular maintenance catches small issues before they become expensive emergencies.
          </p>
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg mb-8">
            <p className="text-white font-semibold mb-4 text-center">
              Schedule your seasonal tune-up today and enjoy:
            </p>
            <ul className="space-y-3">
              <li className="flex items-center text-white">
                <span className="mr-3 flex-shrink-0">✓</span>
                <span>Lower energy bills from efficient operation</span>
              </li>
              <li className="flex items-center text-white">
                <span className="mr-3 flex-shrink-0">✓</span>
                <span>Fewer breakdowns and emergency calls</span>
              </li>
              <li className="flex items-center text-white">
                <span className="mr-3 flex-shrink-0">✓</span>
                <span>Longer system lifespan</span>
              </li>
              <li className="flex items-center text-white">
                <span className="mr-3 flex-shrink-0">✓</span>
                <span>Priority scheduling for Comfort Breeze maintenance customers</span>
              </li>
            </ul>
          </div>
          <div className="text-center">
            <a
              href="tel:5865554822"
              className="inline-block bg-[#E85D04] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#D64E03] transition-colors"
            >
              Schedule Your Tune-Up: (586) 555-HVAC
            </a>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper background="gray" paddingY="large">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-[#1E5B8C] mb-6">
                Ready to Get Comfortable?
              </h3>
              <a
                href="tel:5865554822"
                className="block text-4xl font-bold text-[#1E5B8C] mb-6 hover:text-[#E85D04] transition-colors"
              >
                📞 (586) 555-HVAC
              </a>
              <div className="space-y-2 text-gray-700 mb-6">
                <p><strong>Monday-Friday:</strong> 7am-7pm</p>
                <p><strong>Saturday:</strong> 8am-5pm</p>
                <p><strong>Sunday:</strong> Emergency Service Available</p>
              </div>
              <p className="text-sm text-gray-600 italic">
                Click to call from your mobile device
              </p>
            </div>

            <div>
              <ContactForm
                eyebrow=""
                heading="Request Your Free Quote Online"
                subhead="Not ready to call? No problem. Fill out this quick form and we'll get back to you within 4 business hours."
                fields={[
                  { name: "name", type: "text", placeholder: "Your Name", required: true },
                  { name: "phone", type: "phone", placeholder: "Phone Number", required: true },
                  { name: "email", type: "email", placeholder: "Email Address", required: true },
                  { name: "message", type: "textarea", placeholder: "Tell us what's happening (optional)", required: false }
                ]}
                submitLabel="Get Your Free Quote"
                successMessage="Thanks! We'll get back to you within 4 business hours."
              />
              <p className="text-center text-gray-700 mt-4">
                Or call now if it's urgent: <a href="tel:5865554822" className="text-[#E85D04] font-semibold hover:underline">(586) 555-HVAC</a>
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <FooterSimple
        companyName="Comfort Breeze Heating & Air"
        links={[
          { label: "About Us", href: "#about" },
          { label: "Services", href: "#services" },
          { label: "Service Area", href: "#service-area" },
          { label: "Contact", href: "#contact" },
          { label: "Privacy Policy", href: "/privacy" }
        ]}
        socialLinks={[
          { platform: "facebook", href: "#" },
          { platform: "twitter", href: "#" }
        ]}
        copyrightText="© 2024 Comfort Breeze Heating & Air. All rights reserved. Licensed & Insured"
      />
    </div>
  )
}