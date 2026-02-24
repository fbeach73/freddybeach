# Google Places (New) API — Data Overview

## Quick Answer: Same Fields for All Categories

**The data pulled from Google Places is identical for every business, regardless of category.** The same API field mask is used for all searches. Categories only affect the *search query* and optional `includedType` filter used to find businesses — they do not change which fields come back from Google.

---

## Data Pipeline Summary

```
Google Places API (New)  →  Admin Import UI  →  PostgreSQL (Drizzle)  →  UI Components
         ↓                        ↓                     ↓
   Text Search API         Photos downloaded       Published businesses
   with field mask         to Vercel Blob          queried by category
```

1. Admin searches via `/admin/import` (or bulk import)
2. Google returns results with the requested field mask
3. Admin selects businesses, assigns a category, clicks Import
4. Import route downloads photos to Vercel Blob, inserts DB row as `status: "draft"`
5. Admin publishes businesses to make them visible on the public site

---

## Fields Requested from Google Places API

Defined in `src/lib/services/google-places.ts` as `SEARCH_FIELDS`:

| Google API Field | Requested? |
|---|---|
| `places.id` | Yes |
| `places.displayName` | Yes |
| `places.formattedAddress` | Yes |
| `places.shortFormattedAddress` | Yes |
| `places.location` (lat/lng) | Yes |
| `places.types` | Yes |
| `places.primaryType` | Yes |
| `places.primaryTypeDisplayName` | Yes |
| `places.photos` | Yes |
| `places.regularOpeningHours` | Yes |
| `places.rating` | Yes |
| `places.userRatingCount` | Yes |
| `places.priceLevel` | Yes |
| `places.websiteUri` | Yes |
| `places.nationalPhoneNumber` | Yes |
| `places.googleMapsUri` | Yes |
| `places.businessStatus` | Yes |

The detail endpoint (`getPlaceDetails`) adds `internationalPhoneNumber`.

---

## How Google Fields Map to Database Columns

### Directly From Google

| DB Column | Source | Notes |
|---|---|---|
| `name` | `displayName.text` | Business name |
| `phone` | `nationalPhoneNumber` | e.g. `(506) 555-1234` |
| `website` | `websiteUri` | Full URL |
| `address` | `formattedAddress` | Full formatted string |
| `postalCode` | `formattedAddress` | Regex-extracted Canadian postal code (`A1A 1A1`) |
| `city` | `formattedAddress` | Parsed from comma-separated address |
| `latitude` | `location.latitude` | Decimal |
| `longitude` | `location.longitude` | Decimal |
| `rating` | `rating` | Google's aggregate (e.g. `4.5`) |
| `reviewCount` | `userRatingCount` | Total Google reviews |
| `hours` | `regularOpeningHours.periods` | Parsed into `BusinessHours[]` JSONB |
| `googlePlaceId` | `place.id` | Unique, used for dedup |
| `imageUrl` | First photo | Downloaded to Vercel Blob at import |
| `images` | Up to 5 photos | Downloaded to Vercel Blob at import |
| `googlePlaceData` | Full response | Raw JSONB blob stored for future use |

### NOT From Google (Set at Import or Manually)

| DB Column | Source | Notes |
|---|---|---|
| `id` | Generated | nanoid |
| `slug` | Generated from `name` | URL-friendly |
| `description` | Stub | Set to `"[primaryType] in Fredericton"` — must be manually enriched |
| `categoryId` | Admin-assigned | Selected during import |
| `email` | **Never populated** | Google Places API does not return emails |
| `province` | Hardcoded | `"NB"` |
| `status` | Default `"draft"` | Must be manually published |
| `isFeatured` | Default `false` | Admin toggle |
| `displayOrder` | Default `0` | Admin sort |
| `badges` | Empty array | Admin-managed |
| `ownerId` / `claimedAt` | Null | Set when business is claimed |

---

## The `googlePlaceData` JSONB Blob

The full raw Google response is stored in this column for future use. It contains:

```typescript
{
  displayName:         { text: string, languageCode: string }
  formattedAddress:    string
  types:               string[]        // e.g. ["restaurant", "food", "point_of_interest"]
  primaryType:         string           // e.g. "restaurant"
  photos:              Array<{ name: string, widthPx: number, heightPx: number }>
  regularOpeningHours: { openNow: boolean, weekdayDescriptions: string[], periods: [...] }
  rating:              number
  userRatingCount:     number
  priceLevel:          string           // e.g. "PRICE_LEVEL_MODERATE"
  websiteUri:          string
  nationalPhoneNumber: string
}
```

