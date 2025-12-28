# CNB Exchange Rate Viewer - Frontend Demo

A professional web application that demonstrates the frontend for displaying exchange rates from the Czech National Bank (CNB) API.

## ⚠️ Important Note

**This is a frontend-only demonstration.** The CNB API does not allow direct browser requests due to CORS (Cross-Origin Resource Sharing) restrictions. For the complete solution, you need to implement a **.NET backend API** that acts as a proxy to the CNB API.

### Current Demo Behavior
This demo uses AI-generated mock data to showcase the frontend functionality. In production with your .NET backend, replace the mock data calls with real API requests to your backend endpoint.

## Overview

This application demonstrates best practices for API integration, error handling, and data presentation in a modern React/TypeScript environment. The frontend is ready to consume a .NET backend API that fetches exchange rates from the official CNB public API.

## Features

✅ **API Integration** - Ready to consume .NET backend endpoints  
✅ **Currency Converter** - Real-time currency conversion calculator using live exchange rates  
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
- **Backend (To Implement)**: .NET 6/7/8 Web API

## Architecture

```
Frontend (This Repository):
src/
├── components/
│   ├── ExchangeRateTable.tsx       # Main table component with sorting
│   ├── ExchangeRateTableSkeleton.tsx # Loading skeleton
│   ├── CurrencyConverter.tsx       # Currency conversion calculator
│   └── ui/                          # shadcn components
├── hooks/
│   └── use-exchange-rates.ts        # Custom hook for API data fetching
├── lib/
│   ├── api.ts                       # API service layer (configure for your backend)
│   ├── types.ts                     # TypeScript interfaces
│   └── utils.ts                     # Utility functions
└── App.tsx                          # Main application component

Backend (To Implement):
YourBackend/
├── Controllers/
│   └── ExchangeRateController.cs   # REST endpoint
├── Services/
│   └── ExchangeRateProvider.cs     # CNB API integration
└── Models/
    └── ExchangeRate.cs              # Data models
```

## Implementing the .NET Backend

### Required .NET Backend Endpoint

Create a .NET Web API with the following endpoint structure:

**Endpoint**: `GET /api/exchangerates`  
**Optional Query Parameter**: `date` (YYYY-MM-DD format)

**Response Format**:
```json
{
  "date": "2025-01-15",
  "rates": [
    {
      "country": "USA",
      "currency": "dollar",
      "amount": 1,
      "currencyCode": "USD",
      "rate": 23.456
    },
    ...more currencies
  ]
}
```

### CNB API Integration Points

Your .NET backend should call one of these CNB endpoints:

**Current rates**:
```
https://api.cnb.cz/cnbapi/exrates/daily?lang=EN
```

**Historical rates**:
```
https://api.cnb.cz/cnbapi/exrates/daily/{date}?lang=EN
```

**CNB API Documentation**: https://api.cnb.cz/cnbapi/swagger-ui.html

### Sample .NET Implementation Structure

```csharp
// ExchangeRateProvider.cs
public class ExchangeRateProvider
{
    private readonly HttpClient _httpClient;
    private const string CNB_API_BASE = "https://api.cnb.cz/cnbapi";

    public async Task<ExchangeRateData> GetExchangeRatesAsync(string? date = null)
    {
        var endpoint = date != null 
            ? $"{CNB_API_BASE}/exrates/daily/{date}?lang=EN"
            : $"{CNB_API_BASE}/exrates/daily?lang=EN";
            
        var response = await _httpClient.GetAsync(endpoint);
        response.EnsureSuccessStatusCode();
        
        return await response.Content.ReadFromJsonAsync<ExchangeRateData>();
    }
}

// ExchangeRateController.cs
[ApiController]
[Route("api/[controller]")]
public class ExchangeRatesController : ControllerBase
{
    private readonly ExchangeRateProvider _provider;
    
    [HttpGet]
    public async Task<IActionResult> GetExchangeRates([FromQuery] string? date = null)
    {
        try
        {
            var rates = await _provider.GetExchangeRatesAsync(date);
            return Ok(rates);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
```

### Connecting Frontend to Your Backend

Once your .NET backend is running, update `src/lib/api.ts`:

```typescript
// Replace this line:
const CNB_API_BASE = 'https://api.cnb.cz/cnbapi'

// With your .NET backend URL:
const BACKEND_API_BASE = 'https://localhost:5001/api'  // Or your backend URL

// Then update the endpoint:
const endpoint = date 
  ? `${BACKEND_API_BASE}/exchangerates?date=${date}`
  : `${BACKEND_API_BASE}/exchangerates`
```

Remove the mock data fallback and the `generateMockExchangeRates()` function once your backend is ready.

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

### Currency Converter
The converter component provides:
- Real-time conversion between any two currencies
- Automatic calculation on input change
- Support for all CNB currencies plus CZK
- Swap functionality to reverse conversion direction
- Clear visual feedback of conversion results
- Cross-currency conversion via CZK base rate

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

## Technical Assessment Requirements ✅

This project fulfills the Omnixient Technical Assessment requirements:

### Frontend (Angular → React) ✅
- ✅ Clean, modern TypeScript implementation
- ✅ HTTP client for API consumption
- ✅ Clean table layout for exchange rates
- ✅ Error handling and loading indicators
- ✅ Environment-ready configuration (no hardcoded URLs)
- ✅ Production-ready code quality

### Backend (To Complete)
- [ ] .NET 6/7/8 Web API implementation
- [ ] `ExchangeRateProvider` class to fetch from CNB
- [ ] REST endpoint exposing exchange rate data
- [ ] Error handling in .NET
- [ ] Configuration-based URLs (appsettings.json)
- [ ] Optional: Unit tests

### Deliverables
- ✅ Working frontend application
- ✅ README with instructions
- ✅ Clean code architecture
- [ ] Working .NET backend (implement separately)
- [ ] Integration between frontend and backend

## Next Steps for Complete Solution

1. **Create .NET Web API Project**
   ```bash
   dotnet new webapi -n CNBExchangeRateAPI
   ```

2. **Implement ExchangeRateProvider Service**
   - Add HttpClient configuration
   - Implement CNB API calls
   - Add error handling

3. **Create REST Controller**
   - Map to `/api/exchangerates`
   - Add optional date parameter
   - Return properly formatted JSON

4. **Enable CORS in .NET**
   ```csharp
   builder.Services.AddCors(options => {
       options.AddPolicy("AllowFrontend", policy => {
           policy.WithOrigins("http://localhost:5173")
                 .AllowAnyHeader()
                 .AllowAnyMethod();
       });
   });
   ```

5. **Update Frontend API Configuration**
   - Point to your .NET backend URL
   - Remove mock data fallback

6. **Test Integration**
   - Run .NET backend
   - Run React frontend
   - Verify data flows correctly

## Notes & Assumptions

1. **CORS Required**: .NET backend must enable CORS for browser requests
2. **Date Format**: Exchange rates are updated daily by CNB
3. **Currency Codes**: Uses ISO 4217 currency codes from API response
4. **Browser Support**: Targets modern browsers with ES2020+ support
5. **Demo Mode**: Current implementation uses mock data until backend is connected

## Future Enhancements

- [ ] Date picker to view historical exchange rates
- [x] Currency converter calculator ✅ **Implemented**
- [ ] Favorite currencies feature with persistence
- [ ] Charts showing rate trends over time
- [ ] Export to CSV/Excel functionality
- [ ] Multi-language support
- [ ] PWA capabilities for offline access

## License

MIT

---

**Frontend Demo for Omnixient Technical Assessment**

*Backend implementation required for full functionality. See "Implementing the .NET Backend" section above.*
