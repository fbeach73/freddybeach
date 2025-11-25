# Batch 4: Search & Legal Pages - Requirements

## Overview

Build full search functionality and legal pages for FreddyBeach Directory. Replace the existing search placeholder with a complete search experience, and create privacy policy, terms of service, and refund policy pages.

---

## Page 1: Search Results (`/search`)

### Purpose
Allow users to search and filter businesses in the directory.

### URL State Management
Use URL search params for all filter state (enables bookmarking and sharing):

| Param | Purpose | Example |
|-------|---------|---------|
| `q` | Search query | `?q=pizza` |
| `category` | Category filter (comma-separated) | `?category=restaurants,cafes` |
| `rating` | Minimum rating | `?rating=4` |
| `open` | Open now filter | `?open=true` |
| `sort` | Sort order | `?sort=rating` |
| `page` | Pagination | `?page=2` |

### Sections

#### 1.1 Search Bar (Prominent)
- Large search input at top of page
- Pre-filled with current query from URL
- Search icon inside input
- Clear button (X) when text present
- Submit on Enter or button click
- Updates URL with new query

#### 1.2 Query Display
- "Showing results for: '[query]'" when query exists
- "Browse All Businesses" when no query
- Result count: "Found 12 businesses"

#### 1.3 Filter Sidebar
Collapsible on mobile, always visible on desktop:

**Category Filter:**
- Multi-select dropdown or checkbox list
- All categories from `categories` data
- Shows selected count badge
- Clear button for category filter

**Rating Filter:**
- Radio buttons or button group
- Options: "Any", "3+ stars", "4+ stars", "4.5+ stars"
- Default: "Any"

**Open Now Toggle:**
- Switch component
- Label: "Open Now"
- Filters to businesses currently open (mock: randomly select some)

**Clear All Filters:**
- Button to reset all filters
- Only shows when filters are active

#### 1.4 Results Header
- Result count: "Found X businesses"
- Sort dropdown:
  - "Relevance" (default when searching)
  - "Highest Rated"
  - "Name A-Z"
  - "Name Z-A"
- Grid/List view toggle (optional)

#### 1.5 Results Grid
- Use existing `BusinessCard` component
- 3-column grid on desktop, 2 on tablet, 1 on mobile
- 20 businesses per page max
- Loading skeleton while filtering

#### 1.6 No Results State
When no businesses match:
- Illustration or icon
- "No businesses found for '[query]'"
- Suggestions section:
  - "Did you mean..." with similar category names
  - "Try these popular categories" with 3-4 category cards
  - "Browse all businesses" link

#### 1.7 Pagination
When results exceed 20:
- Page numbers with current highlighted
- Previous/Next buttons
- "Page X of Y" indicator
- Updates URL `?page=` param
- Scroll to top on page change

---

## Page 2: Privacy Policy (`/privacy`)

### Purpose
Legal disclosure of data practices.

### Sections

#### 2.1 Header
- Title: "Privacy Policy"
- Last updated: "Last updated: November 2024"
- Effective date notice

#### 2.2 Table of Contents (Sidebar)
**Desktop:** Sticky sidebar on left
**Mobile:** Collapsible accordion above content

Sections:
1. Information We Collect
2. How We Use Your Information
3. Information Sharing
4. Cookies and Tracking
5. Data Security
6. Your Rights
7. Contact Us

#### 2.3 Content Sections

**1. Information We Collect**
- Account information (name, email, Google profile)
- Business listing information
- Usage data and analytics
- Device and browser information

**2. How We Use Your Information**
- Provide and improve services
- Process business listings
- Send notifications and updates
- AI tool personalization
- Analytics and research

**3. Information Sharing**
- Third-party service providers
- Legal requirements
- Business transfers
- With your consent

**4. Cookies and Tracking**
- Essential cookies (authentication, preferences)
- Analytics cookies (usage patterns)
- How to manage cookies
- Third-party cookies

**5. Data Security**
- Encryption and security measures
- Access controls
- Incident response

**6. Your Rights**
- Access your data
- Correct inaccuracies
- Delete your account
- Export your data
- Opt-out of marketing

