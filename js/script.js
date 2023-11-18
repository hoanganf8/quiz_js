import { client } from "./client.js";
import { shuffle } from "./utils.js";
const root = document.querySelector("#root");
const TIMER_INTERVAL = 2000;
const audioCorrect = new Audio("../audio/rightAnswer.mp3");
const audioInCorrect = new Audio("../audio/wrongAnswer.mp3");
const app = {
  timerStatus: false,
  countTimer: 3,
  gameStatus: false,
  questions: [],
  index: 0,
  timer: TIMER_INTERVAL,
  current: [],
  score: 0,
  incorrect: 0,
  correct: 0,
  render: function () {
    if (!this.gameStatus) {
      root.innerHTML = `<div class="quiz-box d-flex align-items-center justify-content-center">
        ${
          this.timerStatus
            ? `<div class="quiz-timer">
                <h2>${this.countTimer}</h2>
            </div>`
            : `<div class="quiz-start">
        <button type="button" class="btn btn-outline-primary btn-lg btn-start">
            Start
        </button>
    </div>`
        } 
    </div>`;
    } else {
      this.current = []; //Reset câu trả lời
      this.questions.length = 4;
      if (this.index < this.questions.length) {
        const question = this.questions[this.index];
        root.innerHTML = `<div class="quiz-box py-3">
          <div class="container h-100">
            <div
              class="quiz-item h-100 d-flex flex-column justify-content-between text-center"
            >
              <div class="quiz-header">
                <div class="progress mb-3">
                  <div class="progress-bar" style="width: 100%"></div>
                </div>
                <div class="row">
                  <div class="col-6 text-start">
                    <span class="btn btn-info">${this.index + 1}/${
          this.questions.length
        }</span>
                  </div>
                  <div class="col-6 text-end">
                    <span class="btn btn-info">Score: ${this.score}</span>
                  </div>
                </div>
              </div>
              <div class="quiz-content">
                <h2 class="mb-5">${question.title}</h2>
                <div class="row">
                  ${question.answers
                    .map(
                      ({ id, name }) => `<div class="col-3">
                      <button class="btn btn-primary btn-anwser" data-question-id="${question.id}" data-anwser-id="${id}">${name}</button>
                    </div>`,
                    )
                    .join("")}
                  
                </div>
              </div>
              <div class="result"></div>
            </div>
          </div>
        </div>`;
        this.handleTimer();
      } else {
        root.innerHTML = `<div class="results text-center py-3">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-7">
              <h2>Game performance</h2>
              <p>Accuracy</p>
              <div class="progress mb-3">
                <div class="progress-bar" style="width: 100%"></div>
              </div>
              <div class="row g-3">
                <div class="col-6">
                  <div class="bg-primary text-white p-2">
                    <h2>${this.score}</h2>
                    <span>Score</span>
                  </div>
                </div>
                <div class="col-6">
                  <div class="bg-primary text-white p-2">
                    <h2>1</h2>
                    <span>Streak</span>
                  </div>
                </div>
                <div class="col-6">
                  <div class="bg-primary text-white p-2">
                    <h2>${this.correct}</h2>
                    <span>Correct</span>
                  </div>
                </div>
                <div class="col-6">
                  <div class="bg-primary text-white p-2">
                    <h2>${this.incorrect}</h2>
                    <span>Incorrect</span>
                  </div>
                </div>
              </div>
              <div class="d-grid mt-3">
                <button class="btn btn-success btn-reset">Play Again</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
      }
    }
  },
  resetGame: function () {
    this.timerStatus = false;
    this.countTimer = 3;
    this.gameStatus = false;
    this.questions = [];
    this.index = 0;
    this.timer = TIMER_INTERVAL;
    this.current = [];
    this.score = 0;
    this.incorrect = 0;
    this.correct = 0;
  },
  addEvent: function () {
    root.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-start")) {
        this.timerStatus = true;
        this.render();
        const timerInterval = setInterval(() => {
          this.countTimer--;
          if (this.countTimer === 0) {
            clearInterval(timerInterval);
            this.gameStatus = true;
          }
          this.render();
        }, 1000);
      }
    });
    root.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-anwser")) {
        e.target.classList.add("disabled");
        const questionId = e.target.dataset.questionId;
        const anwserId = e.target.dataset.anwserId;
        this.pushCurrent(anwserId);
        this.checkAnwser(questionId, this.timer);
      }
    });
    root.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-reset")) {
        this.resetGame();
        this.render();
        this.getQuestions();
      }
    });
  },
  pushCurrent: function (anwserId) {
    const check = this.current.includes(+anwserId);
    if (!check) {
      this.current.push(+anwserId);
    }
  },
  handleTimer: function () {
    const progressBar = root.querySelector(".progress .progress-bar");
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer === 0) {
        this.nextQuestion();
      }
      const rate = (this.timer * 100) / TIMER_INTERVAL;
      progressBar.style.width = `${rate}%`;
      progressBar.style.transition = "none";
    }, 0);
  },
  nextQuestion: function () {
    clearInterval(this.timerInterval);
    audioCorrect.currentTime = 0;
    audioInCorrect.currentTime = 0;
    setTimeout(() => {
      this.index++;
      this.timer = TIMER_INTERVAL;
      this.resultEl.classList.remove("anwser-correct", "anwser-incorrect");
      this.render();
    }, 1000);
  },
  getQuestions: async function () {
    const { data } = await client.get("/questions");
    const results = shuffle(data);
    this.questions = results;
  },
  checkAnwser: async function (questionId, remain) {
    const { data } = await client.get("/anwsers?questionId=" + questionId);
    if (data.length) {
      const anwserId = data[0].anwserId;
      if (anwserId.length === this.current.length) {
        this.resultEl = document.querySelector(".result");
        if (
          JSON.stringify(anwserId.sort((a, b) => a - b)) ===
          JSON.stringify(this.current.sort((a, b) => a - b))
        ) {
          this.resultEl.classList.add("anwser-correct");
          this.current.forEach((item) => {
            root.querySelector(
              `button[data-anwser-id="${item}"]`,
            ).style.background = "green";
          });
          this.getScore(remain);
          this.correct++;
          audioCorrect.play();
        } else {
          this.resultEl.classList.add("anwser-incorrect");
          this.current.forEach((item) => {
            root.querySelector(
              `button[data-anwser-id="${item}"]`,
            ).style.background = "red";
          });
          anwserId.forEach((item) => {
            root.querySelector(
              `button[data-anwser-id="${item}"]`,
            ).style.background = "green";
          });
          this.incorrect++;
          audioInCorrect.play();
        }
        this.nextQuestion();
      }
    }
  },
  getScore: function (remain) {
    this.score += remain;
  },
  start: function () {
    this.render();
    this.addEvent();
    this.getQuestions();
  },
};

app.start();
