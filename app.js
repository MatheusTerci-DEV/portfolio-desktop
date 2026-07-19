const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
function makeElement(tag, { className, text, attributes = {} } = {}, children = []) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = String(text);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, String(value)));
  children.forEach(child => element.appendChild(child));
  return element;
}

const canvas = $('#stars');
const ctx = canvas.getContext('2d');
let stars = [], pointer = { x: .5, y: .5 };
function resize() {
  canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px';
  stars = Array.from({ length: Math.min(90, innerWidth / 14) }, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
    r: (.25 + Math.random() * .8) * devicePixelRatio, a: .12 + Math.random() * .55, s: .04 + Math.random() * .18,
    color: Math.random() > .86 ? (Math.random() > .5 ? '#9be9ff' : '#c5b8ff') : '#f4f1ea'
  }));
}
function drawStars(t = 0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach((s, i) => {
    const drift = scrollY * s.s * devicePixelRatio;
    const y = (s.y - drift % canvas.height + canvas.height) % canvas.height;
    ctx.globalAlpha = s.a * (.7 + Math.sin(t / 900 + i) * .3); ctx.fillStyle = s.color;
    ctx.beginPath(); ctx.arc(s.x + (pointer.x - .5) * s.s * 24, y, s.r, 0, Math.PI * 2); ctx.fill();
  }); requestAnimationFrame(drawStars);
}
addEventListener('resize', resize); addEventListener('pointermove', e => { pointer = { x: e.clientX / innerWidth, y: e.clientY / innerHeight }; }); resize(); drawStars();

const interactionPilot = $('#interaction-pilot');
let pilotX = innerWidth * .78, pilotY = innerHeight * .72, pilotTargetX = pilotX, pilotTargetY = pilotY;
addEventListener('pointermove', e => {
  pilotTargetX = e.clientX + 24;
  pilotTargetY = e.clientY - 46;
  document.documentElement.style.setProperty('--spot-x', `${e.clientX}px`);
  document.documentElement.style.setProperty('--spot-y', `${e.clientY}px`);
});
function moveInteractionPilot() {
  pilotX += (pilotTargetX - pilotX) * .075;
  pilotY += (pilotTargetY - pilotY) * .075;
  interactionPilot.style.setProperty('--pilot-x', `${pilotX}px`);
  interactionPilot.style.setProperty('--pilot-y', `${pilotY}px`);
  requestAnimationFrame(moveInteractionPilot);
} moveInteractionPilot();

function addPanelTilt(selector) {
  $$(selector).forEach(panel => {
    panel.addEventListener('pointermove', e => {
      const rect = panel.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - .5;
      const y = (e.clientY - rect.top) / rect.height - .5;
      panel.style.setProperty('--tilt-x', `${-y * 2.2}deg`);
      panel.style.setProperty('--tilt-y', `${x * 2.2}deg`);
      panel.classList.add('is-exploring');
    });
    panel.addEventListener('pointerleave', () => {
      panel.style.setProperty('--tilt-x', '0deg');
      panel.style.setProperty('--tilt-y', '0deg');
      panel.classList.remove('is-exploring');
    });
  });
}
addPanelTilt('.skill-card, .project');

const skillDescriptions = [
  'Construção da lógica, regras de negócio e integração de aplicações.',
  'Criação de endpoints REST, persistência de dados e documentação de serviços.',
  'Aprendizado contínuo para ampliar minha visão técnica e colaboração.'
];
function initializeSkillDeck(skillData) {
  const deck = $('#skills-grid');
  if (!deck) return;
  const buttons = $$('.skill-nav button', deck);
  const focus = $('.skill-focus', deck);
  buttons.forEach((button, index) => button.addEventListener('click', () => {
    const item = skillData[index];
    if (!item) return;
    buttons.forEach((b, i) => { b.classList.toggle('active', i === index); b.setAttribute('aria-selected', i === index); });
    focus.classList.add('switching');
    setTimeout(() => {
      focus.dataset.tone = ['violet', 'cyan', 'amber'][index] || 'violet';
      $('#skill-status').textContent = index === 2 ? 'EM DESENVOLVIMENTO' : 'APLICAÇÃO PRÁTICA';
      $('#skill-title').textContent = item.group_name;
      $('#skill-description').textContent = item.description || skillDescriptions[index];
      $('#skill-tags').replaceChildren(...item.items.map(tag => makeElement('em', { text: tag })));
      $('#skill-current').textContent = String(index + 1).padStart(2, '0');
      $('.focus-orbit .skill-orb', deck).className = `skill-orb ${['violet', 'cyan', 'amber'][index]}`;
      focus.classList.remove('switching');
    }, 160);
  }));
}
const defaultSkills = [
  { group_name: 'Back-end .NET', items: ['C#', '.NET 8', 'ASP.NET Core', 'Entity Framework'] },
  { group_name: 'APIs & Dados', items: ['REST', 'SQL Server', 'Swagger', 'Migrations'] },
  { group_name: 'Em evolução', items: ['Python', 'JavaScript', 'Git', 'Trabalho em equipe'] }
];
initializeSkillDeck(defaultSkills);

