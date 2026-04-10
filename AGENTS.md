# AGENTS.md

## Project intent
This is a simple MVP web app to collect data from seed companies and estimate a preliminary carbon footprint.

## Core principles
- Build incrementally
- Prefer simple solutions
- Do not over-engineer
- Prioritize working end-to-end flows
- Keep external user experience frictionless

## UI palette

The default product palette is defined once in `src/app/app-palette.css` as CSS variables (`--palette-*`). **#066A79** is the main brand color. Tailwind maps these to `palette-*` color utilities via `globals.css` (`@theme inline`). Prefer these tokens for new UI; do not introduce other colors unless explicitly requested.

## Current scope
- External companies access the app through unique token links
- No traditional login for external users
- Unit of analysis: company + crop + season
- External users can edit drafts only
- Once submitted, only admin can make corrections

## Development order
1. conceptual model
2. minimal database design
3. minimal SQL
4. external user flow
5. basic frontend
6. calculation logic
7. admin panel
8. refinements

## Avoid unless explicitly requested
- RLS
- advanced auth
- audit/versioning systems
- future certification workflows
- excessive abstractions
- premature optimization