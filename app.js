/* =========================================================
 * 5학년 · What's your favorite subject? · 듣고 따라 말하기 웹 앱
 * - 음성 출력: Web Speech API (SpeechSynthesis)
 * - 단어 클릭: 단어 발음 + 뜻 풍선(popup)
 * - 좋아하는 과목(10과목 × 3단계) · 잘하는 것(10개) 카드 — 그림은 Canva 생성
 * - 대화 완성: What's your favorite subject? → My favorite subject is ___. I'm good at ___.
 * - 나와 친구 카드 3장 + 줄마다 말하기 · 역할극(A/B) 채점
 * - 따라 말하기 채점: Web Speech API (SpeechRecognition)
 * ========================================================= */

/* ---------- 음성 합성 (TTS) ---------- */
const synth = window.speechSynthesis;
let enVoice = null;
let speakRate = 0.85;

function pickVoice() {
  const voices = synth.getVoices();
  enVoice =
    voices.find(v => /en[-_]US/i.test(v.lang)) ||
    voices.find(v => /^en/i.test(v.lang)) ||
    null;
  const status = document.querySelector(".toolbar #voice-status");
  if (status) {
    status.textContent = enVoice ? `음성: ${enVoice.name}` : "영어 음성을 찾는 중...";
  }
}
pickVoice();
if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = pickVoice;

function speak(text, rate, onStart, onEnd) {
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate || speakRate;
  u.pitch = 1.05;
  if (enVoice) u.voice = enVoice;
  if (onStart) u.onstart = onStart;
  if (onEnd) u.onend = onEnd;
  synth.speak(u);
}

/* ---------- 단어 뜻 풍선(popup) ---------- */
const popup = document.createElement("div");
popup.className = "word-popup hidden";
popup.innerHTML = `
  <div class="wp-word"></div>
  <div class="wp-meaning"></div>
  <button class="wp-listen">단어 다시 듣기</button>`;
document.body.appendChild(popup);

popup.querySelector(".wp-listen").addEventListener("click", e => {
  e.stopPropagation();
  if (popup.dataset.word) speak(popup.dataset.word, 0.8);
});

function showWordPopup(wordEl, rawWord) {
  const key = wordKey(rawWord);
  const plain = rawWord.replace(/[.,!?]+$/, "");
  const meaning = WORD_MEANINGS[key] || WORD_MEANINGS[plain] || "(뜻 정보 없음)";
  popup.dataset.word = key || rawWord;
  popup.querySelector(".wp-word").textContent = rawWord.replace(/[.,!?]+$/, "");
  popup.querySelector(".wp-meaning").textContent = meaning;

  popup.classList.remove("hidden");
  const r = wordEl.getBoundingClientRect();
  const pw = popup.offsetWidth;
  let left = r.left + r.width / 2 - pw / 2 + window.scrollX;
  left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
  let top = r.bottom + 8 + window.scrollY;
  popup.style.left = left + "px";
  popup.style.top = top + "px";

  speak(key || rawWord, 0.8);
}

function hidePopup() { popup.classList.add("hidden"); }
document.addEventListener("click", e => {
  if (!popup.contains(e.target) && !e.target.classList.contains("word")) hidePopup();
});

/* ---------- 클릭 가능한 단어로 문장 만들기 ---------- */
function buildWords(sentence) {
  const frag = document.createDocumentFragment();
  sentence.split(/\s+/).forEach((w, i) => {
    if (i > 0) frag.appendChild(document.createTextNode(" "));
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = w;
    span.addEventListener("click", e => {
      e.stopPropagation();
      showWordPopup(span, w);
    });
    frag.appendChild(span);
  });
  return frag;
}