**Currently unused fields** stored in the blob (available for future features):
- `priceLevel` — Could display price range ($, $$, $$$)
- `types[]` — Could show multiple business types / tags
- `primaryTypeDisplayName` — Human-readable type label
- `googleMapsUri` — Direct link to Google Maps listing
- `businessStatus` — Whether the business is operational
- `weekdayDescriptions` — Pre-formatted hours strings from Google

---

## Photo Handling

Google photo resource names (e.g., `places/ABC123/photos/XYZ`) are **not** browser-accessible URLs. At import time:

1. Photos are fetched server-side from `https://places.googleapis.com/v1/{photoName}/media?maxWidthPx=800&maxHeightPx=600`
2. Uploaded to Vercel Blob Storage at `businesses/{businessId}/photo-{index}.jpg`
3. The Vercel Blob URLs are stored in `imageUrl` (first photo) and `images[]` (up to 5)
4. Original Google photo resource names are preserved in `googlePlaceData.photos`

---

## Category → Search Query Mapping

Categories control **what businesses are found**, not what data comes back. Defined in `CATEGORY_SEARCH_MAPPING` in the bulk import route:

| Category | Search Query | Google `includedType` |
|---|---|---|
| restaurants | `"restaurants"` | `restaurant` |
| cafes | `"cafes bakeries coffee"` | `cafe` |
| retail | `"retail shops stores"` | `store` |
| services | `"professional services lawyers accountants"` | — |
| healthcare | `"healthcare medical clinic doctors"` | `doctor` |
| plumbing | `"plumbers plumbing"` | — |
| electrical | `"electricians electrical"` | — |
| hvac | `"hvac heating cooling furnace"` | — |
| contractors | `"general contractors construction renovation"` | — |
| roofing | `"roofing contractors"` | — |
| landscaping | `"landscaping lawn care"` | — |
| cleaning | `"cleaning services"` | — |
| pest-control | `"pest control exterminator"` | — |
| arts | `"entertainment attractions museums galleries"` | `tourist_attraction` |
| automotive | `"auto repair car service mechanics"` | `car_repair` |
| beauty | `"salon spa beauty hair"` | `hair_care` |
| fitness | `"gym fitness"` | `gym` |
| hotels | `"hotels lodging accommodation"` | `lodging` |
| nightlife | `"bars nightclub pub"` | `bar` |
| pets | `"veterinary pet store grooming"` | `veterinary_care` |
| real-estate | `"real estate agents"` | `real_estate_agency` |
| *(catch-all)* | `"local services businesses"` | — |

Categories `parody` and `local-news` are blog-only and have no Google Places mapping.

---

## Key Gaps

| Gap | Detail |
|---|---|
| **No email** | Google Places API does not return business emails. Always `null` after import. |
| **Stub descriptions** | Set to `"[Type] in Fredericton"` at import. Must be manually written or AI-generated. |
| **Price level unused** | `priceLevel` is stored in the JSONB blob but not displayed anywhere. |
| **Google Maps link unused** | `googleMapsUri` is stored but not rendered in the UI. |
| **Business types unused** | `types[]` array is stored but not surfaced as tags or filters. |
| **No auto-refresh** | Data is a point-in-time snapshot. No sync mechanism to update hours, ratings, or photos. |
| **All imports start as draft** | Admin must manually publish each business after import. |

---

## Key Source Files

| File | Purpose |
|---|---|
| `src/lib/services/google-places.ts` | Google Places API client, field masks, search/detail functions |
| `src/lib/services/blob-storage.ts` | Photo download and Vercel Blob upload |
| `src/lib/schema.ts` | Database schema (business table definition) |
| `src/lib/data/businesses-db.ts` | DB query layer, row-to-Business conversion |
| `src/app/api/admin/google-places/search/route.ts` | Search API route |
| `src/app/api/admin/google-places/import/route.ts` | Single import API route |
| `src/app/api/admin/google-places/bulk-import/route.ts` | Bulk import with category mapping |
| `src/app/api/admin/google-places/photo/route.ts` | Photo proxy for admin preview |
| `src/components/business/` | All business detail UI components |
