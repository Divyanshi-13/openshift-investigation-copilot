import type { AnalysisResult, InvestigationInput } from '@/types/investigation'

export function formatCaseNote(
  input: InvestigationInput,
  analysis: AnalysisResult,
): string {
  const articles = analysis.relatedArticles
    .map((a) => `- ${a.id}: ${a.title}`)
    .join('\n')

  const commands = analysis.diagnosticCommands
    .map((c) => `- [${c.target}] ${c.command}`)
    .join('\n')

  const hypotheses = analysis.hypotheses
    .slice(0, 3)
    .map(
      (h, i) =>
        `${i + 1}. ${h.rootCause} (relevance ${h.relevanceScore})\n   Evidence: ${h.evidence.slice(0, 2).join('; ')}`,
    )
    .join('\n')

  const bugs =
    analysis.knownBugs.length > 0
      ? analysis.knownBugs
          .map(
            (b) =>
              `- ${b.id}: ${b.summary}${b.fixedIn ? ` (fixed/guidance: ${b.fixedIn})` : ''}`,
          )
          .join('\n')
      : '- None linked'

  return [
    '=== OpenShift Investigation Copilot — Case Note ===',
    '',
    `Title: ${input.title}`,
    `Environment: OCP ${input.ocpVersion} | ${input.platform} | ${input.topology} | Managed: ${input.managedService}`,
    `Must-gather available: ${input.mustGatherAvailable ? 'Yes' : 'No'}`,
    `Category: ${analysis.category} | Severity: ${analysis.severity}`,
    analysis.patternGroups.length
      ? `Patterns: ${analysis.patternGroups.join(', ')}`
      : null,
    '',
    '--- Symptoms ---',
    ...analysis.symptoms.map((s) => `- ${s}`),
    '',
    input.recentChanges.trim()
      ? `--- What changed ---\n${input.recentChanges.trim()}\n`
      : null,
    '--- Investigation Hypothesis ---',
    analysis.investigationHypothesis,
    '',
    '--- Top Hypotheses ---',
    hypotheses,
    '',
    '--- Related Articles ---',
    articles || '- None',
    '',
    '--- Known Bugs ---',
    bugs,
    '',
    '--- Start Here (diagnostic commands) ---',
    commands,
    '',
    '--- Next Best Action ---',
    analysis.nextAction.command,
    analysis.nextAction.reason,
    '',
    '--- Pre-flight Checklist ---',
    ...analysis.healthChecklist.map((c) => `- [ ] ${c}`),
    '',
    analysis.sbrSuggestion
      ? `--- SBR Suggestion ---\n${analysis.sbrSuggestion.team}: ${analysis.sbrSuggestion.reason}\n`
      : null,
    '=== End Case Note ===',
  ]
    .filter((line) => line != null)
    .join('\n')
}