/* ---------- 카드 만들기 (Canva 그림 · 없으면 이모지) ---------- */
function makeCard(item, opts) {
  opts = opts || {};
  const div = document.createElement("div");
  div.className = "card" + (opts.tone != null ? " tone-" + opts.tone : "");

  function speakSentence() {
    speak(item.en, null,
      () => div.classList.add("speaking"),
      () => div.classList.remove("speaking"));
  }

  // 윗줄: 태그 + 듣기
  const top = document.createElement("div");
  top.className = "card-top";
  const tag = document.createElement("span");
  tag.className = "card-tag";
  if (opts.index != null) tag.textContent = "CARD " + opts.index;
  const listenAll = document.createElement("button");
  listenAll.className = "listen-all";
  listenAll.textContent = "듣기 ▶";
  listenAll.addEventListener("click", e => { e.stopPropagation(); speakSentence(); });
  top.append(tag, listenAll);

  // Canva 그림 (불러오지 못하면 이모지 타일)
  let visual;
  if (item.img) {
    visual = document.createElement("img");
    visual.className = "photo";
    visual.loading = "lazy";
    visual.alt = item.en;
    visual.src = item.img;
    visual.addEventListener("error", () => {
      const em = document.createElement("div");
      em.className = "emoji";
      em.textContent = item.emoji;
      visual.replaceWith(em);
    });
  } else {
    visual = document.createElement("div");
    visual.className = "emoji";
    visual.textContent = item.emoji;
  }

  // 안쪽 문장 박스: 문장 + 한글 + 스피커
  const box = document.createElement("div");
  box.className = "sentence-box";
  const txt = document.createElement("div");
  txt.className = "sentence-text";
  const en = document.createElement("div");
  en.className = "en";
  en.appendChild(buildWords(item.en));
  const ko = document.createElement("div");
  ko.className = "ko";
  ko.textContent = item.ko;
  txt.append(en, ko);
  const speakBtn = document.createElement("button");
  speakBtn.className = "speak-btn";
  speakBtn.setAttribute("aria-label", "문장 듣기");
  speakBtn.textContent = "🔊";
  speakBtn.addEventListener("click", e => { e.stopPropagation(); speakSentence(); });
  box.append(txt, speakBtn);

  div.append(top, visual, box);
  return div;
}

function renderGrid(id, list, opts) {
  opts = opts || {};
  const grid = document.getElementById(id);
  grid.innerHTML = "";
  list.forEach((item, i) => {
    const cardOpts = {};
    if (opts.tones) { cardOpts.tone = i % 6; if (!opts.noIndex) cardOpts.index = i + 1; }
    grid.appendChild(makeCard(item, cardOpts));
  });
}

/* ---------- 문장 만들기 도우미 ---------- */
const subjectLine = s => `My favorite subject is ${s.en}.`;
const subjectKo   = s => `내가 가장 좋아하는 과목은 ${s.koIs}.`;
const skillLine   = k => `I'm good at ${k.en}.`;
const findSubject = en => SUBJECTS.find(x => x.en === en) || null;
const findSkill   = en => SKILLS.find(x => x.en === en) || null;
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* ===========================================================
 * 📚 좋아하는 과목 (질문 + 난이도 × 과목 종류)
 * =========================================================== */
document.getElementById("question-line").appendChild(buildWords(QUESTION.en));
document.getElementById("question-speak").addEventListener("click", () => speak(QUESTION.en));

let currentLevel = "beginner";
let currentCategory = "all";

function renderSubjects() {
  const view = SUBJECT_LEVELS[currentLevel].filter(item => currentCategory === "all" || item.cat === currentCategory);
  renderGrid("subject-grid", view, { tones: true });
}

document.querySelectorAll(".level-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentLevel = btn.dataset.level;
    synth.cancel(); hidePopup(); renderSubjects();
  });
});
document.querySelectorAll("#subject-cat-switch .cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#subject-cat-switch .cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.cat;
    synth.cancel(); hidePopup(); renderSubjects();
  });
});

/* ===========================================================
 * 💪 잘하는 것 (I'm good at ~.)
 * =========================================================== */
function makeChip(text, cls, isOn, onClick) {
  const c = document.createElement("button");
  c.className = "chip " + cls + (isOn ? " on" : "");
  c.textContent = text;
  c.addEventListener("click", onClick);
  return c;
}
function setBlank(id, en) {
  const el = document.getElementById(id);
  el.classList.toggle("filled", !!en);
  if (en) { el.innerHTML = ""; el.appendChild(buildWords(en)); }
  else el.textContent = "________";
}

