# Planning Guide

A professional Czech National Bank (CNB) Exchange Rate Viewer application that displays real-time currency exchange rates fetched directly from the official CNB API.

**Experience Qualities**:
1. **Professional** - Clean, business-focused design that conveys trust and reliability for financial data
2. **Efficient** - Fast loading with clear feedback states and minimal distractions from the core data
3. **Interactive** - Practical currency conversion tools that make exchange rate data immediately useful

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
- This application has evolved into a sophisticated financial data platform with multiple specialized views (Current Rates, Comparison Mode, Analytics, AI Insights), real-time data processing, persistent user preferences (favorites, alerts), advanced filtering and search, interactive visualizations, multi-format exports, intelligent alert systems, and cutting-edge AI-powered analysis features. It demonstrates complex state management, batch API processing, natural language processing integration, and provides professional-grade analysis tools with artificial intelligence capabilities.

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

### Currency Favorites and Watchlist
- **Functionality**: Users can mark specific currencies as favorites by clicking a star icon, creating a personalized watchlist for quick access to preferred currencies
- **Purpose**: Streamlines workflow for users who regularly monitor specific currencies, eliminating the need to scroll through the full list
- **Trigger**: User clicks star icon next to any currency in the exchange rate table
- **Progression**: User views exchange rate table → Clicks star icon on desired currency → Currency added to favorites (star fills with yellow color) → User clicks "Watchlist" button to filter view → Only favorited currencies display → User can toggle back to "Show All" → Favorites persist across sessions
- **Success criteria**: Star icons visible and interactive on every currency row; instant visual feedback (filled star = favorited, outline = not favorited); watchlist button appears only when favorites exist; watchlist filter shows only favorited currencies; empty state with helpful message when watchlist is empty; favorites persist using useKV storage; yellow star color for visibility; smooth transitions between all/watchlist views

### Advanced Search and Filter
- **Functionality**: Real-time search functionality that filters currencies by country name, currency name, or currency code
- **Purpose**: Enables users to quickly find specific currencies without scrolling through the entire list
- **Trigger**: User types in the search input field above the exchange rate table
- **Progression**: User focuses search field → Types query → Table instantly filters to matching currencies → Count of results displayed → User can clear search with X button → Full list restored
- **Success criteria**: Instant filtering without delays; search works across country, currency name, and code; case-insensitive matching; clear visual feedback showing result count; empty state when no matches found; smooth animations

### Quick Stats Dashboard
- **Functionality**: Displays key metrics and insights from current exchange rates in easy-to-scan cards
- **Purpose**: Provides immediate high-level understanding of the currency landscape without detailed analysis
- **Trigger**: Automatically displayed when exchange rate data loads in Current Rates and Analytics tabs
- **Progression**: Data loads → Stats calculated → Four cards display: Total Currencies, Average Rate, Strongest vs CZK, Weakest vs CZK → Color-coded with icons
- **Success criteria**: Stats accurate and update with data refresh; visually distinct cards with icons; hover effects for engagement; responsive grid layout; clear labels and units

### Multi-Currency Converter
- **Functionality**: Converts a single CZK amount into multiple currencies simultaneously, showing results in organized sections for popular and all other currencies
- **Purpose**: Allows users to quickly see equivalent values across many currencies at once, ideal for planning or comparison
- **Trigger**: User enters amount in CZK input field within the multi-currency converter card
- **Progression**: User navigates to Analytics tab → Enters amount in CZK → Conversion results immediately display for all currencies → Popular currencies shown in grid → Other currencies in scrollable list → Real-time updates as amount changes
- **Success criteria**: Instant calculations without lag; clearly separated popular vs all currencies sections; scrollable list for non-popular currencies; formatted results with currency names and codes; empty state when no amount entered; responsive layout adapts to screen size

