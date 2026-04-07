import Papa from "papaparse"

import type { VehicleCheckResult } from "@/types"

const COLUMNS = [
  "rowIndex",
  "vehicleId",
  "product",
  "status",
  "presentFields",
  "missingFields",
  "notes",
] as const

export function resultsToCsvString(results: VehicleCheckResult[]): string {
  const rows = results.map((r) => ({
    rowIndex: r.rowIndex,
    vehicleId: r.vehicleId,
    product: r.product,
    status: r.status,
    presentFields: r.presentFields.join("; "),
    missingFields: r.missingFields.join("; "),
    notes: r.notes.join(" | "),
  }))
  const body = Papa.unparse(rows, {
    columns: [...COLUMNS],
    header: true,
  })
  return `\uFEFF${body}`
}

export function downloadCsvFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.rel = "noopener"
  a.click()
  URL.revokeObjectURL(url)
}