let lastFillSpoken = "";
function fillActions(wrap, en) {
  wrap.innerHTML = "";
  if (!en) return;
  const listenBtn = document.createElement("button");
  listenBtn.className = "btn primary";
  listenBtn.textContent = "🔊 문장 듣기";
  listenBtn.addEventListener("click", () => speak(en));
  wrap.append(listenBtn);
  if (en !== lastFillSpoken) { lastFillSpoken = en; speak(en); }
}

function renderSkills() {
  renderGrid("skill-grid", SKILLS.map(k => ({ en: skillLine(k), ko: k.koSent, emoji: k.emoji, img: k.img })), { tones: true });
}

let fillSkill = null;
function renderGoodFill() {
  const row = document.getElementById("good-chips");
  row.innerHTML = "";
  SKILLS.forEach(k => {
    row.appendChild(makeChip(`${k.emoji} ${k.en}`, "where", fillSkill === k, () => { fillSkill = k; renderGoodFill(); }));
  });
  setBlank("good-blank", fillSkill && fillSkill.en);
  document.getElementById("good-ko").textContent = fillSkill ? fillSkill.koSent : "나는 ________을(를) 잘해.";
  fillActions(document.getElementById("good-actions"), fillSkill && skillLine(fillSkill));
}

/* ===========================================================
 * 💬 대화 완성 (과목 + 잘하는 것)
 * =========================================================== */
let talkSubject = null, talkSkill = null;
function renderTalkFill() {
  const sRow = document.getElementById("talk-subject-chips");
  const kRow = document.getElementById("talk-skill-chips");
  sRow.innerHTML = ""; kRow.innerHTML = "";
  SUBJECTS.forEach(s => {
    sRow.appendChild(makeChip(`${s.emoji} ${s.en}`, "act", talkSubject === s, () => { talkSubject = s; renderTalkFill(); }));
  });
  SKILLS.forEach(k => {
    kRow.appendChild(makeChip(`${k.emoji} ${k.en}`, "where", talkSkill === k, () => { talkSkill = k; renderTalkFill(); }));
  });
  setBlank("talk-subject-blank", talkSubject && talkSubject.en);
  setBlank("talk-skill-blank", talkSkill && talkSkill.en);
  document.getElementById("talk-ko").textContent =
    `${talkSubject ? subjectKo(talkSubject) : "내가 가장 좋아하는 과목은 ________."} ${talkSkill ? talkSkill.koSent : "나는 ________을(를) 잘해."}`;
  fillActions(document.getElementById("talk-actions"),
    talkSubject && talkSkill && `${QUESTION.en} ${subjectLine(talkSubject)} ${skillLine(talkSkill)}`);
}

/* ===========================================================
 * 🎒 나와 친구 카드 (3장: 나 · 친구 1 · 친구 2) — 과목 1 + 잘하는 것 1
 * =========================================================== */
const SET_COUNT = 3;
const SET_LABELS = ["🙋 나", "👦 친구 1", "👧 친구 2"];
let mySets = [];        // [{ subject, skill }] (영어 en 으로 저장)
let curSet = 0;
let stats = {};         // 문장별 정확도 기록

try {
  const saved = JSON.parse(localStorage.getItem("favsubject_sets") || "null");
  if (saved && Array.isArray(saved.sets)) mySets = saved.sets;
} catch (e) {}
while (mySets.length < SET_COUNT) mySets.push({ subject: null, skill: null });
try { stats = JSON.parse(localStorage.getItem("favsubject_stats") || "{}") || {}; } catch (e) {}

function persist() {
  try {
    localStorage.setItem("favsubject_sets", JSON.stringify({ sets: mySets }));
    localStorage.setItem("favsubject_stats", JSON.stringify(stats));
  } catch (e) {}
}
function setComplete(s) { return !!(findSubject(s.subject) && findSkill(s.skill)); }
function completeCount() { return mySets.filter(setComplete).length; }

