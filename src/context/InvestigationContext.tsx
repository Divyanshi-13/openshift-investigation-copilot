import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AnalysisResult,
  InvestigationInput,
} from '@/types/investigation'

interface InvestigationState {
  input: InvestigationInput | null
  analysis: AnalysisResult | null
  scenarioId?: number
  setInvestigation: (
    input: InvestigationInput,
    analysis: AnalysisResult,
    scenarioId?: number,
  ) => void
  clearInvestigation: () => void
}

const InvestigationContext = createContext<InvestigationState | null>(null)

const STORAGE_KEY = 'oic-investigation'

function isUsable(
  input: InvestigationInput | null | undefined,
  analysis: AnalysisResult | null | undefined,
): boolean {
  return Boolean(
    input &&
      analysis &&
      typeof input.platform === 'string' &&
      Array.isArray(analysis.hypotheses) &&
      analysis.hypotheses.every((h) => typeof h.relevanceScore === 'number') &&
      Array.isArray(analysis.diagnosticCommands),
  )
}

function loadStored(): Pick<
  InvestigationState,
  'input' | 'analysis' | 'scenarioId'
> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return { input: null, analysis: null, scenarioId: undefined }
    const parsed = JSON.parse(raw) as {
      input: InvestigationInput
      analysis: AnalysisResult
      scenarioId?: number
    }
    if (!isUsable(parsed.input, parsed.analysis)) {
      sessionStorage.removeItem(STORAGE_KEY)
      return { input: null, analysis: null, scenarioId: undefined }
    }
    return {
      input: parsed.input,
      analysis: parsed.analysis,
      scenarioId: parsed.scenarioId,
    }
  } catch {
    return { input: null, analysis: null, scenarioId: undefined }
  }
}

export function InvestigationProvider({ children }: { children: ReactNode }) {
  const stored = loadStored()
  const [input, setInput] = useState<InvestigationInput | null>(stored.input)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(
    stored.analysis,
  )
  const [scenarioId, setScenarioId] = useState<number | undefined>(
    stored.scenarioId,
  )

  const value = useMemo<InvestigationState>(
    () => ({
      input,
      analysis,
      scenarioId,
      setInvestigation: (nextInput, nextAnalysis, nextScenarioId) => {
        setInput(nextInput)
        setAnalysis(nextAnalysis)
        setScenarioId(nextScenarioId)
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            input: nextInput,
            analysis: nextAnalysis,
            scenarioId: nextScenarioId,
          }),
        )
      },
      clearInvestigation: () => {
        setInput(null)
        setAnalysis(null)
        setScenarioId(undefined)
        sessionStorage.removeItem(STORAGE_KEY)
      },
    }),
    [input, analysis, scenarioId],
  )

  return (
    <InvestigationContext.Provider value={value}>
      {children}
    </InvestigationContext.Provider>
  )
}

export function useInvestigation() {
  const ctx = useContext(InvestigationContext)
  if (!ctx) {
    throw new Error('useInvestigation must be used within InvestigationProvider')
  }
  return ctx
}
