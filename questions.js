// questions.js — QUIZΛ Question Bank
const QUESTIONS = [
  // ── SINGLE SELECT ──────────────────────────────
  {
    type: "single",
    text: "Which planet has the most moons in our Solar System?",
    options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
    correct: [1],
    explanation: "Saturn has 146 confirmed moons — more than any other planet."
  },
  {
    type: "single",
    text: "What is the time complexity of Binary Search?",
    options: ["O(n)", "O(n²)", "O(log n)", "O(n log n)"],
    correct: [2],
    explanation: "Binary Search halves the search space each step: O(log n)."
  },
  {
    type: "single",
    text: "Who painted 'The Persistence of Memory'?",
    options: ["Pablo Picasso", "Vincent van Gogh", "Salvador Dalí", "René Magritte"],
    correct: [2],
    explanation: "Salvador Dalí painted this surrealist masterpiece in 1931."
  },
  {
    type: "single",
    text: "What does DNA stand for?",
    options: ["Deoxyribonucleic Acid", "Dinitrogen Acid", "Dynamic Neural Array", "Dense Nucleotide Arrangement"],
    correct: [0],
    explanation: "DNA = Deoxyribonucleic Acid, the molecule carrying genetic instructions."
  },
  {
    type: "single",
    text: "In what year did the Berlin Wall fall?",
    options: ["1985", "1987", "1989", "1991"],
    correct: [2],
    explanation: "The Berlin Wall fell on November 9, 1989."
  },

  // ── MULTI SELECT ───────────────────────────────
  {
    type: "multi",
    text: "Which of these are JavaScript data types? (Select ALL that apply)",
    options: ["String", "Float", "Boolean", "Character", "Symbol"],
    correct: [0, 2, 4],
    explanation: "JS has: String, Boolean, Symbol (and Number, BigInt, Object, undefined, null). Float & Character are not JS types."
  },
  {
    type: "multi",
    text: "Which countries are part of the G7? (Select ALL that apply)",
    options: ["China", "France", "Germany", "Brazil", "Japan", "India"],
    correct: [1, 2, 4],
    explanation: "G7: USA, UK, Canada, France, Germany, Italy, Japan."
  },
  {
    type: "multi",
    text: "Which of these are noble gases? (Select ALL that apply)",
    options: ["Neon", "Oxygen", "Argon", "Nitrogen", "Xenon"],
    correct: [0, 2, 4],
    explanation: "Noble gases: He, Ne, Ar, Kr, Xe, Rn. O₂ and N₂ are not noble gases."
  },
  {
    type: "multi",
    text: "Which are valid HTTP methods? (Select ALL that apply)",
    options: ["GET", "SEND", "POST", "FETCH", "DELETE"],
    correct: [0, 2, 4],
    explanation: "Valid HTTP methods include GET, POST, PUT, DELETE, PATCH, etc. SEND and FETCH are not HTTP methods."
  },
  {
    type: "multi",
    text: "Which of these are Python built-in data structures? (Select ALL that apply)",
    options: ["List", "Stack", "Tuple", "Queue", "Dictionary"],
    correct: [0, 2, 4],
    explanation: "Python built-ins: list, tuple, dict, set, frozenset. Stack & Queue are not built-in structures."
  },

  // ── FILL IN THE BLANK ──────────────────────────
  {
    type: "fill",
    text: "The chemical symbol for Gold is ___",
    correct: ["au"],
    display_answer: "Au",
    explanation: "Gold's symbol 'Au' comes from the Latin word 'Aurum'."
  },
  {
    type: "fill",
    text: "The speed of light in a vacuum is approximately ___ km/s (round to nearest hundred thousand)",
    correct: ["300000", "300,000"],
    display_answer: "300,000",
    explanation: "Light travels at ~299,792 km/s, commonly rounded to 300,000 km/s."
  },
  {
    type: "fill",
    text: "The mathematical constant π (Pi) to 2 decimal places is ___",
    correct: ["3.14"],
    display_answer: "3.14",
    explanation: "Pi ≈ 3.14159265... Rounded to 2 decimal places: 3.14."
  },
  {
    type: "fill",
    text: "The powerhouse of the cell is the ___",
    correct: ["mitochondria", "mitochondrion"],
    display_answer: "Mitochondria",
    explanation: "Mitochondria produce ATP through cellular respiration."
  },
  {
    type: "fill",
    text: "In CSS, the property used to change text color is ___",
    correct: ["color", "colour"],
    display_answer: "color",
    explanation: "The CSS `color` property sets the foreground color of text."
  }
];