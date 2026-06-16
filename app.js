// ─────────────────────────────────────────────
//  PREGUNTAS POR ROL
// ─────────────────────────────────────────────
const PREGUNTAS = {
  Profesor: [
    {
      id: 'prof_1',
      texto: '¿Cómo recibes los comunicados de Dirección?',
      opciones: ['WhatsApp', 'Comunicado impreso en la pared', 'Ambos', 'No siempre me entero']
    },
    {
      id: 'prof_2',
      texto: '¿Dependes de Dirección para comunicar algo a los padres?',
      opciones: ['Siempre', 'A veces', 'Puedo hacerlo directamente']
    }
  ],
  Padre: [
    {
      id: 'padre_1',
      texto: '¿Por dónde te enteras de las actividades del colegio?',
      opciones: ['WhatsApp', 'Citación en papel', 'Me entero tarde', 'No me entero']
    },
    {
      id: 'padre_2',
      texto: '¿Tu hijo/a te entrega siempre las citaciones?',
      opciones: ['Sí siempre', 'A veces', 'Casi nunca', 'Se las guarda']
    },
    {
      id: 'padre_3',
      texto: '¿Con qué frecuencia vas al colegio a recoger información?',
      opciones: ['Seguido', 'Solo cuando me llaman', 'Casi nunca']
    }
  ],
  Estudiante: [
    {
      id: 'est_1',
      texto: '¿Cuándo te enteras de tus notas?',
      opciones: ['Antes del cierre del trimestre', 'Al cierre', 'Cuando ya es tarde', 'No sé cómo consultarlas']
    },
    {
      id: 'est_2',
      texto: '¿Sientes que las notas son una caja negra durante el año?',
      opciones: ['Sí, no sé nada hasta el final', 'A veces', 'No, me informan bien']
    },
    {
      id: 'est_3',
      texto: '¿Has usado la plataforma de gestión escolar para ver tus notas?',
      opciones: ['Sí y me ayudó', 'La conozco pero no la uso', 'No sabía que existía']
    }
  ]
};

// ─────────────────────────────────────────────
//  DETECT PAGE
// ─────────────────────────────────────────────
const IS_DASHBOARD = document.body.classList.contains('dashboard-body');

// ─────────────────────────────────────────────
//  PARTICIPANT LOGIC
// ─────────────────────────────────────────────
let currentRole = null;

function selectRole(role) {
  currentRole = role;

  document.getElementById('step-role').classList.remove('active');
  document.getElementById('step-questions').classList.add('active');
  document.getElementById('q-role-title').textContent = role === 'Padre' ? 'Padre de Familia' : role;

  const container = document.getElementById('questions-container');
  container.innerHTML = '';

  PREGUNTAS[role].forEach((q, idx) => {
    const block = document.createElement('div');
    block.className = 'question-block';
    block.innerHTML = `
      <p class="question-text"><span class="q-num">${idx + 1}</span>${q.texto}</p>
      <div class="options-group" id="opts-${q.id}">
        ${q.opciones.map(op => `
          <label class="option-label">
            <input type="radio" name="${q.id}" value="${op}" />
            <span class="option-text">${op}</span>
          </label>
        `).join('')}
      </div>
    `;
    container.appendChild(block);
  });
}

function goBack() {
  currentRole = null;
  document.getElementById('step-questions').classList.remove('active');
  document.getElementById('step-role').classList.add('active');
}

async function submitAnswers() {
  if (!currentRole) return;

  const preguntas = PREGUNTAS[currentRole];
  const rows = [];

  for (const q of preguntas) {
    const selected = document.querySelector(`input[name="${q.id}"]:checked`);
    if (!selected) {
      alert('Por favor responde todas las preguntas antes de enviar.');
      return;
    }
    rows.push({ rol: currentRole, pregunta: q.id, respuesta: selected.value });
  }

  const btn = document.getElementById('btn-submit');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  const { error } = await db.from('respuestas').insert(rows);

  if (error) {
    alert('Error al enviar. Verifica tu conexión.');
    btn.disabled = false;
    btn.textContent = 'Enviar respuestas';
    return;
  }

  document.getElementById('step-questions').classList.remove('active');
  document.getElementById('step-success').classList.add('active');
}

// ─────────────────────────────────────────────
//  DASHBOARD LOGIC
// ─────────────────────────────────────────────
const COLORS = {
  cyan:    '#00C2E0',
  blue:    '#1A6BCC',
  green:   '#22C55E',
  yellow:  '#F59E0B',
  purple:  '#8B5CF6',
  red:     '#EF4444',
  teal:    '#14B8A6',
  indigo:  '#6366F1'
};
const PALETTE = Object.values(COLORS);

let charts = {};

function makeChart(id, type, labels, data, colors) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  if (charts[id]) charts[id].destroy();

  const isDoughnut = type === 'doughnut';

  charts[id] = new Chart(ctx, {
    type,
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#0D1B2E',
        borderWidth: isDoughnut ? 3 : 1,
        borderRadius: isDoughnut ? 0 : 6,
        hoverOffset: isDoughnut ? 8 : 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: isDoughnut ? 'right' : 'bottom',
          display: isDoughnut ? true : false,
          labels: {
            color: '#A0AEC0',
            font: { family: 'Inter', size: 11 },
            boxWidth: 12,
            padding: 12
          }
        },
        tooltip: {
          backgroundColor: '#0D1B2E',
          titleColor: '#00C2E0',
          bodyColor: '#E2E8F0',
          borderColor: '#1E3A5F',
          borderWidth: 1,
          padding: 10
        }
      },
      scales: isDoughnut ? {} : {
        x: {
          ticks: { color: '#718096', font: { family: 'Inter', size: 11 } },
          grid: { color: '#1E3A5F' }
        },
        y: {
          ticks: { color: '#718096', font: { family: 'Inter', size: 11 }, stepSize: 1 },
          grid: { color: '#1E3A5F' },
          beginAtZero: true
        }
      }
    }
  });
}