const astronaut = $('#astronaut');
let tx = 0, ty = 0, cx = 0, cy = 0;
function floatAstronaut() {
  tx = (pointer.x - .5) * 34; ty = (pointer.y - .5) * 22;
  cx += (tx - cx) * .035; cy += (ty - cy) * .035;
  astronaut.style.setProperty('--mx', `${cx}px`); astronaut.style.setProperty('--my', `${cy}px`);
  requestAnimationFrame(floatAstronaut);
} floatAstronaut();

const chapters = $$('.chapter');
const chapterLabels = ['Apresentação', 'Trajetória', 'Sistemas de bordo', 'Projetos', 'Contato'];
const travelMessages = [
  ['Bem-vindo à sua viagem.', 'Aproveite cada descoberta.'],
  ['Próximo destino à frente.', 'Conheça a trajetória por trás desta missão.'],
  ['Sistemas de bordo preparados.', 'Explore as tecnologias desta jornada.'],
  ['Chegando à órbita dos projetos.', 'Veja conhecimento transformado em prática.'],
  ['Conexão final se aproximando.', 'Obrigado por viajar comigo.']
];
let currentChapter = 0;
let travelling = false;
function showChapter(index) {
  const next = Math.max(0, Math.min(chapters.length - 1, index));
  chapters.forEach((chapter, i) => {
    chapter.classList.toggle('active', i === next);
    chapter.classList.toggle('exit-left', i < next);
    if (i === next) chapter.scrollTop = 0;
  });
  currentChapter = next;
  document.body.dataset.chapter = String(next);
  $('#control-current').textContent = String(next + 1).padStart(2, '0');
  $('#chapter').textContent = String(next + 1).padStart(2, '0');
  $('#prev-chapter').disabled = next === 0;
  $('#next-chapter').disabled = next === chapters.length - 1;
  astronaut.style.setProperty('--scroll-rot', `${(next - 2) * 2}deg`);
}
showChapter(0);
history.replaceState({ screen: 'launch' }, '', '#viagem');
function travelTo(index, { launch = false, push = true } = {}) {
  if (travelling) return;
  travelling = true;
  const warp = $('#warp-transition');
  const safeIndex = Math.max(0, Math.min(chapters.length - 1, index));
  $('#loading-destination').textContent = chapterLabels[safeIndex].toUpperCase();
  $('.recruiter-messages').replaceChildren(...travelMessages[safeIndex].map(message => makeElement('small', { text: message })));
  document.body.classList.add('warping');
  warp.classList.add('active');
  setTimeout(() => {
    if (launch) document.body.classList.remove('preflight');
    showChapter(safeIndex);
    if (push) history.pushState({ screen: 'chapter', chapter: safeIndex }, '', `#etapa-${safeIndex + 1}`);
  }, 2000);
  setTimeout(() => {
    warp.classList.remove('active');
    document.body.classList.remove('warping');
    travelling = false;
  }, 4000);
}
$('#launch-button').addEventListener('click', () => travelTo(0, { launch: true }));
$('#prev-chapter').addEventListener('click', () => travelTo(currentChapter - 1));
$('#next-chapter').addEventListener('click', () => travelTo(currentChapter + 1));
$('#restart-journey').addEventListener('click', () => {
  if (travelling) return;
  document.body.classList.add('preflight');
  showChapter(0);
  history.pushState({ screen: 'launch' }, '', '#viagem');
  $('#launch-button').focus();
});
addEventListener('popstate', event => {
  const state = event.state || { screen: 'launch' };
  if (state.screen === 'launch') {
    document.body.classList.add('preflight');
    showChapter(0);
    return;
  }
  document.body.classList.remove('preflight');
  travelTo(Number(state.chapter) || 0, { push: false });
});
const destinations = ['Explorar trajetória', 'Conhecer sistemas de bordo', 'Visitar projetos', 'Ir para contato'];
chapters.slice(1, -1).forEach((chapter, index) => {
  const chapterIndex = index + 1;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'travel-next';
  button.textContent = destinations[chapterIndex];
  button.addEventListener('click', () => travelTo(chapterIndex + 1));
  chapter.appendChild(button);
});
const returnButton = document.createElement('button');
returnButton.type = 'button';
returnButton.className = 'travel-next';
returnButton.textContent = 'Viajar novamente';
returnButton.addEventListener('click', () => $('#restart-journey').click());
chapters.at(-1).appendChild(returnButton);
addEventListener('keydown', e => {
  if (document.body.classList.contains('preflight')) {
    if (e.key === 'Enter' || e.key === ' ') $('#launch-button').click();
    return;
  }
  if (e.key === 'ArrowRight') travelTo(currentChapter + 1);
  if (e.key === 'ArrowLeft') travelTo(currentChapter - 1);
});
$$('a[href^="#"]').forEach(link => link.addEventListener('click', e => {
  const target = $(link.getAttribute('href'));
  const index = chapters.indexOf(target);
  if (index >= 0) { e.preventDefault(); travelTo(index); }
}));

