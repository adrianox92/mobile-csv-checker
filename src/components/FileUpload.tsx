import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface FileUploadProps {
  file: File | null
  onFile: (file: File | null) => void
  disabled?: boolean
}

export function FileUpload({ file, onFile, disabled }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="csv-file">CSV file</Label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          id="csv-file"
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          disabled={disabled}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null
            onFile(f)
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          Choose file
        </Button>
        <span className="text-muted-foreground text-sm">
          {file ? file.name : "No file selected"}
        </span>
      </div>
    </div>
  )
}
