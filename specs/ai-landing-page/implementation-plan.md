# AI-Focused Landing Page - Implementation Plan

## Phase 1: Backup Current Homepage ✅
> Preserve the existing homepage before making changes

- [x] Create directory `src/app/home-12-04-25/`
- [x] Copy current `src/app/page.tsx` to `src/app/home-12-04-25/page.tsx`
- [x] Update backup page imports if needed to be standalone
- [x] Verify backup page loads at `/home-12-04-25`

---

## Phase 2: Update Existing Components ✅
> Make necessary modifications to existing components before creating new ones

- [x] Update `src/components/marketing/tool-preview-card.tsx`
  - [x] Change "Available Now" badge text to "Live" (line 60-62)
  - [x] Keep green styling (`bg-green-600 text-white`)

---

## Phase 3: Create New Section Components ✅
> Build each section component individually

### 3.1 AI Hero Section
- [x] Create `src/components/home/ai-hero-section.tsx`
  - [x] Add badge: "AI-Powered Business Tools"
  - [x] Add headline: "Create Stunning AI Images for Your Business"
  - [x] Add subheadline about helping businesses with AI
  - [x] Add hero visual placeholder/image
  - [x] Add primary CTA with AuthDialog integration (sign-up tab)
  - [x] Add secondary CTA with scroll to tools section
  - [x] Implement responsive layout (stacked mobile, 2-col desktop)

### 3.2 Featured Businesses Section
- [x] Create `src/components/home/featured-businesses-section.tsx`
  - [x] Add SectionHeader: "Featured Local Businesses"
  - [x] Integrate existing `FeaturedBusinessesCarousel` component
  - [x] Add link below carousel: "Explore the full directory" → `/search`
  - [x] Accept `businesses` prop for data

### 3.3 AI Tools Grid Section
- [x] Create `src/components/home/ai-tools-grid.tsx`
  - [x] Add SectionHeader: "AI Tools for Your Business"
  - [x] Add subtext about free sign-up
  - [x] Create responsive 4-column grid layout
  - [x] Map `getSortedTools()` to `ToolPreviewCard` components
  - [x] Ensure AI Image Generator appears first
  - [x] Implement responsive: 1 col mobile, 2 col tablet, 4 col desktop

### 3.4 Testimonials Slider Section
- [x] Create `src/components/home/testimonials-slider.tsx`
  - [x] Add SectionHeader: "What Local Businesses Are Saying"
  - [x] Implement Carousel with all 5 testimonials
  - [x] Map testimonials to `TestimonialCard` components
  - [x] Add dot indicators for navigation (custom implementation)
  - [x] Configure loop and responsive arrows
  - [x] Hide arrows on mobile, show on tablet+
  - [x] Ensure touch swipe works on mobile

### 3.5 Consultation CTA Section
- [x] Create `src/components/home/consultation-cta.tsx`
  - [x] Add gradient background styling
  - [x] Add headline: "Ready to Transform Your Business with AI?"
  - [x] Add subheadline about consultation value
  - [x] Add CTA button: "Book a Free Consultation" → `/consultation`
  - [x] Optional: Add trust signals (years, businesses helped)
  - [x] Center-align content

---

## Phase 4: Assemble New Homepage ✅
> Replace the homepage with new section components

- [x] Update `src/app/page.tsx`
  - [x] Remove old component imports
  - [x] Add new component imports:
    - `AIHeroSection`
    - `FeaturedBusinessesSection`
    - `AIToolsGrid`
    - `TestimonialsSlider`
    - `ConsultationCTA`
  - [x] Keep `getFeaturedBusinessesFromDb` import
  - [x] Update page structure:
    ```
    AIHeroSection (full width)
    Container:
      - FeaturedBusinessesSection
      - AIToolsGrid
      - TestimonialsSlider
    ConsultationCTA (full width)
    ```
  - [x] Keep `revalidate = 60` for ISR

---

## Phase 5: Verification & Polish ✅
> Ensure everything works correctly

- [x] Run `pnpm lint` and fix any issues
- [x] Run `pnpm typecheck` and fix any issues
- [x] Test responsive layouts:
  - [x] Mobile (<640px)
  - [x] Tablet (640-1024px)
  - [x] Desktop (>1024px)
- [x] Test functionality:
  - [x] AuthDialog opens from hero CTA
  - [x] Scroll to tools section from secondary CTA
  - [x] Featured businesses carousel works
  - [x] Tool cards link to correct pages
  - [x] Testimonials slider navigation works
  - [x] Consultation CTA links to `/consultation`
  - [x] Backup page loads at `/home-12-04-25`
- [x] Visual review:
  - [x] Consistent spacing between sections
  - [x] Dark mode compatibility
  - [x] Image loading and placeholders

---

## Files Summary

### Files to Create
| File | Phase |
|------|-------|
| `src/app/home-12-04-25/page.tsx` | Phase 1 |
| `src/components/home/ai-hero-section.tsx` | Phase 3.1 |
| `src/components/home/featured-businesses-section.tsx` | Phase 3.2 |
| `src/components/home/ai-tools-grid.tsx` | Phase 3.3 |
| `src/components/home/testimonials-slider.tsx` | Phase 3.4 |
| `src/components/home/consultation-cta.tsx` | Phase 3.5 |

### Files to Modify
| File | Phase | Change |
|------|-------|--------|
| `src/components/marketing/tool-preview-card.tsx` | Phase 2 | "Available Now" → "Live" |
| `src/app/page.tsx` | Phase 4 | Replace with new structure |

---

## Dependencies
- All existing shadcn/ui components are already installed
- No new packages required
- No database changes needed
