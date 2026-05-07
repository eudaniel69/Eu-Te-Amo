/* ─── data ─── */
const MSGS = [
  { e:'💖', t:'Você é o meu lugar favorito no mundo inteiro.' },
  { e:'🌹', t:'Sorrir perto de você é a coisa mais fácil que já fiz.' },
  { e:'✨', t:'Cada dia ao seu lado é meu dia favorito.' },
  { e:'🦋', t:'Você faz meu coração acelerar do jeito mais gostoso.' },
  { e:'🌙', t:'Eu penso em você nos momentos mais inesperados.' },
  { e:'💫', t:'Eu te escolho todos os dias, de novo e de novo.' },
];

const CHALLENGES = [
  '🎬  Maratona de filmes no sofá com muita pipoca — você escolhe!',
  '🍕  Peçam comida juntos e assistam algo especial esta semana!',
  '📸  Tirem uma foto fofa juntos hoje mesmo!',
  '💆  Massagem de 10 minutos — você escolhe quem recebe primeiro!',
  '🌅  Combinem um passeio surpresa no próximo fim de semana!',
  '💌  Mandem uma mensagem super carinhosa um pro outro agora!',
  '🍦  Sorvete juntos hoje — você escolhe o sabor!',
  '🎮  Uma partida do jogo favorito de cada um, juntos!',
];

const WHEEL_COLORS = [
  '#F4A7B9',
  '#FDEEF3',
  '#D45F7A',
  '#F9D0DC',
  '#C9A050',
  '#FAE8EF',
  '#E88CA4',
  '#FBC4D2'
];

const WHEEL_TEXT_COLORS = [
  '#6A1530',
  '#8A3050',
  '#FFFFFF',
  '#7A2540',
  '#4A2800',
  '#8A3050',
  '#5A1020',
  '#7A2540'
];

let playerName = 'Amor';
let flipped = 0;
let wAngle = 0;
let spinning = false;

/* ─── hearts ─── */
function makeHearts() {
  const c = document.getElementById('hearts-bg');
  const glyphs = ['♥','❤','♡','💕','✿'];

  for (let i = 0; i < 18; i++) {
    const h = document.createElement('span');

    h.className = 'fheart';
    h.textContent = glyphs[Math.floor(Math.random()*glyphs.length)];

    const sz = 12 + Math.random()*16;

    h.style.cssText = `
      left:${Math.random()*100}%;
      font-size:${sz}px;
      color:${Math.random()>.5?'#F4A7B9':'#D45F7A'};
      opacity:${.25+Math.random()*.35};
      animation-duration:${7+Math.random()*9}s;
      animation-delay:${Math.random()*10}s;
    `;

    c.appendChild(h);
  }
}

/* ─── navigation ─── */
function show(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
  });

  document.getElementById(id).classList.add('active');
}

/* ─── screen 1 → 2 ─── */
function startGame() {
  const v = document.getElementById('pname').value.trim();

  if (v) playerName = v;

  flipped = 0;

  const grid = document.getElementById('cgrid');
  grid.innerHTML = '';

  MSGS.forEach((m) => {
    const d = document.createElement('div');

    d.className = 'flip-card';

    d.innerHTML = `
      <div class="flip-inner">
        <div class="flip-front">${m.e}</div>

        <div class="flip-back">
          <span class="back-emoji">${m.e}</span>
          ${m.t}
        </div>
      </div>
    `;

    d.addEventListener('click', () => {
      if (d.classList.contains('flipped')) return;

      d.classList.add('flipped');

      flipped++;

      if (flipped === MSGS.length) {
        document.getElementById('cards-hint').style.display = 'none';

        setTimeout(() => {
          document.getElementById('btn-to-wheel').style.display = 'inline-block';
        }, 700);
      }
    });

    grid.appendChild(d);
  });

  show('s-cards');
}

/* ─── screen 2 → 3 ─── */
function goToWheel() {
  wAngle = 0;
  spinning = false;

  document.getElementById('wresult').style.display = 'none';
  document.getElementById('btn-to-end').style.display = 'none';
  document.getElementById('spin-btn').style.display = 'inline-block';

  drawWheel(0);

  show('s-wheel');
}

