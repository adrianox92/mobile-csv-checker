import type { ProductType, ValidationMode, VehicleCheckResult } from "@/types"
import {
  financingBaseComplete,
  financingBasePartial,
  hasAnyFinancing,
  readFinancingValues,
} from "@/validation/financing"
import { isExNonZeroForBalloon } from "@/lib/exAmount"
import { isEmpty } from "@/lib/normalize"
import { buildHeaderValueMap, getFieldValue } from "@/lib/fieldResolve"

const PRODUCT: ProductType = "loaning"

export function validateLoaning(
  rowIndex: number,
  vehicleId: string,
  rawRow: Record<string, unknown>,
  mode: ValidationMode,
): VehicleCheckResult {
  const lookup = buildHeaderValueMap(rawRow)
  const f = readFinancingValues(lookup)
  const present: string[] = []
  const missing: string[] = []
  const notes: string[] = []

  for (const [code, val] of Object.entries(f)) {
    if (!isEmpty(val)) present.push(code)
  }

  const exVal = getFieldValue(lookup, "EX")

  if (isExNonZeroForBalloon(exVal)) {
    notes.push(
      "EX (balloon amount) is not zero; this matches Balloon financing, not Loaning.",
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

  if (!hasAnyFinancing(f)) {
    return {
      rowIndex,
      vehicleId,
      product: PRODUCT,
      status: "NO_DATA",
      presentFields: [],
      missingFields: ["ET", "EU", "EV", "EW"],
      notes: ["No financing fields were found for this row."],
    }
  }

  const baseReq = ["ET", "EU", "EV", "EW"] as const
  for (const c of baseReq) {
    if (isEmpty(f[c])) missing.push(c)
  }

  if (financingBaseComplete(f)) {
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

  if (mode === "strict" && financingBasePartial(f)) {
    notes.push("Strict mode: all base financing fields ET, EU, EV, EW are required.")
  } else if (financingBasePartial(f)) {
    notes.push("Partial financing data: some base fields are missing.")
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
