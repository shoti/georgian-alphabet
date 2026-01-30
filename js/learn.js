/* Learn Page — learn.js */
(() => {

// Timing constants
const TIMING = {
  SLIDE_OUT: 140,
  SLIDE_RESET: 350,
  ANSWER_DELAY: 1200,
};

// State
let alphabetData = null;
let allRegularLetters = [];
let currentScript = 'asomtavruli';
let currentGroupIndex = 0;
let currentMode = 'flashcard';
let fcIndex = 0;
let groupLetters = [];

// Quiz state
let quizQuestions = [];
let quizCurrent = 0;
let quizCorrect = 0;
let quizStreak = 0;
let quizAnswered = false;

const groups = [
  { label: '1–5', start: 0, end: 5 },
  { label: '6–10', start: 5, end: 10 },
  { label: '11–15', start: 10, end: 15 },
  { label: '16–20', start: 15, end: 20 },
  { label: '21–25', start: 20, end: 25 },
  { label: '26–30', start: 25, end: 30 },
  { label: '31–33', start: 30, end: 33 },
];

// DOM references
const groupPillsEl = document.getElementById('groupPills');
const flashcardArea = document.getElementById('flashcardArea');
const quizArea = document.getElementById('quizArea');
const quizSummary = document.getElementById('quizSummary');
const flashcardWrapper = document.getElementById('flashcardWrapper');
const flashcard = document.getElementById('flashcard');
const fcLetter = document.getElementById('fcLetter');
const fcMkhedruli = document.getElementById('fcMkhedruli');
const fcName = document.getElementById('fcName');
const fcExample = document.getElementById('fcExample');
const fcMeaning = document.getElementById('fcMeaning');
const fcCounter = document.getElementById('fcCounter');
const fcDotsEl = document.getElementById('fcDots');

// Init
async function init() {
  try {
    const resp = await fetch('data/alphabet.json');
    alphabetData = await resp.json();
    allRegularLetters = alphabetData.alphabet;
    buildGroupPills();
    setupScriptButtons();
    setupModeButtons();
    setupFlashcardNav();
    setupQuizSummaryButtons();
    selectGroup(0);
  } catch (error) {
    console.error('Error loading alphabet data:', error);
  }
}

function buildGroupPills() {
  groups.forEach((g, i) => {
    const btn = document.createElement('button');
    btn.className = 'group-pill' + (i === 0 ? ' active' : '');
    btn.textContent = g.label;
    btn.addEventListener('click', () => selectGroup(i));
    groupPillsEl.appendChild(btn);
  });
}

function selectGroup(index) {
  currentGroupIndex = index;
  groupPillsEl.querySelectorAll('.group-pill').forEach((p, i) => {
    p.classList.toggle('active', i === index);
  });
  const g = groups[index];
  groupLetters = allRegularLetters.slice(g.start, g.end);
  fcIndex = 0;
  flashcard.classList.remove('flipped');
  if (currentMode === 'flashcard') {
    showFlashcard();
  } else {
    startQuiz();
  }
}

function setupScriptButtons() {
  document.querySelectorAll('.script-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentScript = btn.dataset.script;
      document.querySelectorAll('.script-btn').forEach(b => b.classList.toggle('active', b === btn));
      if (currentMode === 'flashcard') {
        showFlashcard();
      } else {
        startQuiz();
      }
    });
  });
}

function setupModeButtons() {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentMode = btn.dataset.mode;
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b === btn));
      if (currentMode === 'flashcard') {
        flashcardArea.classList.remove('hidden');
        quizArea.classList.add('hidden');
        quizSummary.classList.add('hidden');
        flashcard.classList.remove('flipped');
        fcIndex = 0;
        showFlashcard();
      } else {
        flashcardArea.classList.add('hidden');
        quizArea.classList.remove('hidden');
        quizSummary.classList.add('hidden');
        startQuiz();
      }
    });
  });
}

// Flashcard
function showFlashcard() {
  const letter = groupLetters[fcIndex];
  fcLetter.textContent = letter[currentScript];
  fcMkhedruli.textContent = letter.mkhedruli;
  fcName.textContent = letter.name;
  fcExample.textContent = letter.exampleWord + ' — ' + letter.wordMeaning;
  fcMeaning.textContent = letter.transliteration;
  fcCounter.textContent = (fcIndex + 1) + ' / ' + groupLetters.length;
  buildDots();
}

function buildDots() {
  fcDotsEl.innerHTML = '';
  groupLetters.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'fc-dot' + (i === fcIndex ? ' active' : '');
    dot.addEventListener('click', () => goToCard(i));
    fcDotsEl.appendChild(dot);
  });
}

function goToCard(index) {
  if (index === fcIndex) return;
  const dir = index > fcIndex ? 'slide-left' : 'slide-right';
  flashcard.classList.remove('flipped');
  flashcardWrapper.classList.add(dir);
  setTimeout(() => {
    fcIndex = index;
    showFlashcard();
  }, TIMING.SLIDE_OUT);
  setTimeout(() => {
    flashcardWrapper.classList.remove(dir);
  }, TIMING.SLIDE_RESET);
}

