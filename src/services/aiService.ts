import scenariosJson from '@/data/scenarios.json'
import { parseLines } from '@/lib/utils'
import type { AnalysisResult, InvestigationInput } from '@/types/investigation'
import type { Scenario } from '@/types/scenario'
import { matchScenario, scenarioToAnalysis } from '@/services/scenarioMapper'

const scenarios = scenariosJson as Scenario[]

export interface AnalyzeOptions {
  scenarioId?: number
}

/**
 * Mock analysis service backed by curated OpenShift investigation scenarios.
 * Replace with a real API later; keep returning `AnalysisResult`.
 */
export async function analyzeInvestigation(
  input: InvestigationInput,
  options: AnalyzeOptions = {},
): Promise<AnalysisResult> {
  await delay(900)

  const scenario = matchScenario(
    scenarios,
    input.title,
    input.symptoms,
    input.evidence,
    options.scenarioId,
  )

  const analysis = scenarioToAnalysis(scenario, scenarios, input)

  const customSymptoms = parseLines(input.symptoms)
  const customEvidence = parseLines(input.evidence)

  return {
    ...analysis,
    symptoms: customSymptoms.length > 0 ? customSymptoms : analysis.symptoms,
    rca: {
      ...analysis.rca,
      symptoms:
        customSymptoms.length > 0 ? customSymptoms : analysis.rca.symptoms,
      evidence:
        customEvidence.length > 0
          ? [...customEvidence, ...scenario.important_findings]
          : analysis.rca.evidence,
      problemSummary: input.title || analysis.rca.problemSummary,
    },
  }
}

export function getScenarioById(scenarioId: number): Scenario | undefined {
  return scenarios.find((s) => s.scenario_id === scenarioId)
}

export function listScenarios(): Scenario[] {
  return scenarios
}

export function scenarioToFormDefaults(
  scenario: Scenario,
): Pick<InvestigationInput, 'title' | 'symptoms' | 'evidence'> {
  return {
    title: scenario.problem_title,
    symptoms: scenario.symptoms.join('\n'),
    evidence: scenario.openshift_commands.join('\n\n'),
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
