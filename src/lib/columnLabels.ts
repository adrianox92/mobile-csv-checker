import { FIELD_ALIASES } from "@/constants/fields"

/**
 * Mobile.de CSV API Extension: numeric column IDs (as in Excel when headers show
 * field numbers) map to two-letter codes. Built from FIELD_ALIASES numeric aliases.
 */
const { INDEX_TO_NUMERIC_ID, INDEX_TO_CODE } = (() => {
  const id = new Map<number, string>()
  const code = new Map<number, string>()
  for (const [canonical, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const a of aliases) {
      if (/^\d+$/.test(a)) {
        const idx = parseInt(a, 10)
        if (!id.has(idx)) id.set(idx, a)
        if (!code.has(idx)) code.set(idx, canonical)
      }
    }
  }
  return { INDEX_TO_NUMERIC_ID: id, INDEX_TO_CODE: code }
})()

/**
 * 0-based column index → label for UI, e.g. `149 (ET)`.
 * Unknown columns fall back to the index string (same as internal row key).
 */
export function columnIndexToMobileLabel(index: number): string {
  const numId = INDEX_TO_NUMERIC_ID.get(index)
  const api = INDEX_TO_CODE.get(index)
  if (numId && api) return `${numId} (${api})`
  if (api) return `${index} (${api})`
  return String(index)
}

/** Short reference for financing fields (Mobile column ID → API code). */
export function financingColumnIdReference(): string {
  const parts = [
    "149 → ET",
    "150 → EU",
    "151 → EV",
    "152 → EW",
    "153 → EX",
    "160 → FE",
    "164 → FI (disclaimer)",
    "165 → FJ",
    "302 → KT (leasing disclaimer)",
  ]
  return parts.join(", ")
}