/* ─── wheel drawing ─── */
function drawWheel(angle) {
  const canvas = document.getElementById('wcanvas');
  const ctx = canvas.getContext('2d');

  const cx = 135;
  const cy = 135;
  const r = 126;

  const N = CHALLENGES.length;
  const arc = (2 * Math.PI) / N;

  ctx.clearRect(0, 0, 270, 270);

  for (let i = 0; i < N; i++) {
    const a0 = angle + i * arc;
    const a1 = a0 + arc;

    // slice
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a0, a1);
    ctx.closePath();

    ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
    ctx.fill();

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // emoji label
    ctx.save();

    ctx.translate(cx, cy);
    ctx.rotate(a0 + arc / 2);

    ctx.textAlign = 'center';
    ctx.font = 'bold 19px serif';

    ctx.shadowColor = 'rgba(0,0,0,.18)';
    ctx.shadowBlur = 3;

    ctx.fillStyle = WHEEL_TEXT_COLORS[i % WHEEL_TEXT_COLORS.length];

    ctx.fillText(
      CHALLENGES[i].split('\u2009')[0].trim(),
      r * .62,
      6
    );

    ctx.shadowBlur = 0;

    ctx.restore();
  }

  // outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, r + 1, 0, 2 * Math.PI);

  ctx.strokeStyle = 'rgba(212,95,122,.35)';
  ctx.lineWidth = 3;

  ctx.stroke();
}

function spinWheel() {
  if (spinning) return;

  spinning = true;

  document.getElementById('spin-btn').disabled = true;

  const extra = (Math.random()*4+5) * 2*Math.PI;
  const dur = 3200;

  const t0 = performance.now();
  const a0 = wAngle;

  function step(now) {
    const p = Math.min((now - t0) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);

    wAngle = a0 + extra * e;

    drawWheel(wAngle);

    if (p < 1) {
      requestAnimationFrame(step);
      return;
    }

    spinning = false;

    const N = CHALLENGES.length;
    const arc = (2 * Math.PI) / N;

    const norm = ((-(wAngle) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    const idx = Math.floor(norm / arc) % N;

    const rb = document.getElementById('wresult');

    document.getElementById('wresult-text').innerHTML =
      `<span style="font-size:1.5rem">
        ${CHALLENGES[idx].split('\u2009')[0].trim()}
      </span><br><br>${CHALLENGES[idx].trim()}`;

    rb.style.display = 'block';

    document.getElementById('spin-btn').style.display = 'none';
    document.getElementById('btn-to-end').style.display = 'inline-block';
  }

  requestAnimationFrame(step);
}

/* ─── screen 3 → 4 ─── */
function goToEnd() {
  document.getElementById('end-title').textContent =
    `${playerName}, você arrasou! 💕`;

  document.getElementById('end-msg').innerHTML =
    `Obrigado por jogar comigo, ${playerName}. 💌<br><br>
     Cada segundo ao seu lado é um presente que eu não canso de agradecer.<br><br>
     Você é minha calma, minha alegria e a minha pessoa favorita em qualquer versão do universo.<br><br>
     Espero que esse joguinho tenha te feito sorrir — porque nada me deixa mais feliz do que o seu sorriso. 🌹`;

  launchConfetti();

  show('s-end');
}

function launchConfetti() {
  const colors = [
    '#F4A7B9',
    '#D45F7A',
    '#C9A050',
    '#FDEEF3',
    '#B04060'
  ];

  for (let i = 0; i < 40; i++) {
    const c = document.createElement('div');

    c.className = 'confetti-piece';

    c.style.cssText = `
      left:${10 + Math.random()*80}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-delay:${Math.random()*1}s;
      animation-duration:${1.5 + Math.random()*1.5}s;
      transform:rotate(${Math.random()*360}deg);
    `;

    document.body.appendChild(c);

    setTimeout(() => c.remove(), 3500);
  }
}

/* ─── restart ─── */
function restart() {
  document.getElementById('pname').value = '';

  playerName = 'Amor';
  wAngle = 0;

  show('s-welcome');
}

makeHearts();