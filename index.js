let quotes = [];
let API_URL = "https://quote-generator-5qei.onrender.com";

let colors = [
  "#49B587", "#FF6F61", "#FFD700", "#6A5ACD", "#FF8C00",
  "#00CED1", "#FF69B4", "#8A2BE2", "#20B2AA", "#FF4500",
  "#00FA9A", "#FF1493"
];

let darkColors = [
  "#121212", "#1E1E1E", "#2C2C2C", "#3A3A3A", "#2F4F4F",
  "#36454F", "#2E2B5F", "#4B3832", "#22313F"
];

let darkMode = false;
let usedQuotes = [];
let usedColours = [];


function newQuote() {
  if (quotes.length === 0) return;
  if (usedQuotes.length === quotes.length) {
    usedQuotes = [];
  }

  const available = quotes.map((_, i) => i).filter(i => !usedQuotes.includes(i));
  const quoteIndex = available[Math.floor(Math.random() * available.length)];
  usedQuotes.push(quoteIndex);

  let quote = quotes[quoteIndex];
  document.getElementById("quote").innerHTML =
    `"${quote.text}" <span class="author">${quote.author}</span>`;

  let quoteElem = document.getElementById("quote");
  quoteElem.classList.remove("fade"); // reset if still on
  void quoteElem.offsetWidth; 
  quoteElem.classList.add("fade");

  changeBackground();
}

function changeBackground() {
  let palette = darkMode ? darkColors : colors;
  const available = palette.map((_, i) => i).filter(i => !usedColours.includes(i));
  const randomIndex = available[Math.floor(Math.random() * available.length)];
  usedColours.push(randomIndex);
  document.body.style.backgroundColor = palette[randomIndex];
  if (usedColours.length === palette.length) usedColours = [];
}

function copyQuote() {
  let quoteText = document.getElementById("quote").innerText; 
  navigator.clipboard.writeText(quoteText).then(() => {
    let copyBtn = document.getElementById("copybtn");
    let oldText = copyBtn.innerText;
    copyBtn.innerText = "Copied!";
    setTimeout(() => {
      copyBtn.innerText = oldText;
    }, 1500);
  });
}

function toggleMode() {
  darkMode = !darkMode;
  document.body.classList.toggle("dark-mode");

  let btn = document.getElementById("modeToggle");
  btn.classList.toggle("active");
  let ball = document.querySelector(".toggle-ball");

  ball.textContent = darkMode ? "🌞" : "🌙";

  document.body.style.backgroundColor = darkMode ? "#121212" : "#49B587";
}


//The category section

let selectedCategory = null;

document.querySelectorAll(".cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const category = btn.dataset.category;
    const isSame = selectedCategory === category;

    // Clear all active states
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));

    if (isSame) {
      // Deselect → go back to random
      selectedCategory = null;
      fetchQuotes();
    } else {
      // Select new category
      selectedCategory = category;
      btn.classList.add("active");
      fetchQuotes(category);
    }

    console.log("Selected category:", selectedCategory);
  });
});


//fetching quotes from backend

async function fetchQuotes(category = null) {
  try {
    let url = category
      ? `${API_URL}/quotes/category/${category}`
      : `${API_URL}/quotes`;

    const res = await fetch(url);
    quotes = await res.json();

    usedQuotes = []; // reset used quotes when new data loads
    usedColours = [];
    newQuote();
  } catch (err) {
    console.error("Backend not available:", err);
  }
}

fetchQuotes();


function toggleClearBtn() {
  const input = document.getElementById("ai-input");
  const clearBtn = document.getElementById("clear-btn");
  clearBtn.style.display = input.value.length > 0 ? "flex" : "none";
}

function clearAIInput() {
  document.getElementById("ai-input").value = "";
  document.getElementById("clear-btn").style.display = "none";
  document.getElementById("ai-input").focus();
}

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

    const quoteElem = document.getElementById("quote");
    quoteElem.innerHTML = `"${data.text}" <span class="author">${data.author}</span>`;
    quoteElem.classList.remove("fade");
    void quoteElem.offsetWidth;
    quoteElem.classList.add("fade");

    changeBackground();
  } catch (err) {
    console.error("AI quote error:", err);
    document.getElementById("quote").innerHTML = "Could not reach AI. Please try again.";
  } finally {
    aiBtn.textContent = "Ask Gemini";
    aiBtn.disabled = false;
  }
}