/* 카드 → 대화 줄 */
function setLines(s) {
  const sb = findSubject(s.subject), sk = findSkill(s.skill);
  return [
    { who: "A", en: QUESTION.en, ko: QUESTION.ko },
    { who: "B", en: subjectLine(sb), ko: subjectKo(sb) },
    { who: "B", en: skillLine(sk), ko: sk.koSent },
  ];
}

function updateSetBadge() {
  const c = document.getElementById("set-count");
  if (c) c.textContent = `${completeCount()}/${SET_COUNT}`;
  document.querySelectorAll("#set-tabs .set-tab").forEach((b, i) => {
    b.classList.toggle("active", i === curSet);
    b.classList.toggle("done", setComplete(mySets[i]));
    const sb = findSubject(mySets[i].subject);
    b.textContent = `${SET_LABELS[i]} ${sb ? sb.emoji : ""}${setComplete(mySets[i]) ? " ✓" : ""}`;
  });
}

function renderBuilder() {
  const s = mySets[curSet];
  const subWrap = document.getElementById("build-subjects");
  const skillRow = document.getElementById("build-skills");
  subWrap.innerHTML = ""; skillRow.innerHTML = "";

  SUBJECT_CATS.forEach(cat => {
    const title = document.createElement("div");
    title.className = "chip-group-title";
    title.textContent = cat.label;
    const row = document.createElement("div");
    row.className = "chip-row wrap";
    SUBJECTS.filter(a => a.cat === cat.key).forEach(a => {
      row.appendChild(makeChip(`${a.emoji} ${a.en}`, "act", s.subject === a.en, () => {
        s.subject = a.en; persist(); renderBuilder(); updateSetPreview(true);
      }));
    });
    subWrap.append(title, row);
  });
  SKILLS.forEach(k => {
    skillRow.appendChild(makeChip(`${k.emoji} ${k.en}`, "where", s.skill === k.en, () => {
      s.skill = k.en; persist(); renderBuilder(); updateSetPreview(true);
    }));
  });
  updateSetBadge();
}

let lastSetSpoken = "";
function updateSetPreview(autoSpeak) {
  const s = mySets[curSet];
  const sb = findSubject(s.subject), sk = findSkill(s.skill);
  const isMe = curSet === 0;
  document.getElementById("set-who-a").textContent = isMe ? "👂 친구" : "🙋 나";
  document.getElementById("set-who-b").textContent = isMe ? "🙋 나" : SET_LABELS[curSet];
  document.getElementById("set-who-b2").textContent = isMe ? "🙋 나" : SET_LABELS[curSet];

  setBlank("set-subject", sb && sb.en);
  setBlank("set-skill", sk && sk.en);
  document.getElementById("set-subject-ko").textContent = sb ? subjectKo(sb) : "내가 가장 좋아하는 과목은 ________.";
  document.getElementById("set-skill-ko").textContent = sk ? sk.koSent : "나는 ________을(를) 잘해.";

  const status = document.getElementById("set-status");
  const complete = setComplete(s);
  const who = isMe ? "내가" : "친구가";
  status.className = "dlg-status" + (complete ? " ok" : "");
  if (!sb) status.textContent = `${SET_LABELS[curSet]} · 1️⃣ ${who} 가장 좋아하는 과목을 골라 보세요 👇`;
  else if (!sk) status.textContent = `${SET_LABELS[curSet]} · 2️⃣ ${who} 잘하는 것을 골라 보세요 👇`;
  else status.textContent = `✅ ${SET_LABELS[curSet]} 카드 완성! ${completeCount() < SET_COUNT ? "다음 카드도 만들어 보세요." : "세 카드 모두 완성! 📝 활동지에 적고 🎤 연습으로 가요."}`;
  renderSheetSummary();
  const listen = document.getElementById("set-listen");
  listen.disabled = !complete;
  updateSetBadge();
  // 자동 읽기는 사용자가 칩을 눌러 고른 직후에만
  if (complete && autoSpeak) {
    const en = setLines(s).map(l => l.en).join(" ");
    if (en !== lastSetSpoken) { lastSetSpoken = en; speak(en); }
  } else if (!complete) lastSetSpoken = "";
}

