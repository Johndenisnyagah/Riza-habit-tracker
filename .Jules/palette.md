## 2025-05-14 - [High-Contrast Focus & Dynamic Accessibility]
**Learning:** In glassmorphic UIs with frosted backgrounds, standard browser focus indicators are often nearly invisible. A thick (3px), high-contrast focus outline is necessary to maintain accessibility. Additionally, when using icon-only buttons in dynamically rendered lists, ARIA labels must be programmatically injected based on the item's context to be meaningful for screen readers.
**Action:** Always apply a 3px solid high-contrast outline for `:focus-visible` and ensure JS-rendered buttons include context-aware `aria-label` attributes.

## 2025-05-15 - [Modal Focus Restoration & Escape Closure]
**Learning:** Modal accessibility requires two critical behavioral features: focus restoration (returning focus to the trigger element on close) and Escape key support. Without these, keyboard users become trapped or lose their place in the UI flow.
**Action:** Implement a `previousActiveElement` tracker for all modal opening logic and add a global `keydown` listener for the 'Escape' key to ensure consistent, accessible closures.
