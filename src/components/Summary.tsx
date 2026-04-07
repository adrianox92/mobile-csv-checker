import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { AnalysisSummary, CheckStatus, ProductType } from "@/types"

interface SummaryProps {
  summary: AnalysisSummary | null
}

const STATUS_ORDER: CheckStatus[] = [
  "OK",
  "WARNING",
  "NO_DATA",
  "CONFLICT",
]

const PRODUCT_ORDER: ProductType[] = ["loaning", "balloon", "leasing"]

export function Summary({ summary }: SummaryProps) {
  if (!summary) return null

  const topMissing = Object.entries(summary.missingFieldCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
        <CardDescription>
          Vehicles in file: {summary.totalVehicles}. Result rows:{" "}
          {summary.totalResultRows}
          {summary.totalResultRows > summary.totalVehicles ? (
            <span className="text-muted-foreground">
              {" "}
              (multiple rows per vehicle when “All products” is selected)
            </span>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STATUS_ORDER.map((s) => (
            <div
              key={s}
              className="bg-muted/40 flex flex-col rounded-lg border px-3 py-2"
            >
              <span className="text-muted-foreground text-xs font-medium">
                {s}
              </span>
              <span className="text-2xl font-semibold tabular-nums">
                {summary.byStatus[s]}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        <div>
          <h3 className="mb-2 text-sm font-medium">By product</h3>
          <div className="grid gap-2 sm:grid-cols-3">
            {PRODUCT_ORDER.map((p) => (
              <div
                key={p}
                className="flex justify-between gap-2 rounded-md border px-3 py-1.5 text-sm"
              >
                <span className="capitalize">{p}</span>
                <span className="tabular-nums font-medium">
                  {summary.byProduct[p] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {topMissing.length > 0 ? (
          <>
            <Separator />
            <div>
              <h3 className="mb-2 text-sm font-medium">
                Most frequent missing fields
              </h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                {topMissing.map(([field, count]) => (
                  <li key={field} className="flex justify-between gap-4">
                    <code className="bg-muted rounded px-1 py-0.5">{field}</code>
                    <span className="tabular-nums">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
