# Batch 3: Dashboard - Implementation Plan

## Overview
Build a comprehensive user dashboard with sidebar navigation, business management, AI tools access, and placeholder pages.

---

## Phase 1: Mock Data & Types

### 1.1 Create User Dashboard Types
**File:** `src/lib/types/dashboard.ts`
- [x] Define MockUser interface (id, name, email, tier, joinedAt)
- [x] Define MockDashboardStats interface
- [x] Define MockClaimedBusiness interface
- [x] Define MockToolUsage interface
- [x] Export all types

### 1.2 Create User Dashboard Mock Data
**File:** `src/lib/data/user-dashboard.ts`
- [x] Create mockUser object with sample user data
- [x] Create mockDashboardStats with realistic numbers
- [x] Create mockClaimedBusinesses array (2 businesses from existing data)
- [x] Create mockToolUsage array with usage stats for each tool
- [x] Export helper functions: getMockUser(), getMockStats(), getMockClaimedBusinesses(), getMockToolUsage()

### 1.3 Update Types Index
**File:** `src/lib/types/index.ts`
- [x] Export dashboard types from new file

---

## Phase 2: Dashboard Layout & Sidebar

### 2.1 Create Dashboard Sidebar Component
**File:** `src/components/dashboard/dashboard-sidebar.tsx`
- [x] Import shadcn Sidebar components
- [x] Define nav items array with label, icon, href
- [x] Create DashboardSidebar component using SidebarMenu pattern
- [x] Add SidebarHeader with "Dashboard" title
- [x] Map nav items to SidebarMenuItem + SidebarMenuButton
- [x] Add active state highlighting using usePathname()
- [x] Add SidebarFooter with user info mini-display

### 2.2 Create Dashboard Layout
**File:** `src/app/dashboard/layout.tsx`
- [x] Import SidebarProvider, SidebarInset from shadcn
- [x] Import DashboardSidebar component
- [x] Wrap children with SidebarProvider
- [x] Add DashboardSidebar
- [x] Wrap children with SidebarInset
- [x] Add container and padding for main content area

### 2.3 Create Mobile Sidebar Trigger
**File:** `src/components/dashboard/dashboard-mobile-nav.tsx`
- [x] Create mobile nav trigger button (integrated directly in layout)
- [x] Position fixed on mobile, hidden on desktop
- [x] Uses SidebarTrigger from shadcn
- [x] Add to dashboard layout for mobile

---

## Phase 3: Dashboard Components

### 3.1 Stats Card Component
**File:** `src/components/dashboard/stats-card.tsx`
- [x] Create StatsCard component with props: title, value, icon, trend
- [x] Display icon in colored circular background
- [x] Large value text, smaller label below
- [x] Optional trend indicator (+X% with green/red color)
- [x] Use Card component as wrapper

### 3.2 Stats Grid Component
**File:** `src/components/dashboard/stats-grid.tsx`
- [x] Create StatsGrid component accepting stats array
- [x] 2x2 grid layout on all screen sizes
- [x] Map stats to StatsCard components

### 3.3 Claimed Business Card Component
**File:** `src/components/dashboard/claimed-business-card.tsx`
- [x] Create ClaimedBusinessCard accepting MockClaimedBusiness
- [x] Display business image thumbnail
- [x] Business name and category badge
- [x] Status badge (Active, Pending)
- [x] Metrics: views, clicks this month
- [x] Quick action buttons: Edit, View Public

### 3.4 Dashboard Tool Card Component
**File:** `src/components/dashboard/dashboard-tool-card.tsx`
- [x] Create DashboardToolCard accepting AITool + usage data
- [x] Display tool icon and name
- [x] Short description (truncated)
- [x] Usage stats: "Used X times"
- [x] Tier badge (Free/Premium)
- [x] "Launch" or "Unlock" button based on user tier

### 3.5 Upgrade CTA Card Component
**File:** `src/components/dashboard/upgrade-cta-card.tsx`
- [x] Create UpgradeCTACard component
- [x] Gradient background
- [x] Headline and description
- [x] Feature checklist (3-4 items)
- [x] "Upgrade Now" button linking to /ai-tools#pricing

