import { Badge } from '@/components/ui/badge'
import type { AnalysisResult, InvestigationInput } from '@/types/investigation'

interface AnalysisSummaryBarProps {
  input: InvestigationInput
  analysis: AnalysisResult
}

export function AnalysisSummaryBar({ input, analysis }: AnalysisSummaryBarProps) {
  const parts = [
    analysis.category,
    analysis.severity,
    `OCP ${input.ocpVersion}`,
    input.platform,
    input.topology,
    input.managedService !== 'None' ? input.managedService : null,
    input.mustGatherAvailable ? 'must-gather' : null,
  ].filter(Boolean)

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm">
      {parts.map((part) => (
        <Badge key={String(part)} variant="secondary">
          {part}
        </Badge>
      ))}
      {analysis.patternGroups.map((group) => (
        <Badge key={group} variant="default">
          {group}
        </Badge>
      ))}
      {analysis.candidateCategories.length > 1 && (
        <span className="text-xs text-[var(--color-muted)]">
          Candidates:{' '}
          {analysis.candidateCategories
            .map((c) => `${c.category} (${c.score})`)
            .join(' · ')}
        </span>
      )}
    </div>
  )
}