document.querySelectorAll("#set-tabs .set-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    curSet = +btn.dataset.set; synth.cancel(); lastSetSpoken = "";
    renderBuilder(); updateSetPreview();
  });
});
document.getElementById("set-speak-q").addEventListener("click", () => speak(QUESTION.en));
document.getElementById("set-speak-subject").addEventListener("click", () => {
  const sb = findSubject(mySets[curSet].subject); if (sb) speak(subjectLine(sb));
});
document.getElementById("set-speak-skill").addEventListener("click", () => {
  const sk = findSkill(mySets[curSet].skill); if (sk) speak(skillLine(sk));
});
document.getElementById("set-listen").addEventListener("click", () => {
  const s = mySets[curSet];
  if (setComplete(s)) speak(setLines(s).map(l => l.en).join(" "));
});
document.getElementById("set-random").addEventListener("click", () => {
  const s = mySets[curSet];
  s.subject = pick(SUBJECTS).en;
  s.skill = pick(SKILLS).en;
  persist(); renderBuilder(); updateSetPreview(true);
});
document.getElementById("set-clear").addEventListener("click", () => {
  mySets[curSet] = { subject: null, skill: null };
  synth.cancel(); persist(); renderBuilder(); updateSetPreview();
});


/* ---- 음성 인식 (정확도 측정) ---- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const srSupported = !!SR;
let rec = srSupported ? new SR() : null;
if (rec) { rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 5; }
let recBusy = false;

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z\s']/g, "").replace(/\s+/g, " ").trim();
}
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
function wordsClose(a, b) {
  if (a === b) return true;
  if (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a))) return true;
  return Math.abs(a.length - b.length) <= 1 && levenshtein(a, b) <= 1;
}
const STOPWORDS = new Set(["a", "an", "the", "to", "of", "on", "in", "at", "for", "but", "i", "i'm", "is", "my"]);
function scoreMatch(target, heard) {
  const t = normalize(target).split(" ").filter(Boolean);
  const h = normalize(heard).split(" ").filter(Boolean);
  let content = t.filter(w => !STOPWORDS.has(w));
  if (!content.length) content = t;
  let hit = 0;
  content.forEach(w => { if (h.some(x => wordsClose(x, w))) hit++; });
  let score = hit / content.length;
  if (score >= 0.5) score = Math.min(1, score + 0.12);
  return score;
}
function practiceAttempt(target, cb) {
  if (!rec || recBusy) { cb.onend && cb.onend(); return; }
  recBusy = true;
  let score = 0, heard = "", errCode = null;
  rec.onresult = e => {
    const alts = e.results[0];
    for (let i = 0; i < alts.length; i++) {
      const s = scoreMatch(target, alts[i].transcript);
      if (s > score) { score = s; heard = alts[i].transcript; }
    }
  };
  rec.onerror = ev => { errCode = ev.error; };
  rec.onend = () => {
    recBusy = false;
    if (errCode && score === 0) cb.onerror && cb.onerror(errCode);
    else cb.onresult && cb.onresult(Math.round(score * 100), heard);
    cb.onend && cb.onend();
  };
  try { rec.start(); } catch (e) { recBusy = false; cb.onend && cb.onend(); }
}

/* ---- 말한 뒤 콜백 (음성이 없어도 넘어가도록 안전장치) ---- */
function speakThen(text, cb) {
  let done = false;
  const finish = () => { if (!done) { done = true; cb(); } };
  const timer = setTimeout(finish, Math.min(9000, 1500 + text.length * 90));
  speak(text, null, null, () => { clearTimeout(timer); finish(); });
}

