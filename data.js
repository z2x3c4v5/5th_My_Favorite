/* =========================================================
 * 5학년 · What's your favorite subject? 데이터
 * - 주요 표현
 *   · What's your favorite subject?
 *   · My favorite subject is ______.
 *   · I'm good at ______.
 * - 과목 10개 : Korean · English · math · science · social studies ·
 *               history · music · art · P.E. · practical arts
 *   카테고리 : study(📘 공부 과목 6) / arts(🎨 예체능·실과 4)
 * - 과목 대답 문장 : 초급 / 중급 / 고급 각 10개 (총 30문장)
 * - 잘하는 것 10개 : singing · dancing · drawing · swimming · running ·
 *               cooking · reading books · playing soccer ·
 *               playing the piano · making things
 * - 그림 : Canva 에서 생성한 그림 (images/*.png)
 * - 내 카드(나 · 친구 1 · 친구 2) 는 app.js 에서 localStorage 에 저장
 * ========================================================= */

/* ===== 주요 질문 ===== */
const QUESTION = { en: "What's your favorite subject?", ko: "네가 가장 좋아하는 과목은 뭐니?" };

/* ===== 과목 10개 (인덱스 순서가 문장 목록과 같음) =====
 * ko    : 과목 이름
 * koIs  : "내가 가장 좋아하는 과목은 ___" 뒤에 붙는 말 (이야/야)
 */
const SUBJECTS = [
  { en: "Korean",          ko: "국어",   koIs: "국어야",   emoji: "📖", cat: "study", img: "images/korean.png" },
  { en: "English",         ko: "영어",   koIs: "영어야",   emoji: "🔤", cat: "study", img: "images/english.png" },
  { en: "math",            ko: "수학",   koIs: "수학이야", emoji: "➗", cat: "study", img: "images/math.png" },
  { en: "science",         ko: "과학",   koIs: "과학이야", emoji: "🔬", cat: "study", img: "images/science.png" },
  { en: "social studies",  ko: "사회",   koIs: "사회야",   emoji: "🗺️", cat: "study", img: "images/social_studies.png" },
  { en: "history",         ko: "역사",   koIs: "역사야",   emoji: "🏯", cat: "study", img: "images/history.png" },
  { en: "music",           ko: "음악",   koIs: "음악이야", emoji: "🎵", cat: "arts",  img: "images/music.png" },
  { en: "art",             ko: "미술",   koIs: "미술이야", emoji: "🎨", cat: "arts",  img: "images/art.png" },
  { en: "P.E.",            ko: "체육",   koIs: "체육이야", emoji: "⚽", cat: "arts",  img: "images/pe.png" },
  { en: "practical arts",  ko: "실과",   koIs: "실과야",   emoji: "🪴", cat: "arts",  img: "images/practical_arts.png" },
];

const SUBJECT_CATS = [
  { key: "study", label: "📘 공부 과목" },
  { key: "arts",  label: "🎨 예체능·실과" },
];

/* ===== 과목 대답 문장 (모두 "My favorite subject is ~." 로 시작) ===== */
const SUBJECT_LEVELS = {
  beginner: SUBJECTS.map(s => ({
    en: `My favorite subject is ${s.en}.`,
    ko: `내가 가장 좋아하는 과목은 ${s.koIs}.`,
    emoji: s.emoji, img: s.img, cat: s.cat,
  })),
  intermediate: [
    ["My favorite subject is Korean. I like reading stories.",          "내가 가장 좋아하는 과목은 국어야. 나는 이야기 읽는 것을 좋아해."],
    ["My favorite subject is English. I like English songs.",           "내가 가장 좋아하는 과목은 영어야. 나는 영어 노래를 좋아해."],
    ["My favorite subject is math. It's fun.",                          "내가 가장 좋아하는 과목은 수학이야. 재미있거든."],
    ["My favorite subject is science. I like experiments.",             "내가 가장 좋아하는 과목은 과학이야. 나는 실험을 좋아해."],
    ["My favorite subject is social studies. I like maps.",             "내가 가장 좋아하는 과목은 사회야. 나는 지도를 좋아해."],
    ["My favorite subject is history. I like old stories.",             "내가 가장 좋아하는 과목은 역사야. 나는 옛날이야기를 좋아해."],
    ["My favorite subject is music. I like singing.",                   "내가 가장 좋아하는 과목은 음악이야. 나는 노래하는 것을 좋아해."],
    ["My favorite subject is art. I like painting.",                    "내가 가장 좋아하는 과목은 미술이야. 나는 색칠하는 것을 좋아해."],
    ["My favorite subject is P.E. I like playing games.",               "내가 가장 좋아하는 과목은 체육이야. 나는 게임하는 것을 좋아해."],
    ["My favorite subject is practical arts. I like growing plants.",   "내가 가장 좋아하는 과목은 실과야. 나는 식물 기르는 것을 좋아해."],
  ].map(([en, ko], i) => ({ en, ko, emoji: SUBJECTS[i].emoji, img: SUBJECTS[i].img, cat: SUBJECTS[i].cat })),
  advanced: [
    ["My favorite subject is Korean. I'm good at writing stories.",        "내가 가장 좋아하는 과목은 국어야. 나는 이야기 쓰기를 잘해."],
    ["My favorite subject is English. I'm good at speaking English.",      "내가 가장 좋아하는 과목은 영어야. 나는 영어로 말하기를 잘해."],
    ["My favorite subject is math. I'm good at solving problems.",         "내가 가장 좋아하는 과목은 수학이야. 나는 문제 풀기를 잘해."],
    ["My favorite subject is science. I'm good at doing experiments.",     "내가 가장 좋아하는 과목은 과학이야. 나는 실험을 잘해."],
    ["My favorite subject is social studies. I'm good at reading maps.",   "내가 가장 좋아하는 과목은 사회야. 나는 지도 읽기를 잘해."],
    ["My favorite subject is history. I'm good at remembering old stories.", "내가 가장 좋아하는 과목은 역사야. 나는 옛날이야기를 잘 기억해."],
    ["My favorite subject is music. I'm good at playing the recorder.",    "내가 가장 좋아하는 과목은 음악이야. 나는 리코더를 잘 불어."],
    ["My favorite subject is art. I'm good at drawing.",                   "내가 가장 좋아하는 과목은 미술이야. 나는 그림을 잘 그려."],
    ["My favorite subject is P.E. I'm good at running.",                   "내가 가장 좋아하는 과목은 체육이야. 나는 달리기를 잘해."],
    ["My favorite subject is practical arts. I'm good at making things.",  "내가 가장 좋아하는 과목은 실과야. 나는 물건 만들기를 잘해."],
  ].map(([en, ko], i) => ({ en, ko, emoji: SUBJECTS[i].emoji, img: SUBJECTS[i].img, cat: SUBJECTS[i].cat })),
};

