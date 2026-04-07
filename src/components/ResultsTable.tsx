import { Fragment, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  FIELD_LABELS,
  FINANCING_CODES,
  LEASING_ALL_CODES,
} from "@/constants/fields"
import { buildHeaderValueMap, getFieldValue } from "@/lib/fieldResolve"
import type { CheckStatus, ProductType, VehicleCheckResult } from "@/types"
import { readFinancingValues, readKtLeasingConditions } from "@/validation/financing"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"

interface ResultsTableProps {
  results: VehicleCheckResult[]
  /** Original CSV rows (same index as `VehicleCheckResult.rowIndex`). */
  sourceRows?: Record<string, unknown>[]
}

function formatCellValue(v: unknown): string {
  if (v === null || v === undefined) return "—"
  if (typeof v === "object") return JSON.stringify(v)
  const s = String(v)
  return s.trim() === "" ? "—" : s
}

/** Resolved values for the API field codes that apply to this product row. */
function productFieldRows(
  row: Record<string, unknown> | undefined,
  product: ProductType,
): { code: string; label: string; value: string }[] {
  if (!row) return []
  const lookup = buildHeaderValueMap(row)
  if (product === "leasing") {
    return LEASING_ALL_CODES.map((code) => ({
      code,
      label: FIELD_LABELS[code] ?? code,
      value: formatCellValue(
        code === "KT"
          ? readKtLeasingConditions(lookup)
          : getFieldValue(lookup, code),
      ),
    }))
  }
  const financing = readFinancingValues(lookup)
  return FINANCING_CODES.map((code) => ({
    code,
    label: FIELD_LABELS[code] ?? code,
    value: formatCellValue(financing[code]),
  }))
}

type StatusFilterValue = "all" | CheckStatus

const statusFilterLabels: Record<StatusFilterValue, string> = {
  all: "All statuses",
  OK: "OK",
  WARNING: "WARNING",
  NO_DATA: "NO DATA",
  CONFLICT: "CONFLICT",
}

function statusBadgeClass(status: CheckStatus): string {
  switch (status) {
    case "OK":
      return "border-transparent bg-emerald-600/15 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100"
    case "WARNING":
      return "border-transparent bg-amber-500/15 text-amber-900 dark:bg-amber-500/20 dark:text-amber-50"
    case "NO_DATA":
      return ""
    case "CONFLICT":
      return ""
    default:
      return ""
  }
}

function StatusBadge({ status }: { status: CheckStatus }) {
  const variant =
    status === "CONFLICT"
      ? "destructive"
      : status === "NO_DATA"
        ? "outline"
        : status === "OK"
          ? "default"
          : "secondary"

  return (
    <Badge
      variant={variant}
      className={cn(
        status === "OK" && statusBadgeClass(status),
        status === "WARNING" && statusBadgeClass(status),
      )}
    >
      {status}
    </Badge>
  )
}

export function ResultsTable({
  results,
  sourceRows = [],
}: ResultsTableProps) {
  const [vehicleIdQuery, setVehicleIdQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all")
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set())

  const hasSourceData = sourceRows.length > 0

  const toggleExpanded = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const normalizedQuery = vehicleIdQuery.trim().toLowerCase()
  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false
      if (!normalizedQuery) return true
      return r.vehicleId.toLowerCase().includes(normalizedQuery)
    })
  }, [results, normalizedQuery, statusFilter])

  const hasActiveFilters =
    normalizedQuery.length > 0 || statusFilter !== "all"

  if (results.length === 0) return null

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle>Results</CardTitle>
            <CardDescription>
              One row per vehicle and product checked. Present and missing fields
              use API codes (ET, KH, …); in your file those match column IDs such
              as 149 (ET), 150 (EU) when headers follow the Mobile.de layout.
              {hasActiveFilters ? (
                <>
                  {" "}
                  Showing{" "}
                  <span className="text-foreground font-medium tabular-nums">
                    {filteredResults.length}
                  </span>{" "}
                  of{" "}
                  <span className="text-foreground font-medium tabular-nums">
                    {results.length}
                  </span>{" "}
                  rows.
                </>
              ) : null}
            </CardDescription>
          </div>
          <div className="flex w-full flex-col gap-4 sm:max-w-md sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as StatusFilterValue)}
                items={statusFilterLabels}
              >
                <SelectTrigger id="status-filter" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(statusFilterLabels) as [
                      StatusFilterValue,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="vehicle-id-search">Search by Vehicle ID</Label>
              <Input
                id="vehicle-id-search"
                type="search"
                placeholder="Filter rows…"
                value={vehicleIdQuery}
                onChange={(e) => setVehicleIdQuery(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0 sm:p-6">
        {filteredResults.length === 0 ? (
          <p className="text-muted-foreground px-6 py-8 text-center text-sm sm:px-6">
            No rows match the current filters.
          </p>
        ) : (
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 p-2">
                <span className="sr-only">Expand row</span>
              </TableHead>
              <TableHead className="min-w-[100px]">Vehicle ID</TableHead>
              <TableHead className="min-w-[80px]">Row</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="min-w-[120px]">Present fields</TableHead>
              <TableHead className="min-w-[120px]">Missing fields</TableHead>
              <TableHead className="min-w-[200px]">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.map((r, i) => {
              const rowKey = `${r.rowIndex}-${r.product}-${i}`
              const isExpanded = expandedKeys.has(rowKey)
              const rawRow = sourceRows[r.rowIndex]
              const fieldRows = productFieldRows(rawRow, r.product)

              return (
                <Fragment key={rowKey}>
                  <TableRow>
                    <TableCell className="w-10 p-1 align-middle">
                      {hasSourceData ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="text-muted-foreground"
                          aria-expanded={isExpanded}
                          aria-label={
                            isExpanded ? "Hide field values" : "Show field values"
                          }
                          onClick={() => toggleExpanded(rowKey)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="size-4" aria-hidden />
                          ) : (
                            <ChevronRight className="size-4" aria-hidden />
                          )}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground block w-6 text-center text-xs">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{r.vehicleId}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {r.rowIndex}
                    </TableCell>
                    <TableCell className="capitalize">{r.product}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="max-w-[240px] text-sm break-words">
                      {r.presentFields.length ? r.presentFields.join(", ") : "—"}
                    </TableCell>
                    <TableCell className="max-w-[240px] text-sm break-words">
                      {r.missingFields.length ? r.missingFields.join(", ") : "—"}
                    </TableCell>
                    <TableCell className="max-w-[320px] text-sm">
                      {r.notes.length ? r.notes.join(" ") : "—"}
                    </TableCell>
                  </TableRow>
                  {hasSourceData && isExpanded ? (
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableCell colSpan={8} className="p-0">
                        <div className="border-border border-t px-4 py-3">
                          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                            Fields for {r.product} (API codes)
                          </p>
                          {fieldRows.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                              No row data loaded for this result.
                            </p>
                          ) : (
                            <dl className="grid max-h-[min(60vh,28rem)] grid-cols-1 gap-x-6 gap-y-3 overflow-y-auto text-sm sm:grid-cols-2 lg:grid-cols-3">
                              {fieldRows.map(({ code, label, value }) => (
                                <div
                                  key={code}
                                  className="border-border/50 min-w-0 border-b pb-3 last:border-b-0"
                                >
                                  <dt className="min-w-0">
                                    <span className="font-mono text-xs font-semibold">
                                      {code}
                                    </span>
                                    <span className="text-muted-foreground block truncate text-xs leading-snug">
                                      {label}
                                    </span>
                                  </dt>
                                  <dd className="mt-1 break-words font-medium">
                                    {value}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  )
}
