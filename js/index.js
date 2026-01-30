/* Main Page — index.js */
(() => {

// Timing constants
const TIMING = {
  LOADER_DURATION: 3200,
  CARD_REVEAL_BASE: 3000,
  CARD_STAGGER: 50,
  STAGE_EXIT: 400,
  STAGE_SETTLE: 900,
  AUTOPLAY_INTERVAL: 2000,
  TOOLTIP_LINGER: 1500,
  LONG_PRESS: 300,
  ILLUSTRATION_DELAY: 100,
  LOADER_STEP: 600,
  LOADER_FADE: 300,
  LOADER_FINAL_PAUSE: 500,
};

// State
let alphabetData = null;
let allLetters = [];
let currentLetterData = null;
let currentStage = 0;
let autoPlayInterval = null;
let isAnimating = false;
let currentScript = 'asomtavruli';

// Card → letter data mapping
const cardData = new WeakMap();

// DOM references
const loadingScreen = document.getElementById('loadingScreen');
const letterGrid = document.getElementById('letterGrid');
const obsoleteGrid = document.getElementById('obsoleteGrid');
const obsoleteSection = document.getElementById('obsoleteSection');
const converterInput = document.getElementById('converterInput');
const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalNumber = document.getElementById('modalNumber');
const modalTitle = document.getElementById('modalTitle');
const obsoleteBadge = document.getElementById('obsoleteBadge');
const mainLetter = document.getElementById('mainLetter');
const letterParticles = document.getElementById('letterParticles');
const timelineProgress = document.getElementById('timelineProgress');
const stages = document.querySelectorAll('.timeline-stage');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const vowelLetters = new Set(['ა', 'ე', 'ი', 'ო', 'უ', 'ჱ', 'ჳ', 'ჵ']);

// Background particles
function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.width = (1 + Math.random() * 2) + 'px';
    particle.style.height = particle.style.width;
    particle.style.animationDuration = (15 + Math.random() * 20) + 's';
    particle.style.animationDelay = Math.random() * 20 + 's';
    container.appendChild(particle);
  }
}

// Load alphabet data
async function loadAlphabetData() {
  try {
    const response = await fetch('data/alphabet.json');
    alphabetData = await response.json();

    alphabetData.alphabet.forEach(letter => {
      letter.word = convertWord(letter.exampleWord);
      letter.obsolete = false;
      allLetters.push(letter);
    });

    alphabetData.obsoleteLetters.forEach(letter => {
      letter.word = {
        mkhedruli: letter.mkhedruli,
        asomtavruli: letter.asomtavruli,
        nuskhuri: letter.nuskhuri
      };
      allLetters.push(letter);
    });

    createLetterCards();
    setupConverter();
  } catch (error) {
    console.error('Error loading alphabet data:', error);
  }
}

// Create all letter cards
function createLetterCards() {
  alphabetData.alphabet.forEach((letter, index) => {
    const card = createCard(letter, false);
    letterGrid.appendChild(card);
    setTimeout(() => card.classList.add('revealed'), TIMING.CARD_REVEAL_BASE + index * TIMING.CARD_STAGGER);
  });

  if (alphabetData.obsoleteLetters.length > 0) {
    obsoleteSection.style.display = 'block';
    alphabetData.obsoleteLetters.forEach((letter, index) => {
      const card = createCard(letter, true);
      obsoleteGrid.appendChild(card);
      setTimeout(() => card.classList.add('revealed'), TIMING.CARD_REVEAL_BASE + (33 + index) * TIMING.CARD_STAGGER);
    });
  }
}

