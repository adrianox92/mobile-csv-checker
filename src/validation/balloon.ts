import type { ProductType, ValidationMode, VehicleCheckResult } from "@/types"
import {
  financingBaseComplete,
  hasAnyFinancing,
  readFinancingValues,
} from "@/validation/financing"
import {
  isExNonZeroForBalloon,
  isExPositiveBalloonAmount,
  isExZeroOrEmpty,
} from "@/lib/exAmount"
import { isEmpty } from "@/lib/normalize"
import { buildHeaderValueMap, getFieldValue } from "@/lib/fieldResolve"

const PRODUCT: ProductType = "balloon"

export function validateBalloon(
  rowIndex: number,
  vehicleId: string,
  rawRow: Record<string, unknown>,
  _mode: ValidationMode,
): VehicleCheckResult {
  /* Balloon rules do not differ by flexible vs strict in the MVP. */
  void _mode
  const lookup = buildHeaderValueMap(rawRow)
  const f = readFinancingValues(lookup)
  const present: string[] = []
  const notes: string[] = []

  for (const [code, val] of Object.entries(f)) {
    if (!isEmpty(val)) present.push(code)
  }

  const exVal = getFieldValue(lookup, "EX")

  if (!hasAnyFinancing(f)) {
    return {
      rowIndex,
      vehicleId,
      product: PRODUCT,
      status: "NO_DATA",
      presentFields: [],
      missingFields: ["ET", "EU", "EV", "EW", "EX"],
      notes: ["No financing fields were found for this row."],
    }
  }

  const missing: string[] = []
  for (const c of ["ET", "EU", "EV", "EW", "EX"] as const) {
    if (isEmpty(f[c])) missing.push(c)
  }

  if (financingBaseComplete(f) && isExPositiveBalloonAmount(exVal)) {
    return {
      rowIndex,
      vehicleId,
      product: PRODUCT,
      status: "OK",
      presentFields: present,
      missingFields: [],
      notes: [],
    }
  }

  if (financingBaseComplete(f) && isExZeroOrEmpty(exVal)) {
    notes.push(
      "EX is empty or zero; this row matches Loaning, not Balloon.",
    )
    return {
      rowIndex,
      vehicleId,
      product: PRODUCT,
      status: "CONFLICT",
      presentFields: present,
      missingFields: [],
      notes,
    }
  }

  if (isExNonZeroForBalloon(exVal) && !financingBaseComplete(f)) {
    notes.push(
      "EX is set but base financing fields ET–EW are incomplete; data may be inconsistent.",
    )
    return {
      rowIndex,
      vehicleId,
      product: PRODUCT,
      status: "CONFLICT",
      presentFields: present,
      missingFields: missing,
      notes,
    }
  }

  if (
    financingBaseComplete(f) &&
    isExNonZeroForBalloon(exVal) &&
    !isExPositiveBalloonAmount(exVal)
  ) {
    notes.push("EX is not a valid numeric balloon amount.")
  } else if (isExZeroOrEmpty(exVal)) {
    notes.push(
      "EX (balloon amount EUR) must be non-zero for Balloon financing.",
    )
  }

  return {
    rowIndex,
    vehicleId,
    product: PRODUCT,
    status: "WARNING",
    presentFields: present,
    missingFields: missing,
    notes,
  }
}
