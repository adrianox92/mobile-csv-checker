import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ProductSelection, ValidationMode } from "@/types"

interface ControlsProps {
  product: ProductSelection
  onProduct: (v: ProductSelection) => void
  mode: ValidationMode
  onMode: (v: ValidationMode) => void
  onAnalyze: () => void
  analyzeDisabled: boolean
  busy?: boolean
}

const productItems: Record<ProductSelection, string> = {
  loaning: "Loaning",
  balloon: "Balloon",
  leasing: "Leasing",
  all: "All products",
}

const modeItems: Record<ValidationMode, string> = {
  flexible: "Flexible (partial data → WARNING)",
  strict: "Strict (all required fields)",
}

export function Controls({
  product,
  onProduct,
  mode,
  onMode,
  onAnalyze,
  analyzeDisabled,
  busy,
}: ControlsProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex min-w-[220px] flex-col gap-2">
        <Label htmlFor="product-select">Product to validate</Label>
        <Select
          value={product}
          onValueChange={(v) => onProduct(v as ProductSelection)}
          items={productItems}
        >
          <SelectTrigger id="product-select" className="w-full min-w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(productItems) as [ProductSelection, string][]).map(
              ([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex min-w-[280px] flex-col gap-2">
        <Label htmlFor="mode-select">Validation mode</Label>
        <Select
          value={mode}
          onValueChange={(v) => onMode(v as ValidationMode)}
          items={modeItems}
        >
          <SelectTrigger id="mode-select" className="w-full min-w-[280px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(modeItems) as [ValidationMode, string][]).map(
              ([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        onClick={onAnalyze}
        disabled={analyzeDisabled || busy}
      >
        {busy ? "Working…" : "Analyze"}
      </Button>
    </div>
  )
}
