# Homepage & Layout Components - Requirements

## Feature Overview

Build the homepage and layout components for FreddyBeach.com - a business directory for Fredericton, NB. This is Phase 1: UI/UX prototyping using mock data only (no backend integration).

## Business Context

FreddyBeach.com helps users discover local businesses in Fredericton, New Brunswick. The homepage serves as the main entry point, showcasing featured businesses, categories, and AI tools available to business owners.

---

## Functional Requirements

### FR-1: Site Header

- **FR-1.1**: Display FreddyBeach branding with MapPin icon
- **FR-1.2**: Navigation links: Browse, AI Tools, Success Stories
- **FR-1.3**: Search button that navigates to `/search`
- **FR-1.4**: User profile component (existing auth)
- **FR-1.5**: Dark/light mode toggle
- **FR-1.6**: Mobile navigation drawer (responsive)

### FR-2: Site Footer

- **FR-2.1**: FreddyBeach logo with tagline
- **FR-2.2**: Directory links: Browse All, Categories, Add Your Business
- **FR-2.3**: Company links: About, Contact, Advertise
- **FR-2.4**: Legal links: Privacy Policy, Terms of Service
- **FR-2.5**: Copyright notice with year
- **FR-2.6**: "Made in Fredericton, NB" attribution

### FR-3: Homepage Hero Section

- **FR-3.1**: Badge displaying "Fredericton's Local Business Directory"
- **FR-3.2**: Main headline: "Discover Local Businesses in Freddy Beach"
- **FR-3.3**: Subtitle about supporting local businesses
- **FR-3.4**: Search input with placeholder text
- **FR-3.5**: Search button that navigates to `/search` page

### FR-4: Featured Businesses Carousel

- **FR-4.1**: Section header with "Featured Businesses" title
- **FR-4.2**: "View all" link navigating to `/search`
- **FR-4.3**: Carousel with previous/next navigation
- **FR-4.4**: Business cards showing: image, name, rating, description, address, open status
- **FR-4.5**: Cards link to `/business/[slug]`
- **FR-4.6**: Display tier badge for enhanced/featured businesses

### FR-5: Category Grid

- **FR-5.1**: Section header: "Browse by Category"
- **FR-5.2**: Grid of 10 category cards
- **FR-5.3**: Each card shows: icon, category name, business count
- **FR-5.4**: Cards link to `/category/[slug]`

### FR-6: AI Tools Teaser

- **FR-6.1**: Section header: "Free AI Tools for Local Businesses"
- **FR-6.2**: "See all tools" link to `/ai-tools`
- **FR-6.3**: Display 2 free AI tool cards
- **FR-6.4**: Each card shows: icon, name, description, features list
- **FR-6.5**: "Try it free" button on each card

### FR-7: Testimonial Section

- **FR-7.1**: Section header: "What Local Businesses Are Saying"
- **FR-7.2**: Single featured testimonial with quote
- **FR-7.3**: Display person name, title, business name
- **FR-7.4**: Link to success stories page

### FR-8: SEO Content Section

- **FR-8.1**: Heading about Fredericton's local economy
- **FR-8.2**: 2-3 paragraphs of marketing/SEO content
- **FR-8.3**: Content about Fredericton business community

### FR-9: Search Placeholder Page

- **FR-9.1**: Page header: "Search Businesses"
- **FR-9.2**: Search input (non-functional)
- **FR-9.3**: Empty state indicating search coming soon

---

## Non-Functional Requirements

### NFR-1: Responsive Design

- Mobile-first approach
- Breakpoints: mobile (default), sm (640px), md (768px), lg (1024px)
- Carousel: 1 card mobile, 2 tablet, 3 desktop
- Category grid: 2 cols mobile, 3-4 tablet, 5 desktop
- Footer: stacked mobile, 4-column desktop

### NFR-2: Dark Mode Support

- All components must support dark/light themes
- Use shadcn/ui color tokens (bg-background, text-foreground, etc.)
- Respect user's system preference

### NFR-3: Accessibility

- Semantic HTML elements (nav, main, footer, section)
- Alt text for images
- Focus states on interactive elements
- Keyboard navigation support

### NFR-4: Performance

- Use Next.js Image component for optimized images
- Lazy load carousel images
- Minimal client-side JavaScript

### NFR-5: Code Quality

- TypeScript strict mode
- ESLint compliance
- Consistent component patterns

---

## Data Requirements

All data sourced from mock files in `src/lib/data/`:

| Data | Source | Usage |
|------|--------|-------|
| Featured Businesses | `getFeaturedBusinesses()` | Carousel |
| Categories | `categories` | Category grid |
| Free AI Tools | `getFreeTools()` | AI tools teaser |
| Featured Testimonials | `getFeaturedTestimonials()` | Testimonial section |

---

## Design Specifications

### Color Theme

- Warm OKLCH color palette (browns, tans, golds)
- Primary: Rich brown/tan
- Secondary: Light beige
- Accent: Pale yellow
- Background: Off-white (light) / Dark gray (dark)

### Typography

- Sans-serif: Oxanium
- Serif: Merriweather
- Monospace: Fira Code

### Component Library

- shadcn/ui components only
- Existing shared components: RatingStars, TierBadge, ClaimBadge, OpenStatus

---

## Out of Scope (Phase 1)

- Backend API integration
- Database connections
- Real search functionality
- User authentication flows (beyond existing)
- Business detail pages
- Category listing pages
- Payment/subscription features
- Unit and E2E testing