### Rate Alerts System
- **Functionality**: Users can create custom rate alerts that notify them when a currency reaches a target rate (above or below threshold)
- **Purpose**: Enables proactive monitoring of currencies without constant manual checking, helping users catch optimal exchange opportunities
- **Trigger**: User creates alert by selecting currency, condition (above/below), and target rate
- **Progression**: User navigates to Analytics tab → Fills alert form (currency, condition, rate) → Clicks Create Alert → Alert saved to persistent storage → On data refresh, alerts checked → If triggered, toast notification appears → Alert marked as triggered with green badge → User can delete alerts anytime
- **Success criteria**: Alerts persist across sessions using useKV; triggered alerts show toast notifications; visual distinction between active and triggered alerts; current rate displayed for comparison; form validation prevents invalid inputs; clean UI for managing multiple alerts; info message explains checking mechanism

### AI Market Insights
- **Functionality**: Generates intelligent, AI-powered analysis of current exchange rates using advanced language models to identify trends, opportunities, and risks
- **Purpose**: Provides professional-grade financial insights that would typically require expert analysts, making sophisticated market analysis accessible to all users
- **Trigger**: User clicks "Generate Insights" button in the AI Insights tab
- **Progression**: User navigates to AI Insights tab → Clicks Generate Insights → AI analyzes top 10 currencies → Generates 5 categorized insights (trend/opportunity/risk/info) → Insights display with color-coded cards → Each insight shows currency code, insight type, and detailed message
- **Success criteria**: Insights generated within 5-10 seconds using GPT-4o-mini; JSON response parsed correctly; 5 unique insights per generation; color-coded by type (green for opportunities, blue for trends, red for risks, gray for info); clear currency identification; professional, actionable insights; graceful error handling

### AI Currency Predictions (7-Day Forecast)
- **Functionality**: Generates AI-powered predictions for currency exchange rates over the next 7 days, including confidence levels, trend analysis, and visual forecasting charts
- **Purpose**: Helps users anticipate currency movements and make informed decisions about currency exchanges, investments, or travel planning based on data-driven forecasts
- **Trigger**: User selects a currency and clicks "Generate Forecast" button
- **Progression**: User navigates to AI Insights tab → Selects currency from dropdown → Clicks Generate Forecast → AI analyzes current rate and market context → Generates day-by-day predictions for next 7 days → Displays prediction chart, trend direction (bullish/bearish/stable), confidence levels, and detailed analysis → Shows percentage changes and predicted values for each day → User can select different currencies for comparison
- **Success criteria**: Predictions generated within 10-15 seconds using GPT-4o model; realistic daily variations (0.1-0.5%); 7-day forecast with individual confidence levels (high/medium/low); interactive line chart showing trend; overall trend classification with percentage change; detailed daily breakdown with specific rates; professional analysis explaining prediction reasoning; color-coded trend indicators; responsive design for mobile viewing

### AI Currency Chat Assistant
- **Functionality**: Interactive conversational AI that answers questions about exchange rates, provides recommendations, and offers personalized currency advice in natural language
- **Purpose**: Makes currency data accessible through natural conversation, allowing users to ask questions in plain English rather than navigating complex interfaces
- **Trigger**: User types question in chat input and sends message
- **Progression**: User navigates to AI Insights tab → Types question in chat input → Presses Enter or clicks send → AI processes question with context of all current rates → Response appears in chat bubble → Conversation history maintained → User can ask follow-up questions → Suggested questions available when chat is empty
- **Success criteria**: Responses within 3-5 seconds; maintains conversation context (last 4 messages); includes all currency data in AI context; helpful suggested questions for new users; clear visual distinction between user and assistant messages; timestamps on messages; auto-scroll to latest message; handles errors gracefully; professional and friendly tone

