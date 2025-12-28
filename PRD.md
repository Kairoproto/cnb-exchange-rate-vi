# Planning Guide

A professional Czech National Bank (CNB) Exchange Rate Viewer application that displays real-time currency exchange rates fetched directly from the official CNB API.

**Experience Qualities**:
1. **Professional** - Clean, business-focused design that conveys trust and reliability for financial data
2. **Efficient** - Fast loading with clear feedback states and minimal distractions from the core data
3. **Interactive** - Practical currency conversion tools that make exchange rate data immediately useful

**Complexity Level**: Light Application (multiple features with basic state)
- This is a focused data display and conversion application with real CNB API integration, error handling, loading states, data filtering/sorting, and real-time currency conversion. The application fetches live exchange rates using a CORS proxy solution.

## Essential Features

### Exchange Rate Data Fetching
- **Functionality**: Retrieves current exchange rates from CNB public API with intelligent multi-proxy fallback system
- **Purpose**: Provides real, live data from official Czech banking sources with maximum reliability
- **Trigger**: Automatic on page load, with manual refresh option
- **Progression**: User loads page → Loading indicator appears → API call via primary proxy → If fails, automatically tries backup proxy → Data parsed and displayed → Success state shown
- **Success criteria**: Live exchange rates display accurately with currency codes, amounts, and rates clearly visible; system gracefully handles proxy failures

### Data Table Display
- **Functionality**: Shows exchange rates in a sortable, scannable table format
- **Purpose**: Enables users to quickly find and compare currency rates
- **Trigger**: After successful data fetch
- **Progression**: Data received → Parsed into table rows → Rendered with proper formatting → Sorting/filtering available
- **Success criteria**: All currencies visible with proper decimal formatting, currency codes, and country names

### Error Handling & Loading States
- **Functionality**: Displays clear feedback during loading and when errors occur
- **Purpose**: Keeps users informed about application state and provides recovery options
- **Trigger**: During API calls and on API failures
- **Progression**: Request starts → Loading shown → On error: error message displayed with retry option → User can retry
- **Success criteria**: Never shows blank screen; always provides feedback and recovery path

### Date & Time Display
- **Functionality**: Shows the date for which exchange rates are valid
- **Purpose**: Ensures users know the currency data timestamp
- **Trigger**: Displayed with fetched data
- **Progression**: Data received → Date extracted → Formatted and prominently displayed
- **Success criteria**: Date clearly visible and formatted in readable format

### Currency Converter Calculator
- **Functionality**: Converts amounts between any two currencies using live exchange rates
- **Purpose**: Provides immediate practical value by allowing users to calculate currency conversions
- **Trigger**: User enters amount and selects currencies
- **Progression**: User inputs amount → Selects from/to currencies → Real-time calculation displayed → Result shown with clear formatting
- **Success criteria**: Accurate conversions using CNB rates, instant updates on input changes, all currencies available including CZK

### Currency Trend Chart Visualization
- **Functionality**: Displays historical exchange rate trends over customizable time periods with multiple interactive chart types (line, bar, area, daily change) and comprehensive trend analysis
- **Purpose**: Enables users to analyze currency movements, identify patterns, and make informed decisions based on historical data with rich statistical insights
- **Trigger**: User selects currency, time range (7-90 days), and chart type
- **Progression**: User selects currency → Chooses time range → Selects chart type → Batch fetching begins with parallel requests → Progress tracked → Chart rendered with trend analysis → Detailed statistics displayed (overall trend, max increase/decrease, volatility, average change) → User explores interactive tooltips showing day-to-day changes → Can switch chart types or refresh data
- **Success criteria**: Smooth, responsive charts with accurate historical rates in all four formats; parallel batch processing completes efficiently; clear trend indicators with percentage changes; informative tooltips with formatted dates and change calculations; comprehensive trend statistics; graceful handling of partial data; automatic proxy fallback for reliability

### Data Export Functionality
- **Functionality**: Allows users to download current exchange rate data in CSV, JSON, or PDF formats
- **Purpose**: Enables users to save, share, and analyze data offline or in external tools
- **Trigger**: User clicks Export Data button and selects desired format
- **Progression**: User clicks export dropdown → Selects format (CSV/JSON/PDF) → File is generated with formatted data → Browser downloads file → Success toast notification shown
- **Success criteria**: Files download correctly with all exchange rate data; CSV is spreadsheet-compatible; JSON is properly structured with metadata; PDF is readable and printable; filenames include date for organization; toast notifications confirm successful exports