// Create a single card element
function createCard(letter, isGhost) {
  const card = document.createElement('div');
  const isVowel = vowelLetters.has(letter.mkhedruli);
  card.className = 'letter-card' + (isGhost ? ' ghost' : '') + (isVowel ? ' vowel' : '');
  cardData.set(card, letter);
  const displayLetter = letter[currentScript] || letter.mkhedruli;
  card.innerHTML = `
    <span class="card-number">${String(letter.number).padStart(2, '0')}</span>
    <span class="card-letter">${displayLetter}</span>
    <span class="card-name">${letter.name}</span>
    <div class="card-tooltip">
      <div class="tooltip-row">
        <span class="tooltip-label">ასო</span>
        <span class="tooltip-script">${letter.asomtavruli}</span>
      </div>
      <div class="tooltip-row">
        <span class="tooltip-label">ნუს</span>
        <span class="tooltip-script">${letter.nuskhuri}</span>
      </div>
      <div class="tooltip-row">
        <span class="tooltip-label">მხე</span>
        <span class="tooltip-script">${letter.mkhedruli}</span>
      </div>
    </div>
  `;

  // Touch: long press shows tooltip, tap opens modal
  let touchTimer = null;
  let touchStartY = 0;
  let touchMoved = false;

  card.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    touchMoved = false;
    touchTimer = setTimeout(() => {
      card.classList.add('touch-active');
      touchTimer = null;
    }, TIMING.LONG_PRESS);
  }, { passive: true });

  card.addEventListener('touchmove', (e) => {
    if (Math.abs(e.touches[0].clientY - touchStartY) > 10) {
      touchMoved = true;
      if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; }
      card.classList.remove('touch-active');
    }
  }, { passive: true });

  card.addEventListener('touchend', () => {
    if (touchMoved) return;
    if (touchTimer) {
      clearTimeout(touchTimer);
      touchTimer = null;
      openModal(letter);
    } else {
      setTimeout(() => card.classList.remove('touch-active'), TIMING.TOOLTIP_LINGER);
    }
  });

  card.addEventListener('click', () => {
    if (!('ontouchstart' in window)) openModal(letter);
  });

  return card;
}

// Text converter setup
function setupConverter() {
  const outputBlocks = document.querySelectorAll('.converter-output-block');
  converterInput.addEventListener('input', () => {
    const text = converterInput.value;
    const converted = convertWord(text);
    document.getElementById('outputAsomtavruli').textContent = converted.asomtavruli;
    document.getElementById('outputNuskhuri').textContent = converted.nuskhuri;
    document.getElementById('outputNumerical').textContent = calculateNumericalValue(text, alphabetData);
    outputBlocks.forEach(block => {
      block.classList.toggle('has-content', text.length > 0);
    });
  });
}

// Particle burst on letter change
function createParticleBurst() {
  letterParticles.innerHTML = '';
  const centerX = letterParticles.offsetWidth / 2;
  const centerY = letterParticles.offsetHeight / 2;

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'letter-particle';

    const angle = (i / 20) * Math.PI * 2 + Math.random() * 0.5;
    const distance = 60 + Math.random() * 80;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';
    particle.style.setProperty('--tx', tx + 'px');
    particle.style.setProperty('--ty', ty + 'px');
    particle.style.animation = `particleBurst 0.6s ease-out ${Math.random() * 0.1}s forwards`;

    letterParticles.appendChild(particle);
  }
}

// Modal
function openModal(letter) {
  currentLetterData = letter;
  currentStage = 0;

  modalNumber.textContent = String(letter.number).padStart(2, '0');
  modalTitle.textContent = letter.name;

  document.getElementById('modalNumerical').textContent =
    letter.numericalValue ? 'რიცხვითი მნიშვნელობა: ' + letter.numericalValue.toLocaleString() : '';

  if (letter.obsolete) {
    modal.classList.add('ghost-modal');
    obsoleteBadge.style.display = 'inline-block';
  } else {
    modal.classList.remove('ghost-modal');
    obsoleteBadge.style.display = 'none';
  }

  document.getElementById('stage0Letter').textContent = letter.word.asomtavruli;
  document.getElementById('stage1Letter').textContent = letter.word.nuskhuri;
  document.getElementById('stage2Letter').textContent = letter.word.mkhedruli;

  updateStage(0, false);

  hideAllIllustrations();
  showIllustration(letter.exampleWord);

  modal.classList.add('active');
  modalOverlay.classList.add('active');
}

function closeModal() {
  modal.classList.remove('active');
  modalOverlay.classList.remove('active');
  stopAutoPlay();
  hideAllIllustrations();
}

function showIllustration(word) {
  const el = document.getElementById('illust-' + word);
  if (!el) return;
  setTimeout(() => {
    el.classList.add('active');
    el.classList.add('animate');
  }, TIMING.ILLUSTRATION_DELAY);
}

function hideAllIllustrations() {
  document.querySelectorAll('.word-illustration').forEach(ill => {
    ill.classList.remove('active', 'animate');
  });
}

