# Feature Specification: Bread Recipe Scaling Calculator

**Feature Branch**: `001-bread-recipe-scaling`
**Created**: 2025-01-21
**Status**: Draft
**Input**: User description: "Create a bread recipe scaling feature that allows users to calculate ingredient amounts based on desired total dough weight using baker's percentages."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and Select Recipe (Priority: P1)

Home bakers want to quickly browse available bread recipes and select one that interests them to see its details and start baking.

**Why this priority**: This is the entry point to the entire application. Without the ability to browse and select recipes, users cannot access any other functionality. This represents the minimum viable product - users can at least view and select recipes.

**Independent Test**: Can be fully tested by loading the recipe landing page, viewing recipe cards with basic information, and clicking through to a recipe detail page. Delivers immediate value by allowing users to discover and access recipes.

**Acceptance Scenarios**:

1. **Given** a user visits the application, **When** they land on the home page, **Then** they see a collection of available bread recipes displayed as cards with recipe names and key information
2. **Given** multiple recipes are displayed, **When** a user clicks on a recipe card, **Then** they navigate to that recipe's detail page
3. **Given** a user is on a recipe detail page, **When** they view the page, **Then** they see the recipe name, complete ingredient list with default amounts, step-by-step instructions with timing, and any additional notes or source attribution

---

### User Story 2 - View Recipe with Default Quantities (Priority: P2)

Home bakers want to view a bread recipe with all ingredient amounts calculated for a standard batch size, so they can follow the recipe as-is without needing to scale it.

**Why this priority**: This provides complete recipe information in a usable format. Users get measurable ingredient quantities based on the recipe's default specifications, making it immediately actionable for baking.

**Independent Test**: Can be fully tested by navigating to a recipe detail page and verifying that all ingredients show specific gram measurements calculated from the recipe's base flour weight. Users can copy these measurements and bake the recipe.

**Acceptance Scenarios**:

