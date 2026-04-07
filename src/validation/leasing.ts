import {
  LEASING_ALL_CODES,
  LEASING_MIN_CODES,
  LEASING_STRICT_EXTRA_CODES,
} from "@/constants/fields"
import type { ProductType, ValidationMode, VehicleCheckResult } from "@/types"
import {
  hasAnyLeasingBlock,
  readKtLeasingConditions,
} from "@/validation/financing"
import { isEmpty } from "@/lib/normalize"
import { buildHeaderValueMap, getFieldValue } from "@/lib/fieldResolve"

const PRODUCT: ProductType = "leasing"

function requiredCodes(mode: ValidationMode): readonly string[] {
  if (mode === "strict") {
    return [...LEASING_MIN_CODES, ...LEASING_STRICT_EXTRA_CODES]
  }
  return LEASING_MIN_CODES
}

export function validateLeasing(
  rowIndex: number,
  vehicleId: string,
  rawRow: Record<string, unknown>,
  mode: ValidationMode,
): VehicleCheckResult {
  const lookup = buildHeaderValueMap(rawRow)
  const req = requiredCodes(mode)
  const present: string[] = []
  const missing: string[] = []
  const notes: string[] = []

  for (const c of LEASING_ALL_CODES) {
    const v =
      c === "KT" ? readKtLeasingConditions(lookup) : getFieldValue(lookup, c)
    if (!isEmpty(v)) present.push(c)
  }

  if (!hasAnyLeasingBlock(lookup)) {
    return {
      rowIndex,
      vehicleId,
      product: PRODUCT,
      status: "NO_DATA",
      presentFields: [],
      missingFields: [...req],
      notes: [
        "No leasing block was found (core columns KH–KV, KN, KO, KP, LM).",
      ],
    }
  }

  for (const c of req) {
    const v =
      c === "KT" ? readKtLeasingConditions(lookup) : getFieldValue(lookup, c)
    if (isEmpty(v)) missing.push(c)
  }

  if (missing.length === 0) {
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

  if (mode === "strict") {
    notes.push(
      "Strict mode requires all core leasing fields: KH, KI, KL, KM, KG, KJ, KK, KN, KO, KP, KQ, KR, KS, KT, KU, KV, LM.",
    )
  } else {
    notes.push(
      "Flexible mode minimum: KH (monthly rate), KI (term months), KL (target group), KM (mileage). Optional service columns NT, NY, NM–NX are not required.",
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