### AI Market Report Generator
- **Functionality**: Creates comprehensive, professional market analysis reports in markdown/text format that can be downloaded and shared
- **Purpose**: Provides exportable, professional documentation of market conditions for presentations, records, or decision-making processes
- **Trigger**: User clicks "Generate Report" button
- **Progression**: User navigates to AI Insights tab → Clicks Generate Report → AI analyzes all rates, identifies strongest/weakest currencies → Generates structured report with executive summary, key findings, currency analysis, outlook, and recommendations → Report displays in scrollable viewer → User can download as Markdown (.md) or Text (.txt) → Files named with date for organization
- **Success criteria**: Professional report structure with clear sections; uses GPT-4o model for high-quality writing; includes specific data points and numbers; identifies top 3 strongest and weakest currencies; provides actionable recommendations; download works correctly in both formats; report formatted for readability; generation completes within 10-15 seconds; filenames include date

### Prediction History Tracking
- **Functionality**: Tracks and stores AI-generated currency predictions over time, automatically updating with actual rates to compare forecast accuracy, displaying historical predictions with accuracy metrics and comprehensive performance analytics
- **Purpose**: Enables users to evaluate the reliability of AI forecasts by comparing predictions against actual rates, building trust through transparency and helping users make better-informed decisions based on proven accuracy with trend analysis and performance insights
- **Trigger**: User saves prediction from AI Predictions tab or views History tab
- **Progression**: User generates prediction → Clicks "Save to History" button → Prediction stored with timestamp → User navigates to History tab → Views accuracy trend analytics dashboard showing overall performance, improvement trends, and currency-specific metrics → Interactive charts display accuracy evolution over time → Sees performance breakdown by currency and trend type → Scrolls to view list of past predictions → Filters by currency if desired → Clicks prediction to see detailed comparison → Views predicted vs actual rates in chart → Sees accuracy percentage and variance metrics → Actual rates auto-populate daily as time passes
- **Success criteria**: Predictions persist across sessions using KV storage; automatic daily updates of actual rates for saved predictions; accuracy calculated as percentage comparing predicted vs actual; comprehensive analytics dashboard with overall accuracy, total predictions, best performing currency, and recent trend indicators; area chart showing accuracy evolution over time; bar chart displaying accuracy by currency; trend type performance breakdown; detailed currency performance table with rankings; color-coded accuracy badges (green >90%, yellow >70%, red <70%); performance insights showing improvement trends; responsive visualizations using Recharts; detailed daily breakdown showing variance; filter by currency; delete individual or clear all predictions; dialog view for detailed analysis; graceful handling of incomplete data (pending predictions); empty state with helpful guidance; mobile-responsive layout