function setupFlashcardNav() {
  flashcardWrapper.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
  });

  document.getElementById('fcPrev').addEventListener('click', (e) => {
    e.stopPropagation();
    goToCard((fcIndex - 1 + groupLetters.length) % groupLetters.length);
  });

  document.getElementById('fcNext').addEventListener('click', (e) => {
    e.stopPropagation();
    goToCard((fcIndex + 1) % groupLetters.length);
  });

  document.getElementById('startQuizBtn').addEventListener('click', () => {
    currentMode = 'quiz';
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === 'quiz'));
    flashcardArea.classList.add('hidden');
    quizArea.classList.remove('hidden');
    startQuiz();
  });

  // Touch swipe
  let touchStartX = 0;
  let touchStartY = 0;

  flashcardWrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  flashcardWrapper.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        goToCard((fcIndex + 1) % groupLetters.length);
      } else {
        goToCard((fcIndex - 1 + groupLetters.length) % groupLetters.length);
      }
    }
  }, { passive: true });
}

// Keyboard
document.addEventListener('keydown', (e) => {
  if (currentMode === 'flashcard' && !flashcardArea.classList.contains('hidden')) {
    if (e.key === 'ArrowLeft') {
      goToCard((fcIndex - 1 + groupLetters.length) % groupLetters.length);
    } else if (e.key === 'ArrowRight') {
      goToCard((fcIndex + 1) % groupLetters.length);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      flashcard.classList.toggle('flipped');
    }
  }
});

// Quiz
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz() {
  quizCurrent = 0;
  quizCorrect = 0;
  quizStreak = 0;
  quizAnswered = false;
  quizSummary.classList.add('hidden');

  const shuffled = shuffle(groupLetters);
  quizQuestions = shuffled.map(letter => {
    const others = allRegularLetters.filter(l => l.mkhedruli !== letter.mkhedruli);
    const wrongPool = shuffle(others).slice(0, 3);
    const options = shuffle([
      { mkhedruli: letter.mkhedruli, correct: true },
      ...wrongPool.map(l => ({ mkhedruli: l.mkhedruli, correct: false }))
    ]);
    return { letter, options };
  });

  showQuizQuestion();
}

function showQuizQuestion() {
  const q = quizQuestions[quizCurrent];
  quizAnswered = false;

  document.getElementById('quizProgress').textContent = (quizCurrent + 1) + ' / ' + quizQuestions.length;
  document.getElementById('quizScore').innerHTML =
    'ქულა: ' + quizCorrect + ' / ' + quizCurrent +
    (quizStreak > 1 ? ' &nbsp; <span class="streak">🔥 ' + quizStreak + '</span>' : '');
  document.getElementById('quizLetter').textContent = q.letter[currentScript];

  const optionsEl = document.getElementById('quizOptions');
  optionsEl.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt.mkhedruli;
    btn.addEventListener('click', () => handleAnswer(btn, opt, q));
    optionsEl.appendChild(btn);
  });
}

function handleAnswer(btn, opt, question) {
  if (quizAnswered) return;
  quizAnswered = true;

  const allBtns = document.querySelectorAll('.quiz-option');

  if (opt.correct) {
    btn.classList.add('correct');
    quizCorrect++;
    quizStreak++;
  } else {
    btn.classList.add('wrong');
    quizStreak = 0;
    allBtns.forEach(b => {
      if (b.textContent === question.letter.mkhedruli) {
        b.classList.add('highlight');
      }
    });
  }

  allBtns.forEach(b => {
    if (!b.classList.contains('correct') && !b.classList.contains('wrong') && !b.classList.contains('highlight')) {
      b.classList.add('disabled');
    }
  });

  document.getElementById('quizScore').innerHTML =
    'ქულა: ' + quizCorrect + ' / ' + (quizCurrent + 1) +
    (quizStreak > 1 ? ' &nbsp; <span class="streak">🔥 ' + quizStreak + '</span>' : '');

  setTimeout(() => {
    quizCurrent++;
    if (quizCurrent < quizQuestions.length) {
      showQuizQuestion();
    } else {
      showSummary();
    }
  }, TIMING.ANSWER_DELAY);
}

function showSummary() {
  const total = quizQuestions.length;
  quizSummary.classList.remove('hidden');

  let stars, message;
  if (quizCorrect === total) {
    stars = '★★★';
    message = 'შესანიშნავია!';
  } else if (quizCorrect >= Math.ceil(total * 0.6)) {
    stars = '★★';
    message = 'კარგია!';
  } else {
    stars = '★';
    message = 'კიდევ სცადე!';
  }

  document.getElementById('summaryStars').textContent = stars;
  document.getElementById('summaryMessage').textContent = message;
  document.getElementById('summaryScore').textContent = quizCorrect + ' / ' + total + ' სწორი';
}

function setupQuizSummaryButtons() {
  document.getElementById('summaryRetry').addEventListener('click', () => {
    quizSummary.classList.add('hidden');
    startQuiz();
  });

  document.getElementById('summaryNext').addEventListener('click', () => {
    quizSummary.classList.add('hidden');
    const nextIndex = (currentGroupIndex + 1) % groups.length;
    selectGroup(nextIndex);
    if (currentMode !== 'quiz') {
      currentMode = 'quiz';
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === 'quiz'));
      flashcardArea.classList.add('hidden');
      quizArea.classList.remove('hidden');
    }
    startQuiz();
  });
}

init();

})();
