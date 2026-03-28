import { createServerClient } from "@/lib/supabase";
import { generateEmbedding, vectorToString } from "@/lib/embeddings";
import { verifyAdmin } from "@/lib/admin-auth";

// All FAQ data to seed
const FAQ_DATA = [
  // ── Company Info ──
  { q: "What is Kyrosh?", a: "Kyrosh is a full-service digital marketing and software development agency. We help businesses grow with content, marketing, and technology solutions.", c: "company" },
  { q: "Where is Kyrosh located?", a: "We operate as a digital-first agency and serve clients across India and globally.", c: "company" },
  { q: "How long has Kyrosh been in business?", a: "Kyrosh has been helping businesses grow digitally with a team of experts across marketing, content, and development.", c: "company" },
  { q: "Who is the founder of Kyrosh?", a: "Kyrosh was founded by a team passionate about digital growth, branding, and technology.", c: "company" },
  { q: "What makes Kyrosh different?", a: "We combine creative content, smart marketing, and strong tech — all under one roof. No outsourcing, no delays.", c: "company" },
  { q: "Does Kyrosh work with startups?", a: "Yes! We love working with startups. We offer flexible packages designed for early-stage businesses.", c: "company" },
  { q: "Does Kyrosh work with large companies?", a: "Absolutely. We handle enterprise-grade projects in development and marketing at scale.", c: "company" },
  { q: "Can I visit your office?", a: "We're a digital-first team. Meetings are done via video call for efficiency. WhatsApp us to schedule!", c: "company" },
  { q: "What industries does Kyrosh serve?", a: "We serve e-commerce, real estate, healthcare, education, SaaS, hospitality, and more.", c: "company" },
  { q: "Does Kyrosh offer internships?", a: "Yes, we occasionally offer internships in marketing, design, and development. Contact us for current openings.", c: "company" },

  // ── Content Services ──
  { q: "What content services do you offer?", a: "We offer poster design, graphic design, and professional video editing for social media, ads, and branding.", c: "content" },
  { q: "Can you design social media posts?", a: "Yes! We create stunning social media posts, carousels, reels covers, and story designs for all platforms.", c: "content" },
  { q: "Do you make posters?", a: "Yes, we design professional posters for events, promotions, product launches, and branding campaigns.", c: "content" },
  { q: "Do you do video editing?", a: "Yes! We offer professional video editing — reels, YouTube videos, ads, testimonials, product demos, and more.", c: "content" },
  { q: "What tools do you use for design?", a: "Our team uses Adobe Photoshop, Illustrator, Figma, Canva Pro, and After Effects for world-class designs.", c: "content" },
  { q: "Can you create brand identity?", a: "Yes! We design logos, brand kits, color palettes, typography guides, and complete brand identity packages.", c: "content" },
  { q: "How fast can you deliver designs?", a: "Standard turnaround is 2-3 business days. Rush delivery available within 24 hours for urgent requests.", c: "content" },
  { q: "Do you create content calendars?", a: "Yes, we plan monthly content calendars with post ideas, captions, hashtags, and scheduling.", c: "content" },
  { q: "Can you create infographics?", a: "Yes, we design data-driven infographics that simplify complex information beautifully.", c: "content" },
  { q: "Do you make YouTube thumbnails?", a: "Yes! We create eye-catching, click-worthy YouTube thumbnails optimized for engagement.", c: "content" },

  // ── Software Development ──
  { q: "Do you build websites?", a: "Yes! We build fast, modern, responsive websites using Next.js, React, and other cutting-edge technologies.", c: "software" },
  { q: "Do you develop mobile apps?", a: "Yes! We develop Android and iOS apps using React Native and Flutter for cross-platform performance.", c: "software" },
  { q: "What technologies do you use?", a: "We use Next.js, React, React Native, Flutter, Node.js, Python, MongoDB, PostgreSQL, and Supabase.", c: "software" },
  { q: "Can you build e-commerce websites?", a: "Yes! We build full-featured e-commerce sites with payment integration, inventory management, and admin panels.", c: "software" },
  { q: "Do you build custom web applications?", a: "Yes, we build custom SaaS products, dashboards, CRM systems, and internal tools tailored to your business.", c: "software" },
  { q: "How long does it take to build a website?", a: "A standard website takes 2-4 weeks. Complex web apps take 4-8 weeks depending on features.", c: "software" },
  { q: "How long does app development take?", a: "A basic app takes 4-6 weeks. Feature-rich apps take 8-12 weeks. We provide detailed timelines upfront.", c: "software" },
  { q: "Do you provide website hosting?", a: "Yes, we can set up hosting on Vercel, AWS, or DigitalOcean depending on your needs and budget.", c: "software" },
  { q: "Can you redesign my existing website?", a: "Absolutely! We specialize in modern redesigns that improve speed, SEO, and user experience.", c: "software" },
  { q: "Do you offer website maintenance?", a: "Yes, we offer monthly maintenance packages including updates, security patches, and performance monitoring.", c: "software" },
  { q: "Can you integrate payment gateways?", a: "Yes! We integrate Razorpay, Stripe, PayPal, and other payment gateways into websites and apps.", c: "software" },
  { q: "Do you build landing pages?", a: "Yes! We create high-converting landing pages optimized for lead generation and ad campaigns.", c: "software" },
  { q: "Can you build a booking system?", a: "Yes, we build custom booking and appointment systems integrated with calendars and notifications.", c: "software" },
  { q: "Do you build admin panels?", a: "Yes, every web app we build comes with a powerful admin dashboard for easy management.", c: "software" },

  // ── Marketing ──
  { q: "What marketing services do you offer?", a: "We offer Meta Ads, Google Ads, Social Media Management, WhatsApp Marketing, SEO, and GEO optimization.", c: "marketing" },
  { q: "Do you run Facebook ads?", a: "Yes! We create and manage Facebook & Instagram ad campaigns optimized for leads, sales, and brand awareness.", c: "marketing" },
  { q: "Do you run Google ads?", a: "Yes! We manage Google Search, Display, YouTube, and Shopping ads with data-driven optimization.", c: "marketing" },
  { q: "What is social media management?", a: "We handle your entire social media — content creation, posting, engagement, analytics, and community management.", c: "marketing" },
  { q: "What is WhatsApp marketing?", a: "We set up WhatsApp Business API with bulk messaging, automated replies, catalogs, and broadcast campaigns.", c: "marketing" },
  { q: "Do you offer SEO services?", a: "Yes! We provide on-page SEO, technical SEO, content strategy, keyword research, and link building.", c: "marketing" },
  { q: "What is GEO optimization?", a: "GEO is Generative Engine Optimization — we optimize your content to appear in AI search results like ChatGPT and Google AI.", c: "marketing" },
  { q: "How much do ads cost?", a: "Ad management starts from ₹10,000/month. Ad spend budget is separate and depends on your goals. Let's discuss on WhatsApp!", c: "marketing" },
  { q: "How soon will I see results from ads?", a: "You'll typically see initial results within 3-7 days. Optimized performance builds over 2-4 weeks.", c: "marketing" },
  { q: "Can you manage my Instagram account?", a: "Yes! Full Instagram management including content, stories, reels, engagement, and growth strategy.", c: "marketing" },
  { q: "Do you do influencer marketing?", a: "Yes, we connect brands with relevant influencers and manage the entire campaign from outreach to reporting.", c: "marketing" },
  { q: "Can you help with Google My Business?", a: "Yes! We optimize your Google Business Profile for local search visibility, reviews, and map rankings.", c: "marketing" },
  { q: "Do you provide marketing analytics?", a: "Yes, we provide detailed monthly reports covering impressions, clicks, conversions, ROI, and recommendations.", c: "marketing" },
  { q: "Do you do email marketing?", a: "Yes! We handle email campaigns including design, copywriting, automation, and list management.", c: "marketing" },
  { q: "Can you help me get more leads?", a: "Absolutely! Lead generation is our specialty. We use a mix of ads, SEO, and content to drive quality leads. Let's talk!", c: "marketing" },

  // ── Pricing ──
  { q: "How much does a website cost?", a: "Websites start from ₹15,000 for a basic site. E-commerce and custom apps are priced based on features. WhatsApp us for a quote!", c: "pricing" },
  { q: "How much does an app cost?", a: "App development starts from ₹50,000. Complex apps with backend are quoted after requirement analysis. Let's discuss!", c: "pricing" },
  { q: "How much does social media management cost?", a: "Social media management starts from ₹8,000/month. Pricing depends on platforms and posting frequency.", c: "pricing" },
  { q: "How much do design services cost?", a: "Design packages start from ₹5,000/month for social media. Custom projects are quoted individually.", c: "pricing" },
  { q: "How much does SEO cost?", a: "SEO packages start from ₹10,000/month. Results-driven pricing with transparent reporting.", c: "pricing" },
  { q: "Do you offer custom packages?", a: "Yes! We create custom packages tailored to your specific needs and budget. WhatsApp us to discuss!", c: "pricing" },
  { q: "Do you offer discounts for startups?", a: "Yes! We have special startup packages with flexible pricing. Tell us about your project on WhatsApp.", c: "pricing" },
  { q: "What is your payment structure?", a: "We typically work with 50% advance and 50% on completion. Monthly services are billed at the start of each month.", c: "pricing" },
  { q: "Do you offer EMI or payment plans?", a: "For larger projects, we can arrange milestone-based payments. Let's discuss what works for you!", c: "pricing" },
  { q: "Is there a free consultation?", a: "Yes! We offer a free 15-minute consultation to understand your needs. Book a call or WhatsApp us!", c: "pricing" },

  // ── Process ──
  { q: "How do I get started?", a: "Simple! Just WhatsApp us or call us. We'll understand your needs, share a plan, and get started quickly.", c: "process" },
  { q: "What is your work process?", a: "1. Discovery call → 2. Proposal → 3. Design/Development → 4. Review → 5. Launch → 6. Ongoing support.", c: "process" },
  { q: "How do you communicate with clients?", a: "We use WhatsApp for quick updates, email for documentation, and video calls for detailed discussions.", c: "process" },
  { q: "Do you provide project updates?", a: "Yes! We share weekly progress updates and are available daily on WhatsApp for any questions.", c: "process" },
  { q: "Can I make changes during the project?", a: "Yes, we allow revisions at every stage. We keep you involved throughout the entire process.", c: "process" },
  { q: "Do you provide after-launch support?", a: "Yes, we offer free support for 30 days post-launch and optional maintenance packages after that.", c: "process" },
  { q: "How quickly do you respond?", a: "We typically respond within 1-2 hours during business hours. Urgent requests are handled even faster!", c: "process" },
  { q: "Do you sign NDAs?", a: "Yes, we're happy to sign non-disclosure agreements to protect your business ideas and data.", c: "process" },
  { q: "What if I'm not satisfied?", a: "We offer unlimited revisions until you're happy. Your satisfaction is our top priority!", c: "process" },

  // ── Lead Conversion ──
  { q: "I want to grow my business", a: "That's exactly what we do! Let's hop on a quick call to understand your goals. WhatsApp us at your convenience!", c: "conversion" },
  { q: "I need a website for my business", a: "Great choice! We build stunning, high-performance websites. WhatsApp us your requirements and we'll get started!", c: "conversion" },
  { q: "I need help with digital marketing", a: "You're in the right place! We offer complete digital marketing solutions. Let's discuss your goals on WhatsApp!", c: "conversion" },
  { q: "Can you help my startup?", a: "We love working with startups! We have special packages designed for early-stage businesses. WhatsApp us to learn more!", c: "conversion" },
  { q: "I want more customers", a: "We specialize in customer acquisition through ads, SEO, and content. Let's create a growth plan — WhatsApp us!", c: "conversion" },
  { q: "I want to create an app", a: "Awesome! We build beautiful, high-performance mobile apps. Share your idea on WhatsApp and we'll plan it together!", c: "conversion" },
  { q: "I want better social media presence", a: "We'll transform your social media with professional content, engagement strategies, and growth tactics. Let's talk!", c: "conversion" },
  { q: "How can I reach you?", a: "You can WhatsApp us anytime or call us directly. We usually respond within minutes during business hours!", c: "conversion" },
  { q: "Can I see your portfolio?", a: "Yes! We'd love to show you our work. WhatsApp us and we'll share relevant case studies from your industry.", c: "conversion" },
  { q: "I'm interested in your services", a: "That's great to hear! Let's discuss how we can help your business grow. WhatsApp us or schedule a call right now!", c: "conversion" },

  // ── General/Greetings ──
  { q: "Hi", a: "Hey there! [ICON:HandRaised] Welcome to Kyrosh. I'm here to help you with marketing, design, or tech solutions. What can I help you with?", c: "general" },
  { q: "Hello", a: "Hello! [ICON:HandRaised] Great to have you here. How can Kyrosh help your business grow today?", c: "general" },
  { q: "Hey", a: "Hey! [ICON:HandRaised] Welcome to Kyrosh. Looking for marketing, design, or development help? I'm here for you!", c: "general" },
  { q: "Good morning", a: "Good morning! [ICON:Sun] How can we help your business today? Feel free to ask anything about our services!", c: "general" },
  { q: "Thank you", a: "You're welcome! [ICON:FaceSmile] Is there anything else I can help you with? We're always here for you!", c: "general" },
  { q: "Thanks", a: "Happy to help! If you need anything else, just ask or reach out to us on WhatsApp anytime!", c: "general" },
  { q: "Bye", a: "Goodbye! [ICON:HandRaised] Thanks for chatting with us. Reach out anytime on WhatsApp if you need help!", c: "general" },
  { q: "Ok", a: "Great! Let me know if you have any other questions. We're here to help!", c: "general" },
  { q: "What can you do?", a: "I can help you learn about Kyrosh services — content design, video editing, web & app development, ads, SEO, and more! What interests you?", c: "general" },
  { q: "Tell me about your services", a: "We offer: [ICON:Palette] Content (design, video editing), [ICON:Code] Software (websites, apps), [ICON:ChartBar] Marketing (ads, SMM, SEO, WhatsApp). What interests you most?", c: "general" },
];

export async function POST() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();

    // Clear existing FAQs
    await supabase.from("faqs").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // Insert all FAQs with embeddings
    let inserted = 0;
    for (const faq of FAQ_DATA) {
      const embedding = generateEmbedding(faq.q + " " + faq.a);

      const { error } = await supabase.from("faqs").insert({
        question: faq.q,
        answer: faq.a,
        category: faq.c,
        embedding: vectorToString(embedding),
      });

      if (error) {
        console.error("FAQ insert error:", faq.q, error);
      } else {
        inserted++;
      }
    }

    return Response.json({ success: true, inserted, total: FAQ_DATA.length });
  } catch (error) {
    console.error("Seed error:", error);
    return Response.json({ error: "Failed to seed FAQs" }, { status: 500 });
  }
}
