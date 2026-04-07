import { FIELD_ALIASES } from "@/constants/fields"
import { normalizeCell } from "@/lib/normalize"

/** Map CSV header (any casing) → trimmed string value */
export function buildHeaderValueMap(
  row: Record<string, unknown>,
): Map<string, string> {
  const m = new Map<string, string>()
  for (const [k, v] of Object.entries(row)) {
    const key = normalizeCell(k).toLowerCase()
    if (!key) continue
    m.set(key, normalizeCell(v))
  }
  return m
}

/** Resolve a canonical field code using FIELD_ALIASES (first matching header wins). */
export function getFieldValue(
  lookup: Map<string, string>,
  canonicalCode: string,
): string {
  const aliases = FIELD_ALIASES[canonicalCode] ?? [canonicalCode]
  for (const a of aliases) {
    const k = a.toLowerCase()
    if (lookup.has(k)) return normalizeCell(lookup.get(k))
  }
  return ""
}
