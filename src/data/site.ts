import publishedContent from './published_content.json';

const englishDescriptions: Record<string, string> = {
  proj_qwen_society: 'A high-performance agent-to-agent mesh for distributed DevOps and SRE investigation, connected to the operational memory of the InnerChispa ecosystem.',
  hack_gitlab_upcoming: 'A focused contribution sprint for creating verifiable merge requests, strengthening CI/CD workflows, and building reusable DevSecOps capabilities.',
  proj_funding_registry: 'A live operations portal for tracking technology credits, funding applications, resource consumption, approvals, and supporting evidence.',
  proj_quoteops: 'An operational AI workflow that turns unstructured requests into reviewed B2B quotes, with identity checks, human approval, documents, and delivery tracking.',
  proj_smart_quoter: 'A privacy-first, local AI quoting platform that transcribes voice, extracts requirements, validates Ecuadorian identity data, and prepares structured opportunities.',
  proj_ralphiia_mcp: 'The canonical Model Context Protocol bridge connecting business memory, CRM, accounting, WhatsApp, and supervised agents through typed capabilities.',
  hack_openai_build_week: 'Development of the RalphiIA QuoteOps suite for classifying requests and creating dynamic B2B quotes without hard-coded business content.',
  hack_band_of_agents: 'A sovereign local multi-agent swarm for diagnosing networks, CCTV, and enterprise field-support cases with persistent organizational memory.',
  hack_amd_act_ii: 'A sovereign edge-to-cloud multi-agent ecosystem that routes real operational work between local AMD hardware and accelerated cloud inference.',
  hack_gitlab_transcend: 'InnerSpark DevSecOps Swarm intercepts GitLab events and coordinates local agents to inspect vulnerabilities and return auditable evidence.',
  hack_brightdata_agents: 'VigilOS is an autonomous edge-security system that protects public-data ingestion and explains perimeter anomalies in real time.',
  hack_ollama_offline: 'Offline-first classification and intake tools for operational control and intelligent quoting, powered by local Ollama and Whisper services.',
  hack_chutes_malaysia: 'InnerOS Cloud Copilot reviews server events, identifies container anomalies, and dispatches evidence-rich notifications through WhatsApp.',
  hack_uipath_agenthack: 'PC Doctor Maestro Copilot coordinates real MSP field exceptions using local models, structured memory, and human-in-the-loop control.',
  hack_rapid_agent: 'A multi-agent field-operations flow combining smart routing, MongoDB memory, automated quotes, and contextual WhatsApp notifications.',
  hack_gemini_xprize: 'Research and development of multi-agent systems and cognitive integrations using Gemini and distributed, locally persisted data meshes.',
};

const publicEnglishSummaries: Record<string, string> = {
  "innerspark-smart-quoter": "A privacy-first quoting assistant that transcribes voice requests locally, extracts structured requirements, and prepares reviewable estimates.",
  "proj_innerchispa_conscious_map": "An experimental map of memory, meaningful context, and responsible AI-assisted pattern discovery, with human agency at its center.",
  "canonical_youcom-liveops-intelligence": "A multi-agent investigation and research workflow combining live evidence, independent safety review, and approval-gated actions.",
  "canonical_vigilos-lablab-security": "An exploratory security gateway for perimeter events, remote auditing, and human-reviewed AI-assisted investigations.",
  "funding_web_surface_registry_20260806": "Internal inventory of digital surfaces used to document funding and program applications. Not intended as a public product.",
  "inneros-agentic-platform": "A local-first agent orchestration platform connecting governed tasks, persistent memory, MCP tools, message routing, and evidence-based operations.",
  "hyperloom-r9700-rocm": "A local AMD Radeon AI inference research stack using ROCm, vLLM, and Qwen coding models to keep sensitive processing on owned hardware.",
  "infralens-network-intelligence": "Multi-vendor network observability research correlating device telemetry, topology, and operational anomalies across managed infrastructure.",
  "personal-brain-memory-curator": "Persistent, privacy-conscious agent memory combining episodic records, semantic retrieval, and a knowledge graph.",
  "ambient-guardian-alexa-iot": "An experimental interface connecting voice assistants and home devices to supervised InnerOS queries and authorized actions.",
  "nebius-nvidia-infrastructure-guardian": "Research into governed hybrid AI infrastructure, combining local AMD execution with cloud NVIDIA resources where authorized.",
  "proj_qwen_society": "An agent-to-agent research mesh for distributed DevOps investigation and evidence reconciliation.",
  "proj_ralphiia_mcp": "An MCP integration layer providing governed connections among memory, business applications, and specialized AI agents.",
  "proj_funding_registry": "A registry for tracking grant and program applications, credits, approvals, and supporting evidence.",
  "proj_quoteops": "An assisted B2B quotation workflow that structures incoming requests and routes estimates through human review.",
  "canonical_underwriting-os-prototype": "An early research concept for human-reviewed AI underwriting workflows and persistent decision context."
};

const items = [...(publishedContent as any[])].sort((a, b) => String(b.updated_at || b.published_at || '').localeCompare(String(a.updated_at || a.published_at || '')));
const latestUpdate = items.reduce((latest, item) => String(item.updated_at || item.published_at || '') > latest ? String(item.updated_at || item.published_at || '') : latest, '');

const localize = (item: any) => ({
  id: item.content_id,
  slug: item.slug,
  title: item.title,
  title_es: item.translations?.es?.title || item.title_es || item.title,
  title_en: item.translations?.en?.title || item.title_en || item.title,
  status: item.status,
  summary_es: item.translations?.es?.description || item.description_es || item.description,
  summary_en: item.translations?.en?.description || item.description_en || publicEnglishSummaries[item.content_id] || englishDescriptions[item.content_id] || item.description,
  technologies: item.technologies || [],
  images: item.images || [],
  github_url: item.github_url || '',
  demo_url: item.demo_url || '',
  submission_url: item.submission_url || '',
  milestones: item.milestones || [],
  updated_at: item.updated_at || item.published_at || '',
});

