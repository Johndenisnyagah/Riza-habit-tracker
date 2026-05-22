## 2025-05-14 - [Frontend N+1 Query Pattern]
**Learning:** The application exhibits a classic N+1 performance bottleneck where it fetches check-ins individually for every habit on the dashboard and habits pages. This leads to redundant network requests (1 + N habits) every time the UI refreshes.
**Action:** Consolidate these into a single "get all check-ins" API call to reduce network overhead and improve perceived performance.

## 2026-05-18 - [Database Indexing & Algorithmic Optimization]
**Learning:** Found a critical performance bottleneck in streak calculation where every day of the streak was checking every habit against all check-ins (O(S*H*C)). Also, the backend lacked compound indexes for the most frequent check-in queries.
**Action:** Optimized the frontend by using a Set for O(1) date lookups and the backend by adding compound indexes on {habitId, userId, date} and {userId, date}. Always use Sets for date-based existence checks in long-term tracking apps.

## 2025-05-20 - [Efficient Date Processing in Loops]
**Learning:** Using `substring(0, 10)` and `Date.parse()` instead of `split("T")[0]` and `new Date()` significantly reduces garbage collection pressure and memory allocation in performance-critical calculation loops. Additionally, leveraging the backend's sort order (e.g., descending dates) allows for O(N) streak calculations by avoiding client-side sorting.
**Action:** Always prioritize `Date.parse()` for timestamp comparisons and `substring` for date extraction in high-frequency loops. Avoid `Set` and `Array.sort()` on the client when the data is already ordered.
