import { useState } from 'react'
import { Check, Copy, Terminal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DiagnosticCommand } from '@/types/investigation'

interface StartHereCommandsProps {
  commands: DiagnosticCommand[]
  mustGatherAvailable: boolean
}

function targetVariant(target: DiagnosticCommand['target']) {
  if (target === 'must-gather') return 'warning' as const
  if (target === 'live') return 'default' as const
  return 'secondary' as const
}

export function StartHereCommands({
  commands,
  mustGatherAvailable,
}: StartHereCommandsProps) {
  const [copied, setCopied] = useState<string | null>(null)

  async function copyCommand(command: string) {
    await navigator.clipboard.writeText(command)
    setCopied(command)
    window.setTimeout(() => setCopied(null), 1500)
  }

  return (
    <Card className="border-[var(--color-accent)]/35">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[var(--color-accent)]" />
          Start here
        </CardTitle>
        <p className="text-xs text-[var(--color-muted)]">
          First diagnostic commands from the top-matched scenario.
          {mustGatherAvailable
            ? ' Must-gather is available — prefer tagged commands against the archive.'
            : ' Must-gather not marked available — live-cluster commands are emphasized.'}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {commands.map((item) => (
          <div
            key={item.command}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-3"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant={targetVariant(item.target)}>{item.target}</Badge>
              {item.note && (
                <span className="text-xs text-[var(--color-muted)]">{item.note}</span>
              )}
            </div>
            <div className="flex flex-wrap items-start gap-2">
              <pre className="flex-1 overflow-x-auto font-mono text-sm text-[var(--color-accent)]">
                {item.command}
              </pre>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void copyCommand(item.command)}
              >
                {copied === item.command ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                Copy
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
