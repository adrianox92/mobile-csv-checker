import { isEmpty, normalizeCell } from "@/lib/normalize"

/** Parsea importes tipo CSV (espacios, coma decimal, miles opcionales). */
export function parseAmountLoose(value: string): number | null {
  const t = normalizeCell(value).replace(/\s/g, "")
  if (t === "") return null
  const noThousands = t.replace(/\.(?=\d{3}(\D|$))/g, "")
  const normalized = noThousands.replace(",", ".")
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

/** Vacío o cero numérico → compatible con Loaning (no balloon). */
export function isExZeroOrEmpty(value: string): boolean {
  if (isEmpty(value)) return true
  const n = parseAmountLoose(value)
  return n !== null && Math.abs(n) < 1e-9
}

/** Cualquier valor distinto de vacío/cero → producto Balloon (incluye no numéricos: revisar aparte). */
export function isExNonZeroForBalloon(value: string): boolean {
  return !isExZeroOrEmpty(value)
}

/** EX numérico y distinto de cero → importe balloon válido. */
export function isExPositiveBalloonAmount(value: string): boolean {
  const n = parseAmountLoose(value)
  return n !== null && Math.abs(n) > 1e-9
}