1. **Given** a user views a recipe detail page, **When** the page loads, **Then** each ingredient displays a calculated amount in grams based on the recipe's default base flour weight
2. **Given** ingredients are listed with percentages (baker's percentage method), **When** calculations are applied, **Then** flour shows its base amount, and all other ingredients show amounts proportional to the flour
3. **Given** some ingredients have special handling (like "as needed" items), **When** displayed, **Then** these show appropriate hints instead of calculated amounts
4. **Given** a user views recipe steps, **When** reading instructions, **Then** each step shows its title, detailed description, timing information (active and passive time), optimal temperature if applicable, and any dependencies on previous steps

---

### User Story 3 - Scale Recipe to Desired Dough Weight (Priority: P2)

Home bakers want to input their desired total dough weight and have all ingredient amounts automatically recalculated, so they can make exactly the amount of bread they need for their specific pan size, yield requirements, or preferences.

**Why this priority**: This is the core value proposition of the calculator feature. It enables users to adapt recipes to their specific needs rather than being locked into the default batch size. This directly addresses the baker's percentage calculation problem that manual scaling would require.

**Independent Test**: Can be fully tested by entering different dough weights into the calculator on a recipe detail page and verifying that all ingredient amounts update correctly and proportionally. Delivers value by enabling custom batch sizes.

**Acceptance Scenarios**:

1. **Given** a user is viewing a recipe detail page, **When** they locate the scaling calculator input field, **Then** they can enter a desired total dough weight in grams
2. **Given** a user enters a new total dough weight, **When** the calculation is triggered, **Then** the system determines the flour weight needed to achieve that total weight based on all ingredient percentages
3. **Given** the flour weight is calculated, **When** ingredient amounts are updated, **Then** each ingredient shows a new amount calculated proportionally to the new flour weight using its percentage
4. **Given** ingredient amounts are recalculated, **When** the user views the updated recipe, **Then** all amounts update in real-time without requiring a page refresh
5. **Given** a user has scaled the recipe, **When** they view ingredients with special handling, **Then** these continue to show appropriate hints rather than calculated amounts

---

### User Story 4 - Understand Baker's Percentages (Priority: P3)

Home bakers who are learning bread baking want to see the baker's percentage for each ingredient alongside its weight, so they can understand the recipe structure and learn professional baking ratios.

**Why this priority**: This is an educational enhancement that helps users understand the underlying proportions. While valuable for learning, it's not essential for the primary use case of scaling and baking a recipe.

**Independent Test**: Can be fully tested by viewing a recipe and verifying that baker's percentages are displayed next to ingredient amounts. Delivers educational value for users learning professional baking methods.

**Acceptance Scenarios**:

1. **Given** a user views a recipe's ingredient list, **When** they look at each ingredient, **Then** they see the baker's percentage displayed alongside the weight amount
2. **Given** baker's percentages are shown, **When** a user views the flour entry, **Then** it shows 100% as the base reference
3. **Given** baker's percentages are shown, **When** a user views a high-hydration recipe, **Then** the water percentage clearly indicates the hydration level

---

### Edge Cases

- What happens when a user enters an extremely small total dough weight (e.g., 50g) that results in ingredient amounts too small to measure accurately?
- What happens when a user enters an extremely large total dough weight (e.g., 50,000g) that results in impractical ingredient amounts?
- How does the system handle recipes with non-standard ingredient types that don't follow typical baker's percentage rules?
- What happens when calculated ingredient amounts result in decimal places (e.g., 1.7g of yeast) - should these be rounded, and if so, how?
- How does the system behave if a user enters non-numeric input in the dough weight field?
- What happens when the sum of ingredient percentages doesn't equal the expected total for validating user input?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a collection of bread recipes on a landing page with each recipe showing its name and identifying information
- **FR-002**: System MUST allow users to navigate from the recipe landing page to detailed recipe pages
- **FR-003**: System MUST display complete recipe information including recipe name, ingredients with amounts, preparation steps, timing details, temperatures, and notes
- **FR-004**: System MUST store recipe data including unique identifiers, names, base flour weights, ingredient definitions with percentages, step-by-step instructions with timing and dependencies, and source attribution
- **FR-005**: System MUST calculate ingredient amounts based on baker's percentages where each ingredient amount equals flour weight multiplied by ingredient percentage divided by 100
- **FR-006**: System MUST display default ingredient amounts calculated from the recipe's specified base flour weight when no custom scaling is applied
- **FR-007**: Users MUST be able to input a desired total dough weight in grams via a calculator interface
- **FR-008**: System MUST recalculate all ingredient amounts when a user enters a custom total dough weight
- **FR-009**: System MUST determine flour weight from total dough weight by working backward from the sum of all ingredient percentages
- **FR-010**: System MUST update displayed ingredient amounts in real-time as users adjust the desired dough weight
- **FR-011**: System MUST handle special ingredient types that display hints (e.g., "as needed") rather than calculated amounts
- **FR-012**: System MUST display recipe steps in a sequential, ordered format with clear titles and detailed descriptions
- **FR-013**: System MUST show timing information for each step, distinguishing between active work time and passive waiting time
- **FR-014**: System MUST display temperature requirements for steps where temperature is critical
- **FR-015**: System MUST indicate step dependencies showing which steps must be completed before others can begin
- **FR-016**: System MUST display baker's percentages for each ingredient alongside weight amounts
- **FR-017**: System MUST show recipe metadata including the unit of measurement and default dough composition
- **FR-018**: System MUST display hydration percentage as a prominent hint for recipes where hydration is a key characteristic

### Key Entities

- **Recipe**: Represents a complete bread recipe with a unique identifier, descriptive name, base flour weight for calculations, hydration hint, collection of ingredients, ordered list of preparation steps, additional notes, and source attribution
- **Ingredient**: Represents a single ingredient within a recipe with an identifier, name, baker's percentage (proportion relative to flour), type classification, and optional amount hint for special cases
- **Step**: Represents a single preparation step with an identifier, title, detailed description, technique category, timing breakdown (active and passive minutes), temperature requirement, and dependencies on other steps
- **Scaling Calculator**: Represents the user's input for desired total dough weight and the resulting recalculated ingredient amounts

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can browse available recipes and navigate to a detailed recipe view within 30 seconds of landing on the application
- **SC-002**: Recipe detail pages load and display complete ingredient lists with calculated amounts within 2 seconds
- **SC-003**: Ingredient amounts update within 500 milliseconds when users enter a new desired dough weight
- **SC-004**: 90% of users successfully scale a recipe to their desired dough weight on their first attempt without errors
- **SC-005**: Ingredient calculations are accurate to within 1 gram or 1% of the calculated amount, whichever is greater
- **SC-006**: Users can view and understand recipe steps with timing and temperature information without requiring additional external references or clarification
- **SC-007**: The application displays correctly and remains functional on screens ranging from mobile devices (320px width) to large desktop monitors (1920px+ width)

## Assumptions *(mandatory)*

- Recipes are provided as curated content and are not created or edited by end users within this feature scope
- All measurements use grams as the standard unit of weight
- Users have basic familiarity with bread baking concepts or are willing to learn through practice
- Ingredient percentages in recipe data are validated and sum correctly for the baker's percentage method
- Users can accurately measure ingredients to the gram level using a digital kitchen scale
- The application is delivered as a web-based interface accessible via modern browsers
- Recipe data is loaded from a data store or static files rather than real-time external APIs

## Dependencies *(if applicable)*

- Recipe data must be available in a structured format that includes all required fields (ID, name, base flour weight, hydration hint, ingredients with percentages, steps with timing and temperature, notes, and sources)
- Test recipe data must be prepared including both a simple test recipe (flour 100%, water 65%, yeast 2%, salt 2%) and a complex example recipe (White Sandwich Bread with full step details)

## Out of Scope *(if applicable)*

- User authentication and accounts (recipes are publicly accessible without login)
- Recipe creation, editing, or deletion interfaces (recipes are curated content only)
- Saving or bookmarking favorite recipes (no personalization features)
- Sharing recipes via social media or email
- Recipe ratings, reviews, or comments
- Shopping list generation from recipe ingredients
- Measurement unit conversion (e.g., grams to ounces, cups, or tablespoons)
- Recipe nutritional information or dietary labeling
- Timer or countdown functionality for step timing
- Recipe variations or ingredient substitutions
- Print-optimized or PDF export versions of recipes
- Multi-language support (English only in initial scope)
- Recipe search or filtering by ingredients, techniques, or difficulty
