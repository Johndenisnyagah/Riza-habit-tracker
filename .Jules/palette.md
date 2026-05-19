## 2025-05-14 - [High-Contrast Focus & Dynamic Accessibility]
**Learning:** In glassmorphic UIs with frosted backgrounds, standard browser focus indicators are often nearly invisible. A thick (3px), high-contrast focus outline is necessary to maintain accessibility. Additionally, when using icon-only buttons in dynamically rendered lists, ARIA labels must be programmatically injected based on the item's context to be meaningful for screen readers.
**Action:** Always apply a 3px solid high-contrast outline for `:focus-visible` and ensure JS-rendered buttons include context-aware `aria-label` attributes.

## 2025-05-22 - [Contextual Feedback & Aria State Synchronization]
**Learning:** Destructive actions like deletion should always include the item's context (e.g., its name) in confirmation dialogs to prevent accidental data loss and increase user confidence. Furthermore, components that visual represent selection (like frequency buttons) must explicitly sync their `aria-pressed` state in JavaScript to remain accessible to screen reader users who rely on attribute-based feedback rather than visual classes.
**Action:** Include item names in destructive action confirmations and programmatically update `aria-pressed` attributes whenever an `.active` selection class is toggled.
