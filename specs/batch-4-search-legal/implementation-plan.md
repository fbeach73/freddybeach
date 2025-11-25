# Batch 4: Search & Legal Pages - Implementation Plan

## Overview
Build full search functionality and three legal pages (Privacy, Terms, Refund).

---

## Phase 1: Search Components

### 1.1 Create Search Components Directory
- [ ] Create `src/components/search/` directory

### 1.2 Search Bar Component
**File:** `src/components/search/search-bar.tsx`
- [ ] Create SearchBar component with large input styling
- [ ] Search icon on left side
- [ ] Clear button (X) on right when text present
- [ ] Props: value, onChange, onSubmit, placeholder
- [ ] Handle Enter key submit
- [ ] Autofocus option

### 1.3 Search Filters Component
**File:** `src/components/search/search-filters.tsx`
- [ ] Create SearchFilters component
- [ ] Props: filters state, onFilterChange callbacks

**Category Filter:**
- [ ] Multi-select using shadcn Popover + Command
- [ ] Checkbox list of all categories
- [ ] Show selected count badge
- [ ] "Clear" button for category

**Rating Filter:**
- [ ] Button group or radio buttons
- [ ] Options: Any, 3+, 4+, 4.5+

**Open Now Toggle:**
- [ ] Switch component with label

**Clear All:**
- [ ] "Clear All Filters" button
- [ ] Only visible when filters active

### 1.4 Search Results Grid Component
**File:** `src/components/search/search-results.tsx`
- [ ] Create SearchResults component
- [ ] Props: businesses array, isLoading
- [ ] Map businesses to BusinessCard
- [ ] Responsive grid: 1/2/3 columns
- [ ] Loading state with Skeleton cards

### 1.5 Search Pagination Component
**File:** `src/components/search/search-pagination.tsx`
- [ ] Create SearchPagination component
- [ ] Props: currentPage, totalPages, onPageChange
- [ ] Previous/Next buttons
- [ ] Page number buttons (show 5 at a time)
- [ ] "Page X of Y" text

### 1.6 No Results Component
**File:** `src/components/search/no-results.tsx`
- [ ] Create NoResults component
- [ ] Props: query, suggestedCategories
- [ ] Illustration or icon
- [ ] "No businesses found" message
- [ ] "Did you mean..." suggestions
- [ ] Popular categories grid (3-4 CategoryCard)
- [ ] "Browse all businesses" link

---

## Phase 2: Search Page

### 2.1 Create Search Client Component
**File:** `src/app/search/search-client.tsx`
- [ ] Create SearchClient as client component
- [ ] Import useSearchParams, useRouter
- [ ] Manage filter state from URL params
- [ ] Handle search, filter, sort, pagination

### 2.2 URL State Management
- [ ] Parse URL params on mount: q, category, rating, open, sort, page
- [ ] Create updateURL function to push new params
- [ ] Debounce search input (300ms)
- [ ] Sync local state with URL

### 2.3 Filter Logic
- [ ] Filter businesses by query (name, description match)
- [ ] Filter by category (if selected)
- [ ] Filter by rating (>= selected rating)
- [ ] Filter by open status (mock: random selection)
- [ ] Apply all filters in sequence

### 2.4 Sort Logic
- [ ] Sort by relevance (default, based on query match)
- [ ] Sort by rating (highest first)
- [ ] Sort by name A-Z
- [ ] Sort by name Z-A

### 2.5 Pagination Logic
- [ ] Set page size constant (20)
- [ ] Calculate total pages from filtered results
- [ ] Slice results for current page
- [ ] Reset to page 1 when filters change

### 2.6 Update Search Page
**File:** `src/app/search/page.tsx`
- [ ] Update metadata (title, description)
- [ ] Import SearchClient component
- [ ] Pass initial data (businesses, categories)

### 2.7 Search Page Layout
- [ ] Large SearchBar at top
- [ ] "Showing results for: [query]" or "Browse All Businesses"
- [ ] Two-column layout: Filters sidebar | Results grid
- [ ] Mobile: Filters in collapsible Sheet
- [ ] Results header with count and sort dropdown
- [ ] Results grid
- [ ] Pagination at bottom
- [ ] No results state when empty

### 2.8 Mobile Filters Sheet
- [ ] Filter button visible on mobile
- [ ] Opens Sheet with SearchFilters
- [ ] "Apply Filters" button to close
- [ ] Show active filter count on button

---

## Phase 3: Legal Components

### 3.1 Create Legal Components Directory
- [ ] Create `src/components/legal/` directory

### 3.2 Legal Layout Component
**File:** `src/components/legal/legal-layout.tsx`
- [ ] Create LegalLayout component
- [ ] Props: title, lastUpdated, sections, children
- [ ] Two-column desktop layout
- [ ] Single column mobile layout
- [ ] Slot for TOC and content

### 3.3 Table of Contents Component
**File:** `src/components/legal/table-of-contents.tsx`
- [ ] Create TableOfContents component
- [ ] Props: sections array (id, title)
- [ ] Desktop: Sticky sidebar with links
- [ ] Mobile: Accordion that collapses
- [ ] Click handler scrolls to section
- [ ] Active section highlighting (use IntersectionObserver)

### 3.4 Legal Section Component
**File:** `src/components/legal/legal-section.tsx`
- [ ] Create LegalSection component
- [ ] Props: id, title, children
- [ ] H2 heading with id for anchor
- [ ] Proper spacing and typography
- [ ] Scroll margin for fixed header offset

