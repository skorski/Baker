# Implementation Plan: Bread Recipe Scaling Calculator

**Branch**: `001-bread-recipe-scaling` | **Date**: 2025-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-bread-recipe-scaling/spec.md`

## Summary

This feature implements a web-based bread recipe scaling calculator that allows home bakers to view bread recipes and scale ingredient amounts based on desired total dough weight using baker'\''s percentages. The application provides recipe browsing, detailed recipe views with ingredient lists and preparation steps, and real-time calculation updates as users input custom dough weights.

**Primary Requirement**: Display bread recipes with baker'\''s percentage-based ingredients and enable real-time scaling to user-specified total dough weights.

**Technical Approach**: React single-page application with Vite build system, TypeScript for type safety, Tailwind CSS for styling, and pure calculation functions for baker'\''s percentage math. Recipe data stored in JSON format, bundled with the application. No backend or database required.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18, Node.js 18+
**Primary Dependencies**: React 18, Vite 5, React Router DOM 6, Tailwind CSS 3
**Storage**: JSON files (recipes stored as static data, bundled with app)
**Testing**: Vitest (unit/integration), React Testing Library, Cypress (E2E)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
**Project Type**: Web application (single-page application, frontend only)
**Performance Goals**: 
- Ingredient amounts update within 500ms when scaling
- Recipe detail pages load within 2 seconds
- Support 50+ recipes without performance degradation
**Constraints**: 
- Recipe data from static JSON (no user-created recipes)
- Measurements in grams only (no unit conversion)
- English language only (no i18n in MVP)
- No authentication or user accounts
**Scale/Scope**: 
- 50-100 recipes expected
- < 20 ingredients per recipe typical
- 5-15 preparation steps per recipe
- Single user (no concurrent editing concerns)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASS (Constitution file is template-only, no project-specific constraints defined)

**Notes**: The constitution.md file contains only template placeholders and no actual project principles. No architectural constraints, testing requirements, or design patterns are mandated. This feature implementation has full flexibility in technical choices.

**Re-evaluation Post-Design**: No constitutional violations introduced. Design follows standard React best practices with component-based architecture, pure functions for business logic, and comprehensive testing strategy.

## Project Structure

### Documentation (this feature)

```text
specs/001-bread-recipe-scaling/
├── plan.md              # This file (implementation plan)
├── research.md          # Technology choices and architecture decisions
├── data-model.md        # Entity definitions and data structures
├── quickstart.md        # Developer setup and implementation guide
├── contracts/           # API and component interface definitions
│   ├── components.md    # React component props and contracts
│   └── calculations.md  # Calculation functions and algorithms
└── tasks.md             # NOT created by /speckit.plan (created by /speckit.tasks)
```

### Source Code (repository root)

```text
baker-app/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── RecipeList.tsx
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeDetail.tsx
│   │   ├── ScalingCalculator.tsx
│   │   ├── IngredientList.tsx
│   │   └── StepList.tsx
│   ├── types/           # TypeScript type definitions
│   │   ├── recipe.ts
│   │   └── json.d.ts
│   ├── utils/           # Pure calculation functions
│   │   └── calculations.ts
│   ├── data/            # Static recipe JSON files
│   │   └── recipes.json
│   ├── test/            # Test configuration
│   │   └── setup.ts
│   ├── App.tsx          # Main app component with routing
│   ├── main.tsx         # Entry point
│   └── index.css        # Tailwind imports
├── tests/
│   ├── unit/            # Unit tests for calculation logic
│   │   └── calculations.test.ts
│   ├── integration/     # Integration tests for components
│   │   ├── RecipeDetail.test.tsx
│   │   └── ScalingCalculator.test.tsx
│   └── e2e/             # End-to-end tests
│       └── recipe-flow.cy.ts
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration with Vitest
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

**Structure Decision**: Selected **Web application** structure (frontend only) because:
- Feature requires interactive UI with real-time updates (recipe browsing, scaling calculations)
- No backend needed (recipes from static JSON per spec assumptions)
- Single-page application pattern optimal for smooth navigation without page reloads
- All business logic (baker'\''s percentage calculations) runs client-side
- No API layer required since data is bundled with application

**Key Directories**:
- `src/components/`: React components organized by responsibility (list, detail, calculator, etc.)
- `src/utils/`: Pure calculation functions (testable without React dependencies)
- `src/types/`: Centralized TypeScript interfaces for type safety
- `src/data/`: Static JSON recipe files (version controlled with code)
- `tests/`: Organized by test type (unit, integration, E2E)

