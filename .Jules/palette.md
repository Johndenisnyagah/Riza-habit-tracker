## 2025-05-14 - [High-Contrast Focus & Dynamic Accessibility]
**Learning:** In glassmorphic UIs with frosted backgrounds, standard browser focus indicators are often nearly invisible. A thick (3px), high-contrast focus outline is necessary to maintain accessibility. Additionally, when using icon-only buttons in dynamically rendered lists, ARIA labels must be programmatically injected based on the item's context to be meaningful for screen readers.
**Action:** Always apply a 3px solid high-contrast outline for `:focus-visible` and ensure JS-rendered buttons include context-aware `aria-label` attributes.

## 2025-05-18 - [Semantic Buttons for Interactive Selection]
**Learning:** Using non-semantic `div` elements for interactive selectors (like icon or frequency pickers) prevents keyboard accessibility. Converting these to `<button type="button">` with `aria-pressed` states provides native focusability and clear state feedback to screen readers.
**Action:** Use `<button type="button">` for all selectable UI options and synchronize `aria-pressed` with the active state in JavaScript.