const fallback = {
  profile: { name: 'Matheus Terci.', headline: 'Desenvolvedor back-end em formação, criando APIs e soluções com C#, .NET, Python e SQL Server.' }
};

function createTimelineItem(experience, index) {
  return makeElement('article', { className: 'timeline-item visible' }, [
    makeElement('time', { text: experience.period }),
    makeElement('div', {}, [
      makeElement('h3', { text: `${experience.role} · ${experience.company}` }),
      makeElement('p', { text: experience.summary })
    ]),
    makeElement('span', { text: String(index + 1).padStart(2, '0') })
  ]);
}

function renderSkillDeck(skills) {
  const tones = ['violet', 'cyan', 'amber'];
  const subtitles = ['NÚCLEO PRINCIPAL', 'INTEGRAÇÃO', 'PRÓXIMA ÓRBITA'];
  const nav = makeElement('nav', { className: 'skill-nav', attributes: { 'aria-label': 'Categorias de conhecimento' } });
  skills.forEach((skill, index) => {
    const button = makeElement('button', {
      className: index === 0 ? 'active' : '',
      attributes: { type: 'button', 'data-skill': index, 'aria-selected': index === 0 }
    }, [
      makeElement('i', { className: tones[index % tones.length] }),
      makeElement('span', {}, [
        makeElement('b', { text: skill.group_name }),
        makeElement('small', { text: subtitles[index] || 'CONHECIMENTO' })
      ]),
      makeElement('em', { text: String(index + 1).padStart(2, '0') })
    ]);
    nav.appendChild(button);
  });

  const first = skills[0];
  const tags = makeElement('div', { className: 'skill-tags', attributes: { id: 'skill-tags' } },
    first.items.map(tag => makeElement('em', { text: tag })));
  const focus = makeElement('article', { className: 'skill-focus', attributes: { 'data-tone': 'violet' } }, [
    makeElement('div', { className: 'focus-orbit' }, [
      makeElement('div', { className: 'skill-orb violet' }, [makeElement('i')]),
      makeElement('span', { text: 'CONHECIMENTO EM FOCO' })
    ]),
    makeElement('div', { className: 'focus-copy' }, [
      makeElement('small', { text: 'APLICAÇÃO PRÁTICA', attributes: { id: 'skill-status' } }),
      makeElement('h3', { text: first.group_name, attributes: { id: 'skill-title' } }),
      makeElement('p', { text: first.description || skillDescriptions[0], attributes: { id: 'skill-description' } }),
      tags
    ]),
    makeElement('div', { className: 'focus-index' }, [
      makeElement('b', { text: '01', attributes: { id: 'skill-current' } }),
      makeElement('span', { text: `/ ${String(skills.length).padStart(2, '0')}` })
    ])
  ]);
  $('#skills-grid').replaceChildren(nav, focus);
  initializeSkillDeck(skills);
}