function countBy(rows, field, value) {
  return rows.filter(r => r[field] === value).length;
}

function countAnswers(rows, pregunta, opciones) {
  return opciones.map(op => rows.filter(r => r.pregunta === pregunta && r.respuesta === op).length);
}

async function loadData() {
  const { data: rows, error } = await db.from('respuestas').select('*').order('created_at', { ascending: false });
  if (error || !rows) return;

  // KPIs
  const profesores  = rows.filter(r => r.rol === 'Profesor');
  const padres      = rows.filter(r => r.rol === 'Padre');
  const estudiantes = rows.filter(r => r.rol === 'Estudiante');

  const uniqueProf = [...new Set(profesores.map(r => r.created_at.slice(0,19)))].length;
  const uniquePad  = [...new Set(padres.map(r => r.created_at.slice(0,19)))].length;
  const uniqueEst  = [...new Set(estudiantes.map(r => r.created_at.slice(0,19)))].length;
  const total = uniqueProf + uniquePad + uniqueEst;

  document.getElementById('kpi-total').textContent = total;
  document.getElementById('kpi-prof').textContent  = uniqueProf;
  document.getElementById('kpi-padre').textContent = uniquePad;
  document.getElementById('kpi-est').textContent   = uniqueEst;
  document.getElementById('resp-count').textContent = `${total} participantes registrados`;

  // Ticker
  if (rows.length > 0) {
    const last = rows[0];
    document.getElementById('ticker-track').textContent =
      `${last.rol.toUpperCase()} — ${last.pregunta.replace('_',' ').toUpperCase()}: "${last.respuesta}"`;
  }

  // Chart: roles (doughnut)
  makeChart('chart-roles', 'doughnut',
    ['Profesor', 'Padre de Familia', 'Estudiante'],
    [uniqueProf, uniquePad, uniqueEst],
    [COLORS.cyan, COLORS.blue, COLORS.purple]
  );

  // Chart: prof_1 (bar)
  const prof1opts = ['WhatsApp', 'Comunicado impreso en la pared', 'Ambos', 'No siempre me entero'];
  makeChart('chart-prof1', 'bar', prof1opts, countAnswers(profesores, 'prof_1', prof1opts),
    [COLORS.cyan, COLORS.blue, COLORS.teal, COLORS.red]);

  // Chart: prof_2 (doughnut)
  const prof2opts = ['Siempre', 'A veces', 'Puedo hacerlo directamente'];
  makeChart('chart-prof2', 'doughnut', prof2opts, countAnswers(profesores, 'prof_2', prof2opts),
    [COLORS.red, COLORS.yellow, COLORS.green]);

  // Chart: padre_1 (bar)
  const pad1opts = ['WhatsApp', 'Citación en papel', 'Me entero tarde', 'No me entero'];
  makeChart('chart-padre1', 'bar', pad1opts, countAnswers(padres, 'padre_1', pad1opts),
    [COLORS.cyan, COLORS.blue, COLORS.yellow, COLORS.red]);

  // Chart: padre_2 (doughnut)
  const pad2opts = ['Sí siempre', 'A veces', 'Casi nunca', 'Se las guarda'];
  makeChart('chart-padre2', 'doughnut', pad2opts, countAnswers(padres, 'padre_2', pad2opts),
    [COLORS.green, COLORS.yellow, COLORS.red, COLORS.purple]);

  // Chart: est_3 (doughnut)
  const est3opts = ['Sí y me ayudó', 'La conozco pero no la uso', 'No sabía que existía'];
  makeChart('chart-est3', 'doughnut', est3opts, countAnswers(estudiantes, 'est_3', est3opts),
    [COLORS.green, COLORS.yellow, COLORS.red]);
}

// ─────────────────────────────────────────────
//  CLOCK — HORA BOLIVIANA (UTC-4)
// ─────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('tv-clock');
  if (!el) return;
  const now = new Date();
  const bolivia = new Date(now.toLocaleString('en-US', { timeZone: 'America/La_Paz' }));
  const hh = String(bolivia.getHours()).padStart(2, '0');
  const mm = String(bolivia.getMinutes()).padStart(2, '0');
  const ss = String(bolivia.getSeconds()).padStart(2, '0');
  el.textContent = `${hh}:${mm}:${ss}`;
}

// ─────────────────────────────────────────────
//  REALTIME SUBSCRIPTION
// ─────────────────────────────────────────────
function subscribeRealtime() {
  db.channel('respuestas-channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'respuestas' }, () => {
      loadData();
    })
    .subscribe();
}

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
if (IS_DASHBOARD) {
  updateClock();
  setInterval(updateClock, 1000);
  loadData();
  setInterval(loadData, 30000);
  subscribeRealtime();
}
