# Planning Guide

A professional Czech National Bank (CNB) Exchange Rate Viewer application that displays real-time currency exchange rates fetched directly from the official CNB API.

**Experience Qualities**:
1. **Professional** - Clean, business-focused design that conveys trust and reliability for financial data
2. **Efficient** - Fast loading with clear feedback states and minimal distractions from the core data
3. **Interactive** - Practical currency conversion tools that make exchange rate data immediately useful

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
- This application has evolved into a sophisticated financial data platform with multiple specialized views (Current Rates, Comparison Mode, Analytics, AI Insights, History, Collaborate), real-time data processing, persistent user preferences (favorites, alerts, shared watchlists), advanced filtering and search, interactive visualizations, multi-format exports, intelligent alert systems, cutting-edge AI-powered analysis features, comprehensive notification management, auto-refresh scheduling, keyboard shortcuts for power users, visual currency performance heatmaps, and multi-user collaboration with role-based permissions, live cursor tracking, and real-time voice/video communication. It demonstrates complex state management, batch API processing, natural language processing integration, collaborative data sharing, user permission management, invitation systems, WebRTC peer-to-peer communication, and provides professional-grade analysis tools with artificial intelligence capabilities and comprehensive team collaboration features including voice and video calls.

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
- **Functionality**: Enables users to select and compare exchange rates across multiple dates (up to 5) with visual change indicators showing percentage differences from a baseline date, including quick templates for common time periods, a custom template builder to save personalized comparison periods, and template duplication to quickly create variations
- **Purpose**: Provides powerful analysis tools for tracking currency rate movements over custom time periods, helping users identify trends and make informed financial decisions with standardized comparison periods, the ability to save frequently-used date combinations for instant reuse, and quick duplication to create template variations without starting from scratch
- **Trigger**: User switches to "Comparison Mode" tab and selects dates via calendar, quick-add buttons, pre-configured templates, custom saved templates, or duplicating existing templates
- **Progression**: User switches to comparison tab → Sees quick comparison templates (Weekly, Bi-Weekly, Monthly, Quarterly) with duplicate icons → Can click duplicate icon on preset template to save it as editable custom template OR create custom template by clicking "Create Template" → Opens custom template builder dialog → Names template and adds description → Selects specific dates from calendar → Dates display in sorted list → Saves template to persistent storage → Template appears in custom templates grid → Can mark templates as favorites (star icon) → Duplicate existing custom templates with copy icon (creates instant copy with "(Copy)" suffix) → Edit duplicated or existing templates to modify dates or details → Delete templates with confirmation → Apply any template (preset or custom) to load all dates instantly → Each date is fetched from CNB API → Comparison table displays with all currencies → Shows rate values and percentage changes from baseline → Color-coded indicators (green=increase, red=decrease) → User can filter currencies, sort by country/code → Remove individual dates or clear all → Refresh all comparison data
- **Success criteria**: Up to 5 dates can be selected; four pre-configured templates (Weekly, Bi-Weekly, Monthly, Quarterly) with duplicate functionality; custom template builder with name, description, and date selection; templates persist using useKV across sessions; custom templates can be created with any combination of dates; one-click duplication of both preset and custom templates; duplicated templates clearly marked with "(Copy)" suffix; duplicate button on preset templates saves them to custom templates; duplicate icon on custom template cards creates instant copy; calendar date picker for precise selection; templates sorted by favorites first, then by creation date; edit functionality preserves template ID and updates metadata; delete confirmation dialog prevents accidental removal; favorite star toggle with visual feedback (yellow when favorited); empty state encourages creating first template; template cards show date count and apply button; percentage changes accurately calculated from baseline date; color-coded trend indicators; sortable and filterable comparison table; smooth loading states with toast notifications for all actions including duplication; mobile-responsive template grid with action buttons

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

