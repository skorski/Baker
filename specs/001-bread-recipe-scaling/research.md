# Research: Bread Recipe Scaling Calculator

**Feature**: 001-bread-recipe-scaling
**Date**: 2025-01-21
**Status**: Complete

## Overview

This document captures research decisions for implementing a web-based bread recipe scaling calculator using baker's percentages. The application must display recipes, calculate ingredient amounts, and allow users to scale recipes to desired dough weights with real-time updates.

## Technology Stack Decisions

### Frontend Framework

**Decision**: React + Vite

**Rationale**:
- **Real-time calculations**: React's reactive state management (useState, useEffect) naturally handles instant updates as users adjust scaling inputs
- **Component reusability**: Recipe cards, ingredient lists, and scaling calculators become modular, DRY components that can be easily tested and maintained
- **SPA experience**: No page reloads needed; smooth navigation between recipe browsing and detail pages
- **Responsive design**: Modern CSS frameworks (Tailwind CSS recommended) integrate seamlessly with React
- **Rich ecosystem**: Access to mature UI libraries, form handling, and utility packages
- **Fast development**: Vite provides instant hot module replacement and optimized builds
- **Developer experience**: JSX makes it easy to visualize component structure and maintain HTML-like syntax

**Alternatives Considered**:
1. **Vue.js**: Similar benefits to React but overkill for this scope. React has better job market demand and more resources for learning.
2. **Vanilla JavaScript**: Would become unmaintainable with complex state management needed for real-time calculations across multiple components.
3. **Static Site Generators (Hugo/Jekyll)**: Poor fit because they're designed for static content. Dynamic calculations would require bolting on JavaScript, adding unnecessary complexity.
4. **Svelte**: Interesting option with great performance, but smaller ecosystem and less community support compared to React.

### Testing Framework

**Decision**: Vitest + React Testing Library + Cypress

**Rationale**:
- **Vitest**: Vite-native testing framework with ultra-fast test execution. Uses the same config as Vite, reducing setup complexity.
- **React Testing Library**: Focuses on testing user behavior rather than implementation details. Encourages accessible, maintainable tests.
- **Cypress**: For end-to-end testing of complete user flows (browse recipes → select → scale → verify calculations).

**Test Strategy**:
- **80% Unit Tests**: Critical for baker'\''s percentage math accuracy
  - Calculation functions: flour weight derivation, ingredient scaling
  - Edge cases: decimal rounding, percentage validation, extreme values
- **15% Integration Tests**: State updates trigger correct recalculations
  - Component integration with calculation service
  - Real-time updates when dough weight input changes
- **5% E2E Tests**: Validate user flows work end-to-end
  - Recipe browsing and navigation
  - Complete scaling workflow

### Styling Approach

**Decision**: Tailwind CSS

**Rationale**:
- **Utility-first**: Rapid prototyping with pre-built classes
- **Responsive design**: Built-in breakpoint system for mobile-to-desktop support
- **Minimal bundle size**: Only includes used classes in production
- **Consistency**: Design system constraints prevent arbitrary values

## Data Structure Design

### Recipe Storage Format

**Decision**: JSON files with TypeScript interfaces

**Example JSON**:
```json
{
  "id": "white-sandwich-bread",
  "name": "White Sandwich Bread",
  "baseFlourWeight": 500,
  "hydrationHint": "65% hydration",
  "ingredients": [
    {
      "id": "flour",
      "name": "Bread Flour",
      "percentage": 100,
      "type": "flour"
    },
    {
      "id": "water",
      "name": "Water",
      "percentage": 65,
      "type": "liquid"
    }
  ],
  "steps": [
    {
      "id": "mix",
      "title": "Mix Ingredients",
      "description": "Combine flour, water, yeast, and salt...",
      "activeMinutes": 10,
      "passiveMinutes": 0
    }
  ]
}
```

## Baker'\''s Percentage Calculation Logic

### Core Algorithm

**Formula for ingredient weights from flour weight**:
```
ingredient_weight = (flour_weight × ingredient_percentage) ÷ 100
```

**Formula for flour weight from desired total**:
```
total_percentage = sum of all ingredient percentages
flour_weight = (desired_total_weight × 100) ÷ total_percentage
```

### Rounding Rules

- Small amounts (< 10g): Round to 1 decimal place
- Large amounts (≥ 10g): Round to whole numbers

## Component Architecture

```
App
├── RecipeList (route: /)
│   └── RecipeCard (multiple)
└── RecipeDetail (route: /recipe/:id)
    ├── RecipeHeader
    ├── ScalingCalculator
    ├── IngredientList
    └── StepList
```

## Performance Validation

- Calculation time: < 1ms
- React re-render: < 50ms
- Total update time: < 100ms (meets 500ms requirement with 5x margin)

## Summary

React + Vite SPA with Tailwind CSS, JSON-based recipe storage, pure calculation functions, and comprehensive testing strategy (Vitest + React Testing Library + Cypress).
