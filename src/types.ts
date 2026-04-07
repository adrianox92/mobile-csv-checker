export type CheckStatus = "OK" | "WARNING" | "NO_DATA" | "CONFLICT"

export type ProductType = "loaning" | "balloon" | "leasing"

/** User selection including “all products” */
export type ProductSelection = ProductType | "all"

export type ValidationMode = "flexible" | "strict"

/** SSK: instalment_plan.interest_rate_type (nullable in API; 1=fixed, 2=variable, 3=combined). */
export const LeasingInterestRateType = {
  Fixed: 1,
  Variable: 2,
  Combined: 3,
} as const

export type LeasingInterestRateTypeId =
  (typeof LeasingInterestRateType)[keyof typeof LeasingInterestRateType]

/** KL → PRIVATE_LEASING vs PROFESSIONAL_LEASING: 1=private, 2=professional, 3=both */
export const LeasingTargetGroup = {
  Private: 1,
  Professional: 2,
  Both: 3,
} as const

export interface VehicleCheckResult {
  rowIndex: number
  vehicleId: string
  product: ProductType
  status: CheckStatus
  presentFields: string[]
  missingFields: string[]
  notes: string[]
}

export interface AnalysisSummary {
  totalVehicles: number
  totalResultRows: number
  byStatus: Record<CheckStatus, number>
  byProduct: Partial<Record<ProductType, number>>
  missingFieldCounts: Record<string, number>
}
