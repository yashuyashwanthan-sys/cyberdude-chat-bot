// knowledgeBase.js
// All "knowledge" CD-BOT has about CyberDude Networks lives here as a plain
// array of intents. Each intent = { tag, patterns, responses, suggestions, priority? }.
// No AI, no API — matcher.js scores these patterns against user input.
//
// v3 update: responses kept SHORT (1-2 sentences) so first-time visitors
// actually read them, and each intent now has 2 phrasings so repeat
// questions don't sound identical (matcher.js picks one at random).
//
// Sourced from https://cyberdudenetworks.com/, /about, /careers (live site)

const knowledgeBase = [
  {
    tag: "greeting",
    priority: 2,
    patterns: ["hi", "hello", "hey", "hey there", "good morning", "good afternoon", "good evening", "yo", "sup", "greetings", "hiya", "hello there", "heyy", "hii", "helo"],
    responses: [
      "Hey, I'm Cyber Dude Duty 👋 Ask me about services, projects, pricing, careers, or how to reach us.",
      "Hi there! I'm Cyber Dude Duty from CyberDude Networks — what would you like to know?"
    ],
    suggestions: ["What does CyberDude Networks do?", "What services do you offer?", "How much do you charge?"]
  },
  {
    tag: "goodbye",
    priority: 2,
    patterns: ["bye", "goodbye", "see you", "see ya", "later", "talk later", "catch you later", "gotta go", "exit", "quit"],
    responses: [
      "Thanks for stopping by! Reach us anytime at hello@cyberdudenetworks.com.",
      "Bye for now — feel free to come back anytime you have a question."
    ],
    suggestions: ["How do I contact you?", "What are your engagement models?", "Tell me about your team"]
  },
  {
    tag: "thanks",
    priority: 2,
    patterns: ["thanks", "thank you", "thx", "appreciate it", "cheers", "ty", "thank you so much", "much appreciated"],
    responses: [
      "You're welcome! Anything else you'd like to know?",
      "Anytime! Happy to help with anything else."
    ],
    suggestions: ["What services do you offer?", "Show me your projects", "How do I contact you?"]
  },
  {
    tag: "company_overview",
    priority: 1,
    patterns: ["about cyberdude", "what is cyberdude networks", "tell me about the company", "who are you", "what does cyberdude do", "company overview", "about the company", "what is this company", "tell me about cyberdude networks", "who is cyberdude", "what does cyberdude networks do"],
    responses: [
      "We're a Chennai-based tech startup (since Dec 2016) building IoT, AI & SaaS platforms — 35+ projects shipped, 4x award-winning.",
      "CyberDude Networks is a systems engineering firm from Chennai — 9+ years building cloud, AI and IoT products for clients across 3 countries."
    ],
    suggestions: ["What is your mission?", "What services do you offer?", "Who is on the leadership team?"]
  },
  {
    tag: "mission_vision",
    priority: 2,
    patterns: ["mission", "vision", "what is your mission", "what is your vision", "why do you exist", "purpose", "what drives cyberdude", "exist"],
    responses: [
      "Our mission: solve real business problems through disciplined engineering, and teach the next generation of developers along the way.",
      "We want every business owner to feel fully in control of their operations — no computer science degree required."
    ],
    suggestions: ["Tell me about CyberDude Academy", "What is your journey/history?", "What services do you offer?"]
  },
  {
    tag: "services",
    priority: 1,
    patterns: ["services", "what services do you offer", "what do you offer", "what can you build", "solutions", "what solutions do you provide", "core expertise", "what do you do", "capabilities", "what kind of work do you do", "what do you guys do"],
    responses: [
      "5 core areas: IoT & Hardware Tracking, Smart SaaS & Custom AI, Autonomous ERP, Legacy Upgrades, and Enterprise Data Security. Ask about any one!",
      "We build IoT platforms, custom AI/SaaS tools, ERP systems, legacy modernization, and secure cloud infra. Which one interests you?"
    ],
    suggestions: ["Tell me about IoT tracking", "Tell me about custom AI", "Tell me about ERP systems"]
  },
  {
    tag: "iot_edge",
    priority: 2,
    patterns: ["iot", "internet of things", "edge computing", "hardware tracking", "machine tracking", "vehicle tracking", "factory floor", "sensors", "hardware iot tracking"],
    responses: [
      "We connect machines, vehicles and factory floors to the cloud for real-time tracking — reliable, no constant crashes.",
      "Hardware & IoT Tracking: live monitoring of your physical assets, engineered to actually stay up."
    ],
    suggestions: ["Tell me about your IoT projects", "What's your engineering stack?", "How much does an IoT project cost?"]
  },
  {
    tag: "saas_ai",
    priority: 2,
    patterns: ["saas", "custom ai", "smart saas", "ai platform", "ai native", "artificial intelligence solutions", "cloud application", "private ai"],
    responses: [
      "We build secure, practical AI tools tailored to your workflow — not just a basic chatbot bolted on.",
      "Smart SaaS & Custom AI: intelligent cloud apps built around your exact business process."
    ],
    suggestions: ["Tell me about your AI data pipelines", "What's an example SaaS project?", "What are your engagement models?"]
  },
  {
    tag: "autonomous_erp",
    priority: 2,
    patterns: ["erp", "autonomous erp", "erp systems", "inventory management", "billing system", "staff workflow", "enterprise resource planning"],
    responses: [
      "Custom dashboards that auto-track inventory, billing and staff workflows — no more running things on Excel sheets.",
      "Autonomous ERP: your operations, automated end-to-end, zero manual data entry."
    ],
    suggestions: ["Show me an ERP project you built", "What's the DIC ERP?", "How much does an ERP system cost?"]
  },
  {
    tag: "legacy_modernization",
    priority: 2,
    patterns: ["legacy software", "modernization", "upgrade old system", "outdated software", "migrate system", "old software slow", "legacy to ai"],
    responses: [
      "We upgrade outdated systems to modern, fast cloud architecture — without losing your historical data.",
      "Legacy Upgrades: same data, none of the slowness. We migrate you safely to modern infrastructure."
    ],
    suggestions: ["What's your cloud deployment process?", "Tell me about data security", "How do I get a quote?"]
  },
  {
    tag: "data_governance",
    priority: 2,
    patterns: ["data security", "data governance", "data privacy", "secure cloud", "is my data safe", "data protection", "enterprise security"],
    responses: [
      "We build private, secure cloud environments — your data and IP never leak to third parties.",
      "Enterprise Data Security: you own 100% of your data and source code, guaranteed."
    ],
    suggestions: ["Tell me about your privacy policy", "What's your cloud & AMC support?", "How do I contact you?"]
  },
  {
    tag: "engineering",
    priority: 2,
    patterns: ["core engineering", "tech stack", "what technologies do you use", "engineering team", "what tech do you use", "technology", "react", "node", "nodejs", "python", "javascript", "docker"],
    responses: [
      "Web, Mobile, UI/UX, AI Pipelines, and DevOps/Cloud — deployed on AWS/GCP, fully owned by you, with 24/7 monitoring.",
      "Our stack spans high-performance web, native mobile, product design, AI pipelines and cloud DevOps."
    ],
    suggestions: ["Tell me about your web development", "Tell me about mobile development", "Tell me about DevOps & cloud"]
  },
  {
    tag: "web_dev",
    priority: 2,
    patterns: ["web development", "high performance web", "website development", "frontend development", "web app"],
    responses: [
      "Fast, scalable web platforms, built by senior engineers, deployed on cloud infra you fully own.",
      "High-Performance Web is one of our core pillars — speed and scale from day one."
    ],
    suggestions: ["Tell me about mobile development", "What's your product design process?", "Show me a web project"]
  },
  {
    tag: "mobile_dev",
    priority: 2,
    patterns: ["mobile development", "mobile app", "android app", "ios app", "mobile ecosystems", "native app"],
    responses: [
      "We build native mobile apps end-to-end — e.g. Varam Matrimony, our secure web + Android platform.",
      "Mobile Ecosystems: full native app builds, like our Varam Matrimony web + Android product."
    ],
    suggestions: ["Tell me about Varam Matrimony", "What's your web development like?", "How much does an app cost?"]
  },
  {
    tag: "product_design",
    priority: 2,
    patterns: ["product design", "ui ux", "ui/ux", "design process", "user interface design", "wireframes", "mockups"],
    responses: [
      "Under our Studio model, we blueprint your workflow and UI before writing a single line of code.",
      "UI/UX is baked into our process — full mockups and blueprints before development starts."
    ],
    suggestions: ["Tell me about the Studio engagement model", "Show me your projects", "What's your tech stack?"]
  },
  {
    tag: "ai_pipelines",
    priority: 2,
    patterns: ["rag", "ai data pipelines", "retrieval augmented generation", "ai pipeline", "llm pipeline", "embeddings"],
    responses: [
      "We engineer RAG data pipelines that power private AI tools — built to protect your company's data.",
      "AI Data Pipelines: practical, private AI, not generic third-party AI plugged into your data."
    ],
    suggestions: ["Tell me about Smart SaaS & Custom AI", "Tell me about data security", "How do I get a quote?"]
  },
  {
    tag: "devops_cloud",
    priority: 2,
    patterns: ["devops", "cloud infrastructure", "cloud deployment", "aws", "gcp", "server management", "deployment"],
    responses: [
      "Hassle-free deployment on AWS/GCP, under your 100% ownership, tuned for the lowest server bills.",
      "DevOps & Cloud Scale: fast load times, low costs, full ownership — plus 24/7 maintenance."
    ],
    suggestions: ["Tell me about your AMC maintenance plan", "What's your data security like?", "How do I contact you?"]
  },
  {
    tag: "maintenance_support",
    priority: 2,
    patterns: ["support", "maintenance", "24/7 support", "bug fixes", "server crash", "backups", "who fixes bugs"],
    responses: [
      "24/7 monitoring, daily automated backups, instant bug fixes — you never need an internal IT person.",
      "We keep things running: proactive monitoring, backups, and fast fixes, all included."
    ],
    suggestions: ["Tell me about the AMC plan", "What are your engagement models?", "How do I contact you?"]
  },
  {
    tag: "projects",
    priority: 1,
    patterns: ["projects", "what have you built", "case studies", "past work", "portfolio", "show me your work", "clients", "who are your clients"],
    responses: [
      "35+ shipped projects, including CyberGYM+, CyPro CRM, Varam Matrimony, SkillTrum, DIC ERP, CyberHRM, and SelfMote.",
      "We've built gym management software, CRMs, matrimony platforms, EdTech, university ERPs, and more — want details on one?"
    ],
    suggestions: ["Tell me about Varam Matrimony", "Tell me about the DIC ERP project", "What do clients say about you?"]
  },
  {
    tag: "project_varam",
    priority: 2,
    patterns: ["varam", "varam matrimony", "matchmaking platform", "matrimony app"],
    responses: [
      "Varam Matrimony: web + Android, with secure photo watermarking and OTP logins — zero downtime even at peak traffic.",
      "A matchmaking platform we built to stop fake profiles and leaked photos, with rock-solid uptime."
    ],
    suggestions: ["Show me more of your projects", "What do clients say about you?", "Tell me about mobile development"]
  },
  {
    tag: "project_skilltrum",
    priority: 2,
    patterns: ["skilltrum", "skilltrum edtech", "edtech platform", "learning platform"],
    responses: [
      "SkillTrum: a Web & PWA learning platform we built for scalable online education.",
      "An EdTech platform (Web + Progressive Web App) for online learning at scale."
    ],
    suggestions: ["Tell me about CyberDude Academy", "Show me more of your projects", "What services do you offer?"]
  },
  {
    tag: "project_cypro",
    priority: 2,
    patterns: ["cypro", "cypro crm", "crm app", "business crm"],
    responses: [
      "CyPro CRM: a complete business CRM application for growing companies.",
      "A full CRM system we built to manage business relationships and pipelines."
    ],
    suggestions: ["Tell me about your ERP systems", "Show me more of your projects", "How much does a CRM cost?"]
  },
  {
    tag: "project_dic",
    priority: 2,
    patterns: ["dic", "dic university", "university management", "college management software"],
    responses: [
      "DIC: a custom University Management ERP covering academic and admin operations end-to-end.",
      "A full university management system — academics, admin, all in one platform."
    ],
    suggestions: ["Tell me about your ERP systems", "Show me more of your projects", "How do I get a quote?"]
  },
  {
    tag: "project_cybergym",
    priority: 2,
    patterns: ["cybergym", "cybergym+", "gym management", "gym software"],
    responses: [
      "CyberGYM+ (2020): gym management software — memberships, billing, and ops, all digitized.",
      "Our Gym Management Software, helping fitness businesses run digitally instead of on paper."
    ],
    suggestions: ["Show me more of your projects", "What's your journey/history?", "How much does it cost?"]
  },
  {
    tag: "project_cyberhrm",
    priority: 2,
    patterns: ["cyberhrm", "hr management system", "hrm software", "human resource management"],
    responses: [
      "CyberHRM (2017): our first major product — an HR management system built for SMEs.",
      "A full HR management platform, and one of our earliest products."
    ],
    suggestions: ["What's your company journey?", "Show me more of your projects", "Tell me about your team"]
  },
  {
    tag: "project_selfmote",
    priority: 2,
    patterns: ["selfmote", "wireless device control", "device control app"],
    responses: [
      "SelfMote (2018): a wireless device control app, marking our move into IoT.",
      "A wireless device-control app — our first step into IoT solutions."
    ],
    suggestions: ["Tell me about your IoT & edge work", "Show me more of your projects", "What's your journey/history?"]
  },
  {
    tag: "pricing",
    priority: 1,
    patterns: ["pricing", "cost", "how much does it cost", "price", "budget", "engagement models", "how much do you charge", "rates", "how much would it cost to build something", "quote", "estimate", "price for a project"],
    responses: [
      "3 models: Turnkey (fixed budget), Studio (idea → build, most popular), or AMC (maintenance). Ask about any one!",
      "No hidden invoices — pick Turnkey, Studio, or AMC depending on what you need. Email hello@cyberdudenetworks.com for an actual quote."
    ],
    suggestions: ["Tell me about the Turnkey model", "Tell me about the Studio model", "Tell me about the AMC plan"]
  },
  {
    tag: "pricing_turnkey",
    priority: 2,
    patterns: ["turnkey", "build to spec", "fixed scope", "i have a spec document", "fixed pricing"],
    responses: [
      "Turnkey: you bring the spec, we deliver at a 100% fixed budget with 30 days of free bug fixes.",
      "Best if you already have a clear feature list — fixed price, fixed deadline, no surprises."
    ],
    suggestions: ["Tell me about the Studio model", "Tell me about the AMC plan", "How do I request an estimate?"]
  },
  {
    tag: "pricing_studio",
    priority: 2,
    patterns: ["concept to launch studio", "studio model", "non technical idea", "i just have an idea", "blueprint and build"],
    responses: [
      "Studio: got an idea but no tech docs? We blueprint it with you and build from scratch — you own the IP.",
      "Our most popular model — for when you have a vision, not a spec. We handle the rest."
    ],
    suggestions: ["Tell me about the Turnkey model", "Tell me about the AMC plan", "How do I book an ideation session?"]
  },
  {
    tag: "pricing_amc",
    priority: 2,
    patterns: ["amc", "annual maintenance", "ongoing protection", "already have a platform", "maintenance contract", "cloud upkeep"],
    responses: [
      "AMC: already have a platform? We take over hosting, backups, and crash prevention — annual or monthly.",
      "For existing platforms — we handle upkeep so you get direct access to lead developers, not a ticket queue."
    ],
    suggestions: ["Tell me about the Turnkey model", "Tell me about the Studio model", "How do I contact you?"]
  },
  {
    tag: "testimonials",
    priority: 2,
    patterns: ["reviews", "testimonials", "what do clients say", "client feedback", "ratings", "client reviews", "past clients", "good ratings"],
    responses: [
      "Rated 4.9/5 — clients highlight zero downtime, strong security, and engineers who optimize logic before coding.",
      "Clients praise our reliability — from a matrimony platform with zero crashes to a medical IoT system with zero breaches."
    ],
    suggestions: ["Show me your projects", "What awards have you won?", "How do I contact you?"]
  },
  {
    tag: "awards",
    priority: 2,
    patterns: ["awards", "award winning", "recognition", "partners", "achievements"],
    responses: [
      "4x award-winning for IoT and SaaS innovation, with 500+ enterprise deployments and zero breaches.",
      "Recognized industry-wide — 4 awards, 500+ deployments, 10+ years of shipped code."
    ],
    suggestions: ["What do clients say about you?", "Tell me about your journey", "Who's on your team?"]
  },
  {
    tag: "team",
    priority: 1,
    patterns: ["team", "leadership", "who founded cyberdude", "who runs cyberdude", "meet the team", "who works there", "who made cyberdude", "who is behind this company", "who is behind cyberdude"],
    responses: [
      "Led by Anbuselvan Annamalai (CEO), Abishek Pushparaj (CTO), Dr. Ananth JP (Director), and Yuvaraj Mohan (Business Analyst).",
      "Our leadership spans engineering, IoT, AI/ML, design and cloud — ask me about the founder or CTO specifically."
    ],
    suggestions: ["Tell me about the founder", "Tell me about the CTO", "Are you hiring?"]
  },
  {
    tag: "team_ceo",
    priority: 2,
    patterns: ["founder", "ceo", "who is the ceo", "anbuselvan", "principal scientist", "boss", "who started cyberdude"],
    responses: [
      "Anbuselvan Annamalai — Founder, CEO & Principal Scientist. His words: \"We engineer digital ecosystems that drive real growth.\"",
      "Our Founder & CEO is Anbuselvan Annamalai, also our Principal Scientist."
    ],
    suggestions: ["Tell me about the CTO", "What's your company journey?", "Tell me about the team"]
  },
  {
    tag: "team_cto",
    priority: 2,
    patterns: ["cto", "abishek", "global reach", "chief technology officer", "tech lead", "technical head", "tech head"],
    responses: [
      "Abishek Pushparaj is our CTO, leading technical direction and global reach.",
      "Our CTO, Abishek Pushparaj, heads up engineering and international growth."
    ],
    suggestions: ["Tell me about the founder", "What's your tech stack?", "Tell me about the team"]
  },
  {
    tag: "journey",
    priority: 1,
    patterns: ["history", "journey", "when was cyberdude founded", "company history", "timeline", "how long has cyberdude been around", "founded", "when did cyberdude start", "started", "years old", "how old is cyberdude", "how old is this company"],
    responses: [
      "Founded Dec 2016. Since then: CyberHRM (2017), SelfMote (2018), CyberGYM+ (2020), Academy (2021), and steady growth to enterprise scale.",
      "9+ years in — from our first HR product in 2017 to enterprise cloud platforms today."
    ],
    suggestions: ["Tell me about CyberDude Academy", "What awards have you won?", "Tell me about the founder"]
  },
  {
    tag: "careers",
    priority: 1,
    patterns: ["careers", "jobs", "hiring", "job openings", "are you hiring", "open positions", "how do i apply", "job opportunities", "career opportunities", "vacancies", "current openings"],
    responses: [
      "We're hiring! Fullstack Engineer, Developer Trainer, and IoT Hardware Integrator. Email hr@cyberdudenetworks.com.",
      "3 open roles right now — ask me about a specific one, or just email hr@cyberdudenetworks.com to apply."
    ],
    suggestions: ["Tell me about the Fullstack Engineer role", "Do you offer internships?", "What's it like working there?"]
  },
  {
    tag: "careers_fullstack_engineer",
    priority: 2,
    patterns: ["fullstack engineer", "full stack engineer role", "software engineer job"],
    responses: [
      "Fullstack Engineer — Engineering team, Chennai. Apply via hr@cyberdudenetworks.com.",
      "An open Engineering role based in Chennai — reach out to hr@cyberdudenetworks.com to apply."
    ],
    suggestions: ["What other roles are open?", "Do you offer internships?", "What's it like working there?"]
  },
  {
    tag: "careers_trainer",
    priority: 2,
    patterns: ["developer trainer", "trainer role", "teaching job", "academy job", "trainer position"],
    responses: [
      "Full-Stack Developer Trainer — CyberDude Academy, Avadi. Teach real production builds, not textbook theory.",
      "An Academy role in Avadi — teaching Full Stack development the hands-on way."
    ],
    suggestions: ["What other roles are open?", "Tell me about CyberDude Academy", "How do I apply?"]
  },
  {
    tag: "careers_iot_integrator",
    priority: 2,
    patterns: ["iot integrator", "hardware integrator", "telemetry hardware", "iot hardware job"],
    responses: [
      "IoT & Telemetry Hardware Integrator — Hardware team, Avadi. Connects physical devices to our cloud platforms.",
      "A Hardware team role in Avadi, working on IoT and telemetry integration."
    ],
    suggestions: ["What other roles are open?", "Tell me about your IoT work", "How do I apply?"]
  },
  {
    tag: "internships",
    priority: 2,
    patterns: ["internship", "internships", "intern program", "student internship", "looking for internships"],
    responses: [
      "Yes! Hands-on internships — you build real software, not just watch tickets.",
      "We run internship programs alongside our full-time roles — real, production-grade work."
    ],
    suggestions: ["What's it like working there?", "Tell me about CyberDude Academy", "How do I apply?"]
  },
  {
    tag: "careers_culture",
    priority: 2,
    patterns: ["what's it like working there", "company culture", "how are you selected", "hiring process", "what do you look for", "how do you hire people"],
    responses: [
      "We hire for curious, creative, respectful, consistent people — not just output. Our motto: \"Don't apply. Belong.\"",
      "Culture over résumé — we look for people who ask good questions and show up consistently."
    ],
    suggestions: ["What roles are open?", "Do you offer internships?", "Tell me about the team"]
  },
  {
    tag: "academy",
    priority: 2,
    patterns: ["academy", "learn tech", "training", "courses", "youtube channel", "learn to code", "cyberdude academy"],
    responses: [
      "CyberDude Academy (2021): Full Stack, Mobile, IoT and UI/UX — real builds, not textbook theory. Also on YouTube.",
      "We teach practical dev skills through real production builds, with live sessions on our YouTube channel."
    ],
    suggestions: ["Tell me about the Trainer job role", "Do you offer internships?", "What's your journey/history?"]
  },
  {
    tag: "contact",
    priority: 2,
    patterns: ["contact", "address", "phone", "email", "reach you", "location", "where are you located", "how do i contact you", "get in touch", "phone number", "email address", "where is cyberdude located"],
    responses: [
      "Email hello@cyberdudenetworks.com or call +91 8939738801. Office: #32, Second Street, Ramalingapuram, Kamaraj Nagar, Avadi, Chennai – 600 071.",
      "Reach us at +91 8148413506 or hello@cyberdudenetworks.com — we're based in Avadi, Chennai."
    ],
    suggestions: ["What are your social media links?", "What are your engagement models?", "Are you hiring?"]
  },
  {
    tag: "social_media",
    priority: 2,
    patterns: ["social media", "linkedin", "instagram", "twitter", "x.com", "youtube", "follow you"],
    responses: [
      "Find us on LinkedIn, Instagram, X (@cdudenetworks), and YouTube — we post real coding builds there.",
      "We're active on LinkedIn, Instagram, X and YouTube under CyberDude Networks."
    ],
    suggestions: ["Tell me about CyberDude Academy", "How do I contact you?", "Show me your projects"]
  },
  {
    tag: "legal_privacy",
    priority: 2,
    patterns: ["privacy policy", "terms of service", "data and cloud security policy", "legal", "gdpr"],
    responses: [
      "Our Privacy Policy, Terms, and Data & Cloud Security docs are on our website footer — or email hello@cyberdudenetworks.com.",
      "Legal details are published on our site; happy to point you to the right page if you email us."
    ],
    suggestions: ["Tell me about data security", "How do I contact you?", "What are your engagement models?"]
  },
  {
    tag: "how_we_work",
    priority: 1,
    patterns: ["how do you work", "how we work", "your process", "development process", "workflow", "how does your process work"],
    responses: [
      "One team handles everything — no juggling multiple vendors. Blueprint, build, deploy, and maintain, all under one roof.",
      "From planning to deployment to 24/7 maintenance — one accountable team, not outsourced pieces."
    ],
    suggestions: ["What are your engagement models?", "Tell me about your team", "Show me your projects"]
  },
  {
    tag: "bot_identity",
    priority: 2,
    patterns: ["are you an ai", "are you chatgpt", "are you a bot", "are you human", "are you using an api", "is this chatgpt", "what are you", "are you real", "who made you", "who built you", "who build you", "who created you", "who developed you", "who programmed you", "who designed you", "your creator", "your developer", "coded", "programmed", "who coded this", "who coded you"],
    responses: [
      "I'm Cyber Dude Duty — a rule-based assistant, no external AI API. Just keyword matching against real company info.",
      "No ChatGPT here — I'm a handwritten keyword matcher built specifically for CyberDude Networks."
    ],
    suggestions: ["What services do you offer?", "How much do you charge?", "How do I contact you?"]
  },
  {
    tag: "abuse_policy",
    priority: 2,
    patterns: [
      "what happens if someone abuses you", "what will you do if someone abuses you",
      "abuse policy", "safety rules", "safety policy",
      "what if i abuse you", "what happens if i am abusive",
      "what happens if someone is abusive", "what happens if i abuse you",
      "what happens if i swear at you", "do you block people"
    ],
    // Exact policy wording — kept as a single consistent response rather
    // than 2 varied phrasings (like every other intent) because this is a
    // policy statement: it should read identically every time it's asked,
    // not paraphrase itself randomly.
    responses: [
      "Cyber Dude Duty follows a strict safety policy. If abusive language is used, the system triggers a strike warning. Upon reaching 3 strikes, access to the chatbot and agent support is temporarily blocked on this device for 24 hours."
    ],
    suggestions: ["How do I contact you?", "What services do you offer?", "Are you an AI?"]
  }
];

module.exports = knowledgeBase;
