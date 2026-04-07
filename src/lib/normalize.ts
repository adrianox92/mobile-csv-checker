/** Trimmed cell; empty string and whitespace-only are treated as empty. */
export function normalizeCell(value: unknown): string {
  if (value === null || value === undefined) return ""
  return String(value).trim()
}

export function isEmpty(value: string): boolean {
  return normalizeCell(value) === ""
}
