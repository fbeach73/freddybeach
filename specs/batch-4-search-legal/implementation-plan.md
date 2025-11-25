# Batch 4: Search & Legal Pages - Implementation Plan

## Overview
Build full search functionality and three legal pages (Privacy, Terms, Refund).

---

## Phase 1: Search Components ✅

### 1.1 Create Search Components Directory
- [x] Create `src/components/search/` directory

### 1.2 Search Bar Component
**File:** `src/components/search/search-bar.tsx`
- [x] Create SearchBar component with large input styling
- [x] Search icon on left side
- [x] Clear button (X) on right when text present
- [x] Props: value, onChange, onSubmit, placeholder
- [x] Handle Enter key submit
- [x] Autofocus option

### 1.3 Search Filters Component
**File:** `src/components/search/search-filters.tsx`
- [x] Create SearchFilters component
- [x] Props: filters state, onFilterChange callbacks

**Category Filter:**
- [x] Multi-select using shadcn Popover + Command
- [x] Checkbox list of all categories
- [x] Show selected count badge
- [x] "Clear" button for category

**Rating Filter:**
- [x] Button group or radio buttons
- [x] Options: Any, 3+, 4+, 4.5+

**Open Now Toggle:**
- [x] Switch component with label

**Clear All:**
- [x] "Clear All Filters" button
- [x] Only visible when filters active

### 1.4 Search Results Grid Component
**File:** `src/components/search/search-results.tsx`
- [x] Create SearchResults component
- [x] Props: businesses array, isLoading
- [x] Map businesses to BusinessCard
- [x] Responsive grid: 1/2/3 columns
- [x] Loading state with Skeleton cards

### 1.5 Search Pagination Component
**File:** `src/components/search/search-pagination.tsx`
- [x] Create SearchPagination component
- [x] Props: currentPage, totalPages, onPageChange
- [x] Previous/Next buttons
- [x] Page number buttons (show 5 at a time)
- [x] "Page X of Y" text

### 1.6 No Results Component
**File:** `src/components/search/no-results.tsx`
- [x] Create NoResults component
- [x] Props: query, suggestedCategories
- [x] Illustration or icon
- [x] "No businesses found" message
- [x] "Did you mean..." suggestions
- [x] Popular categories grid (3-4 CategoryCard)
- [x] "Browse all businesses" link

---

## Phase 2: Search Page ✅

### 2.1 Create Search Client Component
**File:** `src/app/search/search-client.tsx`
- [x] Create SearchClient as client component
- [x] Import useSearchParams, useRouter
- [x] Manage filter state from URL params
- [x] Handle search, filter, sort, pagination

### 2.2 URL State Management
- [x] Parse URL params on mount: q, category, rating, open, sort, page
- [x] Create updateURL function to push new params
- [x] Debounce search input (300ms)
- [x] Sync local state with URL

### 2.3 Filter Logic
- [x] Filter businesses by query (name, description match)
- [x] Filter by category (if selected)
- [x] Filter by rating (>= selected rating)
- [x] Filter by open status (checks actual business hours)
- [x] Apply all filters in sequence

### 2.4 Sort Logic
- [x] Sort by relevance (default, based on query match)
- [x] Sort by rating (highest first)
- [x] Sort by name A-Z
- [x] Sort by name Z-A

### 2.5 Pagination Logic
- [x] Set page size constant (20)
- [x] Calculate total pages from filtered results
- [x] Slice results for current page
- [x] Reset to page 1 when filters change

### 2.6 Update Search Page
**File:** `src/app/search/page.tsx`
- [x] Update metadata (title, description)
- [x] Import SearchClient component
- [x] Pass initial data (businesses, categories)

### 2.7 Search Page Layout
- [x] Large SearchBar at top
- [x] "Showing results for: [query]" or "Browse All Businesses"
- [x] Two-column layout: Filters sidebar | Results grid
- [x] Mobile: Filters in collapsible Sheet
- [x] Results header with count and sort dropdown
- [x] Results grid
- [x] Pagination at bottom
- [x] No results state when empty

### 2.8 Mobile Filters Sheet
- [x] Filter button visible on mobile
- [x] Opens Sheet with SearchFilters
- [x] "Apply Filters" button to close
- [x] Show active filter count on button

---

## Phase 3: Legal Components ✅

### 3.1 Create Legal Components Directory
- [x] Create `src/components/legal/` directory

### 3.2 Legal Layout Component
**File:** `src/components/legal/legal-layout.tsx`
- [x] Create LegalLayout component
- [x] Props: title, lastUpdated, sections, children
- [x] Two-column desktop layout
- [x] Single column mobile layout
- [x] Slot for TOC and content

### 3.3 Table of Contents Component
**File:** `src/components/legal/table-of-contents.tsx`
- [x] Create TableOfContents component
- [x] Props: sections array (id, title)
- [x] Desktop: Sticky sidebar with links
- [x] Mobile: Accordion that collapses
- [x] Click handler scrolls to section
- [x] Active section highlighting (use IntersectionObserver)

### 3.4 Legal Section Component
**File:** `src/components/legal/legal-section.tsx`
- [x] Create LegalSection component
- [x] Props: id, title, children
- [x] H2 heading with id for anchor
- [x] Proper spacing and typography
- [x] Scroll margin for fixed header offset

### 3.5 Legal Content Styles
**File:** Update `src/app/globals.css` if needed
- [x] Add prose-like styling for legal content
- [x] List styling (ul, ol)
- [x] Paragraph spacing
- [x] Strong/emphasis styling

---

## Phase 4: Privacy Policy Page ✅

### 4.1 Create Privacy Page
**File:** `src/app/privacy/page.tsx`
- [x] Create page.tsx with metadata
- [x] Import LegalLayout and components

