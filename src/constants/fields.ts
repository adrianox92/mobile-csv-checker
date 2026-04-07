/** Two-letter / numeric aliases for Mobile.de CSV API Extension (case-insensitive headers). */
/** Company import set: base = ET–EW; EX = balloon; FE/FI/FJ = extra disclosure/amounts. */
export const FINANCING_CODES = [
  "ET",
  "EU",
  "EV",
  "EW",
  "EX",
  "FE",
  "FI",
  "FJ",
] as const
export type FinancingCode = (typeof FINANCING_CODES)[number]

/** Minimum leasing fields (flexible mode). */
export const LEASING_MIN_CODES = ["KH", "KI", "KL", "KM"] as const

/**
 * Extra fields required in strict mode (company spec: core instalment_plan mapping).
 * KM is in LEASING_MIN_CODES; KN–KP, LM extend the former KH–KV block.
 */
export const LEASING_STRICT_EXTRA_CODES = [
  "KG",
  "KJ",
  "KK",
  "KN",
  "KO",
  "KP",
  "KQ",
  "KR",
  "KS",
  "KT",
  "KU",
  "KV",
  "LM",
] as const

/** Core leasing columns used for detection and strict validation (no optional services). */
export const LEASING_CORE_CODES = [
  ...LEASING_MIN_CODES,
  ...LEASING_STRICT_EXTRA_CODES,
] as const

/**
 * Optional Mobile.de extension fields (not always present): delivery, registration,
 * maintenance, insurance, tax, tires, TÜV, return insurance.
 */
export const LEASING_OPTIONAL_SERVICE_CODES = [
  "NT",
  "NY",
  "NM",
  "NN",
  "NO",
  "NP",
  "NQ",
  "NR",
  "NS",
  "NU",
  "NV",
  "NW",
  "NX",
] as const

export const LEASING_ALL_CODES = [
  ...LEASING_CORE_CODES,
  ...LEASING_OPTIONAL_SERVICE_CODES,
] as const
export type LeasingCode = (typeof LEASING_ALL_CODES)[number]

/** Any of these non-empty ⇒ row has leasing data (optional-only columns do not count alone). */
export const LEASING_DETECTOR_CODES = LEASING_CORE_CODES

/** Map canonical code → header aliases (lowercase keys matched after normalizing CSV headers). */
export const FIELD_ALIASES: Record<string, readonly string[]> = {
  ET: ["et", "149"],
  EU: ["eu", "150"],
  EV: ["ev", "151"],
  /** Prepayment; legacy Mobile.de “financing feature” column was EY (154). */
  EW: ["ew", "ey", "154"],
  EX: ["ex", "153"],
  FE: ["fe"],
  FI: ["fi"],
  FJ: ["fj"],
  KG: ["kg", "292"],
  KH: ["kh", "293"],
  KI: ["ki", "294"],
  KJ: ["kj", "295"],
  KK: ["kk", "296"],
  KL: ["kl", "297"],
  KM: ["km", "298"],
  KN: ["kn", "299"],
  KO: ["ko", "300"],
  KP: ["kp", "301"],
  KQ: ["kq", "302"],
  KR: ["kr", "303"],
  KS: ["ks", "304"],
  KT: ["kt", "305"],
  KU: ["ku", "306"],
  KV: ["kv", "307"],
  LM: ["lm", "324"],
  NT: ["nt", "383"],
  NM: ["nm", "376"],
  NN: ["nn", "377"],
  NO: ["no", "378"],
  NP: ["np", "379"],
  NQ: ["nq", "380"],
  NR: ["nr", "381"],
  NS: ["ns", "382"],
  NU: ["nu", "384"],
  NV: ["nv", "385"],
  NW: ["nw", "386"],
  NX: ["nx", "387"],
  NY: ["ny", "388"],
}

export const FIELD_LABELS: Record<string, string> = {
  ET: "Effective rate % (ET)",
  EU: "Monthly rate (EU)",
  EV: "Duration (EV)",
  EW: "Prepayment (EW)",
  EX: "Balloon amount EUR (EX)",
  FE: "Gross loan amount (FE)",
  FI: "Disclaimer text (FI)",
  FJ: "APR rate lower % (FJ)",
  KG: "Effective annual rate TAEG (KG)",
  KH: "Monthly rate / instalment (KH)",
  KI: "Term months (KI)",
  KJ: "Down payment / advance (KJ)",
  KK: "Final installment / balloon (KK)",
  KL: "Target group 1=private 2=professional 3=both (KL)",
  KM: "Total mileage km (KM)",
  KN: "Residual value / future value (KN)",
  KO: "Extra km cost gross cents (KO)",
  KP: "Reduced km cost gross cents (KP)",
  KQ: "Provider bank (KQ)",
  KR: "Nominal rate TAN (KR)",
  KS: "Interest rate type 1=fixed 2=variable 3=combined (KS)",
  KT: "Leasing conditions text (KT)",
  KU: "Total leasing amount gross (KU)",
  KV: "Bank total leasing amount (KV, WSK only)",
  LM: "Residual value discount % (LM)",
  NT: "Delivery cost one-time gross EUR (NT)",
  NY: "Registration cost one-time gross EUR (NY)",
  NM: "Maintenance per month gross EUR (NM)",
  NN: "Wear per month gross EUR (NN)",
  NO: "Maintenance & wear combined / month (NO)",
  NP: "Liability insurance monthly (NP)",
  NQ: "Liability deductible (NQ)",
  NR: "Comprehensive insurance monthly (NR)",
  NS: "Comprehensive deductible (NS)",
  NU: "Vehicle tax monthly EUR (NU)",
  NV: "8-tire service monthly EUR (NV)",
  NW: "TÜV (HU+AU) monthly EUR (NW)",
  NX: "Return insurance monthly EUR (NX)",
}
