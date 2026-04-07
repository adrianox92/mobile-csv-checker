import { Accordion } from "@base-ui/react/accordion"
import { ChevronDownIcon } from "lucide-react"
import type { ReactNode } from "react"

import {
  FIELD_LABELS,
  FINANCING_CODES,
  LEASING_MIN_CODES,
  LEASING_OPTIONAL_SERVICE_CODES,
  LEASING_STRICT_EXTRA_CODES,
} from "@/constants/fields"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

function FieldList({ codes }: { codes: readonly string[] }) {
  return (
    <ul className="border-muted space-y-1.5 rounded-md border px-3 py-2">
      {codes.map((code) => (
        <li key={code} className="text-sm leading-snug">
          <span className="text-foreground font-mono font-medium">{code}</span>
          <span className="text-muted-foreground">
            {" "}
            — {FIELD_LABELS[code] ?? code}
          </span>
        </li>
      ))}
    </ul>
  )
}

const LOANING_BASE = ["ET", "EU", "EV", "EW"] as const
const BALLOON_FIELDS = ["ET", "EU", "EV", "EW", "EX"] as const

function AccordionBlock({
  value,
  title,
  children,
}: {
  value: string
  title: string
  children: ReactNode
}) {
  return (
    <Accordion.Item
      value={value}
      className="border-muted border-b px-3 last:border-b-0"
    >
      <Accordion.Header>
        <Accordion.Trigger
          className={cn(
            "text-foreground flex w-full items-center justify-between gap-2 py-3 text-left text-sm font-semibold",
            "hover:bg-muted/50 -mx-1 rounded-md px-1 transition-colors",
            "[&[aria-expanded=true]>svg]:rotate-180",
          )}
        >
          {title}
          <ChevronDownIcon
            className="text-muted-foreground size-4 shrink-0 transition-transform"
            aria-hidden
          />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Panel className="data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-top-1 pb-4">
        <div className="space-y-2 pt-0">{children}</div>
      </Accordion.Panel>
    </Accordion.Item>
  )
}

export function ProductFieldsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fields evaluated per product</CardTitle>
        <CardDescription>
          Expand each section for Mobile.de CSV API Extension columns used in
          validation (e.g. column <span className="font-mono">149</span> ={" "}
          <span className="font-mono">ET</span>).
        </CardDescription>
      </CardHeader>
      <div className="px-4 pb-4">
        <Accordion.Root
          multiple
          defaultValue={[]}
          className="rounded-lg border"
        >
          <AccordionBlock value="loaning" title="Loaning">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Required for a complete check:{" "}
              <strong className="text-foreground">ET, EU, EV, EW</strong>.{" "}
              <span className="font-mono">EX</span> must be empty or zero; a
              non-zero balloon amount is treated as Balloon, not Loaning. A row
              is considered to have financing data if any of{" "}
              <span className="font-mono">{FINANCING_CODES.join(", ")}</span> is
              present. In strict mode, partial base fields (some of ET–EW
              filled) trigger a stricter warning.
            </p>
            <FieldList codes={LOANING_BASE} />
          </AccordionBlock>

          <AccordionBlock value="balloon" title="Balloon">
            <p className="text-muted-foreground text-sm leading-relaxed">
              All base financing fields plus a positive balloon amount:{" "}
              <strong className="text-foreground">ET, EU, EV, EW, EX</strong>.
              Rules are the same in flexible and strict mode.
            </p>
            <FieldList codes={BALLOON_FIELDS} />
          </AccordionBlock>

          <AccordionBlock value="leasing" title="Leasing">
            <p className="text-muted-foreground text-sm leading-relaxed">
              <strong className="text-foreground">Flexible mode</strong> requires
              at least:{" "}
              <span className="font-mono">{LEASING_MIN_CODES.join(", ")}</span>.{" "}
              <strong className="text-foreground">Strict mode</strong> requires
              those plus the extended core block below (company instalment_plan
              mapping). Optional service columns are listed but not required.
            </p>
            <p className="text-muted-foreground text-xs">
              Flexible minimum ({LEASING_MIN_CODES.length} fields)
            </p>
            <FieldList codes={LEASING_MIN_CODES} />
            <p className="text-muted-foreground pt-1 text-xs">
              Strict — additional required fields (
              {LEASING_STRICT_EXTRA_CODES.length} fields)
            </p>
            <FieldList codes={LEASING_STRICT_EXTRA_CODES} />
            <p className="text-muted-foreground pt-1 text-xs">
              Optional (not required):{" "}
              <span className="font-mono">
                {LEASING_OPTIONAL_SERVICE_CODES.join(", ")}
              </span>
            </p>
            <FieldList codes={LEASING_OPTIONAL_SERVICE_CODES} />
          </AccordionBlock>
        </Accordion.Root>
      </div>
    </Card>
  )
}
