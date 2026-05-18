## 2026-05-15 - XSS Vulnerability in Habit List Rendering
**Vulnerability:** Cross-Site Scripting (XSS) via habit name, description, and icon fields.
**Learning:** Using `innerHTML` with template literals to render user-provided data directly into the DOM creates a serious XSS vector. Even if some fields are expected to be simple strings, malicious users can inject script tags or use attribute event handlers (e.g., `onerror` on an `<img>` tag) to execute arbitrary JavaScript in the context of other users' sessions.
**Prevention:** Always escape user-provided data before injecting it into HTML templates. Use a dedicated `escapeHTML` helper function that handles tags, ampersands, and quotes. For a more robust solution, consider using `textContent` for plain text elements and a proven sanitization library like DOMPurify for complex HTML.

## 2026-05-17 - Information Leakage in API Error Responses
**Vulnerability:** Information Leakage and Email Enumeration via overly descriptive error messages.
**Learning:** Returning specific error messages like "User not found" vs "Invalid password" allows attackers to verify the existence of user accounts. Additionally, including `err.message` in 500 responses can leak sensitive database schema details or internal logic.
**Prevention:** Always use generic error messages for authentication failures (e.g., "Invalid email or password"). For server-side errors, return a standard "Server error" message without attaching the raw error object or stack trace to the response.