### Multi-Date Comparison Mode
- **Functionality**: Enables users to select and compare exchange rates across multiple dates (up to 5) with visual change indicators showing percentage differences from a baseline date
- **Purpose**: Provides powerful analysis tools for tracking currency rate movements over custom time periods, helping users identify trends and make informed financial decisions
- **Trigger**: User switches to "Comparison Mode" tab and selects dates via calendar or quick-add buttons
- **Progression**: User switches to comparison tab → Selects first date (becomes baseline) → Adds additional dates using calendar picker or quick buttons (yesterday, 1 week ago, 1 month ago, 3 months ago) → Each date is fetched from CNB API → Comparison table displays with all currencies → Shows rate values and percentage changes from baseline → Color-coded indicators (green=increase, red=decrease) → User can filter currencies, sort by country/code → Remove individual dates or clear all → Refresh all comparison data
- **Success criteria**: Up to 5 dates can be selected; weekends auto-excluded; percentage changes accurately calculated from baseline date; color-coded trend indicators (green up, red down, gray neutral); sortable and filterable comparison table; smooth loading states with toast notifications; individual date removal without refetching; clear visual distinction between baseline and comparison dates; mobile-responsive with proper date badge wrapping

## Edge Case Handling

- **API Timeout/Network Failure**: Display friendly error message with retry button, automatic proxy fallback, and troubleshooting hints
- **CORS Proxy Failure**: Automatically switch to backup proxy service without user intervention
- **Malformed API Response**: Graceful fallback with error logging and user notification
- **Empty Data Set**: Show empty state with explanation and refresh action
- **Slow Connection**: Progressive loading indicator with timeout handling (10s per request)
- **Stale Data**: Display last update timestamp to inform users of data freshness
- **Invalid Conversion Input**: Handle non-numeric or negative amounts gracefully without errors
- **Same Currency Conversion**: Allow but show 1:1 conversion correctly
- **Historical Data Unavailable**: Show appropriate empty state when chart data cannot be fetched with suggestions
- **Partial Historical Data**: Display available data with warning when some dates fail to fetch
- **Weekend/Holiday Gaps**: Chart automatically excludes non-trading days to show accurate trend lines
- **Long-term Data Loading**: Progressive batch loading with clear progress indication for chart data
- **Chart Type Switching**: Instant transitions between line, bar, area, and change chart types without refetching
- **Multiple Proxy Failures**: Exhaust all proxy options with retries before showing error to user
- **Export Failure**: Catch and display friendly error messages if file generation fails
- **Large Data Sets**: Ensure export works efficiently even with full currency dataset
- **Special Characters in Data**: Properly escape currency names and countries in CSV/JSON/PDF output
- **Comparison Mode - Maximum Dates**: Prevent adding more than 5 dates with clear messaging
- **Comparison Mode - Duplicate Dates**: Block duplicate date selection silently
- **Comparison Mode - Weekend Selection**: Automatically skip weekends when using quick-add buttons
- **Comparison Mode - Future Dates**: Disable future date selection in calendar picker
- **Comparison Mode - Missing Data**: Show "N/A" for currencies not available on specific dates
- **Comparison Mode - Empty State**: Display helpful prompt when no dates are selected
- **Comparison Mode - Single Date**: Show only rate values without percentage changes when comparing single date
- **Comparison Mode - API Failures**: Handle individual date fetch failures gracefully without breaking entire comparison
- **Comparison Mode - Tab Switching**: Preserve both current rates and comparison data when switching between tabs

## Design Direction

The design should evoke precision, trust, and professionalism - qualities essential for financial applications. Clean lines, generous whitespace, and a focus on data readability should dominate. The interface should feel like a professional financial terminal, not a consumer app.

## Color Selection

A sophisticated financial palette with deep blue tones and high-contrast elements for maximum data readability.

- **Primary Color**: `oklch(0.35 0.12 250)` - Deep professional blue that conveys trust and stability, perfect for financial applications
- **Secondary Colors**: `oklch(0.92 0.02 250)` - Very light blue-gray for subtle backgrounds and cards
- **Accent Color**: `oklch(0.55 0.18 160)` - Fresh teal for interactive elements and successful states, provides visual interest without overwhelming
- **Foreground/Background Pairings**: 
  - Background (White `oklch(0.99 0 0)`): Dark text `oklch(0.25 0.02 250)` - Ratio 11.5:1 ✓
  - Primary (Deep Blue `oklch(0.35 0.12 250)`): White text `oklch(0.99 0 0)` - Ratio 8.2:1 ✓
  - Accent (Teal `oklch(0.55 0.18 160)`): White text `oklch(0.99 0 0)` - Ratio 4.9:1 ✓
  - Card (Light Blue-Gray `oklch(0.92 0.02 250)`): Dark text `oklch(0.25 0.02 250)` - Ratio 10.8:1 ✓