function statsText(en, last) {
  const s = stats[en] || { attempts: 0, best: 0 };
  return `정확도 <b class="acc">${last != null ? last + "%" : "--"}</b>` +
    ` · 최고 <b class="best">${s.best ? s.best + "%" : "--"}</b>` +
    ` · <b>${s.attempts}</b>회`;
}
function recordScore(en, score) {
  const s = stats[en] || { attempts: 0, best: 0 };
  s.attempts++; s.best = Math.max(s.best, score); stats[en] = s; persist();
}
function feedbackHtml(score, heard) {
  const h = `<span class="heard">내 발음: ${heard || "(못 들었어요)"}</span>`;
  if (score >= 75) return ["good", `⭐ 훌륭해요! ${score}% ${h}`];
  if (score >= 45) return ["good", `👍 좋아요! 한 번 더! ${score}% ${h}`];
  return ["bad", `🔁 다시 또박또박! ${score}% ${h}`];
}

/* 한 문장 연습 줄: [🔊] 문장/뜻 [🎙️ 말하기] 점수 → 피드백 */
function makeSpeakRow(en, ko, who) {
  const row = document.createElement("div");
  row.className = "prow" + (who ? " who-" + who.toLowerCase() : "");

  const speakBtn = document.createElement("button");
  speakBtn.className = "speak-btn small";
  speakBtn.setAttribute("aria-label", "듣기");
  speakBtn.textContent = "🔊";
  speakBtn.addEventListener("click", () => speak(en));

  const txt = document.createElement("div");
  txt.className = "prow-text";
  if (who) { const w = document.createElement("span"); w.className = "prow-who"; w.textContent = who; txt.appendChild(w); }
  const enEl = document.createElement("div"); enEl.className = "en"; enEl.appendChild(buildWords(en));
  const koEl = document.createElement("div"); koEl.className = "ko"; koEl.textContent = ko;
  txt.append(enEl, koEl);

  const mic = document.createElement("button");
  mic.className = "mic-btn";
  mic.innerHTML = '<span class="mic-ico">🎙️</span><span class="mic-txt">말하기</span>';
  const score = document.createElement("div");
  score.className = "pstats";
  score.innerHTML = statsText(en, null);
  const fb = document.createElement("div");
  fb.className = "mic-feedback";

  if (!srSupported) { mic.disabled = true; mic.title = "이 브라우저는 음성 인식을 지원하지 않아요 (Chrome 권장)"; }

  function attempt(after) {
    if (recBusy || !srSupported) { after && after(); return; }
    mic.classList.add("recording");
    row.classList.add("active");
    fb.className = "mic-feedback"; fb.textContent = "🔴 듣고 있어요... 또박또박 말해보세요!";
    practiceAttempt(en, {
      onresult: (s, heard) => {
        recordScore(en, s);
        score.innerHTML = statsText(en, s);
        const [cls, html] = feedbackHtml(s, heard);
        fb.className = "mic-feedback " + cls; fb.innerHTML = html;
      },
      onerror: err => {
        fb.className = "mic-feedback bad";
        fb.textContent = err === "not-allowed" ? "마이크 권한을 허용해 주세요." : "다시 시도해 주세요.";
      },
      onend: () => { mic.classList.remove("recording"); row.classList.remove("active"); after && after(); }
    });
  }
  mic.addEventListener("click", () => attempt());

  const main = document.createElement("div");
  main.className = "prow-main";
  main.append(speakBtn, txt, mic, score);
  row.append(main, fb);
  row._attempt = attempt;
  row._who = who;
  row._en = en;
  return row;
}


/* ===========================================================
 * 📝 활동지에 적기
 * =========================================================== */