### 4.2 Define Sections
- [x] Define sections array with id and title for TOC
- [x] Sections: collection, usage, sharing, cookies, security, rights, contact

### 4.3 Write Content
- [x] Section 1: Information We Collect
  - [x] Account information paragraph
  - [x] Business listing information
  - [x] Usage data list
- [x] Section 2: How We Use Your Information
  - [x] Purpose list (services, listings, notifications, AI, analytics)
- [x] Section 3: Information Sharing
  - [x] Third parties list
  - [x] Legal requirements
- [x] Section 4: Cookies and Tracking
  - [x] Cookie types table or list
  - [x] Management instructions
- [x] Section 5: Data Security
  - [x] Security measures paragraph
- [x] Section 6: Your Rights
  - [x] Rights list (access, correct, delete, export, opt-out)
- [x] Section 7: Contact Us
  - [x] Email and address

---

## Phase 5: Terms of Service Page ✅

### 5.1 Create Terms Page
**File:** `src/app/terms/page.tsx`
- [x] Create page.tsx with metadata
- [x] Import LegalLayout and components

### 5.2 Define Sections
- [x] Sections: acceptance, accounts, listings, ai-usage, payments, prohibited, liability, changes, contact

### 5.3 Write Content
- [x] Section 1: Acceptance of Terms
  - [x] Agreement paragraph
  - [x] Eligibility requirements
- [x] Section 2: User Accounts
  - [x] Creation requirements
  - [x] Security responsibilities
  - [x] Termination policy
- [x] Section 3: Business Listings
  - [x] Claiming process
  - [x] Accuracy requirements
  - [x] Prohibited content
- [x] Section 4: AI Tools Usage
  - [x] Acceptable use policy
  - [x] Content ownership
  - [x] Limitations disclaimer
- [x] Section 5: Subscription & Payments
  - [x] Tier descriptions
  - [x] Billing terms
  - [x] Cancellation policy
- [x] Section 6: Prohibited Conduct
  - [x] Prohibited actions list
- [x] Section 7: Limitation of Liability
  - [x] "As is" disclaimer
  - [x] Damages limitation
- [x] Section 8: Changes to Terms
  - [x] Update notification process
- [x] Section 9: Contact Us
  - [x] Legal email and address

---

## Phase 6: Refund Policy Page ✅

### 6.1 Create Refund Page
**File:** `src/app/refund/page.tsx`
- [x] Create page.tsx with metadata
- [x] Import LegalLayout and components

### 6.2 Define Sections
- [x] Sections: subscriptions, consultations, process, exceptions, contact

### 6.3 Write Content
- [x] Section 1: Subscription Refunds
  - [x] 30-day guarantee
  - [x] Pro-rated annual refunds
  - [x] Monthly plan terms
- [x] Section 2: Consultation Services
  - [x] Cancellation policy
  - [x] Partial completion refunds
  - [x] Satisfaction guarantee
- [x] Section 3: Refund Process
  - [x] How to request
  - [x] Required information
  - [x] Processing timeframe
- [x] Section 4: Exceptions
  - [x] Non-refundable situations
- [x] Section 5: Contact Us
  - [x] Billing email and support hours

---

## Phase 7: Navigation & Polish ✅

### 7.1 Update Site Footer
**File:** `src/components/site-footer.tsx`
- [x] Verify legal links in footer
- [x] Links: Privacy Policy, Terms of Service, Refund Policy
- [x] Ensure links point to /privacy, /terms, /refund

### 7.2 Update Hero Search
**File:** `src/components/home/hero-section.tsx`
- [x] Verify hero search form submits to /search?q=
- [x] Ensure search redirects work correctly

### 7.3 Run Lint & Typecheck
- [x] Run `npm run lint` and fix errors
- [x] Run `npm run typecheck` and fix type errors

### 7.4 Search Testing
- [x] Test search with various queries
- [x] Test each filter individually
- [x] Test filter combinations
- [x] Test pagination
- [x] Test URL state preservation (refresh page)
- [x] Test empty/no results state

### 7.5 Legal Pages Testing
- [x] Test TOC navigation on desktop
- [x] Test accordion TOC on mobile
- [x] Test scroll-to-section behavior
- [x] Test active section highlighting
- [x] Verify all sections have proper IDs

### 7.6 Responsive Testing
- [x] Test search page on mobile (filters sheet)
- [x] Test search page on tablet/desktop
- [x] Test legal pages TOC behavior at all breakpoints

### 7.7 Dark Mode Testing
- [x] Verify search components in dark mode
- [x] Verify legal pages in dark mode
- [x] Check text readability and contrast

---

## File Summary

### New Files to Create

```
src/components/search/
├── search-bar.tsx
├── search-filters.tsx
├── search-results.tsx
├── search-pagination.tsx
└── no-results.tsx

src/components/legal/
├── legal-layout.tsx
├── table-of-contents.tsx
└── legal-section.tsx

src/app/
├── search/
│   ├── page.tsx (update existing)
│   └── search-client.tsx
├── privacy/
│   └── page.tsx
├── terms/
│   └── page.tsx
└── refund/
    └── page.tsx
```

### Files to Modify
```
src/app/search/page.tsx (replace placeholder)
src/components/site-footer.tsx (verify legal links)
src/components/home/hero-section.tsx (verify search action)
```

### Existing Files to Reference
```
src/lib/data/businesses.ts (searchBusinesses, getBusinessesByCategory)
src/lib/data/categories.ts (categories list)
src/components/home/business-card.tsx (BusinessCard component)
src/components/home/category-card.tsx (CategoryCard for suggestions)
src/components/shared/empty-state.tsx (EmptyState pattern)
src/components/ui/sheet.tsx (mobile filters)
src/components/ui/accordion.tsx (mobile TOC)
```