// Timeline stage
function updateStage(stageIndex, animate = true) {
  if (isAnimating && animate) return;

  const wordForms = [
    currentLetterData.word.asomtavruli,
    currentLetterData.word.nuskhuri,
    currentLetterData.word.mkhedruli
  ];

  currentStage = stageIndex;

  stages.forEach((stage, i) => {
    stage.classList.toggle('active', i === stageIndex);
  });

  if (stageIndex === 0) {
    timelineProgress.style.width = '0%';
  } else if (stageIndex === 1) {
    timelineProgress.style.width = 'calc(50% - 80px)';
  } else {
    timelineProgress.style.width = 'calc(100% - 160px)';
  }

  if (animate) {
    isAnimating = true;
    createParticleBurst();

    mainLetter.classList.remove('enter');
    mainLetter.classList.add('exit');

    setTimeout(() => {
      mainLetter.textContent = wordForms[stageIndex];
      mainLetter.classList.remove('exit');
      mainLetter.classList.add('enter');
    }, TIMING.STAGE_EXIT);

    setTimeout(() => {
      isAnimating = false;
    }, TIMING.STAGE_SETTLE);
  } else {
    mainLetter.textContent = wordForms[stageIndex];
    mainLetter.classList.remove('exit', 'enter');
  }
}

// Auto-play
function startAutoPlay() {
  stopAutoPlay();
  autoPlayInterval = setInterval(() => {
    updateStage((currentStage + 1) % 3, true);
  }, TIMING.AUTOPLAY_INTERVAL);
}

function stopAutoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
}

// Event listeners
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

stages.forEach((stage, index) => {
  stage.addEventListener('click', () => {
    stopAutoPlay();
    updateStage(index, true);
  });
});

prevBtn.addEventListener('click', () => {
  stopAutoPlay();
  updateStage((currentStage - 1 + 3) % 3, true);
});

nextBtn.addEventListener('click', () => {
  stopAutoPlay();
  updateStage((currentStage + 1) % 3, true);
});

// Script switching
document.querySelectorAll('.era-item').forEach(item => {
  item.addEventListener('click', () => {
    const script = item.dataset.script;
    currentScript = script;

    document.querySelectorAll('.era-item').forEach(el => el.classList.remove('active'));
    item.classList.add('active');

    document.querySelectorAll('.letter-card').forEach(card => {
      const letterEl = card.querySelector('.card-letter');
      const letter = cardData.get(card);
      if (letter) {
        letterEl.textContent = letter[script];
      }
    });
  });
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!modal.classList.contains('active')) return;

  if (e.key === 'Escape') {
    closeModal();
  } else if (e.key === 'ArrowLeft') {
    stopAutoPlay();
    updateStage((currentStage - 1 + 3) % 3, true);
  } else if (e.key === 'ArrowRight') {
    stopAutoPlay();
    updateStage((currentStage + 1) % 3, true);
  } else if (e.key === ' ') {
    e.preventDefault();
    autoPlayInterval ? stopAutoPlay() : startAutoPlay();
  }
});

// Loading animation
function animateLoader() {
  const loadingText = document.querySelector('.loading-text');
  const loadingBar = document.querySelector('.loading-bar');
  const scripts = ['ႠႬႡႠႬႨ', 'ⴀⴌⴁⴀⴌⴈ', 'ანბანი'];
  let index = 0;
  let stopped = false;

  function showNext() {
    if (stopped) return;
    loadingText.classList.remove('visible');
    setTimeout(() => {
      if (stopped) return;
      loadingText.textContent = scripts[index];
      loadingText.classList.add('visible');
      index++;
      if (index < scripts.length) {
        setTimeout(showNext, TIMING.LOADER_STEP);
      } else {
        setTimeout(() => {
          loadingText.classList.remove('visible');
          loadingBar.style.opacity = '0';
          loadingBar.style.transition = 'opacity 0.4s ease';
        }, TIMING.LOADER_FINAL_PAUSE);
      }
    }, TIMING.LOADER_FADE);
  }

  showNext();
  return function stop() { stopped = true; };
}

// Initialize
window.addEventListener('load', () => {
  createParticles();
  loadAlphabetData();
  const stopLoader = animateLoader();

  setTimeout(() => {
    stopLoader();
    document.querySelector('.loading-text').classList.remove('visible');
    document.querySelector('.loading-bar').style.opacity = '0';
    loadingScreen.classList.add('hidden');
  }, TIMING.LOADER_DURATION);
});

})();