**7. Contact Us**
- Email: privacy@freddybeach.com (mock)
- Mailing address
- Response timeframe

---

## Page 3: Terms of Service (`/terms`)

### Purpose
Legal agreement for using the platform.

### Sections

#### 3.1 Header
- Title: "Terms of Service"
- Last updated: "Last updated: November 2024"
- "By using FreddyBeach, you agree to these terms"

#### 3.2 Table of Contents
Sections:
1. Acceptance of Terms
2. User Accounts
3. Business Listings
4. AI Tools Usage
5. Subscription & Payments
6. Prohibited Conduct
7. Limitation of Liability
8. Changes to Terms
9. Contact Us

#### 3.3 Content Sections

**1. Acceptance of Terms**
- Agreement to be bound
- Eligibility requirements (18+, legal entity)
- Updates to terms

**2. User Accounts**
- Account creation requirements
- Account security responsibilities
- Account termination

**3. Business Listings**
- Claiming requirements
- Accuracy requirements
- Prohibited content
- Verification process

**4. AI Tools Usage**
- Acceptable use
- Content ownership
- Generation limits
- AI limitations disclaimer

**5. Subscription & Payments**
- Tier descriptions
- Billing cycles
- Price changes
- Cancellation

**6. Prohibited Conduct**
- Misrepresentation
- Spam and abuse
- Intellectual property violations
- Security violations

**7. Limitation of Liability**
- Service provided "as is"
- Limitation of damages
- Indemnification

**8. Changes to Terms**
- Notification of changes
- Continued use constitutes acceptance

**9. Contact Us**
- Legal inquiries email
- Mailing address

---

## Page 4: Refund Policy (`/refund`)

### Purpose
Clear refund terms for paid services.

### Sections

#### 4.1 Header
- Title: "Refund Policy"
- Last updated: "Last updated: November 2024"
- Summary: "We want you to be satisfied with FreddyBeach"

#### 4.2 Table of Contents
Sections:
1. Subscription Refunds
2. Consultation Services
3. Refund Process
4. Exceptions
5. Contact Us

#### 4.3 Content Sections

**1. Subscription Refunds**
- 30-day money-back guarantee for new subscribers
- Pro-rated refunds for annual plans
- No refunds for monthly plans after 7 days
- Downgrade vs refund options

**2. Consultation Services**
- Cancellation before service: Full refund
- Partial completion: Pro-rated refund
- Satisfaction guarantee details
- Rescheduling policy

**3. Refund Process**
- How to request a refund
- Required information
- Processing timeframe (5-10 business days)
- Refund method (original payment method)

**4. Exceptions**
- Violation of terms
- Abuse of refund policy
- Promotional pricing
- Bundle purchases

**5. Contact Us**
- Refund requests email: billing@freddybeach.com (mock)
- Support hours
- Response timeframe

---

## Technical Requirements

### Search Implementation

**Data Filtering:**
- Use existing `searchBusinesses()` function from `businesses.ts`
- Filter by category using `getBusinessesByCategory()`
- Client-side filtering for rating and open status
- Sort results based on selected option

**URL State:**
- Use `useSearchParams()` from `next/navigation`
- Or use `nuqs` library for type-safe URL state
- Sync URL state with local filter state
- Debounce search input to avoid excessive URL updates

**Pagination:**
- Client-side pagination (mock data is small)
- 20 items per page
- Calculate total pages from filtered results

### Legal Pages Layout

**Shared Layout Component:**
Create `LegalLayout` component used by all three pages:
- Two-column layout on desktop (TOC + content)
- Single column on mobile (TOC accordion + content)
- Sticky TOC on scroll (desktop)
- Smooth scroll to section on TOC click

**Table of Contents:**
- Auto-generate from content headings
- Active section highlighting on scroll
- Click to scroll to section

### Design Requirements
- Follow existing design system
- Dark mode support
- Mobile-first responsive
- Accessible heading hierarchy
- Readable typography for legal content

---

## Out of Scope
- Real search API (use existing mock data)
- Geolocation-based "Open Now" (use random mock)
- Distance-based filtering (no location data)
- Legal review of policy content (placeholder text)
- Cookie consent banner
