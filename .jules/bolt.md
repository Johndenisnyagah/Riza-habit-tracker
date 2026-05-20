## 2025-05-14 - [Frontend N+1 Query Pattern]
**Learning:** The application exhibits a classic N+1 performance bottleneck where it fetches check-ins individually for every habit on the dashboard and habits pages. This leads to redundant network requests (1 + N habits) every time the UI refreshes.
**Action:** Consolidate these into a single "get all check-ins" API call to reduce network overhead and improve perceived performance.

## 2026-05-18 - [Database Indexing & Algorithmic Optimization]
**Learning:** Found a critical performance bottleneck in streak calculation where every day of the streak was checking every habit against all check-ins (O(S*H*C)). Also, the backend lacked compound indexes for the most frequent check-in queries.
**Action:** Optimized the frontend by using a Set for O(1) date lookups and the backend by adding compound indexes on {habitId, userId, date} and {userId, date}. Always use Sets for date-based existence checks in long-term tracking apps.

## 2025-05-20 - [Optimized Chart Iteration & Sunday Boundary Fix]
**Learning:** The weekly chart was iterating through the entire check-in history for every render, and the boundary logic incorrectly handled Sundays, potentially extending the week range. Using timestamps and a 'for...of' loop with an early 'break' (leveraging descending sort order) reduced complexity from O(N) to O(K) where K is weekly check-ins.
**Action:** Always hoist date boundary calculations outside loops and use early break patterns when processing sorted historical data. Handle Sunday (day 0) as an explicit edge case in weekly logic.
