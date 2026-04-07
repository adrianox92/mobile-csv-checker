import Papa from "papaparse"

import { normalizeCell } from "@/lib/normalize"

export interface ParseCsvResult {
  rows: Record<string, unknown>[]
  /** Header names in file order (column A = index 0, column B = index 1). */
  fieldsInOrder: string[]
  rowCount: number
  errors: string[]
}

/**
 * When the file has no header row, Papa uses the first data line as column names
 * (e.g. "13", "CC12260", …). That breaks field codes like "149" (ET).
 *
 * We only use this heuristic (not "any column equals 149/295/…"), because numeric
 * Mobile.de IDs (295 = KJ, etc.) often appear as **values** in vehicle rows and
 * would falsely look like real headers.
 */
function looksLikeDataRowUsedAsHeaders(
  fields: readonly string[] | undefined,
): boolean {
  if (!fields || fields.length < 2) return false
  const a = normalizeCell(fields[0])
  const b = normalizeCell(fields[1])
  if (!/^\d+$/.test(a)) return false
  return /^[A-Z]{2}\d+$/i.test(b)
}

function arrayRowToRecord(row: unknown[]): Record<string, unknown> {
  const o: Record<string, unknown> = {}
  for (let i = 0; i < row.length; i++) {
    o[String(i)] = row[i]
  }
  return o
}

/**
 * Parse CSV in the browser (full file read, then Papa Parse).
 * Large files: shows progress after parse completes (row count as feedback).
 */
export function parseCsvFile(
  file: File,
  onProgress?: (rowsParsed: number) => void,
): Promise<ParseCsvResult> {
  return file.text().then((text) => {
    if (!text.trim()) {
      return {
        rows: [],
        fieldsInOrder: [],
        rowCount: 0,
        errors: ["The file is empty."],
      }
    }

    const parsed = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.replace(/^\uFEFF/, "").trim(),
      delimiter: "",
    })

    let rows = parsed.data.filter(
      (row): row is Record<string, unknown> =>
        row !== null && typeof row === "object" && !Array.isArray(row),
    )

    let fieldsInOrder = parsed.meta.fields ?? []

    if (looksLikeDataRowUsedAsHeaders(fieldsInOrder)) {
      const delim = parsed.meta.delimiter ?? ";"
      const raw = Papa.parse<string[]>(text, {
        header: false,
        skipEmptyLines: "greedy",
        delimiter: delim,
      })
      const dataRows = raw.data.filter((line) =>
        line.some((c) => normalizeCell(c) !== ""),
      )
      rows = dataRows.map(arrayRowToRecord)
      const maxLen = dataRows.reduce((m, r) => Math.max(m, r.length), 0)
      fieldsInOrder = Array.from({ length: maxLen }, (_, i) => String(i))
    }

    const errors = parsed.errors.map((e) => e.message ?? String(e))

    onProgress?.(rows.length)

    return {
      rows,
      fieldsInOrder,
      rowCount: rows.length,
      errors: errors.slice(0, 20),
    }
  })
}
