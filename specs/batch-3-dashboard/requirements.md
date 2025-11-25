# Batch 3: Dashboard - Requirements

## Overview

Build a comprehensive user dashboard for FreddyBeach Directory with sidebar navigation. The dashboard allows users to manage their claimed businesses, access AI tools, view analytics, and manage their subscription.

**Key Architecture Decision:** Keep the site header (from root layout), add collapsible sidebar below it for dashboard routes only.

---

## Layout Architecture

### Dashboard Layout Wrapper
- Site header remains visible (from root layout)
- Sidebar appears below header for all `/dashboard/*` routes
- Main content area next to sidebar
- Use shadcn's `SidebarProvider`, `Sidebar`, `SidebarInset` components

### Sidebar Navigation
Persistent collapsible sidebar with the following items:

| Label | Icon | Route |
|-------|------|-------|
| Overview | Home | `/dashboard` |
| My Businesses | Building2 | `/dashboard/my-businesses` |
| AI Tools | Sparkles | `/dashboard/ai-tools` |
| Analytics | BarChart3 | `/dashboard/analytics` |
| Billing | CreditCard | `/dashboard/billing` |
| Settings | Settings | `/dashboard/settings` |

### Sidebar Behavior
- **Desktop:** Collapsible sidebar (icon-only when collapsed)
- **Mobile:** Hidden by default, opens as sheet drawer via hamburger trigger
- **State persistence:** Use cookie/localStorage for collapse state
- **Active state:** Highlight current route in nav

---

## Page 1: Dashboard Overview (`/dashboard`)

### Purpose
Landing page for authenticated users showing key metrics and quick access.

### Sections

#### 1.1 Welcome Header
- "Welcome back, [User Name]!" with user's first name
- Current date display
- Tier badge showing current plan

#### 1.2 Stats Cards (2x2 Grid)
Four stat cards displaying:

| Stat | Mock Value | Icon |
|------|------------|------|
| Businesses Claimed | 2 | Building2 |
| AI Tools Used This Month | 23 | Sparkles |
| Hours Saved | 12 | Clock |
| Current Plan | "Enhanced" | Crown |

Each card shows:
- Icon with background
- Stat value (large)
- Stat label (small, muted)
- Optional trend indicator (+15% vs last month)

#### 1.3 My Claimed Businesses Section
**If businesses claimed:**
- Section header: "My Businesses" with "View All" link
- Horizontal scroll or 2-column grid of business cards
- Each card shows: name, category, views this month, last updated
- Quick actions: "Edit", "View Public Page"

**If no businesses:**
- Empty state component
- Illustration or icon
- "You haven't claimed any businesses yet"
- "Browse Directory" CTA button

#### 1.4 AI Tools Quick Access
- Section header: "AI Tools" with "View All" link
- 3-4 tool cards showing most-used or featured tools
- Each card: icon, name, "Used X times", "Launch" button
- Show usage count if tool has been used

#### 1.5 Upgrade CTA Card (if on Free plan)
- Gradient or highlighted background
- "Unlock Premium Features"
- "Upgrade to Enhanced and unlock 10+ premium AI tools"
- Feature highlights with checkmarks (3-4 items)
- "Upgrade Now" button → links to pricing

#### 1.6 Consultation CTA Card
- "Need Custom Solutions?"
- Brief description of consultation services
- "Book Free AI Audit" button → /consultation

---

## Page 2: My Businesses (`/dashboard/my-businesses`)

### Purpose
Manage all claimed business listings.

### Sections

#### 2.1 Page Header
- Title: "My Businesses"
- Count badge: "(2 businesses)"
- "Claim New Business" button

#### 2.2 Business Management Cards
**For each claimed business:**
- Business hero image (thumbnail)
- Business name and category badge
- Status badge: "Active", "Pending Verification", "Featured"
- Tier badge: Free, Enhanced, Featured

**Metrics Row:**
- Views this month: "1,234 views"
- Clicks this month: "89 clicks"
- Rating: 4.7 stars

**Quick Actions:**
- "Edit Listing" button
- "View Public Page" link (opens in new tab)
- "Manage AI Tools" link
- "Upgrade" button (if not Featured)

#### 2.3 Empty State
**If no businesses claimed:**
- Large illustration
- "No businesses claimed yet"
- "Find your business in our directory and claim it"
- Primary CTA: "Browse Directory" → /
- Secondary: "How claiming works" → help/FAQ

#### 2.4 Claim Another Business CTA
- Card at bottom of list
- "Add Another Business"
- "Claim or create a new business listing"
- CTA button → business claim flow (can link to homepage search)

---

## Page 3: AI Tools (`/dashboard/ai-tools`)

### Purpose
Access and manage AI tools with usage tracking.

### Sections

#### 3.1 Page Header
- Title: "AI Tools"
- Tier badge showing current plan
- "Upgrade to unlock more tools" link (if on Free)

#### 3.2 Tool Grid
Display all AI tools organized by availability:

**Free Tools Section:**
- Section header: "Free Tools"
- Grid of tools available on Free tier
- Each card shows: icon, name, short description, usage count, "Launch" button

**Premium Tools Section:**
- Section header: "Premium Tools"
- Grid of Enhanced/Featured tier tools
- Each card shows: icon, name, short description
- If user has access: usage count, "Launch" button
- If user doesn't have access: lock icon, "Unlock with Enhanced" button