### Currency Performance Heatmap
- **Functionality**: Displays an interactive visual grid or list showing currency strength relative to CZK, color-coded from weakest (blue) to strongest (red), with multiple sorting and view options
- **Purpose**: Provides instant visual understanding of currency performance landscape, enabling users to quickly identify strong and weak currencies at a glance
- **Trigger**: Automatically displayed in Analytics tab when exchange rate data loads
- **Progression**: User navigates to Analytics tab → Heatmap renders with all currencies → Each currency shown as color-coded card/row based on strength percentile → User can sort by strength, rate, or alphabetically → Toggle between grid view (compact cards) and list view (detailed rows with progress bars) → Hover over currency for detailed tooltip showing country, exact rates, and unit rate → Color intensity indicates relative strength within current dataset
- **Success criteria**: All currencies rendered with accurate color coding; smooth transitions between grid and list views; sorting updates instantly without lag; tooltips provide detailed information on hover; strength calculated correctly as rate/amount ratio; color scale uses 5 distinct levels (very weak to very strong); grid view shows 2-6 columns responsive to screen size; list view includes visual progress bars; legend clearly explains color meanings; strength badges (Very Strong/Strong/Neutral/Weak/Very Weak) with appropriate icons (Fire/TrendUp/Minus/TrendDown/Snowflake); mobile-responsive layout; accessible color choices meeting WCAG standards

### Smart Notification Center
- **Functionality**: Centralized hub for managing all app notifications including rate alerts, prediction accuracy updates, data refreshes, and system announcements, with customizable preferences for each notification type
- **Purpose**: Keeps users informed of important events and changes without overwhelming them, with granular control over what notifications they receive
- **Trigger**: Accessed via Bell icon in header; notifications appear automatically based on user preferences and system events
- **Progression**: User accesses Notification Center → Views four notification preference toggles (Rate Alerts, Prediction Accuracy, Data Updates, System Notifications) → Toggles preferences on/off → Sees list of recent notifications sorted by time → Can filter to show unread only → Notifications display with color-coded icons based on type (success/warning/error/info) → Each notification shows title, message, timestamp → Can mark individual notifications as read → Can delete individual notifications → "Mark All Read" button for bulk action → "Clear All" to remove all notifications → Preferences persist across sessions → Unread count badge visible on center access button
- **Success criteria**: All notification types properly categorized and toggleable; notifications persist using KV storage; unread count accurate and updates in real-time; color-coded icons (green for success, orange for warning, red for error, blue for info); smooth animations for marking read/deleting; scrollable list for many notifications; empty state with helpful message when no notifications; timestamps formatted for readability; "New" badge on unread notifications; filter toggle between all/unread works instantly; clear confirmation prevents accidental data loss; mobile-responsive card layout; toast notifications appear for important events even when center is closed

