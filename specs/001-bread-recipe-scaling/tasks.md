---
description: "Task list for bread recipe scaling calculator implementation"
---

# Tasks: Bread Recipe Scaling Calculator

**Input**: Design documents from `/specs/001-bread-recipe-scaling/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: This feature does not explicitly request TDD or comprehensive test coverage in the spec. Tests are included as optional polish tasks at the end.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for React + TypeScript + Vite application

- [ ] T001 Create project with Vite using React + TypeScript template in project root
- [ ] T002 Install core dependencies: react-router-dom for routing in package.json
- [ ] T003 [P] Install and configure Tailwind CSS with postcss and autoprefixer in tailwind.config.js
- [ ] T004 [P] Install testing dependencies: vitest, @testing-library/react, @testing-library/jest-dom, jsdom in package.json
- [ ] T005 [P] Configure Vitest in vite.config.ts with jsdom environment and test setup
- [ ] T006 [P] Create test setup file in src/test/setup.ts
- [ ] T007 [P] Update package.json scripts with dev, build, test commands
- [ ] T008 Configure Tailwind content paths in tailwind.config.js
- [ ] T009 Setup Tailwind imports in src/index.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions, data structures, and calculation logic that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T010 [P] Create Recipe interface in src/types/recipe.ts
- [ ] T011 [P] Create Ingredient interface with IngredientType enum in src/types/recipe.ts
- [ ] T012 [P] Create Step interface with TechniqueType enum in src/types/recipe.ts
- [ ] T013 [P] Create CalculatedIngredient interface in src/types/recipe.ts
- [ ] T014 [P] Create ScalingState interface in src/types/recipe.ts
- [ ] T015 [P] Create ValidationResult and ValidationError types in src/types/recipe.ts
- [ ] T016 [P] Create JSON module declaration in src/types/json.d.ts
- [ ] T017 Implement calculateFlourWeight function in src/utils/calculations.ts
- [ ] T018 [P] Implement calculateIngredientWeight function in src/utils/calculations.ts
- [ ] T019 [P] Implement roundIngredientAmount function in src/utils/calculations.ts
- [ ] T020 Implement calculateIngredients function in src/utils/calculations.ts (depends on T018, T019)
- [ ] T021 [P] Implement validateTotalWeight function in src/utils/calculations.ts
- [ ] T022 Create sample recipe data with basic bread recipe in src/data/recipes.json

**Checkpoint**: Foundation ready - type system and calculation engine complete. User story implementation can now begin.

---

## Phase 3: User Story 1 - Browse and Select Recipe (Priority: P1) ⭐ MVP

**Goal**: Allow users to view a list of available recipes and navigate to recipe details

**Independent Test**: Visit homepage, see recipe cards displayed, click a card and verify navigation to detail page with recipe name visible

### Implementation for User Story 1

- [ ] T023 [P] [US1] Create RecipeCard component in src/components/RecipeCard.tsx
- [ ] T024 [P] [US1] Create RecipeList component in src/components/RecipeList.tsx
- [ ] T025 [US1] Setup React Router with routes for home and recipe detail in src/App.tsx
- [ ] T026 [US1] Import and configure BrowserRouter in src/App.tsx
- [ ] T027 [US1] Create route for RecipeList at "/" in src/App.tsx
- [ ] T028 [US1] Load recipes from JSON and pass to RecipeList in src/App.tsx
- [ ] T029 [US1] Style RecipeCard with Tailwind classes for card layout and hover effects
- [ ] T030 [US1] Style RecipeList with responsive grid layout in Tailwind

**Checkpoint**: Users can now browse recipes and navigate to detail pages. This is the MVP entry point.

---

## Phase 4: User Story 2 - View Recipe with Default Quantities (Priority: P2)

**Goal**: Display complete recipe information with ingredient amounts calculated from default base flour weight

**Independent Test**: Navigate to a recipe detail page, verify all ingredients show calculated gram amounts, verify preparation steps are visible with timing information

### Implementation for User Story 2

- [ ] T031 [P] [US2] Create RecipeDetail component with routing parameter in src/components/RecipeDetail.tsx
- [ ] T032 [P] [US2] Create IngredientList component in src/components/IngredientList.tsx
- [ ] T033 [P] [US2] Create StepList component in src/components/StepList.tsx
- [ ] T034 [US2] Implement recipe lookup by ID in RecipeDetail component
- [ ] T035 [US2] Calculate default flour weight and ingredients using calculation utilities
- [ ] T036 [US2] Render recipe header with name and hydration hint
- [ ] T037 [US2] Pass calculated ingredients to IngredientList component
- [ ] T038 [US2] Display ingredient rows with name, weight, and percentage in IngredientList
- [ ] T039 [US2] Pass steps to StepList component
- [ ] T040 [US2] Display step cards with title, description, timing, and temperature in StepList
- [ ] T041 [US2] Add recipe route "/recipe/:id" to App routing
- [ ] T042 [US2] Handle special ingredients with amountHint display
- [ ] T043 [US2] Display recipe notes and source attribution
- [ ] T044 [US2] Style RecipeDetail layout with Tailwind grid
- [ ] T045 [US2] Style IngredientList with Tailwind for clean ingredient rows
- [ ] T046 [US2] Style StepList with numbered steps and timing badges

**Checkpoint**: Users can now view complete recipes with all ingredients showing calculated weights and full preparation instructions.

---

## Phase 5: User Story 3 - Scale Recipe to Desired Dough Weight (Priority: P2)

**Goal**: Enable users to input custom total dough weight and see all ingredient amounts recalculate in real-time

**Independent Test**: On recipe detail page, enter a custom dough weight (e.g., 1000g) in the scaling calculator, verify all ingredient amounts update immediately to reflect the new flour weight

### Implementation for User Story 3

- [ ] T047 [P] [US3] Create ScalingCalculator component in src/components/ScalingCalculator.tsx
- [ ] T048 [US3] Add state management for desiredTotalWeight in RecipeDetail component
- [ ] T049 [US3] Implement useMemo for flour weight calculation in RecipeDetail
- [ ] T050 [US3] Implement useMemo for ingredient recalculation in RecipeDetail
- [ ] T051 [US3] Calculate total percentage sum in RecipeDetail
- [ ] T052 [US3] Implement input change handler with validation in ScalingCalculator
- [ ] T053 [US3] Display input field for total dough weight in ScalingCalculator
- [ ] T054 [US3] Display calculated flour weight and total percentage in ScalingCalculator
- [ ] T055 [US3] Display scaling status (Default vs Scaled) in ScalingCalculator
- [ ] T056 [US3] Implement error messages for validation errors in ScalingCalculator
- [ ] T057 [US3] Add callback prop for weight changes from ScalingCalculator to RecipeDetail
- [ ] T058 [US3] Wire up calculator to RecipeDetail state management
- [ ] T059 [US3] Handle null/empty input to reset to default weights
- [ ] T060 [US3] Style ScalingCalculator with Tailwind form styles
- [ ] T061 [US3] Add ScalingCalculator to RecipeDetail layout

**Checkpoint**: Users can now scale any recipe to their desired dough weight with real-time calculation updates. Core scaling functionality is complete.

---

## Phase 6: User Story 4 - Understand Baker's Percentages (Priority: P3)

**Goal**: Display baker's percentages alongside weights to help users understand recipe proportions

**Independent Test**: View any recipe detail page and verify that each ingredient shows its baker's percentage (e.g., "65%") next to the weight in grams

### Implementation for User Story 4

- [ ] T062 [US4] Add percentage display to ingredient rows in IngredientList component
- [ ] T063 [US4] Format percentage as "(XX%)" next to weight display
- [ ] T064 [US4] Ensure flour always shows "(100%)" as the base reference
- [ ] T065 [US4] Style percentage text with gray color for secondary information

**Checkpoint**: Users can now see baker's percentages to understand recipe ratios and learn professional baking techniques.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements, testing, and refinements that affect multiple user stories

- [ ] T066 [P] Add basic unit tests for calculation functions in tests/unit/calculations.test.ts
- [ ] T067 [P] Add edge case validation tests (empty input, negative values, extreme sizes) in tests/unit/calculations.test.ts
- [ ] T068 [P] Add rounding behavior tests in tests/unit/calculations.test.ts
- [ ] T069 Add integration test for RecipeDetail scaling workflow in tests/integration/RecipeDetail.test.tsx
- [ ] T070 Add more sample recipes to recipes.json (sourdough, enriched dough examples)
- [ ] T071 Add responsive breakpoints testing for mobile/tablet/desktop layouts
- [ ] T072 [P] Add ARIA labels for accessibility in form inputs
- [ ] T073 [P] Add semantic HTML improvements (nav, main, article tags)
- [ ] T074 Optimize bundle size and verify production build
- [ ] T075 Add 404 handling for invalid recipe IDs
- [ ] T076 Add loading states for async operations (if needed)
- [ ] T077 Code cleanup and remove any unused imports
- [ ] T078 Documentation: Add README with setup instructions
- [ ] T079 Documentation: Add inline code comments for complex calculations
- [ ] T080 Run quickstart.md validation steps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (Browse/Select) → No story dependencies
  - US2 (View Default) → Depends on US1 for navigation structure
  - US3 (Scale Recipe) → Depends on US2 for RecipeDetail component
  - US4 (Baker Percentages) → Depends on US2 for IngredientList component
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### Recommended Implementation Order

**MVP (Minimum Viable Product)**:
1. Phase 1: Setup → Phase 2: Foundational → Phase 3: US1
2. **STOP and VALIDATE**: Can browse recipes and view basic recipe cards
3. Continue to Phase 4 (US2) for full recipe viewing
4. Continue to Phase 5 (US3) for scaling functionality (core feature)

**Full Feature**:
1. MVP (Phases 1-5)
2. Phase 6: US4 (educational enhancement)
3. Phase 7: Polish (testing, docs, accessibility)

### Within Each User Story

- Components can be created in parallel if marked [P]
- Layout and styling happens after component logic
- Integration with parent components after component completion
- Independent testing after story completion before moving to next story

### Parallel Opportunities Per Phase

**Phase 2 (Foundational)**:
```bash
# All type definitions (T010-T016) can run in parallel
# All calculation functions (T017-T021) marked [P] can run in parallel
```

**Phase 3 (US1)**:
```bash
# RecipeCard and RecipeList components (T023, T024) can run in parallel
```

**Phase 4 (US2)**:
```bash
# RecipeDetail, IngredientList, StepList (T031-T033) can run in parallel
```

**Phase 5 (US3)**:
```bash
# ScalingCalculator can be built in parallel with state setup
```

**Phase 7 (Polish)**:
```bash
# Unit tests, documentation, accessibility (T066-T068, T072-T073, T078-T079) can run in parallel
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

