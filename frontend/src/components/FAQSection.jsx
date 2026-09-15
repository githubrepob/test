import { useState } from "react";

const FAQS = [
  {
    q: "What is uniVerse?",
    a: "uniVerse is a connected academic ecosystem where students learn, collaborate, and grow beyond classrooms."
  },
  {
    q: "Who is uniVerse for?",
    a: "uniVerse is built for students, developers, and campus communities seeking real-world exposure and collaboration."
  },
  {
    q: "Are hackathons and internships verified?",
    a: "Yes. Opportunities are curated from trusted partners, communities, and institutions."
  },
  {
    q: "Is uniVerse free to use?",
    a: "Core features are free. Advanced tools and premium collaborations may be introduced later."
  },
  {
    q: "How do referrals and micro-internships work?",
    a: "Students can apply through verified listings and build credibility through community-driven referrals."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="relative z-10 max-w-4xl mx-auto px-6 py-32">
      {/* Heading */}
      <h2 className="font-display text-[7rem] text-4xl md:text-3xl font-medium mb-10 text-white">
        Frequently Asked Questions
      </h2>

      {/* FAQ List */}
      <div className="space-y-3">
        {FAQS.map((faq, i) => {
          const open = openIndex === i;

          return (
            <div
              key={i}
              className="border-b border-white/10 pb-4 cursor-pointer"
              onClick={() => setOpenIndex(open ? null : i)}
            >
              {/* Question */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg md:text-sm text-white/90">
                  {faq.q}
                </h3>
                <span
                  className={`text-white/50 text-xl transition-transform duration-300 ${
                    open ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </div>

              {/* Answer */}
              <div
                className={`grid transition-all duration-300 ${
                  open ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]"
                }`}
              >
                <p className="overflow-hidden text-white/60 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
