# Baker - Bread Recipe Scaling Calculator

A web application for scaling bread recipes using baker's percentages. Built with React, TypeScript, and Tailwind CSS.

## Features

- ✅ Browse bread recipes
- ✅ View detailed recipe information with ingredients and steps
- ✅ Scale recipes to desired dough weight with real-time calculations
- ✅ View baker's percentages alongside ingredient weights
- ✅ Responsive design for mobile and desktop

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3
- **Routing**: React Router DOM 6
- **Testing**: Vitest + React Testing Library

## Project Structure

```
baker-app/
├── src/
│   ├── components/      # React components
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Pure calculation functions
│   ├── data/            # Recipe JSON data
│   └── test/            # Test configuration
├── tests/               # Test files
└── public/              # Static assets
```

## Development

The application uses baker's percentages for recipe scaling:
- Flour is always 100%
- All other ingredients are percentages relative to flour weight
- Total dough weight = flour × (sum of all percentages ÷ 100)

## Implementation Status

✅ **MVP Complete** - All core features implemented and tested
- Phase 1: Project Setup
- Phase 2: Type Definitions & Calculations
- Phase 3: Recipe Browsing
- Phase 4: Recipe Detail View
- Phase 5: Scaling Functionality
- Phase 6: Baker's Percentages Display

## License

MIT
