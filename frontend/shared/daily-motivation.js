/* =========================================================
   RIZA HABIT TRACKER | DAILY MOTIVATION QUOTES
   
   Purpose: 
   - Provides daily inspirational quotes for habit building
   - Consistent quote system across multiple pages
   - Day-based rotation with manual refresh option
   
   Used By:
   - dashboard.html (motivation card)
   - habits.html (daily overview card)
   - progress.html (motivation section)
   
   Features:
   - 10 curated quotes with categories
   - Day-based automatic rotation (changes daily)
   - Manual refresh button support
   - Category badges for quote themes
   - Global function access for compatibility
   
   Quote Categories:
   - Consistency, Discipline, Growth, Commitment
   - Mindset, Action, Persistence, Motivation, Courage
   
   Data Flow:
   1. Page loads → setDailyMotivation() called
   2. Current day determines quote index
   3. Quote text and category displayed in DOM
   4. User can manually refresh for next quote
   
   DOM Elements Required:
   - #motivationText (blockquote for quote text)
   - #quoteCategory (span for category badge)
   - #refreshQuote (button for manual refresh)

   Author: John Denis Nyagah
   ========================================================= */

/* =========================================================
   QUOTE DATABASE
   Purpose: Array of motivational quotes with categories
   
   Structure:
   - text: Quote content (string)
   - category: Theme classification (string)
   
   Total Quotes: 10
   Rotation: Based on day of week (0-6, wraps with modulo)
   ========================================================= */
const MOTIVATION_QUOTES = [
  {
    text: "Small consistent steps lead to big changes.",
    category: "Consistency",
  },
  {
    text: "Discipline is choosing what you want most over what you want now.",
    category: "Discipline",
  },
  {
    text: "Tiny habits. Massive results.",
    category: "Growth",
  },
  {
    text: "Show up today. Your future self will thank you.",
    category: "Commitment",
  },
  {
    text: "Progress, not perfection.",
    category: "Mindset",
  },
  {
    text: "One day or day one — you decide.",
    category: "Action",
  },
  {
    text: "Success is the sum of small efforts repeated daily.",
    category: "Persistence",
  },
  {
    text: "Your only limit is you.",
    category: "Motivation",
  },
  {
    text: "Don't wait for opportunity. Create it.",
    category: "Action",
  },
  {
    text: "Every accomplishment starts with the decision to try.",
    category: "Courage",
  },
];

/* =========================================================
   STATE MANAGEMENT
   ========================================================= */

/**
 * Current quote index
 *
 * Initialization:
 * - Uses current day of week (0-6)
 * - Modulo operation ensures index stays within array bounds
 * - Example: Sunday (0) → quote 0, Wednesday (3) → quote 3
 *
 * Updates:
 * - Changes when user clicks refresh button
 * - Cycles through quotes sequentially
 */
let currentQuoteIndex = new Date().getDay() % MOTIVATION_QUOTES.length;

/* =========================================================
   QUOTE DISPLAY FUNCTION
   ========================================================= */

/**
 * Set or update the daily motivation quote in the DOM
 *
 * Purpose:
 * - Displays motivational quote based on day or user action
 * - Updates both quote text and category badge
 * - Supports automatic (day-based) and manual (next) modes
 *
 * Algorithm:
 * 1. Check if DOM elements exist
 * 2. Determine quote index (day-based or next)
 * 3. Get quote from array
 * 4. Update quote text with quotation marks
 * 5. Update category badge if element exists
 *
 * @param {boolean} useNext - If true, advance to next quote; if false, use day-based index
 *
 * Behavior:
 * - useNext = false (default): Quote based on current day
 * - useNext = true: Advance to next quote in sequence
 *
 * DOM Updates:
 * - #motivationText: Quote with quotation marks
 * - #quoteCategory: Category badge text
 *
 * Example Usage:
 * ```javascript
 * setDailyMotivation();        // Day-based quote
 * setDailyMotivation(true);    // Next quote in sequence
 * ```
 *
 * Error Handling:
 * - Returns early if motivationText element not found
 * - Category update skipped if element doesn't exist
 */
function setDailyMotivation(useNext = false) {
  // Get DOM elements
  const motivationText = document.getElementById("motivationText");
  const categoryEl = document.getElementById("quoteCategory");

  // Guard: Exit if main element doesn't exist
  if (!motivationText) return;

  // Determine quote index based on mode
  if (useNext) {
    // Manual mode: Advance to next quote (wraps around at end)
    currentQuoteIndex = (currentQuoteIndex + 1) % MOTIVATION_QUOTES.length;
  } else {
    // Automatic mode: Use day-based index
    currentQuoteIndex = new Date().getDay() % MOTIVATION_QUOTES.length;
  }

  // Get quote object from array
  const quote = MOTIVATION_QUOTES[currentQuoteIndex];

  // Update quote text with quotation marks
  motivationText.textContent = `"${quote.text}"`;

  // Update category badge (if element exists)
  if (categoryEl) {
    categoryEl.textContent = quote.category;
  }
}

/* =========================================================
   INITIALIZATION & EVENT LISTENERS
   ========================================================= */

/**
 * Initialize motivation system when DOM is ready
 *
 * Sequence:
 * 1. Wait for DOMContentLoaded event
 * 2. Display initial quote (day-based)
 * 3. Setup refresh button if it exists
 *
 * Refresh Button:
 * - Element ID: #refreshQuote
 * - Click action: Show next quote in sequence
 * - Optional: Only added if button exists on page
 */
document.addEventListener("DOMContentLoaded", () => {
  // Display initial quote based on current day
  setDailyMotivation();

  // Setup refresh button functionality if element exists
  const refreshBtn = document.getElementById("refreshQuote");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      setDailyMotivation(true); // Pass true to get next quote
    });
  }
});

/* =========================================================
   GLOBAL EXPORT (Backward Compatibility)
   Purpose: Make function available to non-module scripts
   
   Note: This allows calling from inline scripts or legacy code
   Modern code should import this module instead
   ========================================================= */
window.setDailyMotivation = setDailyMotivation;
