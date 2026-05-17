const questions = [
  {
    question: "내가 싫어하는 음식은?",
    choices: ["마라탕", "말차", "두쫀쿠", "가지나물", "초밥"],
    answer: "마라탕",
  },
  {
    question: "내가 본 영화는?",
    choices: ["왕과 사는 남자", "살목지", "암살", "파묘", "관상"],
    answer: "파묘",
  },
  {
    question: "내가 저번주 금요일에 먹은 음식은?",
    choices: ["부대찌개", "보쌈", "곱창", "김치볶음밥", "설렁탕"],
    answer: "보쌈",
  },
  {
    question: "내 플레이리스트에 없는 노래는?",
    choices: [
      "키키 - 404(New Era)",
      "NCT WISH - Steady",
      "아일릿 - 빌려온 고양이",
      "코르티스 - REDRED",
    ],
    answer: "코르티스 - REDRED",
  },
];

const questionText = document.querySelector("#questionText");
const choices = document.querySelector("#choices");
const nextButton = document.querySelector("#nextButton");
const restartButton = document.querySelector("#restartButton");
const progressText = document.querySelector("#progressText");
const scoreText = document.querySelector("#scoreText");
const leftText = document.querySelector("#leftText");
const questionArea = document.querySelector("#questionArea");
const resultArea = document.querySelector("#resultArea");
const resultScore = document.querySelector("#resultScore");
const resultMessage = document.querySelector("#resultMessage");

let currentQuestionIndex = 0;
let score = 0;
let answered = false;

function renderQuestion() {
  const currentQuestion = questions[currentQuestionIndex];

  answered = false;
  nextButton.disabled = true;
  nextButton.textContent =
    currentQuestionIndex === questions.length - 1 ? "결과 보기" : "다음 문제";

  questionText.textContent = `Q. ${currentQuestion.question}`;
  choices.innerHTML = "";

  currentQuestion.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.type = "button";
    button.textContent = choice;
    button.addEventListener("click", () => selectAnswer(button, choice));
    choices.appendChild(button);
  });

  updateStatus();
}

function selectAnswer(selectedButton, selectedChoice) {
  if (answered) return;

  const currentQuestion = questions[currentQuestionIndex];
  const buttons = choices.querySelectorAll(".choice-button");
  answered = true;

  if (selectedChoice === currentQuestion.answer) {
    score += 1;
  }

  buttons.forEach((button) => {
    button.disabled = true;

    if (button.textContent === currentQuestion.answer) {
      button.classList.add("correct");
    }
  });

  if (selectedChoice !== currentQuestion.answer) {
    selectedButton.classList.add("wrong");
  }

  nextButton.disabled = false;
  updateStatus();
}

function updateStatus() {
  progressText.textContent = `${currentQuestionIndex + 1} / ${questions.length}`;
  scoreText.textContent = score;
  leftText.textContent = questions.length - currentQuestionIndex;
}

function showResult() {
  questionArea.classList.add("hidden");
  nextButton.classList.add("hidden");
  resultArea.classList.remove("hidden");
  progressText.textContent = "완료!";
  leftText.textContent = 0;

  resultScore.textContent = `${score} / ${questions.length}`;

  if (score === questions.length) {
    resultMessage.textContent = "완벽해요! 나를 아주 잘 알고 있네요.";
  } else if (score >= 2) {
    resultMessage.textContent = "꽤 잘 맞혔어요! 조금만 더 알면 만점이에요.";
  } else {
    resultMessage.textContent = "아직은 탐색전! 다시 도전해볼까요?";
  }
}

nextButton.addEventListener("click", () => {
  if (!answered) return;

  currentQuestionIndex += 1;

  if (currentQuestionIndex >= questions.length) {
    showResult();
    return;
  }

  renderQuestion();
});

restartButton.addEventListener("click", () => {
  currentQuestionIndex = 0;
  score = 0;
  questionArea.classList.remove("hidden");
  nextButton.classList.remove("hidden");
  resultArea.classList.add("hidden");
  renderQuestion();
});

renderQuestion();
