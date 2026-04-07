import {
  FIELD_ALIASES,
  FINANCING_CODES,
  LEASING_DETECTOR_CODES,
} from "@/constants/fields"
import { getFieldValue } from "@/lib/fieldResolve"
import { isEmpty, normalizeCell } from "@/lib/normalize"

export type FinancingValues = Record<string, string>

/** EW can appear in column 152 or 154; positional rows have both keys — take first non-empty. */
function readEwPrepayment(lookup: Map<string, string>): string {
  const aliases = FIELD_ALIASES.EW ?? ["ew"]
  for (const a of aliases) {
    const k = a.toLowerCase()
    if (!lookup.has(k)) continue
    const v = normalizeCell(lookup.get(k))
    if (!isEmpty(v)) return v
  }
  return ""
}

/**
 * FI (disclaimer): dealer export uses column 164; positional rows may have empty 164 — first
 * non-empty among aliases (see FIELD_ALIASES.FI).
 */
function readFiDisclaimer(lookup: Map<string, string>): string {
  const candidates = FIELD_ALIASES.FI ?? ["fi"]
  for (const a of candidates) {
    const k = a.toLowerCase()
    if (!lookup.has(k)) continue
    const v = normalizeCell(lookup.get(k))
    if (!isEmpty(v)) return v
  }
  return ""
}

export function readKtLeasingConditions(lookup: Map<string, string>): string {
  const candidates = FIELD_ALIASES.KT ?? ["kt"]
  for (const a of candidates) {
    const k = a.toLowerCase()
    if (!lookup.has(k)) continue
    const v = normalizeCell(lookup.get(k))
    if (!isEmpty(v)) return v
  }
  return ""
}

export function readFinancingValues(
  lookup: Map<string, string>,
): FinancingValues {
  const o: FinancingValues = {}
  for (const c of FINANCING_CODES) {
    o[c] =
      c === "EW"
        ? readEwPrepayment(lookup)
        : c === "FI"
          ? readFiDisclaimer(lookup)
          : getFieldValue(lookup, c)
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
