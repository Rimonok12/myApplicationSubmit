import type { GenerationResult } from "./types";

// Used by the "Load sample" button and as a fallback when no ANTHROPIC_API_KEY is set,
// so the whole UI is testable without spending tokens.
export const SAMPLE: GenerationResult = {
  business: {
    name: "Spice Garden",
    type: "Restaurant",
    tagline: "Where every dish tells a story",
    vibe: "warm & modern",
    primary_color: "#c0392b",
    accent_color: "#f1c40f",
    about:
      "A family-run restaurant in Dhanmondi serving authentic Bengali and fusion cuisine, cooked fresh daily with locally sourced ingredients and decades of family recipes.",
    services: [
      { name: "Dine-In", description: "Cozy seating for families and groups with a modern ambience.", price: "" },
      { name: "Home Delivery", description: "Hot meals delivered across Dhanmondi within 40 minutes.", price: "" },
      { name: "Catering", description: "Full-service catering for weddings, offices and events.", price: "From ৳15,000" },
      { name: "Chef's Specials", description: "Rotating seasonal menu curated by our head chef.", price: "" },
    ],
    highlights: ["Fresh daily", "Family recipes", "Fast delivery", "Event catering"],
    location: {
      address: "Road 27, Dhanmondi, Dhaka 1209",
      phone: "01712-345678",
      email: "hello@spicegarden.com",
      hours: "11 AM – 11 PM, daily",
    },
    socials: [{ label: "Facebook", url: "#" }],
  },
  critique:
    "Spice Garden has no real website — just a Facebook page with low-resolution photos and no menu, so hungry customers searching on Google find nothing and order from a competitor instead. There's no online menu, no direct ordering, and the brand looks far less premium than the food actually is.",
  proposal_email: {
    subject: "A modern website for Spice Garden (free demo inside)",
    body: `Dear Spice Garden Team,

I'm Rimon Debnath, a web developer in Dhaka. I came across Spice Garden and your food looks fantastic — but right now anyone searching for you online finds only a Facebook page with no menu, which means you're losing customers to restaurants that show up properly on Google.

So instead of just pitching, I built you a working demo:
[DEMO LINK]

It's a fast, mobile-friendly site built with Next.js, Tailwind and premium animation — with your menu, delivery info and a one-tap call button front and center.

I'll build and launch the complete website for only 10,000 BDT, set up on your own domain, with free support after launch.

Happy to show you in person or over a call.

Best regards,
Rimon Debnath
Phone: 01540670260
WhatsApp: 01818681993
Email: rimonok12@gmail.com`,
  },
};
