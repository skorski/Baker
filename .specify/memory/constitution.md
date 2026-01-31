<!--
Sync Impact Report

- Version change: N/A (template) 6 0.1.0
- Modified principles: N/A (template placeholders 6 concrete principles)
- Added sections: Technology & Platform Constraints; Development Workflow & Quality Gates
- Removed sections: None
- Templates requiring updates:
	- 9 `.specify/templates/plan-template.md`
	- 9 `.specify/templates/spec-template.md`
	- 9 `.specify/templates/tasks-template.md`
	- 9 `.specify/templates/checklist-template.md`
	- 9 `.specify/templates/agent-file-template.md`
- Follow-up TODOs:
	- TODO(RATIFICATION_DATE): confirm original adoption date (YYYY-MM-DD)
-->

# Baker Constitution

## Core Principles

### React + Fluent UI v9 Only
Baker is a React app and MUST use Fluent UI React v9 for UI components and styling.
New UI MUST be built from Fluent v9 primitives/components; do not introduce other UI
component libraries.

### Mobile-First UX + Accessibility
All UX decisions MUST optimize for mobile screens and touch interaction first.
Accessibility is required: components MUST have appropriate labels/roles and be
usable with keyboard and screen readers where applicable.

### Tests + Interfaces (NON-NEGOTIABLE)
When making changes to the codebase:

- Every new or modified method/function MUST have unit tests.
- Every non-trivial dependency boundary MUST be represented by a TypeScript
	`interface` (e.g., storage, recipe repositories, timers, API clients).
- Implementations MUST depend on interfaces (not concretions) to keep code
	testable.

### Layered Architecture + Clear Contracts
Separate UI, state orchestration, and domain logic:

- UI components MUST remain presentation-focused.
- Domain logic MUST be deterministic where possible and isolated from IO.
- Side effects (persistence, network calls, time) MUST go through interfaces.

### Backend-Ready Recipe Data + Export Path
We will eventually add a Python backend that allows users to modify recipes and
record completion.

- Recipe data packaged into the frontend MUST be stored in a portable, versioned
	format (e.g., JSON with a schema/version field).
- Frontend code MUST be written so a future backend can replace packaged data
	without rewriting UI (swap via interfaces).
- If a Python section exists, it MAY provide an export tool that generates the
	packaged recipes used by the frontend.

## Technology & Platform Constraints

- Frontend is a React app intended to run on mobile.
- UI MUST use Fluent UI React v9.
- TypeScript is the default language for frontend code to support interfaces.
- Data formats that may cross the frontend/backend boundary MUST be explicit and
	versioned.

## Development Workflow & Quality Gates

- PRs MUST include unit tests for all new/changed methods.
- PRs MUST introduce/adjust interfaces when adding new dependencies or seams.
- Prefer small, incremental changes that keep the app releasable.
- If requirements are ambiguous, implement the simplest behavior that satisfies
	the spec and preserves mobile usability.

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

This constitution supersedes all other project guidance.

- **Compliance review**: Every PR/review MUST verify compliance with the Core
	Principles.
- **Amendments**: Amendments MUST update this file and any affected
	`.specify/templates/*` documents in the same change.
- **Versioning**: Constitution changes follow semantic versioning:
	- MAJOR: breaking governance change or principle removal/redefinition
	- MINOR: new principle/section added or materially expanded
	- PATCH: clarifications/typos/non-semantic refinements

**Version**: 0.1.0 | **Ratified**: TODO(RATIFICATION_DATE): confirm original adoption date (YYYY-MM-DD) | **Last Amended**: 2025-12-28