export const site = {
  brand: 'InnerChispa',
  product: 'Live Systems Lab',
  tagline: 'Private intelligence, supervised agents, and real-world systems.',
  contact: 'info@innerchispa.us',
  publicUrl: 'https://lab.pcdoctor.ai',
  heroImage: '/hero-innerchispa.png',
  business: {
    name: 'PC Doctor S.A. · InnerChispa Live Systems Lab',
    shortName: 'PC Doctor S.A.',
    telephone: '+593999059000',
    whatsapp: 'https://wa.me/593999059000',
    email: 'info@innerchispa.us',
    url: 'https://www.innerchispa.us',
    labUrl: 'https://lab.pcdoctor.ai',
    priceRange: '$$',
    areaServed: ['Guayaquil, Ecuador', 'Ecuador', 'Remote support'],
    address: {
      streetAddress: 'Guayaquil service area',
      addressLocality: 'Guayaquil',
      addressRegion: 'Guayas',
      postalCode: '090150',
      addressCountry: 'EC',
    },
    geo: {
      latitude: -2.1894,
      longitude: -79.8891,
    },
    sameAs: [
      'https://www.innerchispa.us',
      'https://github.com/Rafa-Innerchispa',
      'https://www.linkedin.com/company/innerchispa',
    ],
    openingHours: [
      { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' },
      { dayOfWeek: ['Saturday'], opens: '10:00', closes: '14:00' },
    ],
    services: [
      { name: 'Computer and laptop diagnostics', description: 'Technical diagnosis for laptops, desktop PCs, operating systems, peripherals, and business workstations.' },
      { name: 'Preventive maintenance and hardware repair', description: 'Cleaning, optimization, replacement guidance, storage, memory, thermal and performance maintenance.' },
      { name: 'Remote and on-site IT support', description: 'Supervised remote assistance and coordinated on-site support for homes, founders, and small businesses.' },
      { name: 'Networking, security and automation support', description: 'Support for networks, cameras, operational systems, WhatsApp workflows, private AI agents, and auditable automation.' },
    ],
    faqs: [
      {
        question: 'What does PC Doctor and InnerChispa do?',
        answer: 'PC Doctor provides computer diagnostics, repair, maintenance, networking and IT support in Ecuador, while InnerChispa builds supervised AI systems, automation and private operational memory for real business workflows.',
      },
      {
        question: 'Can support be remote or on-site?',
        answer: 'Yes. The team can coordinate remote support when the issue can be diagnosed safely online, and on-site support when hardware, networks, cameras or physical infrastructure require field work.',
      },
      {
        question: 'How can a customer request service quickly?',
        answer: 'The fastest path is WhatsApp at +593999059000 or email at info@innerchispa.us, with a short description of the device, issue, location and urgency.',
      },
      {
        question: 'How are AI and automation used?',
        answer: 'AI agents are used as supervised tools for intake, evidence organization, pattern detection, quoting assistance and operational follow-up; sensitive actions remain human-reviewed.',
      },
    ],
  },
  source: {
    label: 'MCP · MongoDB · Astro',
    itemCount: items.length,
    latestUpdate,
  },
  projects: items.filter((item) => item.type === 'project').map(localize),
  hackathons: items.filter((item) => item.type === 'hackathon').map(localize),
  navigation: [
    ['Home', '/'],
    ['Ralphi IA / Ralph AI', '/ralphi-ia'],
    ['Proyectos', '/proyectos'],
    ['Hackatones', '/hackatones'],
    ['Tecnología', '/tecnologia'],
    ['Contacto', '/contacto'],
    ['Privacy', '/privacy'],
  ],
  proof: [
    { title: 'PC Doctor in real operations', body: 'Twenty-five years of field infrastructure, clients, service visits, physical systems, and operational evidence.' },
    { title: 'RalphiIA as an operating layer', body: 'MCP, multi-agent coordination, WhatsApp, private memory, and human-supervised capabilities.' },
    { title: 'Every project becomes a building block', body: 'What is learned in one mission is documented and made reusable across the ecosystem.' },
  ],
  entities: [
    { name: 'PC Doctor S.A.', region: 'Ecuador', role: 'Physical infrastructure, field services, networking, security, and business operations.' },
    { name: 'InnerChispa LLC', region: 'United States', role: 'AI systems strategy, reusable technology, products, and global collaboration.' },
    { name: 'InnerSpark', region: 'Mission layer', role: 'Human-centered systems for founders, creators, organizations, and meaningful work.' },
  ],
  timeline: [
    { date: '2000', title: 'Physical operations', body: 'PC Doctor begins building and maintaining real technology environments.' },
    { date: '2026-07', title: 'Shared operational memory', body: 'Agents, tools, projects, and evidence converge through RalphiIA MCP.' },
    { date: 'Now', title: 'Live systems laboratory', body: 'Each new approved project becomes a visible, reusable part of the InnerChispa ecosystem.' },
  ],
  capabilities: ['Private AI memory', 'Supervised agents', 'WhatsApp operations', 'Local model routing', 'Field infrastructure', 'Evidence and audit trails'],
  mission: ['Automate real work without losing human control.', 'Turn operations into reusable systems.', 'Make practical intelligence available to projects with purpose.'],
};

export const formatSyncDate = (value: string, locale = 'en-US') => {
  if (!value) return 'Awaiting first sync';
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Guayaquil' }).format(new Date(value));
};