## Font Selection

Typography should be technical and legible, optimized for displaying numerical data and currency codes with clarity.

**Primary**: IBM Plex Sans - A technical, professional typeface designed for clarity at all sizes, particularly excellent for displaying financial data and technical content
**Monospace**: JetBrains Mono - For currency codes and numerical values to ensure perfect alignment

- **Typographic Hierarchy**:
  - H1 (Page Title): IBM Plex Sans Bold/32px/tight letter spacing/-0.02em
  - H2 (Section Headers): IBM Plex Sans Semibold/20px/normal/0em
  - Body (Table Data): IBM Plex Sans Regular/15px/relaxed line-height/0em
  - Currency Codes: JetBrains Mono Medium/14px/normal/0.01em
  - Numeric Values: JetBrains Mono Regular/15px/tabular-nums enabled

## Animations

Animations should be minimal and purposeful, reinforcing the professional nature of the application while providing clear feedback.

Subtle fade-ins for data appearing (200ms), smooth loading spinner rotation, and gentle hover states on interactive elements. Avoid bouncy or playful animations - keep everything measured and precise like the financial data being displayed.

## Component Selection

- **Components**: 
  - Card component for main data container with subtle shadow
  - Table component with sortable headers and hover states
  - Button component for refresh action (with loading state)
  - Badge component for currency codes and selected date chips
  - Alert component for error messages
  - Skeleton component for loading states
  - Input component for currency converter amount entry and filtering
  - Select component for currency selection dropdowns and chart type selector
  - Label component for form field labels
  - Recharts LineChart, BarChart, and AreaChart for historical trend visualization
  - Tooltip component for chart data point details
  - Legend component for chart data series identification
  - DropdownMenu component for export format selection
  - Tabs component for switching between current rates and comparison mode
  - Calendar component for date selection in comparison mode
  - Popover component for calendar picker presentation
- **Customizations**: 
  - Custom table styling with alternating row backgrounds for easier scanning
  - Monospace font override for numeric columns
  - Custom loading spinner with CNB-style branding colors
  - Chart styled with theme colors for consistency
  - Custom trend indicators with color-coded positive/negative changes
  - Export menu with format icons and descriptions for clarity
- **States**: 
  - Buttons: default with solid primary, hover with slight brightness increase, active with scale press, disabled with reduced opacity
  - Table rows: hover with subtle background tint, selected with accent border
  - Loading: skeleton placeholders that match final content layout
  - Chart: interactive hover states on data points, smooth transitions on data updates
  - Dropdown items: hover with background highlight, active indication on click
- **Icon Selection**: 
  - ArrowsClockwise for refresh action
  - Warning for error states  
  - Bank for CNB branding
  - CaretUp/CaretDown for sortable columns
  - ArrowsLeftRight for currency swap functionality
  - Equals for conversion result indicator and neutral change
  - TrendUp/TrendDown for chart trend indicators and comparison changes
  - ChartLine for line chart selector and current rates tab
  - ChartBar for bar chart selector
  - ChartLineUp for area chart selector
  - DownloadSimple for export functionality
  - FileCsv for CSV format option
  - FileJs for JSON format option
  - FileText for PDF format option
  - CalendarCheck for comparison mode tab
  - CalendarBlank for date selector
  - CalendarPlus for empty comparison state
  - Plus for add date button
  - X for remove date badges
  - Trash for clear all comparison dates
  - Info for informational alerts
- **Spacing**: 
  - Container padding: p-6 (24px)
  - Card spacing: gap-6 between major sections
  - Table cell padding: px-4 py-3
  - Button padding: px-4 py-2
  - Chart margins: balanced to ensure labels are visible
- **Mobile**: 
  - Stack header elements vertically
  - Make table horizontally scrollable with sticky first column
  - Increase touch targets to minimum 44px
  - Reduce padding to p-4 on mobile
  - Show fewer columns by default with expand option
  - Stack converter input fields vertically
  - Show currency swap button below fields on mobile
  - Ensure dropdowns are touch-friendly with large hit areas
  - Chart remains responsive with adjusted margins for smaller screens
  - Stack chart controls (currency selector, time range, chart type) into 2x2 grid on mobile
  - Export button wraps to new line on mobile for better accessibility
  - Export dropdown menu aligned properly on small screens
  - Comparison mode date badges wrap properly in small containers
  - Quick-add buttons stack vertically on very small screens
  - Comparison table remains horizontally scrollable with fixed currency column
  - Tab navigation switches to full-width buttons on mobile
