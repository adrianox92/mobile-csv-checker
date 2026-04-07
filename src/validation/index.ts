import { resolveVehicleId } from "@/lib/vehicleId"
import type {
  AnalysisSummary,
  CheckStatus,
  ProductSelection,
  ProductType,
  ValidationMode,
  VehicleCheckResult,
} from "@/types"
import { validateBalloon } from "@/validation/balloon"
import { validateLeasing } from "@/validation/leasing"
import { validateLoaning } from "@/validation/loaning"

function buildSummary(
  totalVehicles: number,
  results: VehicleCheckResult[],
): AnalysisSummary {
  const byStatus: Record<CheckStatus, number> = {
    OK: 0,
    WARNING: 0,
    NO_DATA: 0,
    CONFLICT: 0,
  }
  const byProduct: Partial<Record<ProductType, number>> = {}
  const missingFieldCounts: Record<string, number> = {}

  for (const r of results) {
    byStatus[r.status]++
    byProduct[r.product] = (byProduct[r.product] ?? 0) + 1
    for (const f of r.missingFields) {
      missingFieldCounts[f] = (missingFieldCounts[f] ?? 0) + 1
    }
  }

  return {
    totalVehicles,
    totalResultRows: results.length,
    byStatus,
    byProduct,
    missingFieldCounts,
  }
}

export function analyzeRows(
  rows: Record<string, unknown>[],
  selection: ProductSelection,
  mode: ValidationMode,
  fieldsInOrder?: readonly string[],
): { results: VehicleCheckResult[]; summary: AnalysisSummary } {
  const results: VehicleCheckResult[] = []

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i]
    const vehicleId = resolveVehicleId(raw, i, fieldsInOrder)

    if (selection === "all") {
      results.push(validateLoaning(i, vehicleId, raw, mode))
      results.push(validateBalloon(i, vehicleId, raw, mode))
      results.push(validateLeasing(i, vehicleId, raw, mode))
    } else if (selection === "loaning") {
      results.push(validateLoaning(i, vehicleId, raw, mode))
    } else if (selection === "balloon") {
      results.push(validateBalloon(i, vehicleId, raw, mode))
    } else {
      results.push(validateLeasing(i, vehicleId, raw, mode))
    }
  }

  return {
    results,
    summary: buildSummary(rows.length, results),
  }
}