## Complexity Tracking

No constitution violations or complexity concerns. Constitution file contains only template placeholders.

**Architectural Simplicity**:
- Single project (no monorepo needed)
- Direct prop drilling for state (no Redux/Context needed - component tree is shallow)
- Pure functions for calculations (no side effects, easy to test)
- Static JSON data (no database, no ORM)
- No authentication layer (recipes are public)
- Standard React patterns (no custom abstractions)

## Phase 0: Research (Complete)

**Status**: ✅ Complete - See [research.md](./research.md)

**Key Decisions**:
1. **React + Vite**: Optimal for fast development and real-time UI updates
2. **Tailwind CSS**: Utility-first styling for rapid responsive design
3. **Vitest + React Testing Library**: Vite-native testing with behavior-focused tests
4. **JSON storage**: Simple, version-controlled recipe data
5. **Pure calculation functions**: Testable, predictable baker'\''s percentage math

**Resolved Questions**:
- Rounding strategy: Context-sensitive (1 decimal for < 10g, whole numbers for >= 10g)
- Validation approach: Client-side with helpful warnings for edge cases
- Component architecture: Parent state management with prop drilling (no state management library needed)
- Responsive strategy: Mobile-first with Tailwind breakpoints

## Phase 1: Design & Contracts (Complete)

**Status**: ✅ Complete

**Artifacts Created**:
1. **[data-model.md](./data-model.md)**: Complete entity definitions
   - Recipe, Ingredient, Step (stored entities)
   - CalculatedIngredient, ScalingState (runtime entities)
   - Validation rules and relationships
   - TypeScript interfaces with field descriptions

2. **[contracts/components.md](./contracts/components.md)**: Component interfaces
   - Props for all React components
   - Component hierarchy and data flow
   - Testing contracts for unit/integration/E2E

3. **[contracts/calculations.md](./contracts/calculations.md)**: Calculation API
   - Core formulas (flour weight calculation, ingredient scaling)
   - Rounding algorithms
   - Validation logic
   - Performance benchmarks

4. **[quickstart.md](./quickstart.md)**: Developer implementation guide
   - Step-by-step setup instructions
   - Complete code examples for all components
   - Testing examples
   - Troubleshooting guide

**Design Highlights**:
- **Data Model**: Simple JSON structure with TypeScript interfaces for type safety
- **Calculation Logic**: Pure functions following baker'\''s percentage formulas
- **Component Design**: Unidirectional data flow (props down, events up)
- **State Management**: Parent component (RecipeDetail) owns scaling state
- **Performance**: All calculations < 1ms, UI updates < 100ms (5x under requirement)

## Phase 2: Implementation Planning

**Status**: ⏸️ Paused - Use `/speckit.tasks` command to generate tasks.md

**Next Command**: `/speckit.tasks` to create actionable task breakdown

**Expected Task Categories**:
1. Project setup (Vite + React + TypeScript + Tailwind + Vitest)
2. Type definitions (recipe.ts interfaces)
3. Calculation functions (calculations.ts with tests)
4. Component implementation (RecipeList → RecipeCard → RecipeDetail → etc.)
5. Recipe data creation (recipes.json with sample data)
6. Routing setup (React Router configuration)
7. Styling (Tailwind classes, responsive design)
8. Testing (unit tests for calculations, integration tests for components)
9. E2E testing (Cypress flows)
10. Build and deployment preparation

## Success Criteria Mapping

| Success Criteria | Implementation Strategy | Validation Method |
|------------------|------------------------|-------------------|
| SC-001: Browse/navigate within 30s | Prominent recipe cards on landing page with click-to-detail | E2E test timing |
| SC-002: Detail page loads in 2s | JSON bundled with app (no async loading) | Performance profiling |
| SC-003: Updates within 500ms | Pure function calculations (< 1ms) + React re-render (< 50ms) | Integration test with timer |
| SC-004: 90% successful scaling | Clear UI, input validation, helpful error messages | User testing / E2E tests |
| SC-005: Calculation accuracy ±1g or 1% | Context-sensitive rounding, comprehensive unit tests | Unit tests with assertions |
| SC-006: Steps viewable without external refs | Complete timing, temperature, dependency info in each step | Manual review |
| SC-007: Responsive 320px-1920px+ | Mobile-first Tailwind design with breakpoints | Manual testing + Cypress viewports |

