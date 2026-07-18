import { Terminal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { NextAction } from '@/types/investigation'

interface NextBestActionProps {
  action: NextAction
}

export function NextBestAction({ action }: NextBestActionProps) {
  return (
    <Card className="border-[var(--color-accent)]/40 bg-[linear-gradient(180deg,rgba(88,166,255,0.08),transparent)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[var(--color-accent)]" />
          Next Best Action
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
            Recommended command
          </p>
          <pre className="overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 font-mono text-sm text-[var(--color-accent)]">
            {action.command}
          </pre>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
            Reason
          </p>
          <p className="text-sm leading-relaxed text-[var(--color-foreground)]">
            {action.reason}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
