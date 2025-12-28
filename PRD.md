# Planning Guide

A professional Czech National Bank (CNB) Exchange Rate Viewer that fetches and displays real-time currency exchange rates in a clean, data-focused interface suitable for financial applications.

**Experience Qualities**:
1. **Professional** - Clean, business-focused design that conveys trust and reliability for financial data
2. **Efficient** - Fast loading with clear feedback states and minimal distractions from the core data
3. **Accessible** - Clear typography and high contrast for easy reading of numerical data and currency codes

**Complexity Level**: Light Application (multiple features with basic state)
- This is a focused data display application with API integration, error handling, loading states, and data filtering/sorting capabilities

## Essential Features

### Exchange Rate Data Fetching
- **Functionality**: Retrieves current exchange rates from CNB public API
- **Purpose**: Provides real, live data from official Czech banking sources
- **Trigger**: Automatic on page load, with manual refresh option
- **Progression**: User loads page → Loading indicator appears → API call executes → Data parsed and displayed → Success state shown
- **Success criteria**: Exchange rates display accurately with currency codes, amounts, and rates clearly visible

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

## Edge Case Handling

- **API Timeout/Network Failure**: Display friendly error message with retry button and troubleshooting hints
- **Malformed API Response**: Graceful fallback with error logging and user notification
- **Empty Data Set**: Show empty state with explanation and refresh action
- **Slow Connection**: Progressive loading indicator showing fetch is in progress
- **Stale Data**: Display last update timestamp to inform users of data freshness

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
  - Badge component for currency codes
  - Alert component for error messages
  - Skeleton component for loading states
- **Customizations**: 
  - Custom table styling with alternating row backgrounds for easier scanning
  - Monospace font override for numeric columns
  - Custom loading spinner with CNB-style branding colors
- **States**: 
  - Buttons: default with solid primary, hover with slight brightness increase, active with scale press, disabled with reduced opacity
  - Table rows: hover with subtle background tint, selected with accent border
  - Loading: skeleton placeholders that match final content layout
- **Icon Selection**: 
  - ArrowsClockwise for refresh action
  - Warning for error states  
  - Bank for CNB branding
  - CaretUp/CaretDown for sortable columns
- **Spacing**: 
  - Container padding: p-6 (24px)
  - Card spacing: gap-6 between major sections
  - Table cell padding: px-4 py-3
  - Button padding: px-4 py-2
- **Mobile**: 
  - Stack header elements vertically
  - Make table horizontally scrollable with sticky first column
  - Increase touch targets to minimum 44px
  - Reduce padding to p-4 on mobile
  - Show fewer columns by default with expand option