### 3.5 Legal Content Styles
**File:** Update `src/app/globals.css` if needed
- [ ] Add prose-like styling for legal content
- [ ] List styling (ul, ol)
- [ ] Paragraph spacing
- [ ] Strong/emphasis styling

---

## Phase 4: Privacy Policy Page

### 4.1 Create Privacy Page
**File:** `src/app/privacy/page.tsx`
- [ ] Create page.tsx with metadata
- [ ] Import LegalLayout and components

### 4.2 Define Sections
- [ ] Define sections array with id and title for TOC
- [ ] Sections: collection, usage, sharing, cookies, security, rights, contact

### 4.3 Write Content
- [ ] Section 1: Information We Collect
  - [ ] Account information paragraph
  - [ ] Business listing information
  - [ ] Usage data list
- [ ] Section 2: How We Use Your Information
  - [ ] Purpose list (services, listings, notifications, AI, analytics)
- [ ] Section 3: Information Sharing
  - [ ] Third parties list
  - [ ] Legal requirements
- [ ] Section 4: Cookies and Tracking
  - [ ] Cookie types table or list
  - [ ] Management instructions
- [ ] Section 5: Data Security
  - [ ] Security measures paragraph
- [ ] Section 6: Your Rights
  - [ ] Rights list (access, correct, delete, export, opt-out)
- [ ] Section 7: Contact Us
  - [ ] Email and address

---

## Phase 5: Terms of Service Page

### 5.1 Create Terms Page
**File:** `src/app/terms/page.tsx`
- [ ] Create page.tsx with metadata
- [ ] Import LegalLayout and components

### 5.2 Define Sections
- [ ] Sections: acceptance, accounts, listings, ai-usage, payments, prohibited, liability, changes, contact

### 5.3 Write Content
- [ ] Section 1: Acceptance of Terms
  - [ ] Agreement paragraph
  - [ ] Eligibility requirements
- [ ] Section 2: User Accounts
  - [ ] Creation requirements
  - [ ] Security responsibilities
  - [ ] Termination policy
- [ ] Section 3: Business Listings
  - [ ] Claiming process
  - [ ] Accuracy requirements
  - [ ] Prohibited content
- [ ] Section 4: AI Tools Usage
  - [ ] Acceptable use policy
  - [ ] Content ownership
  - [ ] Limitations disclaimer
- [ ] Section 5: Subscription & Payments
  - [ ] Tier descriptions
  - [ ] Billing terms
  - [ ] Cancellation policy
- [ ] Section 6: Prohibited Conduct
  - [ ] Prohibited actions list
- [ ] Section 7: Limitation of Liability
  - [ ] "As is" disclaimer
  - [ ] Damages limitation
- [ ] Section 8: Changes to Terms
  - [ ] Update notification process
- [ ] Section 9: Contact Us
  - [ ] Legal email and address

---

## Phase 6: Refund Policy Page

### 6.1 Create Refund Page
**File:** `src/app/refund/page.tsx`
- [ ] Create page.tsx with metadata
- [ ] Import LegalLayout and components

### 6.2 Define Sections
- [ ] Sections: subscriptions, consultations, process, exceptions, contact

### 6.3 Write Content
- [ ] Section 1: Subscription Refunds
  - [ ] 30-day guarantee
  - [ ] Pro-rated annual refunds
  - [ ] Monthly plan terms
- [ ] Section 2: Consultation Services
  - [ ] Cancellation policy
  - [ ] Partial completion refunds
  - [ ] Satisfaction guarantee
- [ ] Section 3: Refund Process
  - [ ] How to request
  - [ ] Required information
  - [ ] Processing timeframe
- [ ] Section 4: Exceptions
  - [ ] Non-refundable situations
- [ ] Section 5: Contact Us
  - [ ] Billing email and support hours

---

## Phase 7: Navigation & Polish

### 7.1 Update Site Footer
**File:** `src/components/site-footer.tsx`
- [ ] Verify legal links in footer
- [ ] Links: Privacy Policy, Terms of Service, Refund Policy
- [ ] Ensure links point to /privacy, /terms, /refund

### 7.2 Update Hero Search
**File:** `src/components/home/hero-section.tsx`
- [ ] Verify hero search form submits to /search?q=
- [ ] Ensure search redirects work correctly

### 7.3 Run Lint & Typecheck
- [ ] Run `npm run lint` and fix errors
- [ ] Run `npm run typecheck` and fix type errors

### 7.4 Search Testing
- [ ] Test search with various queries
- [ ] Test each filter individually
- [ ] Test filter combinations
- [ ] Test pagination
- [ ] Test URL state preservation (refresh page)
- [ ] Test empty/no results state

### 7.5 Legal Pages Testing
- [ ] Test TOC navigation on desktop
- [ ] Test accordion TOC on mobile
- [ ] Test scroll-to-section behavior
- [ ] Test active section highlighting
- [ ] Verify all sections have proper IDs

### 7.6 Responsive Testing
- [ ] Test search page on mobile (filters sheet)
- [ ] Test search page on tablet/desktop
- [ ] Test legal pages TOC behavior at all breakpoints

### 7.7 Dark Mode Testing
- [ ] Verify search components in dark mode
- [ ] Verify legal pages in dark mode
- [ ] Check text readability and contrast

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
