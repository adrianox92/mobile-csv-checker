import {
  FINANCING_CODES,
  LEASING_DETECTOR_CODES,
} from "@/constants/fields"
import { getFieldValue } from "@/lib/fieldResolve"
import { isEmpty } from "@/lib/normalize"

export type FinancingValues = Record<string, string>

export function readFinancingValues(
  lookup: Map<string, string>,
): FinancingValues {
  const o: FinancingValues = {}
  for (const c of FINANCING_CODES) {
    o[c] = getFieldValue(lookup, c)
  }
  return o
}

export function hasAnyFinancing(f: FinancingValues): boolean {
  return FINANCING_CODES.some((c) => !isEmpty(f[c]))
}

export function financingBaseComplete(f: FinancingValues): boolean {
  return ["ET", "EU", "EV", "EW"].every((c) => !isEmpty(f[c]))
}

export function financingBasePartial(f: FinancingValues): boolean {
  const base = ["ET", "EU", "EV", "EW"]
  const any = base.some((c) => !isEmpty(f[c]))
  const all = base.every((c) => !isEmpty(f[c]))
  return any && !all
}

export function hasAnyLeasingBlock(lookup: Map<string, string>): boolean {
  return LEASING_DETECTOR_CODES.some((c) => !isEmpty(getFieldValue(lookup, c)))
}
