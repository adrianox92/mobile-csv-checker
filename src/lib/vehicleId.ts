import { isEmpty, normalizeCell } from "@/lib/normalize"

/**
 * Resolves the vehicle identifier for one data row.
 *
 * **Primary rule:** use **column B** (second column, index `1`) in the CSV header
 * order, as in Mobile.de / Excel layout. This matches `fieldsInOrder[1]` from the
 * parser. If column B is missing or empty, named id columns are tried; last
 * resort is `row-{n}`.
 */
const VEHICLE_ID_CANDIDATES = [
  "interne_nummer",
  "internenummer",
  "interne nummer",
  "internal_number",
  "internalnumber",
  "externe_id",
  "externe id",
  "external_id",
  "external id",
  "ad-id",
  "adid",
  "mobile_ad_id",
] as const

/** Build lowercase header → value map for one row */
function rowLookup(row: Record<string, unknown>): Map<string, string> {
  const m = new Map<string, string>()
  for (const [k, v] of Object.entries(row)) {
    const key = normalizeCell(k).toLowerCase()
    if (!key) continue
    m.set(key, normalizeCell(v))
  }
  return m
}

export function resolveVehicleId(
  rawRow: Record<string, unknown>,
  rowIndex: number,
  fieldsInOrder?: readonly string[],
): string {
  if (fieldsInOrder && fieldsInOrder.length >= 2) {
    const columnBKey = fieldsInOrder[1]
    if (columnBKey) {
      const fromB = normalizeCell(rawRow[columnBKey])
      if (!isEmpty(fromB)) return fromB
    }
  }

  const lookup = rowLookup(rawRow)
  for (const cand of VEHICLE_ID_CANDIDATES) {
    const v = lookup.get(cand)
    if (v !== undefined && !isEmpty(v)) return v
  }
  return `row-${rowIndex + 1}`
}
