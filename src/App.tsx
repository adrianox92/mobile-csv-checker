import { useCallback, useEffect, useState } from "react"

import { Controls } from "@/components/Controls"
import { FileUpload } from "@/components/FileUpload"
import { ResultsTable } from "@/components/ResultsTable"
import { ProductFieldsSection } from "@/components/ProductFieldsSection"
import { Summary } from "@/components/Summary"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { parseCsvFile } from "@/lib/csv"
import type {
  AnalysisSummary,
  ProductSelection,
  ValidationMode,
  VehicleCheckResult,
} from "@/types"
import { financingColumnIdReference } from "@/lib/columnLabels"
import { analyzeRows } from "@/validation"
import { downloadCsvFile, resultsToCsvString } from "@/utils/exportCsv"
import { AlertCircleIcon } from "lucide-react"

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [fieldsInOrder, setFieldsInOrder] = useState<string[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [parsing, setParsing] = useState(false)
  const [product, setProduct] = useState<ProductSelection>("loaning")
  const [mode, setMode] = useState<ValidationMode>("flexible")
  const [results, setResults] = useState<VehicleCheckResult[]>([])
  const [summary, setSummary] = useState<AnalysisSummary | null>(null)

  useEffect(() => {
    if (!file) {
      setRows([])
      setFieldsInOrder([])
      setParseErrors([])
      setResults([])
      setSummary(null)
      return
    }

    let cancelled = false
    setParsing(true)
    setParseErrors([])
    setResults([])
    setSummary(null)

    parseCsvFile(file)
      .then((res) => {
        if (cancelled) return
        setRows(res.rows)
        setFieldsInOrder(res.fieldsInOrder)
        setParseErrors(res.errors)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setRows([])
        setFieldsInOrder([])
        setParseErrors([
          err instanceof Error ? err.message : "Failed to read the CSV file.",
        ])
      })
      .finally(() => {
        if (!cancelled) setParsing(false)
      })

    return () => {
      cancelled = true
    }
  }, [file])

  const runAnalysis = useCallback(() => {
    if (rows.length === 0) return
    const { results: next, summary: sum } = analyzeRows(
      rows,
      product,
      mode,
      fieldsInOrder,
    )
    setResults(next)
    setSummary(sum)
  }, [rows, product, mode, fieldsInOrder])

  const reset = useCallback(() => {
    setFile(null)
    setRows([])
    setParseErrors([])
    setResults([])
    setSummary(null)
  }, [])

  const exportResults = useCallback(() => {
    if (results.length === 0) return
    const csv = resultsToCsvString(results)
    const name = `mobile-de-check-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`
    downloadCsvFile(csv, name)
  }, [results])

  const parseBlocking = parsing
  const canAnalyze = rows.length > 0 && !parseBlocking

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Mobile.de CSV Product Checker
          </h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
            Upload a CSV in{" "}
            <strong>mobile.de CSV API Extension</strong> format. Vehicle IDs use{" "}
            <strong>column B</strong> (second column) of the file. In Excel or
            Mobile.de exports, financing fields are often shown by{" "}
            <strong>column ID</strong> (header row) matching the API code:{" "}
            <span className="text-foreground font-medium">
              {financingColumnIdReference()}
            </span>
            . For example, column <strong>149</strong> is <strong>ET</strong>{" "}
            (effective interest rate). Choose a financing product (Loaning,
            Balloon, Leasing) or validate all three. Results show OK, WARNING, NO
            DATA, or CONFLICT per vehicle and product.
          </p>
        </header>

        <ProductFieldsSection />

        <Card>
          <CardHeader>
            <CardTitle>Upload &amp; options</CardTitle>
            <CardDescription>
              Parsing runs in your browser. Large files may take a moment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FileUpload
              file={file}
              onFile={setFile}
              disabled={parseBlocking}
            />

            {parseBlocking ? (
              <div className="space-y-2">
                <div
                  className="bg-muted h-2 animate-pulse rounded-full"
                  aria-hidden
                />
                <p className="text-muted-foreground text-sm">Reading file…</p>
              </div>
            ) : null}

            {!parseBlocking && file && rows.length === 0 && !parseErrors.length ? (
              <Alert>
                <AlertTitle>No rows</AlertTitle>
                <AlertDescription>
                  The file was read but no data rows were found.
                </AlertDescription>
              </Alert>
            ) : null}

            {parseErrors.length > 0 ? (
              <Alert variant="destructive">
                <AlertCircleIcon className="size-4" />
                <AlertTitle>Parse notices</AlertTitle>
                <AlertDescription>
                  <ul className="list-inside list-disc text-sm">
                    {parseErrors.slice(0, 5).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            ) : null}

            {!parseBlocking && file ? (
              <p className="text-sm">
                <span className="text-muted-foreground">Rows loaded: </span>
                <strong className="tabular-nums">{rows.length}</strong>
              </p>
            ) : null}

            <Separator />

            <Controls
              product={product}
              onProduct={setProduct}
              mode={mode}
              onMode={setMode}
              onAnalyze={runAnalysis}
              analyzeDisabled={!canAnalyze}
              busy={false}
            />

            {product === "leasing" || product === "all" ? (
              <aside
                className="text-muted-foreground border-muted rounded-md border px-3 py-2 text-xs leading-relaxed"
                aria-label="Leasing import notes"
              >
                <p className="text-foreground mb-1 font-medium">
                  Leasing disclaimer (import rules)
                </p>
                <ul className="list-inside list-disc space-y-1">
                  <li>
                    <strong>KU</strong> (total leasing amount): use gross; for{" "}
                    <strong>Professional</strong> target group (<strong>KL=2</strong>),
                    subtract VAT before mapping to net amounts.
                  </li>
                  <li>
                    <strong>KV</strong> (bank total leasing amount): stored and exposed
                    to WSK; no practical use in our systems.
                  </li>
                  <li>
                    <strong>KQ</strong> (provider/bank): include this identifier in
                    customer-facing disclaimers where your legal text references the
                    financing partner.
                  </li>
                  <li>
                    <strong>KS</strong> interest type: 1=fixed, 2=variable, 3=combined
                    (maps to instalment_plan.interest_rate_type).
                  </li>
                </ul>
              </aside>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={results.length === 0}
                onClick={exportResults}
              >
                Download results CSV
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!file && results.length === 0 && !summary}
                onClick={reset}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {summary ? <Summary summary={summary} /> : null}
        <ResultsTable results={results} sourceRows={rows} />
      </div>
    </div>
  )
}
