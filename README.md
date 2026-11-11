# What's your favorite subject? · 좋아하는 과목과 잘하는 것 말하기

5학년 영어 **좋아하는 과목 묻고 답하기** 단원 학습용 웹앱입니다.
가장 좋아하는 과목을 묻고 대답하고, **I'm good at ___.** 으로 내가 잘하는 것까지 말하며 익힐 수 있도록 만들었습니다.
(기존 *Can you come to the ___?* 페이지와 같은 구성, 📚 학교 테마 디자인 · 카드 그림은 **Canva**에서 생성)

## 주요 표현

| 역할 | 표현 |
|------|------|
| 묻기 | **What's your favorite subject?** |
| 대답 | **My favorite subject is ___.** |
| 잘하는 것 | **I'm good at ___.** |

## 기능

- 📚 **좋아하는 과목** — 질문 듣기 + 초급·중급·고급 난이도 × 10과목, **총 30문장**
  - 📘 공부 과목 6개: Korean · English · math · science · social studies · history
  - 🎨 예체능·실과 4개: music · art · P.E. · practical arts
  - 초급: 기본 문장 / 중급: 좋아하는 이유 / 고급: `I'm good at ___.`까지 이어 말하기
- 💪 **잘하는 것** — `I'm good at ___.` 카드 10개 + 빈칸 채우기
  - singing · dancing · drawing · swimming · running · cooking · reading books · playing soccer · playing the piano · making things
- 💬 **대화 완성** — `What's your favorite subject?` → `My favorite subject is ___.` `I'm good at ___.` 빈칸에 과목·잘하는 것을 골라 대화 완성하고 듣기
- 🎒 **나와 친구 카드** — 🙋 나 · 👦 친구 1 · 👧 친구 2 카드 3장(카드마다 과목 1개 + 잘하는 것 1개)
  - 말풍선 대화 빈칸이 채워지는 것을 확인 · 🎲 무작위 채우기 · 브라우저에 저장
  - 📝 **활동지에 적기** 표: 영어 문장을 보고 옮겨 적기
- 🎤 **연습 · 짝 활동** — 👫 짝 활동 카드 + 컴퓨터와 미리 연습
  - 줄마다 🎙️ 말하기로 정확도 측정
  - 🎭 역할극: 내가 A(묻기) 또는 B(대답하기)를 맡으면 컴퓨터가 상대 역할을 읽어 주고 내 차례에 마이크가 켜짐 (Chrome 권장)
- 단어 클릭 시 **뜻 풍선 + 발음**, 말하기 **속도 조절** 슬라이더

브라우저 내장 **Web Speech API**(음성 합성·음성 인식)를 사용합니다.
나와 친구 카드와 연습 기록은 브라우저(localStorage)에 저장됩니다.

## 사용 방법

`index.html`을 브라우저(크롬 권장)에서 열면 됩니다. 별도 설치가 필요 없습니다.

## 파일 구성

| 파일 | 설명 |
|------|------|
| `index.html` | 화면 구조(탭·섹션) |
| `style.css`  | 디자인·학교 테마 |
| `data.js`    | 질문·과목·대답 문장·잘하는 것, 단어 뜻 데이터 |
| `app.js`     | 음성·단어 풍선·카드 만들기·연습(역할극) 채점 로직 |
| `images/`    | Canva에서 생성한 과목 10장 · 잘하는 것 10장 그림 |
| `worksheet_친구초대하기.hwpx` | 이전 단원(친구 초대하기) 워크시트 |
