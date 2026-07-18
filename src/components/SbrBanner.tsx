import { AlertTriangle } from 'lucide-react'
import type { SbrSuggestion } from '@/types/investigation'

interface SbrBannerProps {
  suggestion: SbrSuggestion
}

export function SbrBanner({ suggestion }: SbrBannerProps) {
  return (
    <div className="flex gap-3 rounded-md border border-[var(--color-warning)]/40 bg-[var(--color-warning-soft)] px-4 py-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning)]" />
      <div>
        <p className="text-sm font-semibold text-[var(--color-warning)]">
          SBR suggestion: {suggestion.team}
        </p>
        <p className="mt-1 text-sm text-[var(--color-foreground)]">
          {suggestion.reason}
        </p>
      </div>
    </div>
  )
}