function sheetRow(label, en, ko) {
  const row = document.createElement("div");
  row.className = "sheet-row" + (en ? "" : " empty");
  const lab = document.createElement("div"); lab.className = "sheet-label"; lab.textContent = label;
  const val = document.createElement("div"); val.className = "sheet-val";
  if (en) {
    const e = document.createElement("div"); e.className = "en"; e.appendChild(buildWords(en));
    const k = document.createElement("div"); k.className = "ko"; k.textContent = ko;
    val.append(e, k);
  } else val.textContent = "아직 고르지 않았어요";
  const btn = document.createElement("button");
  btn.className = "speak-btn small"; btn.textContent = "🔊"; btn.disabled = !en;
  btn.addEventListener("click", () => en && speak(en));
  row.append(lab, val, btn);
  return row;
}
function renderSheetSummary() {
  const box = document.getElementById("sheet-summary");
  if (!box) return;
  box.innerHTML = "";
  box.appendChild(sheetRow("묻기", QUESTION.en, QUESTION.ko));
  mySets.forEach((s, i) => {
    const sb = findSubject(s.subject), sk = findSkill(s.skill);
    box.appendChild(sheetRow(`${SET_LABELS[i]} · 좋아하는 과목`, sb && subjectLine(sb), sb && subjectKo(sb)));
    box.appendChild(sheetRow(`${SET_LABELS[i]} · 잘하는 것`, sk && skillLine(sk), sk && sk.koSent));
  });
}

/* ===========================================================
 * 👫 짝 활동 카드
 * =========================================================== */
function renderPairCards() {
  const box = document.getElementById("pair-cards");
  box.innerHTML = "";
  const done = mySets.map((s, i) => [s, i]).filter(([s]) => setComplete(s));
  if (!done.length) {
    const p = document.createElement("p"); p.className = "practice-empty";
    p.innerHTML = "아직 만든 카드가 없어요! <b>🎒 나와 친구 카드</b>에서 먼저 만들어요.";
    box.appendChild(p); return;
  }
  done.forEach(([s, i]) => {
    const sb = findSubject(s.subject), sk = findSkill(s.skill);
    const isMe = i === 0;
    const card = document.createElement("div");
    card.className = "pair-card tone-" + (i % 6);
    const head = document.createElement("div"); head.className = "pair-head";
    head.innerHTML = `<span class="card-tag tag-combo">${SET_LABELS[i]}</span><span class="pair-emoji">${sb.emoji}${sk.emoji}</span>`;
    const q = document.createElement("div"); q.className = "pair-line me";
    q.innerHTML = `<div class="pair-who">${isMe ? "👂 친구가 물어요" : "🙋 내가 물어요"}</div>`;
    const qe = document.createElement("div"); qe.className = "pair-en"; qe.appendChild(buildWords(QUESTION.en));
    q.appendChild(qe);
    const ans = document.createElement("div"); ans.className = "pair-line friend";
    ans.innerHTML = `<div class="pair-who">${isMe ? "🙋 내가 대답해요" : `${SET_LABELS[i]}의 대답`}</div>`;
    const a1 = document.createElement("div"); a1.className = "pair-en"; a1.appendChild(buildWords(subjectLine(sb)));
    const a2 = document.createElement("div"); a2.className = "pair-en"; a2.appendChild(buildWords(skillLine(sk)));
    ans.append(a1, a2);
    const tools = document.createElement("div"); tools.className = "ptools";
    const b1 = document.createElement("button"); b1.className = "btn small primary"; b1.textContent = "🔊 질문 듣기";
    b1.addEventListener("click", () => speak(QUESTION.en));
    const b2 = document.createElement("button"); b2.className = "btn small"; b2.textContent = "🔊 대답 듣기";
    b2.addEventListener("click", () => speak(`${subjectLine(sb)} ${skillLine(sk)}`));
    tools.append(b1, b2);
    card.append(head, q, ans, tools);
    box.appendChild(card);
  });
  const note = document.createElement("p"); note.className = "hint pair-note";
  note.innerHTML = `💬 대답할 때는 과목 이름을 또박또박! 친구 대답이 내 카드와 같으면 <b>Me, too!</b> 라고 말해 봐요.`;
  box.appendChild(note);
}

/* ===========================================================
 * 🎤 컴퓨터와 미리 연습하기 (카드별 대화: 줄마다 말하기 + 역할극)
 * =========================================================== */
