const API_URL = "https://quote-generator-5qei.onrender.com";

let quotes = [];
let usedQuotes = [];
let usedColours = [];
let darkMode = false;
let selectedCategory = null;

const colors = [
  "#49B587", "#FF6F61", "#FFD700", "#6A5ACD", "#FF8C00",
  "#00CED1", "#FF69B4", "#8A2BE2", "#20B2AA", "#FF4500",
  "#00FA9A", "#FF1493"
];

const darkColors = [
  "#121212", "#1E1E1E", "#2C2C2C", "#3A3A3A", "#2F4F4F",
  "#36454F", "#2E2B5F", "#4B3832", "#22313F"
];

// --- Helpers ---

// Picks a random unused index from arr. Resets when all have been used,
// so every item appears before any repeats.
function pickWithoutRepeat(arr, usedArr) {
  if (usedArr.length === arr.length) usedArr.length = 0;
  const available = arr.map((_, i) => i).filter(i => !usedArr.includes(i));
  const index = available[Math.floor(Math.random() * available.length)];
  usedArr.push(index);
  return index;
}

// Renders a quote into #quote with a CSS fade-in animation.
function displayQuote(text, author) {
  const quoteElem = document.getElementById("quote");
  quoteElem.innerHTML = `"${text}" <span class="author">${author}</span>`;
  quoteElem.classList.remove("fade");
  void quoteElem.offsetWidth; // force reflow so removing+adding the class restarts the animation
  quoteElem.classList.add("fade");
  changeBackground();
}

// --- Core functions ---

function newQuote() {
  if (quotes.length === 0) return;
  const index = pickWithoutRepeat(quotes, usedQuotes);
  displayQuote(quotes[index].text, quotes[index].author);
}

function changeBackground() {
  const palette = darkMode ? darkColors : colors;
  const index = pickWithoutRepeat(palette, usedColours);
  document.body.style.backgroundColor = palette[index];
}

function copyQuote() {
  const quoteText = document.getElementById("quote").innerText;
  navigator.clipboard.writeText(quoteText).then(() => {
    const copyBtn = document.getElementById("copybtn");
    const oldText = copyBtn.innerText;
    copyBtn.innerText = "Copied!";
    setTimeout(() => { copyBtn.innerText = oldText; }, 1500);
  });
}

function toggleMode() {
  darkMode = !darkMode;
  document.body.classList.toggle("dark-mode");
  document.getElementById("modeToggle").classList.toggle("active");
  document.querySelector(".toggle-ball").textContent = darkMode ? "🌞" : "🌙";
  document.body.style.backgroundColor = darkMode ? "#121212" : "#49B587";
}

// --- Category filtering ---

document.querySelectorAll(".cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const category = btn.dataset.category;
    const isSame = selectedCategory === category;

    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));

    if (isSame) {
      // Clicking the active category again deselects it → load all quotes
      selectedCategory = null;
      fetchQuotes();
    } else {
      selectedCategory = category;
      btn.classList.add("active");
      fetchQuotes(category);
    }
  });
});

// --- Fetching quotes from the backend ---

async function fetchQuotes(category = null) {
  try {
    const url = category
      ? `${API_URL}/quotes/category/${category}`
      : `${API_URL}/quotes`;

    const res = await fetch(url);
    quotes = await res.json();

    // Reset no-repeat tracking whenever a fresh batch of quotes loads
    usedQuotes = [];
    usedColours = [];
    newQuote();
  } catch (err) {
    console.error("Backend not available:", err);
  }
}

fetchQuotes();

// --- AI input helpers ---

function toggleClearBtn() {
  const input = document.getElementById("ai-input");
  document.getElementById("clear-btn").style.display = input.value.length > 0 ? "flex" : "none";
}

function clearAIInput() {
  const input = document.getElementById("ai-input");
  input.value = "";
  document.getElementById("clear-btn").style.display = "none";
  input.focus();
}

// Runs a 10-second countdown on the AI button to prevent rapid re-clicks
function startCooldown(btn) {
  let countdown = 10;
  btn.disabled = true;
  btn.textContent = `Wait ${countdown}s`;
  const timer = setInterval(() => {
    countdown--;
    if (countdown <= 0) {
      clearInterval(timer);
      btn.textContent = "Ask Gemini";
      btn.disabled = false;
    } else {
      btn.textContent = `Wait ${countdown}s`;
    }
  }, 1000);
}

// --- AI quote generation ---

async function generateAIQuote() {
  const phrase = document.getElementById("ai-input").value.trim();
  if (!phrase) return;

  const aiBtn = document.getElementById("ai-btn");
  aiBtn.textContent = "Generating...";
  aiBtn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/gemini-quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phrase })
    });

    const data = await res.json();

    if (data.error) {
      console.error("Gemini API error:", data.error);
      document.getElementById("quote").innerHTML = "Could not generate a quote. Try again.";
      return;
    }

    displayQuote(data.text, data.author);
  } catch (err) {
    console.error("AI quote error:", err);
    document.getElementById("quote").innerHTML = "Could not reach AI. Please try again.";
  } finally {
    startCooldown(aiBtn);
  }
}