### 3.6 Consultation CTA Card Component
**File:** `src/components/dashboard/consultation-cta-card.tsx`
- [x] Create ConsultationCTACard component
- [x] "Need Custom Solutions?" headline
- [x] Brief description
- [x] "Book Free AI Audit" button → /consultation

### 3.7 Coming Soon Placeholder Component
**File:** `src/components/dashboard/coming-soon.tsx`
- [x] Create ComingSoon component with props: title, description, features
- [x] Centered layout with illustration/icon
- [x] Title and description
- [x] Preview features list
- [x] Optional "Notify Me" input (mock)

---

## Phase 4: Dashboard Overview Page

### 4.1 Update Dashboard Page
**File:** `src/app/dashboard/page.tsx`
- [x] Keep existing auth check pattern
- [x] Import mock user data and components
- [x] Replace DashboardClient with new layout

### 4.2 Welcome Header Section
- [x] Display "Welcome back, [name]!" with user name
- [x] Show current date
- [x] Display tier badge

### 4.3 Stats Grid Section
- [x] Add StatsGrid component
- [x] Pass mock stats data
- [x] Stats: businesses claimed, AI tools used, hours saved, current plan

### 4.4 My Businesses Section
- [x] Add SectionHeader: "My Businesses" with "View All" link
- [x] If businesses: Display ClaimedBusinessCard grid
- [x] If no businesses: Display empty state with "Browse Directory" CTA
- [x] Limit to 2-3 businesses, show "View All" for more

### 4.5 AI Tools Quick Access Section
- [x] Add SectionHeader: "AI Tools" with "View All" link
- [x] Display 3-4 DashboardToolCard components
- [x] Show most-used or featured tools

### 4.6 CTA Cards Section
- [x] Two-column grid on desktop
- [x] UpgradeCTACard (if on free tier)
- [x] ConsultationCTACard

---

## Phase 5: My Businesses Page

### 5.1 Create My Businesses Page
**File:** `src/app/dashboard/my-businesses/page.tsx`
- [ ] Create page.tsx with metadata
- [ ] Import mock claimed businesses data

### 5.2 Page Header
- [ ] PageHeader: "My Businesses"
- [ ] Count badge showing number of businesses
- [ ] "Claim New Business" button (links to homepage)

### 5.3 Business Cards Grid
- [ ] If businesses exist: Grid of ClaimedBusinessCard components
- [ ] Full-width cards with more detail than dashboard preview
- [ ] Show all metrics and actions

### 5.4 Empty State
- [ ] If no businesses: Large empty state
- [ ] Illustration
- [ ] "No businesses claimed yet" message
- [ ] "Browse Directory" CTA

### 5.5 Add Business CTA
- [ ] Card at bottom: "Claim Another Business"
- [ ] Brief description
- [ ] CTA button

---

## Phase 6: AI Tools Page

### 6.1 Create AI Tools Page
**File:** `src/app/dashboard/ai-tools/page.tsx`
- [ ] Create page.tsx with metadata
- [ ] Import aiTools data and mock usage data

### 6.2 Page Header
- [ ] PageHeader: "AI Tools"
- [ ] User tier badge
- [ ] Usage summary: "77/100 generations remaining"

### 6.3 Free Tools Section
- [ ] SectionHeader: "Free Tools"
- [ ] Grid of DashboardToolCard for free tier tools
- [ ] 2-3 columns responsive grid

### 6.4 Premium Tools Section
- [ ] SectionHeader: "Premium Tools"
- [ ] Grid of DashboardToolCard for enhanced/featured tools
- [ ] Show lock state for unavailable tools
- [ ] "Unlock with Enhanced" CTAs

### 6.5 Usage Summary Card
- [ ] Total generations used this month
- [ ] Progress bar showing usage vs limit
- [ ] Upgrade prompt if nearing limit

---

## Phase 7: Individual AI Tool Page

### 7.1 Create Dynamic Tool Page
**File:** `src/app/dashboard/ai-tools/[slug]/page.tsx`
- [ ] Create dynamic route page
- [ ] Generate static params from aiTools
- [ ] Get tool by slug, show 404 if not found

### 7.2 Tool Header
- [ ] Tool icon, name, and description
- [ ] Usage counter badge
- [ ] Generations remaining indicator

