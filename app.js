// app.js — QUIZΛ Game Engine

(function () {
  "use strict";

  /* ─── State ─────────────────────────────────────────── */
  let questions = [];
  let currentIndex = 0;
  let score = 0;
  let selectedOptions = [];
  let timer = null;
  let timeLeft = 20;
  let answered = false;
  let userAnswers = [];

  const TIMER_DURATION = 20;
  const CIRCUMFERENCE = 2 * Math.PI * 26; // r=26

  /* ─── Elements ──────────────────────────────────────── */
  const screens = {
    intro: document.getElementById("intro"),
    quiz: document.getElementById("quiz"),
    results: document.getElementById("results"),
    review: document.getElementById("review"),
  };

  const el = {
    startBtn: document.getElementById("startBtn"),
    retryBtn: document.getElementById("retryBtn"),
    reviewBtn: document.getElementById("reviewBtn"),
    backBtn: document.getElementById("backBtn"),
    nextBtn: document.getElementById("nextBtn"),
    qCounter: document.getElementById("qCounter"),
    timerNum: document.getElementById("timerNum"),
    timerCircle: document.getElementById("timerCircle"),
    liveScore: document.getElementById("liveScore"),
    progressFill: document.getElementById("progressFill"),
    progressGlow: document.getElementById("progressGlow"),
    qCard: document.getElementById("qCard"),
    qTypeBadge: document.getElementById("qTypeBadge"),
    qNumBg: document.getElementById("qNumBg"),
    qText: document.getElementById("qText"),
    optionsGrid: document.getElementById("optionsGrid"),
    fillWrap: document.getElementById("fillWrap"),
    fillInput: document.getElementById("fillInput"),
    feedbackFlash: document.getElementById("feedbackFlash"),
    feedbackText: document.getElementById("feedbackText"),
    finalScore: document.getElementById("finalScore"),
    finalTotal: document.getElementById("finalTotal"),
    resultTitle: document.getElementById("resultTitle"),
    resultSub: document.getElementById("resultSub"),
    breakdownRow: document.getElementById("breakdownRow"),
    reviewList: document.getElementById("reviewList"),
  };

  /* ─── Particles ─────────────────────────────────────── */
  (function initParticles() {
    const canvas = document.getElementById("particleCanvas");
    const ctx = canvas.getContext("2d");
    let W, H, particles = [];

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function Particle() {
      this.reset();
    }
    Particle.prototype.reset = function () {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? "#ff3c5e" : "#00f5d4";
    };
    Particle.prototype.update = function () {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    };

    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 120; i++) particles.push(new Particle());

    function loop() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.update();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(loop);
    }
    loop();
  })();

  /* ─── Screen Router ─────────────────────────────────── */
  function showScreen(name) {
    Object.keys(screens).forEach(k => {
      screens[k].classList.remove("active", "exit");
    });
    screens[name].classList.add("active");
  }

  /* ─── Shuffle ───────────────────────────────────────── */
  function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  /* ─── Timer ─────────────────────────────────────────── */
  function startTimer() {
    clearInterval(timer);
    timeLeft = TIMER_DURATION;
    updateTimerUI();

    timer = setInterval(() => {
      timeLeft--;
      updateTimerUI();
      if (timeLeft <= 0) {
        clearInterval(timer);
        if (!answered) autoFail();
      }
    }, 1000);
  }

  function updateTimerUI() {
    el.timerNum.textContent = timeLeft;
    const pct = timeLeft / TIMER_DURATION;
    const offset = CIRCUMFERENCE * (1 - pct);
    el.timerCircle.style.strokeDashoffset = offset;
    if (timeLeft <= 5) {
      el.timerCircle.style.stroke = "#ff3c5e";
      el.timerNum.style.color = "#ff3c5e";
      el.timerNum.classList.add("pulse");
    } else {
      el.timerCircle.style.stroke = "#00f5d4";
      el.timerNum.style.color = "#00f5d4";
      el.timerNum.classList.remove("pulse");
    }
  }

  function stopTimer() { clearInterval(timer); }

  /* ─── Render Question ───────────────────────────────── */
  function renderQuestion(idx) {
    answered = false;
    selectedOptions = [];
    const q = questions[idx];

    el.qCard.classList.remove("slide-in");
    void el.qCard.offsetWidth;
    el.qCard.classList.add("slide-in");

    // Counter & progress
    const n = (idx + 1).toString().padStart(2, "0");
    el.qCounter.textContent = `${n} / ${questions.length.toString().padStart(2, "0")}`;
    el.qNumBg.textContent = n;
    const pct = ((idx + 1) / questions.length) * 100;
    el.progressFill.style.width = pct + "%";
    el.progressGlow.style.left = pct + "%";

    // Type badge
    const typeMap = { single: "SINGLE SELECT", multi: "MULTI SELECT", fill: "FILL IN BLANK" };
    const typeColors = { single: "#00f5d4", multi: "#a78bfa", fill: "#fbbf24" };
    el.qTypeBadge.textContent = typeMap[q.type];
    el.qTypeBadge.style.color = typeColors[q.type];
    el.qTypeBadge.style.borderColor = typeColors[q.type];

    el.qText.textContent = q.text;

    // Options / Fill
    el.optionsGrid.innerHTML = "";
    el.fillWrap.classList.add("hidden");
    el.nextBtn.classList.add("hidden");
    el.optionsGrid.classList.remove("hidden");

    if (q.type === "fill") {
      el.optionsGrid.classList.add("hidden");
      el.fillWrap.classList.remove("hidden");
      el.fillInput.value = "";
      el.fillInput.focus();
      el.nextBtn.classList.remove("hidden");
      el.nextBtn.classList.add("disabled");
      el.fillInput.addEventListener("input", onFillInput);
    } else {
      q.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.dataset.index = i;
        btn.innerHTML = `<span class="opt-letter">${String.fromCharCode(65 + i)}</span><span class="opt-text">${opt}</span>`;
        btn.addEventListener("click", () => onOptionClick(i, btn, q));
        el.optionsGrid.appendChild(btn);

        // Stagger in
        btn.style.animationDelay = `${i * 80}ms`;
        btn.classList.add("opt-appear");
      });

      if (q.type === "multi") {
        el.nextBtn.classList.remove("hidden");
        el.nextBtn.classList.add("disabled");
        el.nextBtn.querySelector("span").textContent = "CONFIRM";
      }
    }

    startTimer();
  }

  /* ─── Option Click ──────────────────────────────────── */
  function onOptionClick(i, btn, q) {
    if (answered && q.type === "single") return;

    if (q.type === "single") {
      answered = true;
      stopTimer();
      document.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedOptions = [i];
      setTimeout(() => submitAnswer(q), 400);
    } else if (q.type === "multi") {
      if (selectedOptions.includes(i)) {
        selectedOptions = selectedOptions.filter(x => x !== i);
        btn.classList.remove("selected");
      } else {
        selectedOptions.push(i);
        btn.classList.add("selected");
      }
      el.nextBtn.classList.toggle("disabled", selectedOptions.length === 0);
    }
  }

  /* ─── Fill Input ────────────────────────────────────── */
  function onFillInput() {
    el.nextBtn.classList.toggle("disabled", el.fillInput.value.trim() === "");
  }

  /* ─── Submit Answer ─────────────────────────────────── */
  function submitAnswer(q) {
    stopTimer();
    answered = true;
    el.fillInput.removeEventListener("input", onFillInput);

    let isCorrect = false;
    let userAnswer = [];

    if (q.type === "fill") {
      const val = el.fillInput.value.trim().toLowerCase();
      userAnswer = [val];
      isCorrect = q.correct.some(c => c.toLowerCase() === val);
    } else {
      userAnswer = [...selectedOptions];
      const sortedUser = [...selectedOptions].sort().join(",");
      const sortedCorrect = [...q.correct].sort().join(",");
      isCorrect = sortedUser === sortedCorrect;
    }

    userAnswers.push({ q, userAnswer, isCorrect });

    // Reveal correct/wrong
    if (q.type !== "fill") {
      document.querySelectorAll(".option-btn").forEach(btn => {
        const i = parseInt(btn.dataset.index);
        btn.classList.add("locked");
        if (q.correct.includes(i)) btn.classList.add("correct");
        else if (selectedOptions.includes(i)) btn.classList.add("wrong");
      });
    } else {
      if (isCorrect) {
        el.fillInput.classList.add("correct");
      } else {
        el.fillInput.classList.add("wrong");
      }
    }

    if (isCorrect) {
      score++;
      el.liveScore.textContent = score;
      showFeedback(true, q.explanation);
    } else {
      showFeedback(false, q.explanation);
    }

    setTimeout(() => {
      hideFeedback();
      nextQuestion();
    }, 2200);
  }

  /* ─── Feedback ──────────────────────────────────────── */
  function showFeedback(correct, explanation) {
    el.feedbackFlash.className = "feedback-flash show " + (correct ? "correct" : "wrong");
    el.feedbackText.textContent = (correct ? "✓ CORRECT! " : "✗ WRONG! ") + explanation;
  }
  function hideFeedback() {
    el.feedbackFlash.className = "feedback-flash";
  }

  /* ─── Auto Fail (time up) ───────────────────────────── */
  function autoFail() {
    answered = true;
    const q = questions[currentIndex];
    userAnswers.push({ q, userAnswer: [], isCorrect: false });
    showFeedback(false, "Time's up! " + q.explanation);
    document.querySelectorAll(".option-btn").forEach(btn => {
      const i = parseInt(btn.dataset.index);
      btn.classList.add("locked");
      if (q.correct.includes(i)) btn.classList.add("correct");
    });
    setTimeout(() => { hideFeedback(); nextQuestion(); }, 2200);
  }

  /* ─── Next Question ─────────────────────────────────── */
  function nextQuestion() {
    currentIndex++;
    if (currentIndex >= questions.length) {
      showResults();
    } else {
      renderQuestion(currentIndex);
    }
  }

  /* ─── Results ───────────────────────────────────────── */
  function showResults() {
    showScreen("results");
    const total = questions.length;
    el.finalTotal.textContent = `/${total}`;

    // Animate count up
    let count = 0;
    const interval = setInterval(() => {
      count++;
      el.finalScore.textContent = count;
      if (count >= score) clearInterval(interval);
    }, 80);

    const pct = Math.round((score / total) * 100);
    const tiers = [
      { min: 90, title: "NEURAL GENIUS", sub: "Extraordinary. Your mind operates on a different level.", color: "#ffd700" },
      { min: 70, title: "COGNITIVE ELITE", sub: "Impressive performance. You're sharper than most.", color: "#00f5d4" },
      { min: 50, title: "SOLID MIND", sub: "Good effort. Keep pushing the boundaries.", color: "#a78bfa" },
      { min: 30, title: "DEVELOPING", sub: "Room to grow. Every genius starts somewhere.", color: "#fbbf24" },
      { min: 0, title: "KEEP TRAINING", sub: "Don't stop. Failure is just the first step.", color: "#ff3c5e" },
    ];
    const tier = tiers.find(t => pct >= t.min);
    el.resultTitle.textContent = tier.title;
    el.resultTitle.style.color = tier.color;
    el.resultSub.textContent = tier.sub;

    // Breakdown
    const correct = userAnswers.filter(a => a.isCorrect).length;
    const wrong = userAnswers.filter(a => !a.isCorrect).length;
    el.breakdownRow.innerHTML = `
      <div class="bd-item"><span class="bd-num correct-c">${correct}</span><span class="bd-label">Correct</span></div>
      <div class="bd-item"><span class="bd-num wrong-c">${wrong}</span><span class="bd-label">Wrong</span></div>
      <div class="bd-item"><span class="bd-num pct-c">${pct}%</span><span class="bd-label">Score</span></div>
    `;
  }

  /* ─── Review ─────────────────────────────────────────── */
  function showReview() {
    el.reviewList.innerHTML = "";
    userAnswers.forEach((entry, i) => {
      const { q, userAnswer, isCorrect } = entry;
      const div = document.createElement("div");
      div.className = `review-item ${isCorrect ? "rev-correct" : "rev-wrong"}`;

      let answerHTML = "";
      if (q.type === "fill") {
        answerHTML = `<p class="rev-your">Your answer: <strong>${userAnswer[0] || "(no answer)"}</strong></p>
                      <p class="rev-correct-ans">Correct: <strong>${q.display_answer}</strong></p>`;
      } else {
        const userLabels = userAnswer.map(i => q.options[i]).join(", ") || "(no answer)";
        const correctLabels = q.correct.map(i => q.options[i]).join(", ");
        answerHTML = `<p class="rev-your">Your answer: <strong>${userLabels}</strong></p>
                      <p class="rev-correct-ans">Correct: <strong>${correctLabels}</strong></p>`;
      }

      div.innerHTML = `
        <div class="rev-top">
          <span class="rev-num">${(i + 1).toString().padStart(2, "0")}</span>
          <span class="rev-status">${isCorrect ? "✓" : "✗"}</span>
        </div>
        <p class="rev-q">${q.text}</p>
        ${answerHTML}
        <p class="rev-exp">${q.explanation}</p>
      `;
      el.reviewList.appendChild(div);
    });
    showScreen("review");
  }

  /* ─── Event Listeners ───────────────────────────────── */
  el.startBtn.addEventListener("click", () => {
    questions = shuffle(QUESTIONS);
    currentIndex = 0;
    score = 0;
    userAnswers = [];
    el.liveScore.textContent = "0";
    showScreen("quiz");
    setTimeout(() => renderQuestion(0), 300);
  });

  el.nextBtn.addEventListener("click", () => {
    if (el.nextBtn.classList.contains("disabled")) return;
    submitAnswer(questions[currentIndex]);
  });

  el.retryBtn.addEventListener("click", () => {
    questions = shuffle(QUESTIONS);
    currentIndex = 0;
    score = 0;
    userAnswers = [];
    el.liveScore.textContent = "0";
    showScreen("quiz");
    setTimeout(() => renderQuestion(0), 300);
  });

  el.reviewBtn.addEventListener("click", showReview);
  el.backBtn.addEventListener("click", () => showScreen("results"));

  /* ─── Timer circle setup ────────────────────────────── */
  el.timerCircle.style.strokeDasharray = CIRCUMFERENCE;
  el.timerCircle.style.strokeDashoffset = 0;

})();