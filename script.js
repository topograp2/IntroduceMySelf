const quizData = [
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
    choices: ["키키 - 404(New Era)", "NCT WISH - Steady", "아일릿 - 빌려온 고양이", "코르티스 - REDRED"],
    answer: "코르티스 - REDRED",
  },
];

const memorySymbols = ["🍀", "🍜", "👩‍💻", "👩‍🏫"];

let currentQuestionIndex = 0;
let selectedChoice = null;
let score = 0;
let answerLocked = false;
let pendingAdvance = false;

let flippedCards = [];
let matchedPairs = 0;
let moveCount = 0;
let memoryDeck = [];

function getRequiredElements() {
  const elements = {
    questionNumber: document.getElementById("questionNumber"),
    questionText: document.getElementById("questionText"),
    choicesContainer: document.getElementById("choices"),
    nextButton: document.getElementById("nextButton"),
    progressText: document.getElementById("progressText"),
    quizScreen: document.getElementById("quizScreen"),
    resultScreen: document.getElementById("resultScreen"),
    scoreText: document.getElementById("scoreText"),
    scoreMessage: document.getElementById("scoreMessage"),
    restartQuizButton: document.getElementById("restartQuizButton"),
    feedbackModal: document.getElementById("feedbackModal"),
    modalIcon: document.getElementById("modalIcon"),
    modalTitle: document.getElementById("modalTitle"),
    modalText: document.getElementById("modalText"),
    closeModalButton: document.getElementById("closeModalButton"),
    memoryGrid: document.getElementById("memoryGrid"),
    memoryMoves: document.getElementById("memoryMoves"),
    memoryStatus: document.getElementById("memoryStatus"),
    restartMemoryButton: document.getElementById("restartMemoryButton"),
  };

  const missing = Object.entries(elements)
    .filter(([, element]) => !element)
    .map(([name]) => name);

  if (missing.length > 0) {
    console.error("Missing required elements:", missing.join(", "));
    return null;
  }

  return elements;
}

function renderQuestion(elements) {
  const {
    questionNumber,
    questionText,
    choicesContainer,
    nextButton,
    progressText,
    quizScreen,
  } = elements;
  const current = quizData[currentQuestionIndex];
  questionNumber.textContent = `QUESTION ${currentQuestionIndex + 1}`;
  questionText.textContent = current.question;
  progressText.textContent = `${currentQuestionIndex + 1} / ${quizData.length}`;
  nextButton.disabled = true;
  selectedChoice = null;
  answerLocked = false;
  pendingAdvance = false;

  const card = quizScreen.querySelector(".question-card");
  card.classList.remove("animate-pop");
  void card.offsetWidth;
  card.classList.add("animate-pop");

  choicesContainer.innerHTML = "";
  current.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.type = "button";
    button.textContent = choice;
    button.addEventListener("click", () => handleChoiceSelect(button, choice));
    choicesContainer.appendChild(button);
  });
}

function handleChoiceSelect(button, choice) {
  if (answerLocked) {
    return;
  }

  selectedChoice = choice;
  document.querySelectorAll(".choice-button").forEach((item) => {
    item.classList.remove("selected");
  });
  button.classList.add("selected");
  nextButton.disabled = false;
}

function showModal(elements, isCorrect, correctAnswer) {
  const { modalIcon, modalTitle, modalText, feedbackModal } = elements;
  modalIcon.textContent = isCorrect ? "O" : "X";
  modalIcon.className = `modal-icon ${isCorrect ? "success" : "fail"}`;
  modalTitle.textContent = isCorrect ? "정답!" : "아쉬워요!";
  modalText.textContent = isCorrect
    ? "정답을 맞혔어요. 다음 문제로 가볼까요?"
    : `정답은 "${correctAnswer}"였어요. 다음 문제에서 만회해봐요!`;
  feedbackModal.classList.remove("hidden");
  feedbackModal.setAttribute("aria-hidden", "false");
}

function closeModal(elements) {
  const { feedbackModal } = elements;
  feedbackModal.classList.add("hidden");
  feedbackModal.setAttribute("aria-hidden", "true");

  if (!pendingAdvance) {
    return;
  }

  if (currentQuestionIndex < quizData.length - 1) {
    currentQuestionIndex += 1;
    renderQuestion(elements);
  } else {
    showResult(elements);
  }
}

function handleNextQuestion(elements) {
  if (!selectedChoice || answerLocked) {
    return;
  }

  answerLocked = true;
  pendingAdvance = true;
  const current = quizData[currentQuestionIndex];
  const isCorrect = selectedChoice === current.answer;
  if (isCorrect) {
    score += 1;
  }

  document.querySelectorAll(".choice-button").forEach((button) => {
    if (button.textContent === current.answer) {
      button.classList.add("correct");
    } else if (button.textContent === selectedChoice) {
      button.classList.add("wrong");
    }
    button.disabled = true;
  });

  showModal(elements, isCorrect, current.answer);
}

