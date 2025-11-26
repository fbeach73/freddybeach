/**
 * Duplicate detection utilities for business imports
 * Provides fuzzy matching for name and address comparisons
 */

/**
 * Normalize a business name for comparison
 * - Lowercases
 * - Removes common business suffixes (Inc, LLC, etc.)
 * - Removes punctuation
 * - Trims whitespace
 */
export function normalizeBusinessName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(inc|llc|ltd|corp|co|company|limited|incorporated)\b\.?/gi, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalize an address for comparison
 * - Lowercases
 * - Standardizes common abbreviations
 * - Removes suite/unit numbers
 * - Removes punctuation
 * - Normalizes whitespace
 */
export function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    // Standardize street types
    .replace(/\bst\b\.?/g, "street")
    .replace(/\bave\b\.?/g, "avenue")
    .replace(/\brd\b\.?/g, "road")
    .replace(/\bdr\b\.?/g, "drive")
    .replace(/\bblvd\b\.?/g, "boulevard")
    .replace(/\bln\b\.?/g, "lane")
    .replace(/\bct\b\.?/g, "court")
    .replace(/\bpl\b\.?/g, "place")
    .replace(/\bhwy\b\.?/g, "highway")
    // Standardize directions
    .replace(/\bn\b\.?/g, "north")
    .replace(/\bs\b\.?/g, "south")
    .replace(/\be\b\.?/g, "east")
    .replace(/\bw\b\.?/g, "west")
    // Remove suite/unit numbers
    .replace(/,?\s*(suite|ste|unit|apt|#)\s*[\w-]+/gi, "")
    // Remove floor numbers
    .replace(/,?\s*(floor|fl)\s*\d+/gi, "")
    // Remove punctuation except spaces
    .replace(/[^\w\s]/g, " ")
    // Normalize whitespace
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Check if two businesses are likely duplicates based on fuzzy name+address matching
 * Both name AND address must match for a positive duplicate detection
 */
export function isFuzzyDuplicate(
  newBusiness: { name: string; address: string },
  existing: { name: string; address: string }
): boolean {
  const normalizedNewName = normalizeBusinessName(newBusiness.name);
  const normalizedExistingName = normalizeBusinessName(existing.name);
  const normalizedNewAddress = normalizeAddress(newBusiness.address);
  const normalizedExistingAddress = normalizeAddress(existing.address);

  // Both name AND address must match
  const nameMatch = normalizedNewName === normalizedExistingName;
  const addressMatch = normalizedNewAddress === normalizedExistingAddress;

  return nameMatch && addressMatch;
}

/**
 * Check a business against a list of existing businesses for duplicates
 * Returns the first matching duplicate or undefined
 */
export function findDuplicate<T extends { name: string; address: string | null; googlePlaceId?: string | null }>(
  newBusiness: { name: string; address: string; googlePlaceId: string },
  existingBusinesses: T[]
): { duplicate: T; reason: "duplicate_google_id" | "duplicate_name_address" } | undefined {
  for (const existing of existingBusinesses) {
    // First check exact googlePlaceId match
    if (existing.googlePlaceId && existing.googlePlaceId === newBusiness.googlePlaceId) {
      return { duplicate: existing, reason: "duplicate_google_id" };
    }

    // Then check fuzzy name+address match (only if existing has an address)
    if (existing.address && isFuzzyDuplicate(newBusiness, { name: existing.name, address: existing.address })) {
      return { duplicate: existing, reason: "duplicate_name_address" };
    }
  }

  return undefined;
}
