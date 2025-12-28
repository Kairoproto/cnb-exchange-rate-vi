# CNB Exchange Rate Viewer

A professional web application that displays real-time exchange rates from the Czech National Bank (CNB) API.

## Overview

This application demonstrates best practices for API integration, error handling, and data presentation in a modern React/TypeScript environment. It fetches current exchange rates from the official CNB public API and displays them in a clean, sortable table interface.

## Features

✅ **Real-time Data Fetching** - Retrieves current exchange rates from CNB API  
✅ **Sortable Table** - Click column headers to sort by country, currency, code, or rate  
✅ **Error Handling** - Comprehensive error states with retry mechanisms  
✅ **Loading States** - Skeleton loaders for better user experience  
✅ **Responsive Design** - Mobile-friendly interface that adapts to all screen sizes  
✅ **Professional UI** - Clean, financial-grade design with proper typography  
✅ **Type Safety** - Full TypeScript implementation with proper types  

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4 with custom theme
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Phosphor Icons
- **Build Tool**: Vite 7
- **API**: CNB (Czech National Bank) Public API

## Architecture

```
src/
├── components/
│   ├── ExchangeRateTable.tsx       # Main table component with sorting
│   ├── ExchangeRateTableSkeleton.tsx # Loading skeleton
│   └── ui/                          # shadcn components
├── hooks/
│   └── use-exchange-rates.ts        # Custom hook for API data fetching
├── lib/
│   ├── api.ts                       # CNB API service layer
│   ├── types.ts                     # TypeScript interfaces
│   └── utils.ts                     # Utility functions
└── App.tsx                          # Main application component
```

## API Integration

### CNB API Endpoint
```
https://api.cnb.cz/cnbapi/exrates/daily?lang=EN
```

### Response Structure
The application consumes the CNB API which returns exchange rates in the following format:

```typescript
{
  date: string,           // ISO date string
  rates: [
    {
      country: string,      // Country name
      currency: string,     // Currency name
      amount: number,       // Base amount
      currencyCode: string, // ISO currency code (USD, EUR, etc.)
      rate: number          // Exchange rate to CZK
    }
  ]
}
```

## Error Handling

The application implements comprehensive error handling:

- **Network Errors**: Displayed with user-friendly messages and retry option
- **API Errors**: HTTP status codes handled with appropriate messaging
- **Invalid Data**: Validates API response structure before rendering
- **Loading States**: Shows skeleton loaders during data fetch

## Key Implementation Details

### Custom Hook Pattern
The `useExchangeRates` hook encapsulates all data fetching logic, providing:
- Loading states
- Error states
- Data state
- Refetch functionality

### API Service Layer
The `api.ts` module provides:
- Typed API responses
- Custom error classes
- Proper error propagation
- Request configuration

### Sorting Functionality
The table component implements client-side sorting:
- Click any column header to sort
- Toggle between ascending/descending
- Visual indicators for active sort
- Type-aware sorting (string vs number)

## Design Decisions

1. **Professional Financial Theme**: Blue color palette conveys trust and stability
2. **IBM Plex Sans Font**: Technical typeface optimized for data display
3. **JetBrains Mono**: Monospace font for currency codes and numbers
4. **Generous Spacing**: Improves readability of numerical data
5. **Subtle Animations**: Measured transitions that feel professional
6. **High Contrast**: WCAG AA compliant color combinations

## Build & Run Instructions

### Prerequisites
- Node.js 18+ installed
- npm or compatible package manager

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## Notes & Assumptions

1. **API Availability**: Assumes CNB API is accessible and follows documented format
2. **Date Format**: Exchange rates are typically updated daily by CNB
3. **Currency Codes**: Uses ISO 4217 currency codes from API response
4. **Browser Support**: Targets modern browsers with ES2020+ support
5. **No Backend Required**: Directly consumes public CNB API (CORS-enabled)

## Technical Assessment Context

This project was created as a demonstration of fullstack development skills, adapted for a React/TypeScript environment. While the original assessment called for .NET backend + Angular frontend, this implementation showcases:

- ✅ API integration and consumption
- ✅ Error handling and loading states
- ✅ Clean code architecture with separation of concerns
- ✅ TypeScript type safety throughout
- ✅ Professional UI/UX design
- ✅ Responsive, accessible interface
- ✅ Production-ready code quality

## Future Enhancements

Potential improvements for extended development:

- [ ] Date picker to view historical exchange rates
- [ ] Currency converter calculator
- [ ] Favorite currencies feature with persistence
- [ ] Charts showing rate trends over time
- [ ] Export to CSV/Excel functionality
- [ ] Multi-language support
- [ ] PWA capabilities for offline access

## License

MIT

---

**Built with ❤️ for the Omnixient Technical Assessment**