function makeSetCard(s, idx) {
  const card = document.createElement("div");
  card.className = "pcard pcard-dialog";
  const sb = findSubject(s.subject), sk = findSkill(s.skill);

  const top = document.createElement("div");
  top.className = "card-top";
  const left = document.createElement("div"); left.className = "ptag-left";
  const tag = document.createElement("span"); tag.className = "card-tag tag-combo"; tag.textContent = `🎒 ${SET_LABELS[idx]}`;
  const title = document.createElement("span"); title.className = "pset-title"; title.textContent = `${sb.emoji} ${sb.en} · ${sk.emoji} ${sk.en}`;
  left.append(tag, title);
  top.append(left);
  card.appendChild(top);

  const body = document.createElement("div");
  const tools = document.createElement("div"); tools.className = "ptools";
  const roleNote = document.createElement("div"); roleNote.className = "role-note";
  card.append(body, tools, roleNote);

  const rows = setLines(s).map(l => makeSpeakRow(l.en, l.ko, l.who));
  rows.forEach(r => body.appendChild(r));
  let playing = false;

  const allBtn = document.createElement("button");
  allBtn.className = "btn small"; allBtn.textContent = "🔊 전체 듣기";
  allBtn.addEventListener("click", () => speak(rows.map(r => r._en).join(" ")));
  const roleA = document.createElement("button");
  roleA.className = "btn small primary"; roleA.textContent = "🎭 내가 A (묻기)";
  const roleB = document.createElement("button");
  roleB.className = "btn small primary"; roleB.textContent = "🎭 내가 B (대답하기)";
  roleA.addEventListener("click", () => rolePlay("A", [roleA, roleB]));
  roleB.addEventListener("click", () => rolePlay("B", [roleA, roleB]));
  tools.append(allBtn, roleA, roleB);

  function rolePlay(me, btns) {
    if (playing || recBusy) return;
    if (!srSupported) { roleNote.textContent = "이 브라우저는 음성 인식을 지원하지 않아요 (Chrome 권장)"; return; }
    playing = true; btns.forEach(b => b.disabled = true);
    let i = 0;
    const step = () => {
      rows.forEach(r => r.classList.remove("turn"));
      if (i >= rows.length) {
        playing = false; btns.forEach(b => b.disabled = false);
        roleNote.textContent = "🎉 역할극 끝! 잘했어요. 역할을 바꿔서도 해 볼까요?";
        return;
      }
      const r = rows[i]; i++;
      r.classList.add("turn");
      if (r._who === me) {
        roleNote.textContent = `🎙️ 내 차례! "${r._en}" 라고 말해 보세요.`;
        r._attempt(() => setTimeout(step, 500));
      } else {
        roleNote.textContent = `👂 컴퓨터(${r._who})가 말해요. 잘 들어 보세요.`;
        speakThen(r._en, () => setTimeout(step, 400));
      }
    };
    step();
  }
  return card;
}

function renderPractice() {
  renderPairCards();
  const empty = document.getElementById("practice-empty");
  const list = document.getElementById("practice-list");
  list.innerHTML = "";
  const done = mySets.map((s, i) => [s, i]).filter(([s]) => setComplete(s));
  if (!done.length) { empty.style.display = "block"; return; }
  empty.style.display = "none";
  done.forEach(([s, i]) => list.appendChild(makeSetCard(s, i)));
  if (done.length < SET_COUNT) {
    const note = document.createElement("p");
    note.className = "practice-empty";
    note.innerHTML = `아직 <b>${SET_COUNT - done.length}장</b>의 카드가 비어 있어요. <b>🎒 나와 친구 카드</b>에서 마저 만들어 보세요.`;
    list.appendChild(note);
  }
}

/* ---------- 초기 렌더 ---------- */
renderSubjects();
renderSkills();
renderGoodFill();
renderTalkFill();
renderBuilder();
updateSetPreview();

/* ---------- 탭 전환 ---------- */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    synth.cancel();
    hidePopup();
    if (btn.dataset.tab === "practice") renderPractice();
    if (btn.dataset.tab === "build") { lastSetSpoken = ""; renderBuilder(); updateSetPreview(); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

/* ---------- 속도 조절 ---------- */
document.getElementById("rate").addEventListener("input", e => {
  speakRate = parseFloat(e.target.value);
});
