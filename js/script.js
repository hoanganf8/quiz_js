import { client } from "./client.js";
import { shuffle } from "./utils.js";
const root = document.querySelector("#root");
const TIMER_INTERVAL = 2000;
const app = {
  timerStatus: false,
  countTimer: 3,
  gameStatus: false,
  questions: [],
  index: 0,
  timer: TIMER_INTERVAL,
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
      this.questions.length = 4;
      if (this.index < this.questions.length) {
        const question = this.questions[this.index];
        root.innerHTML = `<div class="quiz-box py-3">
          <div class="container vh-100">
            <div
              class="quiz-item vh-100 d-flex flex-column justify-content-between text-center"
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
                    <span class="btn btn-info">Score: 0</span>
                  </div>
                </div>
              </div>
              <div class="quiz-content">
                <h2 class="mb-5">${question.title}</h2>
                <div class="row">
                  ${question.answers
                    .map(
                      ({ id, name }) => `<div class="col-3">
                      <button class="btn btn-primary" data-id="${id}">${name}</button>
                    </div>`,
                    )
                    .join("")}
                  
                </div>
              </div>
              <div class="result anwser-incorrect"></div>
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
                    <h2>4750</h2>
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
                    <h2>6</h2>
                    <span>Correct</span>
                  </div>
                </div>
                <div class="col-6">
                  <div class="bg-primary text-white p-2">
                    <h2>2</h2>
                    <span>Incorrect</span>
                  </div>
                </div>
              </div>
              <div class="d-grid mt-3">
                <button class="btn btn-success">Play Again</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
      }
    }
  },
  addEvent: function () {
    const quizStartEl = root.querySelector(".quiz-start");
    const btnStart = quizStartEl.querySelector(".btn-start");
    btnStart.addEventListener("click", () => {
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
    });
  },
  handleTimer: function () {
    console.log("timer");
    const progressBar = root.querySelector(".progress .progress-bar");
    const timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer === 0) {
        clearInterval(timerInterval);
        this.index++;
        this.timer = TIMER_INTERVAL;
        this.render();
      }
      const rate = (this.timer * 100) / TIMER_INTERVAL;
      progressBar.style.width = `${rate}%`;
      progressBar.style.transition = "none";
    }, 0);
  },
  getQuestions: async function (index) {
    const { data } = await client.get("/questions");
    const results = shuffle(data);
    this.questions = results;
  },
  start: function () {
    this.render();
    this.addEvent();
    this.getQuestions();
  },
};

app.start();
