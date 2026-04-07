import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
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
import type { CheckStatus, VehicleCheckResult } from "@/types"
import { cn } from "@/lib/utils"

interface ResultsTableProps {
  results: VehicleCheckResult[]
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

export function ResultsTable({ results }: ResultsTableProps) {
  const [vehicleIdQuery, setVehicleIdQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all")

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
            {filteredResults.map((r, i) => (
              <TableRow key={`${r.rowIndex}-${r.product}-${i}`}>
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
            ))}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  )
}