### 7.3 Create AI Tool Interface Component
**File:** `src/components/dashboard/ai-tool-interface.tsx`
- [ ] Create AIToolInterface accepting AITool
- [ ] Two-panel layout (side-by-side desktop, stacked mobile)

### 7.4 Input Panel
- [ ] Large textarea pre-filled with exampleInput
- [ ] Tool-specific controls:
  - [ ] Review Responder: Tone dropdown
  - [ ] Social Post: Platform dropdown
  - [ ] Business Description: Length dropdown
  - [ ] Email Template: Type dropdown
- [ ] "Generate" button with loading state

### 7.5 Output Panel
- [ ] Empty state before generation
- [ ] Skeleton during generation (1.5s mock delay)
- [ ] Display exampleOutput after generation
- [ ] Response card(s) with copy button, regenerate button
- [ ] Character count display

### 7.6 Premium Tool Gate
- [ ] If tool is premium and user is on free tier
- [ ] Show upgrade overlay/banner
- [ ] Blurred preview of output
- [ ] "Upgrade to Enhanced" CTA

---

## Phase 8: Placeholder Pages

### 8.1 Create Analytics Page
**File:** `src/app/dashboard/analytics/page.tsx`
- [ ] Create page.tsx with metadata
- [ ] Use ComingSoon component
- [ ] Title: "Analytics Dashboard"
- [ ] Features preview: views, clicks, trends, engagement

### 8.2 Create Billing Page
**File:** `src/app/dashboard/billing/page.tsx`
- [ ] Create page.tsx with metadata
- [ ] Current Plan Card with mock plan info
- [ ] If free tier: Upgrade CTA card
- [ ] Invoice History: ComingSoon placeholder
- [ ] Payment Methods: ComingSoon placeholder

### 8.3 Create Settings Page
**File:** `src/app/dashboard/settings/page.tsx`
- [ ] Create page.tsx with metadata
- [ ] Use ComingSoon component
- [ ] Title: "Account Settings"
- [ ] Features preview: profile, notifications, security
- [ ] Contact support link

---

## Phase 9: Polish & Integration

### 9.1 Update Existing Dashboard Components
- [ ] Remove or refactor old DashboardClient if exists
- [ ] Ensure no conflicts with new layout

### 9.2 Verify Navigation
- [ ] Test all sidebar links work correctly
- [ ] Verify active state highlighting
- [ ] Test mobile sheet navigation

### 9.3 Run Lint & Typecheck
- [ ] Run `npm run lint` and fix errors
- [ ] Run `npm run typecheck` and fix type errors

### 9.4 Responsive Testing
- [ ] Test sidebar collapse/expand on desktop
- [ ] Test sheet drawer on mobile
- [ ] Test all pages on mobile/tablet/desktop viewports

### 9.5 Dark Mode Testing
- [ ] Verify all dashboard components in dark mode
- [ ] Check sidebar colors in dark mode
- [ ] Fix any contrast issues

---

## File Summary

### New Files to Create

```
src/lib/types/
└── dashboard.ts

src/lib/data/
└── user-dashboard.ts

src/components/dashboard/
├── dashboard-sidebar.tsx
├── dashboard-mobile-nav.tsx
├── stats-card.tsx
├── stats-grid.tsx
├── claimed-business-card.tsx
├── dashboard-tool-card.tsx
├── upgrade-cta-card.tsx
├── consultation-cta-card.tsx
├── coming-soon.tsx
└── ai-tool-interface.tsx

src/app/dashboard/
├── layout.tsx
├── page.tsx (update existing)
├── my-businesses/
│   └── page.tsx
├── ai-tools/
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
├── analytics/
│   └── page.tsx
├── billing/
│   └── page.tsx
└── settings/
    └── page.tsx
```

### Files to Modify
```
src/lib/types/index.ts (add dashboard types export)
src/app/dashboard/page.tsx (replace with new implementation)
```

### Existing Files to Reference
```
src/components/ui/sidebar.tsx (shadcn sidebar)
src/lib/data/ai-tools.ts (aiTools data)
src/lib/data/businesses.ts (business data for mock claims)
src/lib/data/packages.ts (pricing tiers)
src/components/shared/page-header.tsx (PageHeader pattern)
src/components/shared/empty-state.tsx (EmptyState pattern)
src/components/shared/tier-badge.tsx (TierBadge component)
```
