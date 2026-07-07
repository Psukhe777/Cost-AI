'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CodeBlock({
  code,
  filename,
  language = 'bash',
}: {
  code: string
  filename?: string
  language?: string
}) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    })
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border bg-white/[0.02] px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">{filename ?? language}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Copy code"
        >
          {copied ? <Check className="size-3.5 text-accent" /> : <Copy className="size-3.5" />}
          <span className="font-mono text-xs">{copied ? 'copied' : 'copy'}</span>
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-6 text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  )
}