This represents the core value proposition: browse recipes, view details, and scale to custom weights.

1. **Complete Phase 1: Setup** (T001-T009)
2. **Complete Phase 2: Foundational** (T010-T022) - CRITICAL BLOCKER
3. **Complete Phase 3: US1** (T023-T030) - Browse and navigate
4. **VALIDATE**: Can browse and click recipes ✓
5. **Complete Phase 4: US2** (T031-T046) - View full recipes
6. **VALIDATE**: Can see complete recipe with ingredients and steps ✓
7. **Complete Phase 5: US3** (T047-T061) - Scale recipes
8. **VALIDATE**: Can scale recipe and see updated weights ✓
9. **Deploy MVP**

### Incremental Delivery

- **Iteration 1**: Phases 1-3 → Recipe browsing (basic navigation)
- **Iteration 2**: Add Phase 4 → Full recipe viewing (complete information)
- **Iteration 3**: Add Phase 5 → Scaling functionality (core feature complete)
- **Iteration 4**: Add Phase 6 → Educational percentages
- **Iteration 5**: Add Phase 7 → Testing and polish

### Parallel Team Strategy

With multiple developers after Foundation is complete:

- **Developer A**: User Story 1 (T023-T030)
- **Developer B**: User Story 2 components (T031-T033 in parallel)
- **Developer C**: Calculation tests (T066-T068)