/* ===== 잘하는 것 10개 (I'm good at ~.) =====
 * ko     : 짧은 이름 (칩·빈칸용)
 * koSent : "I'm good at ~." 문장의 우리말
 */
const SKILLS = [
  { en: "singing",           ko: "노래하기",     koSent: "나는 노래를 잘해.",         emoji: "🎤", img: "images/singing.png" },
  { en: "dancing",           ko: "춤추기",       koSent: "나는 춤을 잘 춰.",          emoji: "💃", img: "images/dancing.png" },
  { en: "drawing",           ko: "그림 그리기",  koSent: "나는 그림을 잘 그려.",      emoji: "✏️", img: "images/drawing.png" },
  { en: "swimming",          ko: "수영하기",     koSent: "나는 수영을 잘해.",         emoji: "🏊", img: "images/swimming.png" },
  { en: "running",           ko: "달리기",       koSent: "나는 달리기를 잘해.",       emoji: "🏃", img: "images/running.png" },
  { en: "cooking",           ko: "요리하기",     koSent: "나는 요리를 잘해.",         emoji: "🍳", img: "images/cooking.png" },
  { en: "reading books",     ko: "책 읽기",      koSent: "나는 책을 잘 읽어.",        emoji: "📚", img: "images/reading.png" },
  { en: "playing soccer",    ko: "축구하기",     koSent: "나는 축구를 잘해.",         emoji: "⚽", img: "images/soccer.png" },
  { en: "playing the piano", ko: "피아노 치기",  koSent: "나는 피아노를 잘 쳐.",      emoji: "🎹", img: "images/piano.png" },
  { en: "making things",     ko: "물건 만들기",  koSent: "나는 물건을 잘 만들어.",    emoji: "🛠️", img: "images/making.png" },
];

/* ===== 단어 뜻 사전 ===== */
function wordKey(w) {
  return w.toLowerCase().replace(/^[^a-z0-9':.]+/, "").replace(/[^a-z0-9':]+$/, "");
}

const WORD_MEANINGS = {
  "what's": "무엇이니? (what is)",
  "what": "무엇",
  "is": "~이다",
  "it's": "그것은 ~이다 (it is)",
  "your": "너의",
  "my": "나의",
  "favorite": "가장 좋아하는",
  "subject": "과목",
  "i": "나는",
  "i'm": "나는 ~이다 (I am)",
  "good": "좋은, 잘하는",
  "at": "~에 (good at: ~을 잘하는)",
  "korean": "국어; 한국어",
  "english": "영어",
  "math": "수학",
  "science": "과학",
  "social": "사회의 (social studies: 사회 과목)",
  "studies": "공부, 학문 (social studies: 사회 과목)",
  "history": "역사",
  "music": "음악",
  "art": "미술",
  "p.e": "체육 (Physical Education)",
  "pe": "체육 (Physical Education)",
  "practical": "실용적인 (practical arts: 실과)",
  "arts": "기술, 예술 (practical arts: 실과)",
  "singing": "노래하기",
  "dancing": "춤추기",
  "drawing": "그림 그리기",
  "swimming": "수영하기",
  "running": "달리기",
  "cooking": "요리하기",
  "reading": "읽기",
  "books": "책들",
  "playing": "(운동·악기를) 하기, 연주하기",
  "soccer": "축구",
  "the": "그 (악기 앞에: the piano)",
  "piano": "피아노",
  "making": "만들기",
  "things": "물건들, 것들",
  "like": "좋아하다",
  "stories": "이야기들",
  "songs": "노래들",
  "fun": "재미있는; 재미",
  "experiments": "실험들",
  "maps": "지도들",
  "old": "옛날의, 오래된",
  "painting": "색칠하기, 그림 그리기",
  "games": "게임들",
  "growing": "기르기",
  "plants": "식물들",
  "writing": "쓰기",
  "speaking": "말하기",
  "solving": "풀기",
  "problems": "문제들",
  "doing": "하기",
  "remembering": "기억하기",
  "recorder": "리코더",
};
