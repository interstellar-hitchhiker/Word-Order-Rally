(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const store = window.SSSStorage;
  const engine = window.SSSWordEngine;
  const STORAGE_PREFIX = 'wor_';

  let SENTENCE_BANK = { frameworks: {} };
  let ROUTES = { frameworks: {} };
  let toastId = null;

  const state = {
    screen: 'setup',
    mode: store.get(`${STORAGE_PREFIX}mode`, 'display'),
    framework: store.get(`${STORAGE_PREFIX}framework`, 'cefr'),
    level: store.get(`${STORAGE_PREFIX}level`, 'A1'),
    round: 1,
    current: null,
    hint: '',
    tokens: [],
    built: [],
    feedback: [],
    revealed: false,
    timerSeconds: Number(store.get(`${STORAGE_PREFIX}timerSeconds`, 25)),
    timeLeft: Number(store.get(`${STORAGE_PREFIX}timerSeconds`, 25)),
    timerRunning: false,
    timerId: null,
    correctChecks: 0,
    reveals: 0,
    streak: 0,
    recent: [],
    customSingle: false,
    sound: store.get(`${STORAGE_PREFIX}sound`, 'true') !== 'false',
    lowercase: store.get(`${STORAGE_PREFIX}lowercase`, 'true') !== 'false',
    autoStart: store.get(`${STORAGE_PREFIX}autoStart`, 'false') === 'true'
  };

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    try {
      const [bankRes, routeRes] = await Promise.all([
        fetch('assets/data/sentence-bank.json'),
        fetch('assets/data/level-routes.json')
      ]);
      if (!bankRes.ok) throw new Error(`sentence-bank.json failed: ${bankRes.status}`);
      if (!routeRes.ok) throw new Error(`level-routes.json failed: ${routeRes.status}`);
      SENTENCE_BANK = await bankRes.json();
      ROUTES = await routeRes.json();
      validateLoadedData();
      bindControls();
      loadSettings();
      ensureValidSelection();
      renderSetup();
      renderSaved();
      showSetup();
      setSoundPill();
    } catch (err) {
      console.error(err);
      toast('Could not load game data. Run the app from a local server or GitHub Pages.');
    }
  }

  function validateLoadedData() {
    Object.entries(ROUTES.frameworks || {}).forEach(([frameworkId, framework]) => {
      if (!SENTENCE_BANK.frameworks?.[frameworkId]) throw new Error(`Missing bank for ${frameworkId}`);
      framework.levels.forEach(level => {
        const items = SENTENCE_BANK.frameworks[frameworkId]?.[level.id];
        if (!Array.isArray(items) || items.length < 20) {
          throw new Error(`Missing sentence items for ${frameworkId} ${level.id}`);
        }
      });
    });
  }

  function bindControls() {
    $('startRoundBtn').addEventListener('click', () => startGeneratedRound(true));
    $('backSetupBtn').addEventListener('click', showSetup);
    $('exitDisplayBtn').addEventListener('click', showSetup);
    $('soundPill').addEventListener('click', () => setSoundEnabled(!state.sound, true));
    $('timeDownBtn').addEventListener('click', () => changeTime(-5));
    $('timeUpBtn').addEventListener('click', () => changeTime(5));
    $('timeSlider').addEventListener('input', e => setTimerSeconds(Number(e.target.value)));
    $('lowercaseToggle').addEventListener('change', e => {
      state.lowercase = e.target.checked;
      store.set(`${STORAGE_PREFIX}lowercase`, state.lowercase);
      if (state.current) renderRound();
    });
    $('autoStartToggle').addEventListener('change', e => {
      state.autoStart = e.target.checked;
      store.set(`${STORAGE_PREFIX}autoStart`, state.autoStart);
    });
    $('soundToggle').addEventListener('change', e => setSoundEnabled(e.target.checked, true));
    $('startTimerBtn').addEventListener('click', () => startTimer(true));
    $('pauseTimerBtn').addEventListener('click', () => {
      if (state.timerRunning) {
        stopTimer();
        toast('Timer paused.');
      } else {
        startTimer(false);
      }
    });
    $('checkAnswerBtn').addEventListener('click', checkBuiltAnswer);
    $('revealBtn').addEventListener('click', () => revealAnswer({ manual: true }));
    $('clearBuiltBtn').addEventListener('click', clearBuilt);
    $('nextBtn').addEventListener('click', nextRound);
    $('playCustomBtn').addEventListener('click', () => playCustomFromFields(true));
    $('saveCustomBtn').addEventListener('click', saveCustomSentence);
    $('exportCustomBtn').addEventListener('click', exportCustomSentences);
    $('importCustomInput').addEventListener('change', importCustomSentences);

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && state.screen === 'play' && state.mode === 'display') {
        event.preventDefault();
        showSetup();
        return;
      }
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (event.key === ' ') {
        event.preventDefault();
        state.timerRunning ? stopTimer() : startTimer(false);
      }
      if (event.key.toLowerCase() === 'r') revealAnswer({ manual: true });
      if (event.key.toLowerCase() === 'n') nextRound();
      if (event.key.toLowerCase() === 'c' && state.mode === 'solo') checkBuiltAnswer();
    });
  }

  function loadSettings() {
    $('timeSlider').value = state.timerSeconds;
    $('soundToggle').checked = state.sound;
    $('lowercaseToggle').checked = state.lowercase;
    $('autoStartToggle').checked = state.autoStart;
    updateTimerSetting();
  }

  function ensureValidSelection() {
    if (state.framework === 'custom') {
      state.level = 'teacher-bank';
      return;
    }
    if (!ROUTES.frameworks[state.framework]) state.framework = 'cefr';
    const levels = ROUTES.frameworks[state.framework]?.levels || [];
    if (!levels.some(level => level.id === state.level)) {
      state.level = levels[0]?.id || 'A1';
    }
  }

  function renderSetup() {
    renderModes();
    renderFrameworks();
    renderLevels();
    updateSelectionSummary();
  }

  function renderModes() {
    document.querySelectorAll('[data-mode]').forEach(button => {
      const active = button.dataset.mode === state.mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
      button.onclick = () => {
        state.mode = button.dataset.mode;
        store.set(`${STORAGE_PREFIX}mode`, state.mode);
        renderSetup();
      };
    });
  }

  function renderFrameworks() {
    const list = $('frameworkList');
    list.innerHTML = '';
    Object.entries(ROUTES.frameworks || {}).forEach(([id, framework]) => {
      list.appendChild(routeButton({
        id,
        label: framework.label,
        detail: framework.short,
        active: state.framework === id,
        onClick: () => selectFramework(id)
      }));
    });
    const savedCount = getSaved().length;
    list.appendChild(routeButton({
      id: 'custom',
      label: 'Teacher Bank',
      detail: savedCount ? `${savedCount} local sentence${savedCount === 1 ? '' : 's'}` : 'Use the sentence box',
      active: state.framework === 'custom',
      onClick: () => selectFramework('custom')
    }));
  }

  function routeButton({ id, label, detail, active, onClick }) {
    const button = document.createElement('button');
    button.className = `route-card${active ? ' active' : ''}`;
    button.type = 'button';
    button.dataset.id = id;
    button.innerHTML = `<strong>${engine.escapeHtml(label)}</strong><span>${engine.escapeHtml(detail)}</span>`;
    button.setAttribute('aria-pressed', String(active));
    button.addEventListener('click', onClick);
    return button;
  }

  function renderLevels() {
    const list = $('levelList');
    list.innerHTML = '';
    getLevelsForCurrentFramework().forEach(level => {
      const button = document.createElement('button');
      const active = level.id === state.level;
      button.className = `level-card${active ? ' active' : ''}`;
      button.type = 'button';
      button.innerHTML = `<strong>${engine.escapeHtml(level.label)}</strong><span>${engine.escapeHtml(level.focus || level.summary || '')}</span>`;
      button.setAttribute('aria-pressed', String(active));
      button.addEventListener('click', () => selectLevel(level.id));
      list.appendChild(button);
    });
  }

  function getLevelsForCurrentFramework() {
    if (state.framework === 'custom') {
      const saved = getSaved();
      return [{
        id: 'teacher-bank',
        label: 'Teacher bank',
        focus: saved.length ? `${saved.length} saved local sentence${saved.length === 1 ? '' : 's'}` : 'Play the sentence in the teacher bank box'
      }];
    }
    return ROUTES.frameworks[state.framework]?.levels || [];
  }

  function selectFramework(id) {
    state.framework = id;
    if (id === 'custom') {
      state.level = 'teacher-bank';
    } else {
      const preferred = ROUTES.frameworks[id]?.defaultLevel || ROUTES.frameworks[id]?.levels?.[0]?.id;
      state.level = preferred || state.level;
    }
    store.set(`${STORAGE_PREFIX}framework`, state.framework);
    store.set(`${STORAGE_PREFIX}level`, state.level);
    renderSetup();
  }

  function selectLevel(id) {
    state.level = id;
    store.set(`${STORAGE_PREFIX}level`, state.level);
    renderSetup();
  }

  function updateSelectionSummary() {
    const modeLabel = state.mode === 'display' ? 'Class Display' : 'Solo Practice';
    const route = getRouteLabel();
    const detail = getLevelMeta()?.summary || getLevelMeta()?.focus || 'Teacher-created sentence route.';
    $('selectionTitle').textContent = `${modeLabel} - ${route}`;
    $('selectionDetails').textContent = state.mode === 'display'
      ? `${detail} Timer ends by revealing the answer automatically.`
      : `${detail} Check marks each placed word red or green and reveals the answer.`;
  }

  function getRouteLabel() {
    if (state.framework === 'custom') return 'Teacher Bank';
    const framework = ROUTES.frameworks[state.framework];
    const level = getLevelMeta();
    return `${framework?.label || 'Route'} ${level?.label || state.level}`;
  }

  function getLevelMeta() {
    if (state.framework === 'custom') return getLevelsForCurrentFramework()[0];
    return ROUTES.frameworks[state.framework]?.levels?.find(level => level.id === state.level);
  }

  function startGeneratedRound(resetRound) {
    if (resetRound) resetStats();
    state.customSingle = false;
    const sentence = sampleSentence();
    if (!sentence) return;
    loadRound(sentence);
    showPlay();
  }

  function sampleSentence() {
    if (state.framework === 'custom') {
      const saved = getSaved();
      if (saved.length) return cleanSentence(engine.rand(saved), 'custom', 'teacher-bank');
      return readCustomFields();
    }
    const pool = SENTENCE_BANK.frameworks?.[state.framework]?.[state.level] || [];
    if (!pool.length) {
      toast('No sentences found for that route.');
      return null;
    }
    let sentence = null;
    let guard = 0;
    do {
      sentence = engine.rand(pool);
      guard += 1;
    } while (sentence && state.recent.includes(sentence.text) && guard < 50);
    rememberSentence(sentence.text);
    return cleanSentence(sentence, state.framework, state.level);
  }

  function cleanSentence(item, framework, level) {
    return {
      id: item.id || `${framework}-${level}-${Date.now()}`,
      text: String(item.text || '').trim().replace(/\s+/g, ' '),
      grammar: item.grammar || 'Word order',
      note: item.note || 'Ask students to explain why the words belong in this order.',
      tags: Array.isArray(item.tags) ? item.tags : [],
      framework,
      level
    };
  }

  function readCustomFields() {
    const text = $('customSentence').value.trim().replace(/\s+/g, ' ');
    if (!text || engine.splitSentence(text).length < 3) {
      toast('Add a teacher sentence with at least three words.');
      $('customSentence').focus();
      return null;
    }
    return cleanSentence({
      text,
      grammar: $('customGrammar').value.trim() || 'Teacher-created sentence',
      note: $('customNote').value.trim() || 'Ask students to justify the word order.'
    }, 'custom', 'teacher-bank');
  }

  function playCustomFromFields(resetRound) {
    const sentence = readCustomFields();
    if (!sentence) return;
    if (resetRound) resetStats();
    state.framework = 'custom';
    state.level = 'teacher-bank';
    state.customSingle = true;
    renderSetup();
    loadRound(sentence);
    showPlay();
  }

  function loadRound(sentence) {
    stopTimer();
    state.current = sentence;
    state.revealed = false;
    state.timeLeft = state.timerSeconds;
    state.tokens = engine.makeTokens(sentence.text);
    state.built = [];
    state.feedback = [];
    state.hint = pickHint(sentence);
    clearFeedbackMessage();
    renderRound();
    updateStats();
    updateTimerDisplay();
    if (state.autoStart) setTimeout(() => startTimer(true), 260);
  }

  function renderRound() {
    if (!state.current) return;
    $('modePill').textContent = state.mode === 'display' ? 'Class Display' : 'Solo Practice';
    $('routePill').textContent = getRouteLabelForSentence(state.current);
    $('roundMeta').textContent = `Round ${state.round}`;
    $('roundTitle').textContent = state.mode === 'display' ? 'Solve it before the reveal.' : 'Build the sentence.';
    $('roundInstruction').textContent = state.mode === 'display'
      ? 'Teams write the sentence. When time ends, the answer appears underneath.'
      : 'Tap words into the tray, then check for red and green position feedback.';
    $('promptHint').textContent = state.hint || pickHint(state.current);
    $('wordCount').textContent = `${state.tokens.length} words`;

    const chips = $('scrambledChips');
    chips.innerHTML = '';
    state.tokens.forEach(token => {
      const el = document.createElement(state.mode === 'solo' ? 'button' : 'span');
      el.className = `chip${token.used ? ' used' : ''}`;
      el.textContent = displayWord(token.word);
      if (state.mode === 'solo') {
        el.type = 'button';
        el.addEventListener('click', () => useToken(token.id));
      }
      chips.appendChild(el);
    });

    renderBuiltAnswer();
    renderReveal();
    renderFeedback();
  }

  function getRouteLabelForSentence(sentence) {
    if (sentence.framework === 'custom') return 'Teacher Bank';
    const framework = ROUTES.frameworks[sentence.framework];
    const level = framework?.levels?.find(item => item.id === sentence.level);
    return `${framework?.label || sentence.framework} ${level?.label || sentence.level}`;
  }

  function pickHint(sentence) {
    if (!sentence || sentence.framework === 'custom') return 'Look for the main verb group.';
    const level = ROUTES.frameworks[sentence.framework]?.levels?.find(item => item.id === sentence.level);
    const hints = level?.hints || ['Find the subject first.', 'Look for the main verb.'];
    return engine.rand(hints);
  }

  function displayWord(word) {
    return state.lowercase ? word.toLocaleLowerCase() : word;
  }

  function useToken(id) {
    const token = state.tokens.find(item => item.id === id);
    if (!token || token.used) return;
    token.used = true;
    state.built.push(token);
    state.feedback = [];
    clearFeedbackMessage();
    beep('tap');
    renderRound();
  }

  function renderBuiltAnswer() {
    const line = $('answerLine');
    line.innerHTML = '';
    if (!state.built.length) {
      line.innerHTML = '<span class="empty-text">Tap words above to build the sentence here.</span>';
    } else {
      state.built.forEach((token, index) => {
        const button = document.createElement('button');
        const mark = state.feedback[index] ? ` ${state.feedback[index]}-place` : '';
        button.className = `chip answer${mark}`;
        button.type = 'button';
        button.textContent = displayWord(token.word);
        button.title = 'Tap to remove this word';
        button.addEventListener('click', () => removeBuiltToken(index));
        line.appendChild(button);
      });
    }
    $('trayCount').textContent = `${state.built.length} word${state.built.length === 1 ? '' : 's'}`;
  }

  function removeBuiltToken(index) {
    const [token] = state.built.splice(index, 1);
    if (token) token.used = false;
    state.feedback = [];
    clearFeedbackMessage();
    beep('tap');
    renderRound();
  }

  function clearBuilt() {
    state.tokens.forEach(token => { token.used = false; });
    state.built = [];
    state.feedback = [];
    clearFeedbackMessage();
    renderRound();
    toast('Answer tray cleared.');
  }

  function checkBuiltAnswer() {
    if (!state.current || state.mode !== 'solo') return;
    if (!state.built.length) {
      toast('Tap words into the answer tray first.');
      return;
    }
    const builtText = state.built.map(token => token.word).join(' ');
    const exact = engine.normaliseLoose(builtText) === engine.normaliseLoose(state.current.text);
    state.feedback = state.built.map((token, index) => token.index === index ? 'correct' : 'wrong');
    stopTimer();
    if (exact) {
      state.correctChecks += 1;
      state.streak += 1;
      setFeedbackMessage('All words are in the right order. The answer is revealed below.', 'good');
      beep('win');
      $('playScreen').classList.add('win-flash');
      setTimeout(() => $('playScreen').classList.remove('win-flash'), 600);
    } else {
      const wrong = state.feedback.filter(mark => mark === 'wrong').length;
      const missing = Math.max(0, state.tokens.length - state.built.length);
      state.streak = 0;
      setFeedbackMessage(`${wrong} word${wrong === 1 ? '' : 's'} in the wrong place${missing ? `, ${missing} missing` : ''}. Red words need moving; green words are already placed well.`, 'warn');
      beep('wrong');
    }
    revealAnswer({ fromCheck: true });
    renderRound();
    updateStats();
  }

  function revealAnswer(options = {}) {
    if (!state.current) return;
    stopTimer();
    if (!state.revealed) {
      state.reveals += 1;
      state.revealed = true;
    }
    renderReveal();
    updateStats();
    if (options.fromCheck) return;
    beep(options.fromTimer ? 'end' : 'reveal');
    if (options.fromTimer) toast('Time is up. Answer revealed.');
  }

  function renderReveal() {
    $('correctAnswer').textContent = state.current?.text || '';
    $('grammarFocus').textContent = state.current?.grammar || '';
    $('teacherNote').textContent = state.current?.note || '';
    $('revealBox').classList.toggle('show', Boolean(state.revealed));
  }

  function setFeedbackMessage(message, tone) {
    const box = $('feedbackSummary');
    box.textContent = message;
    box.dataset.tone = tone;
    box.classList.add('show');
  }

  function clearFeedbackMessage() {
    const box = $('feedbackSummary');
    box.textContent = '';
    box.classList.remove('show');
    delete box.dataset.tone;
  }

  function renderFeedback() {
    const box = $('feedbackSummary');
    if (!box.textContent) box.classList.remove('show');
  }

  function nextRound() {
    state.round += 1;
    if (state.customSingle) playCustomFromFields(false);
    else startGeneratedRound(false);
  }

  function resetStats() {
    state.round = 1;
    state.correctChecks = 0;
    state.reveals = 0;
    state.streak = 0;
  }

  function showSetup() {
    stopTimer();
    state.screen = 'setup';
    document.body.classList.remove('class-display', 'solo-mode');
    $('setupScreen').classList.add('active');
    $('playScreen').classList.remove('active');
    $('exitDisplayBtn').hidden = true;
    renderSetup();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showPlay() {
    state.screen = 'play';
    $('setupScreen').classList.remove('active');
    $('playScreen').classList.add('active');
    document.body.classList.toggle('class-display', state.mode === 'display');
    document.body.classList.toggle('solo-mode', state.mode === 'solo');
    $('exitDisplayBtn').hidden = state.mode !== 'display';
    renderRound();
    updateTimerDisplay();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startTimer(reset = true) {
    if (!state.current) return;
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = null;
    if (reset || state.timeLeft <= 0) state.timeLeft = state.timerSeconds;
    state.timerRunning = true;
    $('pauseTimerBtn').textContent = 'Pause';
    $('startTimerBtn').textContent = 'Restart timer';
    beep(reset ? 'start' : 'resume');
    updateTimerDisplay();
    state.timerId = setInterval(() => {
      state.timeLeft -= 1;
      updateTimerDisplay();
      if (state.timeLeft === 10) beep('warning');
      if (state.timeLeft <= 5 && state.timeLeft > 0) beep('tick');
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        stopTimer();
        updateTimerDisplay();
        if (state.mode === 'display') {
          revealAnswer({ fromTimer: true });
        } else {
          beep('end');
          toast('Time is up. Check or reveal when ready.');
        }
      }
    }, 1000);
  }

  function stopTimer() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = null;
    state.timerRunning = false;
    if ($('pauseTimerBtn')) $('pauseTimerBtn').textContent = 'Resume';
    if ($('startTimerBtn')) $('startTimerBtn').textContent = 'Start timer';
  }

  function updateTimerDisplay() {
    const left = Math.max(0, state.timeLeft);
    $('timerNumber').textContent = left;
    $('timerLabel').textContent = state.timerRunning ? (left <= 5 ? 'last five' : 'running') : left <= 0 ? 'time up' : 'seconds';
    const angle = state.timerSeconds === 0 ? 0 : Math.max(0, Math.min(360, 360 * (left / state.timerSeconds)));
    document.documentElement.style.setProperty('--timerAngle', `${angle}deg`);
    const ring = $('timerRing');
    ring.classList.toggle('caution', state.timerRunning && left <= 10 && left > 5);
    ring.classList.toggle('danger', state.timerRunning && left <= 5 && left > 0);
    if (!state.timerRunning || left <= 0) ring.classList.remove('caution', 'danger');
  }

  function changeTime(delta) {
    setTimerSeconds(engine.clamp(state.timerSeconds + delta, 10, 90));
  }

  function setTimerSeconds(value) {
    state.timerSeconds = engine.clamp(value, 10, 90);
    store.set(`${STORAGE_PREFIX}timerSeconds`, state.timerSeconds);
    if (!state.timerRunning) state.timeLeft = state.timerSeconds;
    updateTimerSetting();
    updateTimerDisplay();
  }

  function updateTimerSetting() {
    $('timeSlider').value = state.timerSeconds;
    $('timeSettingLabel').textContent = `${state.timerSeconds} seconds`;
    if (!state.timerRunning) state.timeLeft = state.timerSeconds;
  }

  function updateStats() {
    $('roundStat').textContent = state.round;
    $('correctStat').textContent = state.correctChecks;
    $('revealStat').textContent = state.reveals;
    $('streakStat').textContent = state.streak;
  }

  function getSaved() {
    return store.jsonGet(`${STORAGE_PREFIX}savedSentences`, []);
  }

  function renderSaved() {
    const list = $('savedList');
    const saved = getSaved();
    list.innerHTML = '';
    if (!saved.length) {
      list.innerHTML = '<p class="mini-copy">No saved sentences yet.</p>';
      return;
    }
    saved.slice(0, 80).forEach(item => {
      const button = document.createElement('button');
      button.className = 'saved-item';
      button.type = 'button';
      button.innerHTML = `<strong>${engine.escapeHtml(item.text)}</strong>${item.grammar ? `<span>${engine.escapeHtml(item.grammar)}</span>` : ''}`;
      button.addEventListener('click', () => {
        $('customSentence').value = item.text;
        $('customGrammar').value = item.grammar || '';
        $('customNote').value = item.note || '';
        state.framework = 'custom';
        state.level = 'teacher-bank';
        renderSetup();
        toast('Saved sentence loaded.');
      });
      list.appendChild(button);
    });
  }

  function saveCustomSentence() {
    const sentence = readCustomFields();
    if (!sentence) return;
    const saved = getSaved();
    const normal = engine.normaliseStrict(sentence.text);
    const withoutDuplicate = saved.filter(item => engine.normaliseStrict(item.text) !== normal);
    withoutDuplicate.unshift({
      id: `custom-${Date.now()}`,
      text: sentence.text,
      grammar: sentence.grammar,
      note: sentence.note,
      tags: ['custom'],
      savedAt: Date.now()
    });
    store.jsonSet(`${STORAGE_PREFIX}savedSentences`, withoutDuplicate.slice(0, 200));
    state.framework = 'custom';
    state.level = 'teacher-bank';
    renderSaved();
    renderSetup();
    toast('Sentence saved to the local teacher bank.');
  }

  function exportCustomSentences() {
    const data = JSON.stringify({
      app: 'Word Order Rally',
      exportedAt: new Date().toISOString(),
      sentences: getSaved()
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'word-order-rally-teacher-bank.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast('Teacher bank exported.');
  }

  function importCustomSentences(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const incoming = Array.isArray(parsed) ? parsed : parsed.sentences;
        if (!Array.isArray(incoming)) throw new Error('Invalid JSON');
        const clean = incoming
          .filter(item => item && typeof item.text === 'string' && engine.splitSentence(item.text).length >= 3)
          .map(item => ({
            id: item.id || `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            text: item.text.trim().replace(/\s+/g, ' '),
            grammar: item.grammar || item.focus || 'Teacher-created sentence',
            note: item.note || 'Ask students to justify the word order.',
            tags: Array.isArray(item.tags) ? item.tags : ['custom'],
            savedAt: item.savedAt || Date.now()
          }));
        const merged = [...clean, ...getSaved()];
        const seen = new Set();
        const unique = [];
        merged.forEach(item => {
          const key = engine.normaliseStrict(item.text);
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(item);
          }
        });
        store.jsonSet(`${STORAGE_PREFIX}savedSentences`, unique.slice(0, 200));
        state.framework = 'custom';
        state.level = 'teacher-bank';
        renderSaved();
        renderSetup();
        toast(`Imported ${clean.length} sentence${clean.length === 1 ? '' : 's'}.`);
      } catch (err) {
        console.error(err);
        toast('Could not import that JSON file.');
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  }

  function rememberSentence(text) {
    state.recent.unshift(text);
    state.recent = state.recent.slice(0, 35);
  }

  function setSoundEnabled(enabled, audition = false) {
    state.sound = Boolean(enabled);
    store.set(`${STORAGE_PREFIX}sound`, state.sound);
    $('soundToggle').checked = state.sound;
    setSoundPill();
    if (state.sound && audition) beep('win');
    toast(state.sound ? 'Sound effects on.' : 'Sound effects off.');
  }

  function setSoundPill() {
    const pill = $('soundPill');
    pill.textContent = state.sound ? 'Sound on' : 'Sound off';
    pill.setAttribute('aria-pressed', String(state.sound));
    pill.classList.toggle('muted', !state.sound);
  }

  function beep(type) {
    if (window.SSSSound && window.SSSSound.beep) window.SSSSound.beep(type, state.sound);
  }

  function toast(message) {
    const el = $('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastId);
    toastId = setTimeout(() => el.classList.remove('show'), 2200);
  }
}());