### PDF Accuracy Analytics Reports
- **Functionality**: Generates comprehensive, professional PDF reports of prediction accuracy analytics with charts, statistics, insights, and recommendations
- **Purpose**: Provides shareable, presentation-ready documentation of AI prediction performance for stakeholders, records, or decision-making processes
- **Trigger**: User clicks "Export Report" button in History tab or Accuracy Analytics section
- **Progression**: User navigates to History tab → Views Report Preview card showing ready-to-export status → Clicks "Export Report" → Chooses Quick Export (full report) or Custom Export Options → If custom: selects which sections to include (charts, detailed stats) → Reviews what will be included → Clicks Generate PDF → PDF report generated with professional layout → File automatically downloads → Success notification shown
- **Success criteria**: Professional multi-page PDF with branded header and footer; key metrics dashboard with color-coded cards (overall accuracy, total predictions, best currency, recent trend); performance insights with AI-generated analysis; accuracy trend line chart showing performance over time; currency performance horizontal bar chart (top 10 currencies); trend accuracy breakdown table (bullish/bearish/stable); detailed currency statistics table with rankings; summary and actionable recommendations; page numbering and generation timestamp; clean, modern design with proper spacing; file size 200-500 KB; downloads with descriptive filename including date; custom export options allow toggling charts and detailed stats; preview card shows report contents and estimated pages; generation completes within 2-3 seconds; proper handling of long currency lists with pagination; gradient color schemes matching app theme; rounded corners and modern aesthetics; all charts and data accurately reflect analytics; recommendations tailored to actual performance

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
- **Favorites Persistence**: Ensure favorites survive page refreshes and session changes using KV storage
- **Star Icon Interaction**: Provide immediate visual feedback when toggling favorites without page reload
- **Search No Results**: Display helpful empty state when search query returns no matches
- **Search Special Characters**: Handle special characters and accents in search queries gracefully
- **Multi-Currency Converter Zero Amount**: Show helpful prompt when amount is zero or empty
- **Multi-Currency Converter Invalid Input**: Only accept valid numeric inputs with decimal support
- **Quick Stats Missing Data**: Handle edge cases when rates array is empty
- **Rate Alerts Duplicate Currency**: Allow multiple alerts for same currency with different targets
- **Rate Alerts Invalid Rate**: Validate target rate is positive number before creating alert
- **Rate Alerts Missing Currency**: Prevent alert creation without currency selection
- **Rate Alerts Notification Spam**: Only notify once per alert trigger, track checked alerts
- **Rate Alerts Persistence**: Store alerts in KV storage to survive page refreshes
- **Analytics Tab Loading**: Show appropriate loading states when switching to analytics tab
- **Three-Tab Navigation**: Ensure smooth transitions between Current Rates, Comparison, and Analytics tabs
- **AI Insights Generation Failure**: Display friendly error with retry option if AI service fails
- **AI Insights Invalid JSON**: Handle malformed AI responses gracefully without breaking UI
- **AI Predictions No Currency Selected**: Disable generate button until currency is selected
- **AI Predictions Generation Failure**: Show clear error message with retry option if prediction fails
- **AI Predictions Invalid Response Format**: Gracefully handle malformed AI prediction data
- **AI Predictions Confidence Levels**: Display high/medium/low confidence for each day's prediction
- **AI Predictions Realistic Variations**: Ensure AI generates realistic daily changes (0.1-0.5%)
- **AI Predictions Chart Rendering**: Handle edge cases where prediction data is incomplete
- **AI Chat Context Overflow**: Limit conversation history to last 4 messages to prevent token limits
- **AI Chat Network Failure**: Show error message in chat bubble if AI request fails
- **AI Chat Empty Input**: Disable send button when input is empty or whitespace
- **AI Chat Rapid Submissions**: Prevent multiple simultaneous requests with loading state
- **AI Report Generation Timeout**: Handle long-running report generations with appropriate feedback
- **AI Report Download Failure**: Catch and display error if file download fails
- **AI Report Empty State**: Show helpful prompt when no report has been generated yet
- **AI Tab Data Loading**: Ensure all AI features have access to current rate data
- **AI Features Without Data**: Disable or hide AI features when rate data is unavailable
- **Four-Tab Navigation**: Ensure smooth transitions between all four tabs including new AI Insights tab
- **Prediction History Empty State**: Show helpful prompt when no predictions have been saved yet
- **Prediction History Filter**: Handle empty results when filtering by specific currency
- **Prediction History Auto-Update**: Gracefully update actual rates daily without breaking existing predictions
- **Prediction History Incomplete Data**: Display pending status for predictions with no actual data yet
- **Prediction History Accuracy Calculation**: Handle edge cases where only partial actual data is available
- **Prediction History Delete Confirmation**: Confirm before deleting individual predictions
- **Prediction History Clear All**: Require confirmation before clearing entire history
- **Accuracy Analytics No Data**: Show empty state when no predictions have actual rates yet
- **Accuracy Analytics Partial Data**: Calculate metrics with available data, show progress indicators
- **Accuracy Analytics Chart Rendering**: Handle edge cases with minimal data points (< 3 predictions)
- **Accuracy Analytics Currency Rankings**: Dynamically update as new predictions are added
- **Accuracy Analytics Trend Detection**: Calculate improvement trends only when sufficient data exists (6+ predictions)
- **Accuracy Analytics Mobile View**: Ensure all charts and tables are touch-friendly and scrollable
- **Five-Tab Navigation**: Ensure smooth transitions between all five tabs including new History tab

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
  - Input component for currency converter amount entry, filtering, and search fields
  - Select component for currency selection dropdowns and chart type selector
  - Label component for form field labels
  - Recharts LineChart, BarChart, and AreaChart for historical trend visualization
  - Tooltip component for chart data point details
  - Legend component for chart data series identification
  - DropdownMenu component for export format selection
  - Tabs component for switching between Current Rates, Comparison, and Analytics views
  - Calendar component for date selection in comparison mode
  - Popover component for calendar picker presentation
  - ScrollArea component for scrollable lists in multi-currency converter
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
  - ArrowsLeftRight for currency swap functionality and multi-converter
  - Equals for conversion result indicator and neutral change
  - TrendUp/TrendDown for chart trend indicators and comparison changes
  - ChartLine for line chart selector and current rates tab
  - ChartBar for bar chart selector
  - ChartLineUp for area chart selector
  - ChartPieSlice for analytics tab
  - DownloadSimple for export functionality
  - FileCsv for CSV format option
  - FileJs for JSON format option
  - FileText for PDF format option
  - CalendarCheck for comparison mode tab
  - CalendarBlank for date selector
  - CalendarPlus for empty comparison state
  - Plus for add date button and create alert
  - X for remove date badges and clear search
  - Trash for clear all comparison dates and delete alerts
  - Info for informational alerts
  - Star (outline/filled) for favorites/watchlist feature with yellow color for filled state
  - MagnifyingGlass for search functionality
  - Globe for total currencies stat
  - Bell for rate alerts feature
  - CheckCircle for triggered alerts
  - Sparkle for AI features and insights
  - Brain for AI predictions feature
  - ChatCircleDots for AI chat assistant
  - FileText for AI report generator
  - PaperPlaneRight for sending chat messages
  - User for user chat messages
  - ArrowsClockwise for stable/neutral trend in predictions
  - FloppyDisk for save to history action
  - ClockCounterClockwise for prediction history tab and feature
  - CheckCircle for high accuracy predictions
  - XCircle for low accuracy predictions
  - MinusCircle for predictions with no actual data
  - Target for prediction target metrics and accuracy analytics
  - Calendar for prediction creation dates
  - TrendUp/TrendDown for accuracy improvement indicators
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
  - Tab navigation switches to full-width buttons with proper text sizing on mobile
  - Watchlist button and favorite stars remain accessible with proper touch targets
  - Star icons in table maintain 44px minimum touch area on mobile
  - Quick stats grid stacks to single column on mobile
  - Multi-currency converter grid becomes single column on small screens
  - Analytics tab components stack vertically on mobile for optimal viewing
  - Search input full width on mobile with proper spacing
  - Alert creation form fields stack vertically on small screens
  - AI Insights tab includes 4th tab in responsive navigation
  - AI predictions currency selector and generate button stack vertically on mobile
  - AI predictions chart maintains readability on small screens with adjusted margins
  - AI predictions daily breakdown cards stack properly with readable text
  - AI predictions stats grid (3 cards) stacks to single column on mobile
  - AI chat messages stack properly with max-width constraints
  - AI report viewer scrollable on mobile with touch-friendly controls
  - AI features maintain usability on small screens with proper spacing
  - Prediction history list cards stack properly on mobile
  - Prediction history dialog scrollable on mobile with touch-friendly controls
  - Prediction history filter dropdown full-width on small screens
  - Accuracy analytics charts stack vertically on mobile with adjusted heights
  - Accuracy analytics stats cards grid stacks to single column on small screens
  - Accuracy analytics currency performance table scrollable horizontally on mobile
  - Accuracy analytics responsive breakpoints maintain readability across all devices
  - History tab includes 5th tab in responsive navigation with proper text sizing
  - Prediction comparison charts maintain readability on mobile devices
