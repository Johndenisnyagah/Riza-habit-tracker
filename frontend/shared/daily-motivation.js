/* =========================================================
   Riza Shared Daily Motivation
   - Consistent quotes across dashboard and habits page
   - Day-based motivation quotes with categories
   ========================================================= */

// Array of motivation quotes with categories
const MOTIVATION_QUOTES = [
  {
    text: "Small consistent steps lead to big changes.",
    category: "Consistency",
  },
  {
    text: "Discipline is choosing what you want most over what you want now.",
    category: "Discipline",
  },
  { text: "Tiny habits. Massive results.", category: "Growth" },
  {
    text: "Show up today. Your future self will thank you.",
    category: "Commitment",
  },
  { text: "Progress, not perfection.", category: "Mindset" },
  { text: "One day or day one — you decide.", category: "Action" },
  {
    text: "Success is the sum of small efforts repeated daily.",
    category: "Persistence",
  },
  { text: "Your only limit is you.", category: "Motivation" },
  { text: "Don't wait for opportunity. Create it.", category: "Action" },
  {
    text: "Every accomplishment starts with the decision to try.",
    category: "Courage",
  },
];

let currentQuoteIndex = new Date().getDay() % MOTIVATION_QUOTES.length;

// Function to set the motivation text
function setDailyMotivation(useNext = false) {
  const motivationText = document.getElementById("motivationText");
  const categoryEl = document.getElementById("quoteCategory");

  if (!motivationText) return;

  // If useNext is true, go to next quote, otherwise use day-based index
  if (useNext) {
    currentQuoteIndex = (currentQuoteIndex + 1) % MOTIVATION_QUOTES.length;
  } else {
    currentQuoteIndex = new Date().getDay() % MOTIVATION_QUOTES.length;
  }

  const quote = MOTIVATION_QUOTES[currentQuoteIndex];
  motivationText.textContent = `"${quote.text}"`;

  // Update category if element exists (progress page)
  if (categoryEl) {
    categoryEl.textContent = quote.category;
  }
}

// Initialize when DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
  setDailyMotivation();

  // Add refresh button functionality if it exists
  const refreshBtn = document.getElementById("refreshQuote");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      setDailyMotivation(true); // Pass true to get next quote
    });
  }
});

// Make function available globally if needed elsewhere
window.setDailyMotivation = setDailyMotivation;
