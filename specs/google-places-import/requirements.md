# Google Places Import Feature - Requirements

## Overview
Admin-only feature to manually import local businesses from Google Places API into the FreddyBeach.com directory database.

## Location & Scope
- **Location:** Admin Dashboard section (new link/tab called "Import Businesses")
- **Access:** Only visible/accessible to users with ADMIN role
- **Search Area:** Fredericton, New Brunswick, Canada (center: 45.9636, -66.6431)

## Core Functionality

### 1. Search Interface
Query Google Places API by:
- Business category/type (Google Place types)
- Keyword search
- Radius from Fredericton center (1-50km, default 10km)

### 2. Results Display
Selectable list with:
- Checkboxes for multi-select (shadcn checkbox components)
- Business name, address, Google category
- Rating and review count
- Photo thumbnail
- "Select All" / "Deselect All" buttons
- Category selector dropdown (admin assigns from existing 10 categories)
- Duplicate indicator badges

### 3. Import Action
- "Import Selected" button
- Map Google Places data to existing listings database schema
- Mark imported listings as "draft" status (for admin review before publishing)
- Prevent duplicate imports via:
  - Exact match: `google_place_id` already exists
  - Fuzzy match: Normalized name + address combination

## UI Requirements
- All shadcn/ui components
- Consistent with existing admin dashboard styling
- Loading states and skeletons
- Error handling with toast notifications
- Success toast showing count of imported businesses
- Import confirmation dialog

## Database Requirements
- Add `businesses` table to replace mock data
- Include `google_place_id` field for tracking imports
- Include `status` field (draft/published/archived)
- Include `latitude`/`longitude` for location data
- Store raw Google Places response as JSONB for reference

## Data Mapping

| Google Places Field | Business Field | Notes |
|---------------------|----------------|-------|
| `id` | `googlePlaceId` | For duplicate detection |
| `displayName.text` | `name` | Direct mapping |
| `displayName.text` | `slug` | Slugified version |
| (user selection) | `categoryId`, `categorySlug` | Admin selects during import |
| - | `description` | Empty (admin adds later) |
| - | `shortDescription` | Empty (admin adds later) |
| `formattedAddress` | `address` | Full address |
| - | `city` | Default "Fredericton" |
| - | `province` | Default "NB" |
| (parsed) | `postalCode` | Extract from address |
| `location.latitude` | `latitude` | Direct mapping |
| `location.longitude` | `longitude` | Direct mapping |
| `nationalPhoneNumber` | `phone` | Direct mapping |
| - | `email` | Empty (not in Google data) |
| `websiteUri` | `website` | Direct mapping |
| `rating` | `rating` | Direct mapping |
| `userRatingCount` | `reviewCount` | Direct mapping |
| `photos[0].name` | `heroImage` | Construct photo URL |
| `photos[*].name` | `images` | Construct photo URLs |
| - | `status` | "draft" |
| - | `isClaimed` | false |
| - | `isVerified` | false |
| - | `isFeatured` | false |
| - | `tier` | "free" |
| `regularOpeningHours` | `hours` | **Parse to BusinessHours[]** format |
| (full response) | `googlePlaceData` | Store raw for reference |

## Existing Categories (10)
1. restaurants
2. cafes (Cafes & Bakeries)
3. retail (Retail & Shopping)
4. services (Professional Services)
5. healthcare (Healthcare & Wellness)
6. home-services (Home Services)
7. arts (Arts & Entertainment)
8. automotive
9. beauty (Beauty & Personal Care)
10. fitness (Fitness & Sports)

## Google Places API Notes
- **API:** Places API (New)
- **Endpoint:** `https://places.googleapis.com/v1/places:searchText`
- **Authentication:** API key in `X-Goog-Api-Key` header
- **Photo URLs:** `https://places.googleapis.com/v1/{photo.name}/media?maxHeightPx=400&key=API_KEY`
