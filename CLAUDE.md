# Римские Шторы — Client Management App

## Tech Stack

- **Runtime:** Bun

## Commands

- `bun dev` — start dev server (Next.js + Convex)
- `bun run build` — production build
- `bun run lint` — ESLint
- `npx convex dev` — run Convex dev backend separately if needed

## Key Conventions

- UI text and labels are in Russian
- Auth-protected pages wrap content in `<AuthGuard>`
- Convex functions use `getAuthUserId()` for auth checks
- After finishing a new feature, write tests that cover edge cases
- **No personal data collection:** Do not store, save, or collect any personal data of clients. Avoid saving any client information
- Do not use browser APIs (e.g., `alert()`, `confirm()`, `prompt()`) for popups or dialogs — use UI component libraries instead
