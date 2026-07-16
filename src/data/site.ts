import publishedContent from './published_content.json';

export const site = {
  brand: 'InnerChispa',
  product: 'Ralphi IA / Ralph AI Ecosystem',
  tagline: 'Automatización, coordinación y entregables operativos desde un solo centro',
  contact: 'rlopez@innerchispa.us',
  intro: {
    eyebrow: 'Plataforma viva',
    headline: 'InnerChispa, PC Doctor, InnerSpark y Ralphi IA (LatAm) / Ralph AI (USA) en una sola historia técnica.',
    summary:
      'Un ecosistema modular para operar soporte técnico real, coordinar agentes de IA, documentar operaciones y convertir el trabajo de campo en conocimiento reusable.',
  },
  proof: [
    {
      title: 'PC Doctor en producción real',
      body: 'Operaciones en Ecuador, clientes, visitas, cotizaciones, facturación y evidencia viva que alimentan la memoria del sistema.',
    },
    {
      title: 'Ralphi IA / Ralph AI como cerebro operativo',
      body: 'MCP, coordinación multiagente, WhatsApp, paneles y memoria persistente para ChatGPT, Cursor, Codex, Antigravity y Gemini.',
    },
    {
      title: 'InnerSpark como misión ampliada',
      body: 'Apoyo a fundadores, ONGs y fundaciones; acceso a tecnología y automatización para quien necesite una ruta de entrada.',
    },
  ],
  entities: [
    {
      name: 'PC Doctor S.A.',
      region: 'Ecuador',
      role: 'Operación técnica, soporte de campo, seguridad electrónica y soporte empresarial.',
    },
    {
      name: 'InnerChispa LLC',
      region: 'Estados Unidos',
      role: 'Estrategia, automatización, productos web y colaboración con hackatones.',
    },
    {
      name: 'InnerSpark',
      region: 'Capa de misión',
      role: 'Espiritualidad, conciencia, IA y soporte para proyectos con impacto.',
    },
  ],
  projects: publishedContent
    .filter((x: any) => x.type === 'project')
    .map((x: any) => ({
      name: x.title,
      status: x.status === 'published' ? 'Activo' : x.status,
      summary: x.description,
      technologies: x.technologies || [],
      images: x.images || [],
      github_url: x.github_url || '',
      demo_url: x.demo_url || '',
    })),
  visuals: [
    {
      title: 'Hero operational panel',
      src: '/hero-innerchispa.png',
      alt: 'Panel operativo de InnerChispa, PC Doctor y Ralphi IA',
      caption: 'Hero principal de la portada actual.',
    },
    {
      title: 'Next case study slot',
      src: '/visuals/placeholder-case-study.png',
      alt: 'Espacio reservado para una nueva imagen de caso de estudio',
      caption: 'Copia aquí el siguiente PNG/JPG y actualiza la ruta.',
    },
  ],
  hackathons: publishedContent
    .filter((x: any) => x.type === 'hackathon')
    .map((x: any) => ({
      title: x.title,
      status: x.status === 'published' ? 'Active' : x.status,
      summary: x.description,
      technologies: x.technologies || [],
      images: x.images || [],
      github_url: x.github_url || '',
      demo_url: x.demo_url || '',
      submission_url: x.submission_url || '',
      milestones: x.milestones || []
    })),
  timeline: [
    { date: '2026-07-01', title: 'Coordinación v2', body: 'Se establecen inboxes compartidos, journals y la memoria operativa central.' },
    { date: '2026-07-07', title: 'Dual-node WhatsApp', body: 'Se documenta la estrategia de respaldo y bootstrap para el nodo AMD.' },
    { date: '2026-07-10', title: 'Auditoría de datos', body: 'Se detecta la separación entre legacy y operaciones de PC Doctor.' },
    { date: '2026-07-11', title: 'Arquitectura modular', body: 'Se formaliza el kernel + módulos vendibles y la historia viva del ecosistema.' },
    { date: '2026-07-14', title: 'Staging web y narrativa', body: 'Se define la narrativa de marca y se prepara la web corporativa modular.' },
  ],
  capabilities: [
    'MCP y coordinación multiagente',
    'WhatsApp y mensajes operativos',
    'Registro de fondos y créditos',
    'Paneles web internos',
    'Modelos locales y ruteo de IA',
    'Documentación sincronizada',
  ],
  mission: [
    'Automatizar trabajo real sin perder control humano.',
    'Convertir operaciones en sistemas reutilizables.',
    'Abrir tecnología a proyectos con impacto y a quien no puede pagar.',
  ],
  navigation: [
    ['Home', '/'],
    ['Ralphi IA / Ralph AI', '/ralphi-ia'],
    ['Proyectos', '/proyectos'],
    ['Hackatones', '/hackatones'],
    ['Tecnología', '/tecnologia'],
    ['Contacto', '/contacto'],
    ['Privacy', '/privacy'],
  ],
};
