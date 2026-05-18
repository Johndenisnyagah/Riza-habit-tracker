## 2026-05-15 - XSS Vulnerability in Habit List Rendering
**Vulnerability:** Cross-Site Scripting (XSS) via habit name, description, and icon fields.
**Learning:** Using `innerHTML` with template literals to render user-provided data directly into the DOM creates a serious XSS vector. Even if some fields are expected to be simple strings, malicious users can inject script tags or use attribute event handlers (e.g., `onerror` on an `<img>` tag) to execute arbitrary JavaScript in the context of other users' sessions.
**Prevention:** Always escape user-provided data before injecting it into HTML templates. Use a dedicated `escapeHTML` helper function that handles tags, ampersands, and quotes. For a more robust solution, consider using `textContent` for plain text elements and a proven sanitization library like DOMPurify for complex HTML.

## 2026-05-17 - Information Leakage in API Error Responses
**Vulnerability:** Information Leakage and Email Enumeration via overly descriptive error messages.
**Learning:** Returning specific error messages like "User not found" vs "Invalid password" allows attackers to verify the existence of user accounts. Additionally, including `err.message` in 500 responses can leak sensitive database schema details or internal logic.
**Prevention:** Always use generic error messages for authentication failures (e.g., "Invalid email or password"). For server-side errors, return a standard "Server error" message without attaching the raw error object or stack trace to the response.

## 2026-05-20 - Insecure Verification Token Storage
**Vulnerability:** Exposure of raw email verification tokens in database.
**Learning:** Storing raw verification tokens in the database allows anyone with database access (or via SQL/NoSQL injection) to verify accounts or take over registrations. Hashing tokens (using SHA-256 or similar) ensures that even if the database is compromised, the tokens cannot be used by an attacker.
**Prevention:** Always hash sensitive tokens (verification, password reset) before storing them in the database. Use `crypto.createHash('sha256')` to hash the raw token and only store the hash. Compare the hash of the incoming token from the user's link with the stored hash.