### Auto-Refresh Scheduler
- **Functionality**: Automatically refreshes exchange rate data at user-configured intervals (30 seconds to 1 hour) with live countdown timer and refresh statistics tracking
- **Purpose**: Ensures users always have current data without manual intervention, ideal for monitoring volatile currency markets or keeping dashboards up-to-date
- **Trigger**: User enables auto-refresh toggle and selects desired interval from dropdown
- **Progression**: User navigates to Analytics tab → Finds Auto-Refresh Scheduler card → Enables auto-refresh toggle → Selects interval (30s/1m/5m/15m/30m/1h/manual) → Scheduler activates with pulsing green indicator → Dashboard shows three metrics: Last Refresh time, Next Refresh countdown, and Refresh Count → Countdown updates every second showing time until next refresh → On each interval, data automatically refreshes → Toast notification confirms successful refresh → Refresh count increments → Settings persist across sessions → Can disable anytime or switch to manual mode
- **Success criteria**: Intervals work accurately (30s, 1m, 5m, 15m, 30m, 1h options); countdown timer updates smoothly every second; last refresh timestamp updates on each refresh; refresh count increments correctly; green pulsing indicator visible when active; auto-refresh survives tab switches; settings persist using KV storage; "Active" badge displays when enabled; graceful error handling if refresh fails; toast notifications on success/failure; can be disabled instantly; manual mode option available; respects browser performance (doesn't overwhelm with too-frequent requests); stops refreshing when tab is inactive (optional); mobile-friendly time display format; visual distinction between active/inactive states

### Keyboard Shortcuts
- **Functionality**: Power user feature providing keyboard shortcuts for common actions and navigation throughout the app, with accessible help dialog listing all available shortcuts
- **Purpose**: Dramatically speeds up workflow for frequent users who prefer keyboard navigation over mouse clicks
- **Trigger**: Shortcuts always active when not focused on input fields; help dialog opened with "?" key or Shortcuts button
- **Progression**: User presses shortcut key → Action executes immediately → Available shortcuts include: "/" (focus search), "r" (refresh data), "e" (export), "f" (toggle favorites), "1-6" (switch tabs), "?" (show shortcuts help) → Shortcuts help dialog displays categorized list (Navigation/Actions/Views/General) → Each shortcut shown with key badge and description → Dialog explains shortcuts work when not in input fields → Shortcuts button in header provides discoverable access
- **Success criteria**: All shortcuts respond instantly; shortcuts disabled when typing in input fields to prevent conflicts; "?" opens help dialog with full shortcut list; shortcuts organized into logical categories; clean badge design for key representations; help dialog scrollable for long list; Esc closes dialogs; number keys (1-6) switch between all six tabs; "r" refreshes current view appropriately; "f" toggles favorites filter in current rates view; "/" focuses search input if available; shortcuts persist across navigation; help button accessible in header; mobile users see shortcuts button but understand keyboard shortcuts are desktop-only; no conflicts with browser shortcuts; visual feedback when actions triggered; shortcuts work across all tabs where applicable

### Multi-User Collaboration Features
- **Functionality**: Comprehensive collaboration system enabling users to create, share, and manage shared watchlists with team members; supports both private (invite-only) and public (discoverable) watchlists with role-based permissions (Owner, Editor, Viewer); includes real-time member management, invitation system, real-time collaboration indicators showing active viewers, live cursor tracking showing where team members are hovering in real-time, and seamless currency addition from the main exchange rate table
- **Purpose**: Enables teams and communities to collaboratively track and monitor currency portfolios; facilitates knowledge sharing and coordination for financial decisions; allows organizations to maintain standardized watchlists across team members; provides real-time awareness of team member activity and precise cursor positions for better coordination and interactive collaboration
- **Trigger**: User navigates to "Collaborate" tab; creates new shared watchlist; invites members; browses public watchlists; adds currencies to shared lists; selects watchlist to view active collaborators and see live cursor movements
- **Progression**: User clicks Collaborate tab → Views dashboard with invitation notifications badge → Sees list of shared watchlists they're a member of (or empty state) → Creates new watchlist with "Create Shared Watchlist" button → Dialog opens with name, description, public/private toggle → Sets visibility (public = discoverable by anyone, private = invite-only) → Watchlist created and user becomes owner → Owner invites team members by GitHub username (future: via email/link) → Invitees receive notification in dashboard → Accept/decline invitations → Join public watchlists with single click from browse section → Select watchlist from dashboard to view its currencies → Activity Monitor panel appears showing real-time collaboration indicators → Live cursor tracking activates automatically → Team members' cursors appear as colored pointer icons with user avatars and names → Each user gets a unique color assigned consistently → Cursors move smoothly in real-time (throttled to 50ms updates) → Active Cursors Indicator card shows in top-right corner with count and user avatars → Live cursor display includes smooth animations and spring physics → Inactive cursors auto-cleanup after 5 seconds → Active viewers displayed with pulsing green indicators (viewed within last 2 minutes) → Recently active members shown with timestamps (within last 30 minutes) → User's presence and cursor position automatically tracked when viewing watchlist → Activity status updates every 10 seconds → Cursor positions update continuously while hovering → Activity Monitor shows "Live Cursor Tracking Active" status with count → Compact active viewers badge shown on each watchlist card → Filter main table to show only shared watchlist currencies → Add/remove currencies directly from exchange rate table using "Add to Watchlist" dropdown → Owner manages members (change roles, remove members) → Members see role badges (Owner/Editor/Viewer) with corresponding icons → Editors can add/remove currencies → Viewers have read-only access → Real-time updates show member activity timestamps → Leave watchlists (non-owners) or delete (owners only) with confirmation → Watchlist cards show member count, currency count, last update time, active viewers indicator, and preview of tracked currencies
- **Success criteria**: Watchlists persist across sessions using KV storage; public/private visibility toggles work correctly; role-based permissions enforced (Owner: full control, Editor: modify currencies, Viewer: read-only); invitation system with pending/accepted/declined states; invitation notifications with accept/decline buttons; public watchlist browser shows all public lists with owner info; one-click join for public watchlists; watchlist selection filters exchange rate table; inline currency addition from table via dropdown menu (shows checkmarks for currencies already in list); member management dialog for owners; remove member functionality; leave watchlist for non-owners; delete watchlist for owners with confirmation; watchlist cards display all metadata (name, description, member count, currency count, preview badges); visual role indicators with icons (Crown for owner, Pencil for editor, Eye for viewer); last activity timestamps using relative time (e.g., "2 hours ago"); empty states guide users to create first watchlist; smooth transitions between tabs; responsive grid layout for watchlist cards; mobile-friendly invitation cards; collaboration tab includes helpful info alert explaining features; watchlists support unlimited members; currency additions trigger toast notifications; all actions have loading states; errors handled gracefully with user-friendly messages; works seamlessly with existing favorites system (independent features); live cursor tracking displays colored cursors with user info; cursors animate smoothly with spring physics; cursor throttling prevents performance issues; inactive cursors cleanup automatically after 5 seconds; cursor positions persist in KV storage per watchlist; Active Cursors Indicator shows in fixed top-right position; indicator displays user count and avatars; cursor colors assigned consistently per user; cursor overlay has proper z-index (9999) above all content; cursor tracking info card explains feature with icons; Activity Monitor shows live cursor count; cursor positions update at 50ms intervals; no cursor tracking when watchlist not selected; cursors only visible to team members viewing same watchlist; cursor SVG icons with drop shadows; user avatars displayed next to cursor; smooth fade in/out animations for cursors; no performance impact with multiple cursors (tested up to 10 simultaneous)

### Live Cursor Tracking
- **Functionality**: Real-time cursor position tracking showing where team members are hovering on shared watchlists, with smooth animated cursors displaying user avatars and names, automatic cleanup of inactive cursors, and a live counter showing active collaborators
- **Purpose**: Enhances team collaboration by providing visual awareness of where colleagues are focusing attention, enabling better coordination during simultaneous viewing sessions and creating a sense of presence
- **Trigger**: Automatically activates when user selects and views any shared watchlist in the Collaborate tab
- **Progression**: User selects shared watchlist → Cursor tracking hook initializes → Mouse movements captured and throttled (50ms) → Position calculated as percentage of viewport → Position data stored in KV with user info → Other users' cursor positions fetched from KV → LiveCursorsOverlay component renders all cursors → Each cursor displays as colored SVG pointer with user avatar badge → Cursors animate smoothly to new positions using framer-motion spring physics → Active Cursors Indicator appears in top-right corner → Shows count of active users with avatars → Cleanup interval runs every 2 seconds → Removes cursors inactive for 5+ seconds → User's own cursor not displayed to themselves → Activity Monitor shows cursor count and status → User navigates away → Cursor removed from KV storage → Tracking stops
- **Success criteria**: Cursor positions update in real-time with <100ms latency; smooth cursor animations without jank; each user assigned consistent color from 8-color palette; cursor icons visible with drop shadows; user avatars display correctly in cursor badges; usernames shown next to cursors; throttling prevents excessive updates (50ms intervals); inactive cursors cleanup after 5 seconds automatically; cleanup runs every 2 seconds without UI impact; user's own cursor not shown to themselves; Active Cursors Indicator fixed to top-right with proper z-index; indicator shows accurate count of active users; user avatars displayed in indicator (max 5, then "+N"); pulsing green status indicator for live activity; cursor overlay z-index 9999 above all content; pointer-events: none prevents cursor interference; cursor data stored per watchlist ID in KV; cursor positions as viewport percentages work across all screen sizes; color assignment based on user ID hash for consistency; initials fallback when avatar unavailable; cursor tracking info card explains feature clearly; Activity Monitor shows live cursor status with icon; no tracking when watchlist not selected; graceful cleanup on component unmount; no memory leaks from intervals; works with unlimited simultaneous users; performance tested with 10+ cursors; mobile-friendly (cursors visible, touch events excluded); cursor SVG uses currentColor for easy theming; framer-motion spring physics (stiffness: 500, damping: 30); fade in/out animations on cursor appear/disappear; works seamlessly with activity indicators; cursor data structure includes userId, userName, userAvatar, x, y, timestamp, watchlistId

### Voice & Video Calls
- **Functionality**: Real-time peer-to-peer voice and video communication between team members within shared watchlists, using WebRTC technology with support for audio/video toggling, call management, and call status indicators
- **Purpose**: Enables teams to discuss currency analysis, coordinate trading decisions, and collaborate in real-time while viewing shared watchlists, eliminating the need for external communication tools
- **Trigger**: User navigates to Voice & Video tab in Collaborate dashboard, selects a team member from shared watchlist, and initiates voice or video call
- **Progression**: User selects shared watchlist → Navigates to Voice & Video tab → Views list of team members → Clicks Voice or Video button next to member → Browser requests microphone/camera permissions → Local media stream initialized → WebRTC offer created and sent via KV signaling → Call status changes to "calling" → Recipient sees incoming call notification with accept/decline options → Recipient accepts call → WebRTC answer exchanged → ICE candidates negotiated → Peer connection established → Call status changes to "connected" → Video streams displayed in grid layout → Audio streams play automatically → Users can toggle audio mute/unmute → Users can toggle video on/off (video calls only) → Either user can end call → WebRTC connections closed → Media streams stopped → Call status returns to idle
- **Success criteria**: WebRTC peer-to-peer connections established successfully; audio quality is clear without echo or distortion; video quality supports up to 720p resolution; call signaling works reliably through KV storage; incoming call notifications appear instantly with toast messages; accept/decline buttons respond immediately; local and remote video streams display in responsive grid layout; mute/unmute toggles work instantly with visual feedback; video on/off toggles work for video calls; call status indicator shows accurate state (idle/calling/ringing/connected/ended); end call button immediately closes connections; media streams properly cleaned up on call end; browser permission prompts appear when starting calls; graceful error handling for permission denials; supports multiple simultaneous peer connections (group calls); ICE candidate exchange completes successfully; STUN servers configured for NAT traversal; call signals expire after 60 seconds; old signals cleaned up every 30 seconds; works across different browsers; no audio feedback loops; video elements auto-play correctly; responsive layout adapts to screen size; member list shows only other team members (excludes self); empty state shown when no members available; info alert explains how calls work; call type (voice/video) properly communicated; avatar fallbacks for users without profile pictures; proper z-index layering for video elements; call persistence across tab switches; watchlist selection required for calls; mobile-friendly touch targets; professional UI with icons and badges

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
- **Comparison Templates Empty State**: Show templates prominently when no dates are selected to guide users
- **Comparison Templates Loading State**: Disable template buttons during batch loading to prevent conflicts
- **Comparison Templates Weekend Handling**: All template-generated dates automatically skip weekends
- **Comparison Templates Clear Previous**: Applying a new template clears existing dates to avoid confusion
- **Comparison Templates Error Recovery**: If some dates fail to load in template, show partial results with error notification
- **Comparison Templates Mobile Layout**: Template grid stacks appropriately on smaller screens while maintaining usability
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
- **Currency Heatmap Empty Data**: Show helpful message when no currency data available for visualization
- **Currency Heatmap Sorting**: Instant updates when changing sort order without flickering
- **Currency Heatmap View Toggle**: Smooth transition between grid and list views with consistent data
- **Currency Heatmap Mobile**: Grid stacks appropriately on small screens maintaining readability
- **Currency Heatmap Color Accessibility**: Ensure color-blind friendly palette with sufficient contrast
- **Notification Center Empty State**: Show friendly prompt when no notifications exist
- **Notification Center Persistence**: Ensure notifications survive page refreshes using KV storage
- **Notification Center Preferences**: Settings persist and apply immediately to new notifications
- **Notification Center Filter**: Unread filter handles empty results gracefully
- **Notification Center Delete Confirmation**: Single delete works instantly; clear all requires confirmation
- **Notification Center Overflow**: Scrollable list handles hundreds of notifications smoothly
- **Auto-Refresh Scheduler Disabled State**: Clear messaging when auto-refresh is turned off
- **Auto-Refresh Scheduler Manual Mode**: Explicitly prevent auto-refresh when set to manual
- **Auto-Refresh Scheduler Countdown**: Timer updates smoothly every second without lag
- **Auto-Refresh Scheduler Tab Switching**: Continues running in background when switching tabs
- **Auto-Refresh Scheduler Error Handling**: Shows error toast if refresh fails, doesn't break scheduler
- **Auto-Refresh Scheduler Persistence**: Settings survive page refreshes and browser restarts
- **Auto-Refresh Scheduler Network Issues**: Handles failed refreshes gracefully without breaking
- **Keyboard Shortcuts Input Fields**: Disabled when user is typing in inputs/textareas
- **Keyboard Shortcuts Dialog**: Help dialog accessible via "?" key and button in header
- **Keyboard Shortcuts Conflicts**: No conflicts with browser or OS-level shortcuts
- **Keyboard Shortcuts Mobile**: Shortcuts button visible but shortcuts only work on desktop with keyboard
- **Keyboard Shortcuts Tab Switching**: Number keys (1-6) correctly switch between all six tabs
- **Shared Watchlist Empty Name**: Prevent creating watchlist without name
- **Shared Watchlist Duplicate Names**: Allow duplicate names (distinguished by IDs internally)
- **Shared Watchlist No Members**: Never allow empty member list (creator is always first owner)
- **Shared Watchlist Owner Leaving**: Prevent owner from leaving, must delete instead
- **Shared Watchlist Delete Confirmation**: Confirm before deleting to prevent accidents
- **Shared Watchlist Invite Non-existent User**: Accept any username, user must exist to accept invite
- **Shared Watchlist Invite Existing Member**: Block inviting users who are already members
- **Shared Watchlist Duplicate Currency**: Silently prevent adding currency already in list
- **Shared Watchlist Remove Last Currency**: Allow empty currency list in watchlist
- **Shared Watchlist Permission Checks**: Enforce viewer cannot edit, only owner can invite/manage
- **Shared Watchlist Public Discovery**: Only show truly public watchlists in browse section
- **Shared Watchlist Join Already Member**: Prevent joining watchlist user is already in
- **Shared Watchlist Persistence**: All watchlists and invites survive page refreshes via KV storage
- **Shared Watchlist Member Role Changes**: Only owner can change roles, cannot change own role
- **Shared Watchlist Remove Owner**: Prevent removing the owner from member list
- **Live Cursor Tracking Performance**: Throttle cursor updates to 50ms to prevent excessive KV writes
- **Live Cursor Tracking Cleanup**: Auto-remove cursors inactive for 5+ seconds via 2-second cleanup interval
- **Live Cursor Tracking Own Cursor**: Never display user's own cursor to themselves
- **Live Cursor Tracking Watchlist Switch**: Clear cursor data when switching between watchlists
- **Live Cursor Tracking Component Unmount**: Remove cursor from KV when user leaves collaboration tab
- **Live Cursor Tracking Multiple Tabs**: Handle users opening same watchlist in multiple browser tabs
- **Live Cursor Tracking Color Collision**: Use hash-based color assignment for consistent user colors
- **Live Cursor Tracking Avatar Failure**: Show initials fallback when avatar image fails to load
- **Live Cursor Tracking Mobile**: Show cursors on mobile but don't track touch events (view-only mode)
- **Live Cursor Tracking Overflow**: Handle 10+ simultaneous cursors without performance degradation
- **Live Cursor Tracking KV Errors**: Gracefully handle KV storage failures without breaking feature
- **Live Cursor Tracking Position Bounds**: Ensure cursor percentages stay within 0-100% range
- **Live Cursor Tracking Z-Index**: Maintain cursor overlay at z-index 9999 above all UI elements
- **Active Cursors Indicator Empty**: Hide indicator when no other users have active cursors
- **Active Cursors Indicator Position**: Keep fixed top-right position without blocking content
- **Shared Watchlist Concurrent Edits**: Last write wins for currency additions (acceptable for MVP)
- **Shared Watchlist Long Names**: Truncate long watchlist names in cards with ellipsis
- **Shared Watchlist Many Currencies**: Show first 10 currency badges with "+X more" indicator
- **Shared Watchlist No Watchlists**: Show helpful empty state encouraging creation
- **Shared Watchlist No Invites**: Hide invitations section when no pending invites
- **Shared Watchlist Filter By Watchlist**: Successfully filter main table when watchlist selected
- **Shared Watchlist Deselect**: Click selected watchlist again to deselect and show all currencies
- **Shared Watchlist Tab Switching**: Preserve selected watchlist when switching between tabs
- **Six-Tab Navigation**: Ensure smooth transitions between all six tabs including new Collaborate tab
- **Keyboard Shortcuts Focus Management**: Search focus shortcut works when search input exists
- **Active Viewers No Data**: Show empty state when no team members are currently viewing
- **Active Viewers Self-Exclusion**: Never show current user in their own active viewers list
- **Active Viewers Timestamp Accuracy**: Update activity status every 10 seconds automatically
- **Active Viewers Threshold**: Active = last 2 minutes, Recent = last 30 minutes
- **Active Viewers Auto-Tracking**: Automatically update user's lastActive timestamp every 30 seconds when viewing watchlist
- **Active Viewers Presence Cleanup**: Stop tracking presence when user deselects watchlist
- **Active Viewers Badge Display**: Only show active viewers badge when count > 0
- **Active Viewers Avatar Overflow**: Show first 5 avatars, collapse remaining with "+X" indicator
- **Active Viewers Role Icons**: Display appropriate icon (Crown/Pencil/Eye) for each member's role
- **Active Viewers Panel Sync**: Activity panel automatically updates when watchlist membership changes
- **Active Viewers Mobile Layout**: Compact avatar display and stacked layout on small screens
- **Active Viewers Tooltip Performance**: Lazy load tooltips to prevent performance issues with many members
- **Voice/Video Call Permission Denied**: Show clear error message when browser denies microphone/camera access
- **Voice/Video Call Network Issues**: Display connection status and retry options when WebRTC connection fails
- **Voice/Video Call ICE Failure**: Gracefully handle NAT traversal failures with STUN server fallback
- **Voice/Video Call Signaling Timeout**: Expire call signals after 60 seconds to prevent stale call requests
- **Voice/Video Call Signal Cleanup**: Clean up old signals every 30 seconds to prevent KV storage bloat
- **Voice/Video Call No Members**: Show helpful empty state when watchlist has no other members
- **Voice/Video Call Duplicate Request**: Prevent multiple simultaneous call attempts to same user
- **Voice/Video Call Already In Call**: Block new calls when user is already in an active call
- **Voice/Video Call Browser Compatibility**: Handle WebRTC API differences across browsers
- **Voice/Video Call Media Track Errors**: Gracefully handle media track failures during call
- **Voice/Video Call Connection State**: Monitor and display connection state changes (connecting/connected/disconnected)
- **Voice/Video Call End While Ringing**: Handle call end during ringing state without errors
- **Voice/Video Call Reject While Connecting**: Allow call rejection even during connection setup
- **Voice/Video Call Audio Echo**: Ensure local audio is muted in video element to prevent echo
- **Voice/Video Call Video Autoplay**: Handle browser autoplay policies for remote video streams
- **Voice/Video Call Multiple Peers**: Support multiple simultaneous peer connections for group calls
- **Voice/Video Call Peer Disconnection**: Clean up peer connection when remote user disconnects
- **Voice/Video Call Toggle During Setup**: Prevent audio/video toggles before connection is established
- **Voice/Video Call Watchlist Deselection**: End all active calls when user deselects watchlist
- **Voice/Video Call Tab Switch**: Maintain call state when switching between collaboration tabs
- **Voice/Video Call Component Unmount**: Properly cleanup all media streams and connections on unmount
- **Voice/Video Call Mobile Support**: Handle touch-friendly controls and reduced bandwidth on mobile
- **Voice/Video Call Bandwidth Constraints**: Adjust video quality based on available bandwidth
- **Voice/Video Call Audio Only Mode**: Handle voice calls without video track properly

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
  - Dialog component for keyboard shortcuts help and other modals
  - Switch component for toggle controls in preferences and settings
  - Progress component for visual indicators in heatmap list view
  - Tooltip component for detailed information on hover in heatmap
  - Avatar component for user profile pictures in collaboration features
  - Video element for displaying video call streams with autoPlay and playsInline attributes
- **Customizations**: 
  - Custom table styling with alternating row backgrounds for easier scanning
  - Monospace font override for numeric columns
  - Custom loading spinner with CNB-style branding colors
  - Chart styled with theme colors for consistency
  - Custom trend indicators with color-coded positive/negative changes
  - Export menu with format icons and descriptions for clarity
  - Video call grid layout with responsive aspect ratio containers
  - Call status badges with animated indicators for active calls
  - Media control buttons with clear on/off states for audio/video
  - User avatars with fallback initials for team members
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
  - Plus for add date button, create alert, and add currency to watchlist
  - X for remove date badges, clear search, and decline invitations
  - Trash for clear all comparison dates, delete alerts, and delete watchlists
  - Info for informational alerts
  - Star (outline/filled) for favorites/watchlist feature with yellow color for filled state
  - MagnifyingGlass for search functionality
  - Globe for total currencies stat and public watchlists
  - Bell for rate alerts feature and invitation notifications
  - CheckCircle for triggered alerts and accepted invitations
  - Sparkle for AI features and insights
  - Brain for AI predictions feature
  - ChatCircleDots for AI chat assistant
  - FileText for AI report generator
  - PaperPlaneRight for sending chat messages
  - User for user chat messages
  - ArrowsClockwise for stable/neutral trend in predictions
  - Users for collaboration features and shared watchlists
  - Crown for watchlist owner role
  - PencilSimple for watchlist editor role
  - Eye for watchlist viewer role
  - Lock for private watchlists
  - UserPlus for invite members and add to shared watchlist
  - SignIn for joining public watchlists
  - SignOut for leaving watchlists
  - Check for currencies already in shared watchlist
  - Calendar for watchlist metadata (currency count)
  - Clock for last activity timestamps
  - FloppyDisk for save to history action
  - ClockCounterClockwise for prediction history tab and feature
  - CheckCircle for high accuracy predictions
  - XCircle for low accuracy predictions
  - MinusCircle for predictions with no actual data
  - Target for prediction target metrics and accuracy analytics
  - Calendar for prediction creation dates
  - TrendUp/TrendDown for accuracy improvement indicators
  - Lightning for bi-weekly template and quick actions
  - Rocket for quarterly template and advanced features
  - Fire for currency heatmap and hot/strong currencies
  - Snowflake for weak/cold currencies in heatmap
  - Minus for neutral state in heatmap
  - Clock for auto-refresh scheduler feature
  - PlayCircle for active auto-refresh indicator
  - StopCircle for inactive auto-refresh state
  - Keyboard for keyboard shortcuts feature
  - Command for shortcuts help dialog
  - Phone for voice calls and call tab
  - PhoneDisconnect for ending calls
  - VideoCamera for video calls
  - Microphone for audio enabled state
  - MicrophoneSlash for audio muted state
  - VideoCameraSlash for video disabled state
  - UserCircle for no video placeholder
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
  - Comparison templates grid stacks to single column on mobile with full-width cards
  - Template selection buttons maintain proper touch targets (min 44px height) on mobile
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
  - Currency heatmap grid stacks to 2 columns on tablet, 1 column on mobile
  - Currency heatmap list view maintains full width with horizontal scroll if needed
  - Currency heatmap sort controls and view toggle stack appropriately on small screens
  - Notification center cards stack properly with full-width layout on mobile
  - Notification center action buttons remain accessible with proper touch targets
  - Auto-refresh scheduler metrics stack vertically on mobile for readability
  - Auto-refresh scheduler controls (toggle, select) full-width on small screens
  - Keyboard shortcuts button visible in mobile header but explains desktop-only feature
  - Keyboard shortcuts help dialog fully scrollable on mobile with touch-friendly dismiss
  - Collaborate tab includes 6th tab in responsive navigation with proper text sizing
  - Tab navigation accommodates six tabs with appropriate font scaling on mobile
  - Shared watchlist cards stack to single column on mobile with full-width layout
  - Watchlist creation dialog fully scrollable and usable on mobile screens
  - Public/private toggle in watchlist dialog has large touch target
  - Watchlist invitation cards stack properly with touch-friendly accept/decline buttons
  - Watchlist member avatars and info display clearly on small screens
  - Add to shared watchlist dropdown properly aligned on mobile
  - Watchlist filter selection works smoothly on touch devices
  - Collaboration dashboard info alert wraps text appropriately on narrow screens
  - Browse public watchlists grid stacks to single column on mobile
  - All collaboration action buttons maintain 44px minimum touch target on mobile
  - Voice/Video call tab properly integrated into 3-tab navigation in collaboration section
  - Voice/video call team member list stacks to single column on mobile
  - Call action buttons (voice/video) remain accessible with proper touch targets (min 44px)
  - Video call grid adapts from 2-column to single column on mobile screens
  - Video call aspect ratio maintained on all screen sizes (16:9 or 4:3)
  - Call control buttons stack horizontally with adequate spacing on mobile
  - Incoming call notification card fully readable and actionable on small screens
  - Call status badge remains visible without blocking content on mobile
  - Video elements scale proportionally on mobile while maintaining visibility
  - Mute/unmute and video toggle buttons full-width on very small screens
  - End call button prominent and easily accessible on mobile
  - Team member avatars and names clearly visible in call interface on mobile
  - Call feature info alert scrollable and readable on mobile devices
  - Currency heatmap sort controls and view toggle stack appropriately on small screens
  - Notification center cards stack properly with full-width layout on mobile
  - Notification center action buttons remain accessible with proper touch targets
  - Auto-refresh scheduler metrics stack vertically on mobile for readability
  - Auto-refresh scheduler controls (toggle, select) full-width on small screens
  - Keyboard shortcuts button visible in mobile header but explains desktop-only feature
  - Keyboard shortcuts help dialog fully scrollable on mobile with touch-friendly dismiss