#### 3.3 Tool Card Layout
Each tool card displays:
- Tool icon with colored background
- Tool name (bold)
- Short description (1 line, truncated)
- Usage stats: "Used 12 times this month"
- Time saved: "~3 hours saved"
- Badge: "Free" (green) or "Premium" (blue/locked)
- CTA: "Launch Tool" or "Unlock"

#### 3.4 Usage Summary
- Total tools used this month
- Total generations remaining (e.g., "77/100 generations left")
- Progress bar showing usage

---

## Page 4: Individual AI Tool (`/dashboard/ai-tools/[slug]`)

### Purpose
Interactive AI tool interface with mock responses.

### Layout
Two-panel layout (side-by-side on desktop, stacked on mobile):

#### 4.1 Tool Header
- Tool icon and name
- Tool description
- Usage counter: "Used 5 times this month"
- Generations remaining badge

#### 4.2 Input Panel (Left)
- Large textarea for input
- Pre-filled with example input from `aiTools` data
- Optional controls based on tool:
  - Review Responder: Tone selector (Professional, Friendly, Apologetic)
  - Social Post: Platform selector (Instagram, Facebook, Twitter)
  - Business Description: Length selector (Short, Medium, Long)
  - Email Template: Template type selector
- "Generate" button (primary, full width)

#### 4.3 Output Panel (Right)
**Before generation:**
- Empty state: "Click Generate to create your response"
- Shows what to expect

**During generation:**
- Loading skeleton
- "Generating..." text

**After generation (mock):**
- Display `exampleOutput` from tool data
- For Review Responder: Show 3 response variations
- Each response card has:
  - Response text
  - Character count
  - "Copy" button with success feedback
  - "Regenerate This One" button

#### 4.4 History Section (Optional)
- "Past Generations" collapsible section
- Show last 5 mock generations
- Each with timestamp and preview

#### 4.5 Upgrade Prompt (if premium tool + free user)
- Full-page overlay or prominent banner
- "This tool requires Enhanced plan"
- Feature preview (blurred output)
- "Upgrade Now" CTA

---

## Page 5: Analytics (`/dashboard/analytics`)

### Purpose
Placeholder for future analytics dashboard.

### Content
- "Coming Soon" illustration
- Title: "Analytics Dashboard"
- Description: "Soon you'll see detailed insights about your business performance"
- Preview features list:
  - "Business profile views over time"
  - "Click-through rates"
  - "AI tool usage trends"
  - "Customer engagement metrics"
- "Notify Me" email signup (optional, can be mock)

---

## Page 6: Billing (`/dashboard/billing`)

### Purpose
View current plan and manage subscription.

### Sections

#### 6.1 Current Plan Card
- Plan name with badge (Free, Enhanced, Featured)
- Price: "$99/year" or "Free"
- Status: "Active" or "Trial"
- Renewal date: "Renews on Jan 15, 2026"
- "Manage Plan" or "Upgrade" button

#### 6.2 Upgrade CTA (if on Free)
- Feature comparison mini-grid
- "Upgrade to Enhanced" CTA

#### 6.3 Coming Soon Sections
- Invoice History: "Coming Soon" placeholder
- Payment Methods: "Coming Soon" placeholder
- "Contact support for billing inquiries" link

---

## Page 7: Settings (`/dashboard/settings`)

### Purpose
Placeholder for account settings.

### Content
- "Coming Soon" illustration
- Title: "Account Settings"
- Description: "Account settings are in development"
- Preview features list:
  - "Edit profile information"
  - "Notification preferences"
  - "Password & security"
  - "Connected accounts"
- Temporary: "Contact support for account changes" link with email

---

## Mock Data Requirements

### User Dashboard Data
Create `src/lib/data/user-dashboard.ts`:

```typescript
interface MockUser {
  id: string;
  name: string;
  email: string;
  tier: "free" | "enhanced" | "featured";
  joinedAt: Date;
}

interface MockDashboardStats {
  businessesClaimed: number;
  aiToolsUsedThisMonth: number;
  hoursSaved: number;
  generationsUsed: number;
  generationsLimit: number;
}

interface MockClaimedBusiness {
  businessId: string;
  business: Business; // from existing types
  claimedAt: Date;
  status: "active" | "pending" | "suspended";
  viewsThisMonth: number;
  clicksThisMonth: number;
}

interface MockToolUsage {
  toolId: string;
  usageCount: number;
  lastUsed: Date;
  hoursSaved: number;
}
```

---

## Technical Requirements

### Sidebar Component
- Use existing `src/components/ui/sidebar.tsx` from shadcn
- Key components: `SidebarProvider`, `Sidebar`, `SidebarContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarTrigger`, `SidebarInset`

### Route Protection
- All dashboard pages should check for session
- If no session, show sign-in prompt (existing pattern)
- Don't redirect, show inline auth message

### Data Sources
- AI tools: `src/lib/data/ai-tools.ts`
- Businesses: `src/lib/data/businesses.ts`
- Pricing: `src/lib/data/packages.ts`
- Mock user data: Create `src/lib/data/user-dashboard.ts`

### Design Requirements
- Consistent with existing design system
- Dark mode support throughout
- Mobile-first responsive
- Use existing shared components where possible

---

## Out of Scope
- Real authentication checks (use mock signed-in state)
- Real API calls (all mock data)
- Real AI generation (show example outputs)
- Payment processing
- Actual settings changes