## Risks & Mitigations

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| User confusion about baker'\''s percentages | Medium | Clear help text, show both % and weights | Addressed in design |
| Floating-point calculation errors | Low | Consistent rounding, comprehensive tests | Addressed in algorithm |
| Poor mobile UX | High | Mobile-first design, simplify layouts for small screens | Addressed in architecture |
| Accessibility barriers | Medium | Semantic HTML, ARIA labels, screen reader testing | Documented in research |

## Dependencies & Prerequisites

**External Dependencies** (from package.json):
- React 18+ and React DOM 18+
- React Router DOM 6+
- Vite 5+ (build tool)
- TypeScript 5+ (language)
- Tailwind CSS 3+ (styling)
- Vitest (testing framework)
- @testing-library/react (component testing)
- Cypress (E2E testing - optional)

**Data Prerequisites**:
- Recipe JSON files must be prepared with:
  - Valid baker'\''s percentages (flour = 100%, percentages sum correctly)
  - Complete step information (timing, temperature, dependencies)
  - At least 2-3 recipes for testing (simple and complex examples)

**Development Environment**:
- Node.js 18+ installed
- Modern code editor (VS Code recommended)
- Git for version control
- Modern web browser for testing

## Implementation Notes

### Baker'\''s Percentage Primer

For developers unfamiliar with baker'\''s percentages:
- **Flour is always 100%** (the base reference)
- All other ingredients are percentages relative to flour weight
- Example: 65% water means 65g water per 100g flour
- Total dough weight = flour × (sum of all percentages ÷ 100)
- To scale: calculate flour needed, then multiply all ingredients by flour weight

### Calculation Example

Given recipe with flour (100%), water (65%), salt (2%), yeast (2%):
- Total percentage: 169%
- Desired total dough: 1000g
- **Flour needed**: (1000 × 100) ÷ 169 = 591.7g
- **Water**: (591.7 × 65) ÷ 100 = 384.6g
- **Salt**: (591.7 × 2) ÷ 100 = 11.8g
- **Yeast**: (591.7 × 2) ÷ 100 = 11.8g
- **Verify**: 591.7 + 384.6 + 11.8 + 11.8 = 999.9g ✓

### Component Hierarchy Visualization

```
┌─────────────────────────────────────────┐
│ App (Router)                            │
├─────────────────────────────────────────┤
│ Route "/"                               │
│   RecipeList                            │
│   └─ RecipeCard (×N)                    │
├─────────────────────────────────────────┤
│ Route "/recipe/:id"                     │
│   RecipeDetail [owns state]             │
│   ├─ ScalingCalculator                  │
│   │    [input → callback → state update]│
│   ├─ IngredientList                     │
│   │  └─ IngredientRow (×N)              │
│   │     [receives calculated weights]   │
│   └─ StepList                           │
│      └─ StepCard (×N)                   │
└─────────────────────────────────────────┘
```

### State Flow

```
User enters total weight in ScalingCalculator
  ↓
ScalingCalculator.onTotalWeightChange callback
  ↓
RecipeDetail.setDesiredTotalWeight (state update)
  ↓
useMemo recalculates flourWeight
  ↓
useMemo recalculates ingredients with new flour weight
  ↓
IngredientList re-renders with updated calculated ingredients
  ↓
UI shows new weights (< 100ms total time)
```

## Reference Documentation

- **[research.md](./research.md)**: Technology choices, alternatives considered, architecture decisions
- **[data-model.md](./data-model.md)**: Complete entity definitions with TypeScript interfaces
- **[contracts/components.md](./contracts/components.md)**: React component props and interfaces
- **[contracts/calculations.md](./contracts/calculations.md)**: Calculation algorithms and formulas
- **[quickstart.md](./quickstart.md)**: Step-by-step implementation guide with code examples

## Approval & Sign-off

This implementation plan is ready for review. Next steps:

1. **Review this plan**: Ensure technical approach aligns with project goals
2. **Run `/speckit.tasks`**: Generate actionable task breakdown
3. **Begin implementation**: Follow quickstart.md for step-by-step guidance

**Plan Version**: 1.0
**Last Updated**: 2025-01-21
**Status**: ✅ Ready for implementation
