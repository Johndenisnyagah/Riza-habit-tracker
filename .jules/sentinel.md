## 2026-05-15 - XSS Vulnerability in Habit List Rendering
**Vulnerability:** Cross-Site Scripting (XSS) via habit name, description, and icon fields.
**Learning:** Using `innerHTML` with template literals to render user-provided data directly into the DOM creates a serious XSS vector. Even if some fields are expected to be simple strings, malicious users can inject script tags or use attribute event handlers (e.g., `onerror` on an `<img>` tag) to execute arbitrary JavaScript in the context of other users' sessions.
**Prevention:** Always escape user-provided data before injecting it into HTML templates. Use a dedicated `escapeHTML` helper function that handles tags, ampersands, and quotes. For a more robust solution, consider using `textContent` for plain text elements and a proven sanitization library like DOMPurify for complex HTML.

## 2026-05-17 - Information Leakage in API Error Responses
**Vulnerability:** Information Leakage and Email Enumeration via overly descriptive error messages.
**Learning:** Returning specific error messages like "User not found" vs "Invalid password" allows attackers to verify the existence of user accounts. Additionally, including `err.message` in 500 responses can leak sensitive database schema details or internal logic.
**Prevention:** Always use generic error messages for authentication failures (e.g., "Invalid email or password"). For server-side errors, return a standard "Server error" message without attaching the raw error object or stack trace to the response.

## 2026-05-18 - NoSQL Injection via Object Injection in Authentication Routes
**Vulnerability:** Authentication bypass or data manipulation via object injection in `req.body`.
**Learning:** In Node.js/Express applications using Mongoose, passing unsanitized user input directly from `req.body` to query methods like `findOne` or `findById` can be dangerous. If an attacker provides an object with MongoDB operators (e.g., `{ "email": { "$gt": "" } }`) instead of a string, it can lead to authentication bypass or unauthorized data access. Even if the application logic expects strings, Express's JSON parser will happily create objects if the request payload is structured that way.
**Prevention:** Always validate that incoming user input matches the expected data type. Use `typeof === "string"` checks for all fields before using them in database queries or operations. Implement schema-level validation (e.g., `match`, `minlength`) in Mongoose as a defense-in-depth measure.

## 2026-05-19 - IDOR Vulnerability in Check-in Toggle Route
**Vulnerability:** Insecure Direct Object Reference (IDOR) via `habitId` in the toggle endpoint.
**Learning:** Authenticating a user only verifies their identity, not their authorization to modify a specific resource. In the `/api/checkins/toggle` endpoint, the system was performing a `findOne` on the habit by its ID but failed to verify that the habit actually belonged to the requester. This allowed any authenticated user to create or delete check-in records for habits they did not own by simply providing a target `habitId`.
**Prevention:** Always enforce ownership checks in state-changing operations. For user-specific resources, ensure queries always include the owner's ID (e.g., `Model.findOne({ _id: resourceId, userId: req.user.id })`). This ensures that if a user attempts to access a resource they don't own, the query naturally fails to find the record, maintaining data integrity.
