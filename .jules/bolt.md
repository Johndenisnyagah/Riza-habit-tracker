## 2025-05-14 - [Frontend N+1 Query Pattern]
**Learning:** The application exhibits a classic N+1 performance bottleneck where it fetches check-ins individually for every habit on the dashboard and habits pages. This leads to redundant network requests (1 + N habits) every time the UI refreshes.
**Action:** Consolidate these into a single "get all check-ins" API call to reduce network overhead and improve perceived performance.
