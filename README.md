# StockPilot

**Offline-first portfolio tracking for React Native.**

StockPilot is an independent React Native project focused on data-heavy mobile UX, local persistence, resilient state, and an architecture that can evolve from mocked market data to a production API.

## What this project demonstrates

- Portfolio valuation and unrealized P&L
- Holdings and watchlist views
- Responsive dark mobile UI
- Local persistence with AsyncStorage
- Separation between screens, data, storage and presentation components
- An offline-first foundation that keeps UI logic independent from networking

## Architecture

```
Expo Router
  ├── Screens / navigation
  │     ├── Portfolio
  │     ├── Watchlist
  │     └── Settings
  ├── Presentation components
  │     ├── Card
  │     └── HoldingRow
  ├── Typed data layer
  └── Persistence
        └── AsyncStorage snapshot
```

The boundaries are intentional: screens consume typed data and reusable components, while persistence is isolated behind storage helpers. A future API client can replace the mock source without pushing networking concerns into every screen.

## Product flow

**Portfolio → Holdings → Watchlist → Local snapshot → Future remote sync**

## Roadmap

- [x] Portfolio dashboard
- [x] Holdings and P&L
- [x] Watchlist
- [x] Dark responsive UI
- [x] AsyncStorage persistence foundation
- [ ] Live market-data API
- [ ] Sync/reconciliation queue
- [ ] Cached historical prices
- [ ] Interactive performance chart
- [ ] Authentication
- [ ] Unit and E2E coverage

## Run locally

```bash
npm install
npx expo start
```

## Independent project

StockPilot is a personal portfolio project and is not affiliated with or derived from confidential employer code or systems.

Built by **Shubham Mehta** · React Native / Mobile Engineering