function showResult(elements) {
  const { quizScreen, resultScreen, progressText, scoreText, scoreMessage } = elements;
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
  progressText.textContent = "완료";
  scoreText.textContent = `${quizData.length}문제 중 ${score}문제를 맞혔어요!`;

  if (score === quizData.length) {
    scoreMessage.textContent = "완벽해요! 저를 정말 잘 알고 있네요.";
  } else if (score >= 2) {
    scoreMessage.textContent = "꽤 잘 맞혔어요! 조금만 더 알면 만점도 가능해요.";
  } else {
    scoreMessage.textContent = "이제 막 탐험을 시작했어요. 다시 도전해서 더 맞혀봐요!";
  }
}

function restartQuiz(elements) {
  const { resultScreen, quizScreen } = elements;
  currentQuestionIndex = 0;
  score = 0;
  selectedChoice = null;
  answerLocked = false;
  pendingAdvance = false;
  resultScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");
  renderQuestion(elements);
}

function shuffle(array) {
  const copied = [...array];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[randomIndex]] = [copied[randomIndex], copied[i]];
  }
  return copied;
}

function createMemoryDeck() {
  return shuffle([...memorySymbols, ...memorySymbols]).map((symbol, index) => ({
    id: `${symbol}-${index}`,
    symbol,
    flipped: false,
    matched: false,
  }));
}

function renderMemoryGame(elements) {
  const { memoryGrid, memoryMoves } = elements;
  memoryGrid.innerHTML = "";

  memoryDeck.forEach((card) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "memory-card";
    button.dataset.id = card.id;
    button.innerHTML = `
      <span class="face front">?</span>
      <span class="face back">${card.symbol}</span>
    `;

    if (card.flipped) {
      button.classList.add("flipped");
    }
    if (card.matched) {
      button.classList.add("matched");
      button.disabled = true;
    }

    button.addEventListener("click", () => handleMemoryFlip(elements, card.id));
    memoryGrid.appendChild(button);
  });

  memoryMoves.textContent = `이동 ${moveCount}회`;
}

function handleMemoryFlip(elements, cardId) {
  const { memoryMoves, memoryStatus } = elements;
  if (flippedCards.length === 2) {
    return;
  }

  const card = memoryDeck.find((item) => item.id === cardId);
  if (!card || card.flipped || card.matched) {
    return;
  }

  card.flipped = true;
  flippedCards.push(card);
  renderMemoryGame(elements);

  if (flippedCards.length === 2) {
    moveCount += 1;
    memoryMoves.textContent = `이동 ${moveCount}회`;

    const [firstCard, secondCard] = flippedCards;
    if (firstCard.symbol === secondCard.symbol) {
      firstCard.matched = true;
      secondCard.matched = true;
      flippedCards = [];
      matchedPairs += 1;
      memoryStatus.textContent = "짝을 맞혔어요! 계속 도전해보세요.";

      if (matchedPairs === memorySymbols.length) {
        memoryStatus.textContent = `축하해요! ${moveCount}번 만에 모든 카드를 맞혔어요.`;
      }
      renderMemoryGame(elements);
      return;
    }

    memoryStatus.textContent = "다른 카드예요. 잠시 뒤 다시 뒤집힙니다.";
    window.setTimeout(() => {
      firstCard.flipped = false;
      secondCard.flipped = false;
      flippedCards = [];
      renderMemoryGame(elements);
      memoryStatus.textContent = "카드를 뒤집어 다음 짝을 찾아보세요!";
    }, 800);
  }
}

function restartMemoryGame(elements) {
  const { memoryStatus } = elements;
  memoryDeck = createMemoryDeck();
  flippedCards = [];
  matchedPairs = 0;
  moveCount = 0;
  memoryStatus.textContent = "카드를 뒤집어 시작해보세요!";
  renderMemoryGame(elements);
}

function init() {
  const elements = getRequiredElements();
  if (!elements) {
    return;
  }

  const {
    nextButton,
    restartQuizButton,
    closeModalButton,
    restartMemoryButton,
    feedbackModal,
  } = elements;

  nextButton.addEventListener("click", () => handleNextQuestion(elements));
  restartQuizButton.addEventListener("click", () => restartQuiz(elements));
  closeModalButton.addEventListener("click", () => closeModal(elements));
  restartMemoryButton.addEventListener("click", () => restartMemoryGame(elements));
  feedbackModal.addEventListener("click", (event) => {
    if (event.target === feedbackModal) {
      closeModal(elements);
    }
  });

  renderQuestion(elements);
  restartMemoryGame(elements);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
