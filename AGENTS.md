# Repository Agent Guidelines

## Architectural Overview
- The project is a lightweight Node.js (ESM) server that exposes an OpenAI-compatible API backed by a classic ELIZA chatbot implementation.
- Core modules are:
  - `index.js` – starts the HTTP server.
  - `server.js` – owns HTTP routing, authentication checks, response formatting, and SSE streaming.
  - `eliza-bot.js` – ELIZA pattern matching and response generation, delegating test content retrieval to helper classes.
  - `lib/content-manager.js` and `lib/config-loader.js` – handle filesystem-based test content and TOML configuration loading.
- Tests live under `tests/` (Vitest) and exercise unit, integration, and validation behaviours.
- Static test content and configuration live in `test-content/`.

## General Development Principles
- Preserve the project’s minimalist architecture: prefer standard Node.js modules and small, explicit utilities over large frameworks.
- New Node.js dependencies should be minimal and must be well-justified.
- Keep the codebase ECMAScript Module (ESM) compliant; use `import`/`export` and avoid CommonJS patterns.
- Maintain clear separation of concerns between networking (`server.js`), bot logic (`eliza-bot.js`), and content/config helpers (`lib/`).
- Uphold existing streaming semantics (Server-Sent Events) and response payload shapes when extending chat functionality.
- Ensure authentication and error handling paths remain explicit and return JSON structures consistent with the current API.
- When modifying content-loading logic, retain graceful fallback behaviour when files or configuration entries are missing.
- Update documentation (e.g., `README.md`, `CONTENT_MANAGEMENT.md`) when behaviour or workflows visible to users change.

## Testing & Quality
- Prefer small, deterministic unit tests in `tests/unit/` for new logic, and expand integration/validation tests when API behaviour changes.
- Use Vitest (`npm test`) for automated verification; keep tests isolated from network or external dependencies.
- Validate new configuration or content schema changes with appropriate fixtures under `tests/fixtures/`.

## Style & Implementation Notes
- Use async/await with `try`/`catch` for asynchronous filesystem or network operations; surface actionable log messages on failures.
- Keep logging informative but concise; avoid noisy debug logs in production paths.
- Follow existing naming conventions (camelCase for variables/functions, PascalCase for classes).
- Favor pure/helper functions for reusable logic and keep modules small and focused.

## Content System Considerations
- Respect the current directory taxonomy within `test-content/`; new content types should integrate cleanly with configuration-driven discovery.
- Ensure that default/fallback content remains meaningful for automated testing scenarios.
- Preserve command mappings documented in the README when introducing new prompt controls.