function createProjectCard(project) {
  const consoleHeader = makeElement('header', {}, [
    makeElement('i'),
    makeElement('span', { text: 'stock-control / api' }),
    makeElement('b', { text: 'ONLINE' })
  ]);
  const apiRoute = makeElement('div', { className: 'api-route' }, [
    makeElement('small', { text: 'CLIENTE' }),
    makeElement('strong', { text: 'REST API' }),
    makeElement('em', { text: 'Swagger' })
  ]);
  const apiCore = makeElement('div', { className: 'api-core' }, [
    ...['GET', 'POST', 'PUT', 'DELETE'].map(method => makeElement('span', { text: method })),
    makeElement('b', {}, [document.createTextNode('ASP.NET'), makeElement('br'), document.createTextNode('CORE')])
  ]);
  const database = makeElement('div', { className: 'database' }, [
    makeElement('i'), makeElement('strong', { text: 'SQL' }), makeElement('small', { text: 'SERVER' })
  ]);
  const consoleFooter = makeElement('footer', {},
    ['PRODUTOS', 'ENDEREÇOS', 'NOTAS FISCAIS', 'ESTOQUE'].map(label => makeElement('span', { text: label })));
  const visual = makeElement('div', { className: 'project-visual' }, [
    makeElement('div', { className: 'api-console project-monitor' }, [
      consoleHeader,
      makeElement('div', { className: 'api-body monitor-screen' }, [apiRoute, apiCore, database]),
      consoleFooter
    ])
  ]);
  const resultLabels = [
    'Modelagem e banco de dados',
    'Endpoints e regras de negócio',
    'Testes e documentação Swagger'
  ];
  const results = makeElement('div', { className: 'project-results' }, resultLabels.map((label, index) =>
    makeElement('span', {}, [makeElement('b', { text: String(index + 1).padStart(2, '0') }), document.createTextNode(` ${label}`)])));
  const tags = makeElement('div', { className: 'project-tags' },
    (project.tags || []).map(tag => makeElement('span', { text: tag })));
  const copy = makeElement('div', { className: 'project-copy' }, [
    makeElement('small', { text: `${project.category} / ${project.year}` }),
    makeElement('h3', { text: project.title }),
    makeElement('p', { text: project.summary }),
    results,
    tags
  ]);
  return makeElement('article', { className: 'project visible' }, [visual, copy]);
}

async function loadPortfolio() {
  const cfg = window.__PORTFOLIO_CONFIG__ || {};
  if (!cfg.supabaseUrl || !cfg.supabasePublishableKey) return;
  try {
    const headers = { apikey: cfg.supabasePublishableKey };
    const [profileRes, projectsRes, experienceRes, skillsRes] = await Promise.all([
      fetch(`${cfg.supabaseUrl}/rest/v1/portfolio_profile?select=name,headline&limit=1`, { headers }),
      fetch(`${cfg.supabaseUrl}/rest/v1/portfolio_projects?select=title,summary,category,year,tags&order=sort_order.asc`, { headers }),
      fetch(`${cfg.supabaseUrl}/rest/v1/portfolio_experience?select=company,role,period,summary&order=sort_order.asc`, { headers }),
      fetch(`${cfg.supabaseUrl}/rest/v1/portfolio_skills?select=group_name,items&order=sort_order.asc`, { headers })
    ]);
    if (![profileRes, projectsRes, experienceRes, skillsRes].every(r => r.ok)) throw new Error('Conteúdo indisponível');
    const [profiles, projects, experiences, skills] = await Promise.all([profileRes.json(), projectsRes.json(), experienceRes.json(), skillsRes.json()]);
    const profile = profiles[0] || fallback.profile;
    $$('[data-profile="name"]').forEach(e => e.textContent = profile.name || fallback.profile.name);
    $$('[data-profile="headline"]').forEach(e => e.textContent = profile.headline || fallback.profile.headline);
    if (experiences.length) $('#timeline').replaceChildren(...experiences.slice().reverse().map(createTimelineItem));
    if (skills.length) renderSkillDeck(skills);
    if (projects.length) {
      $('#project-list').replaceChildren(...projects.map(createProjectCard));
      addPanelTilt('.project');
    }
  } catch (error) { console.info('Modo demonstração ativo.'); }
} loadPortfolio();