After US2 completes, Developer B can start US3 (T047-T061)

---

## Success Metrics & Validation

### Success Criteria Mapping

| ID | Success Criteria | Validation Tasks | Test Method |
|----|------------------|------------------|-------------|
| SC-001 | Browse/navigate within 30s | T023-T030 | Manual timing + E2E test |
| SC-002 | Detail page loads in 2s | T031-T046 | Performance profiling |
| SC-003 | Updates within 500ms | T047-T061 | Integration test with timer |
| SC-004 | 90% successful scaling | T047-T061 | User testing / E2E tests |
| SC-005 | Calculation accuracy ±1g or 1% | T017-T021, T066-T068 | Unit tests with assertions |
| SC-006 | Steps viewable | T033, T039-T040 | Manual review |
| SC-007 | Responsive 320px-1920px+ | T071 | Manual testing + Cypress viewports |

### Task Count Summary

- **Total Tasks**: 80
- **Setup (Phase 1)**: 9 tasks
- **Foundational (Phase 2)**: 13 tasks (BLOCKING)
- **User Story 1**: 8 tasks (Browse/Select - P1)
- **User Story 2**: 16 tasks (View Default - P2)
- **User Story 3**: 15 tasks (Scale Recipe - P2)
- **User Story 4**: 4 tasks (Baker Percentages - P3)
- **Polish (Phase 7)**: 15 tasks

### Parallel Opportunities

- **Phase 1**: 5 parallel tasks (T003, T004, T005, T006, T007)
- **Phase 2**: 11 parallel tasks (T010-T016, T018-T021)
- **Phase 3**: 2 parallel tasks (T023, T024)
- **Phase 4**: 3 parallel tasks (T031, T032, T033)
- **Phase 5**: 1 parallel task (T047)
- **Phase 7**: 6 parallel tasks (T066-T068, T072-T073, T078-T079)

**Total Parallelizable**: ~28 tasks (35% of all tasks)

---

## Notes

- All file paths follow single-project structure (React SPA)
- No backend or API needed (static JSON data)
- [P] tasks can run simultaneously (different files)
- [Story] labels (US1-US4) map to spec.md user stories
- Tests are optional polish tasks, not TDD (no explicit test request in spec)
- Each user story delivers independently testable value
- MVP = US1 + US2 + US3 (browse, view, scale)
- Calculation logic is pure functions (easy to test and maintain)
- React state management is simple (no Redux/Context needed)
- Mobile-first responsive design with Tailwind breakpoints

