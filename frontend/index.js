let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", author: "~ Walt Disney" },
  { text: "Don’t let yesterday take up too much of today.", author: "~ Will Rogers" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", author: "~ Vince Lombardi" },
  { text: "If you are working on something exciting, it will keep you motivated.", author: "~ Unknown" },
  { text: "Success doesn’t come to you, you go to it.", author: "~ Marva Collins" },
  { text: "Life is like a box of chocolates, you never know what you're going to get.", author: "~ Forrest Gump" },
  { text: "If you are going through hell, keep going.", author: "~ Winston Churchill" },
  { text: "If at first you don't succeed, try, try again.", author: "~ William Edward Hickson" },
  { text: "Life is about making an impact, not making an income.", author: "~ Kevin Kruse" }
];

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

  let quoteIndex = Math.floor(Math.random() * quotes.length);
    while (usedQuotes.includes(quoteIndex)) {
    quoteIndex = Math.floor(Math.random() * quotes.length);
  }
  usedQuotes.push(quoteIndex);

  let quote = quotes[quoteIndex];
  document.getElementById("quote").innerHTML =
    `"${quote.text}" <span class="author">${quote.author}</span>`;

  let quoteElem = document.getElementById("quote");
  quoteElem.classList.remove("fade"); // reset if still on
  void quoteElem.offsetWidth; 
  quoteElem.classList.add("fade");

  if (usedQuotes.length === quotes.length) {
    usedQuotes = [];
  }

  //background colour changing

  let palette = darkMode ? darkColors : colors;
  let randomIndex = Math.floor(Math.random() * palette.length);
    while (usedColours.includes(randomIndex)) {
      randomIndex = Math.floor(Math.random() * palette.length);
    }
  usedColours.push(randomIndex);

  document.body.style.backgroundColor = palette[randomIndex];
  if(usedColours.length === palette.length) {
    usedColours = [];
  }
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
  btn.addEventListener("click", function() {
    // Deselect if same button is clicked again
    if (selectedCategory === this.dataset.category) {
      selectedCategory = null;
      this.classList.remove("active");
    } else {
      // Clear previous selection
      document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      selectedCategory = this.dataset.category;
      this.classList.add("active");
    }

    // Debug check
    console.log("Selected category:", selectedCategory);
  });
});