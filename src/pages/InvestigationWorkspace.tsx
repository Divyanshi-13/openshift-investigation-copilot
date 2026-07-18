import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useInvestigation } from '@/context/InvestigationContext'
import { analyzeInvestigation } from '@/services/aiService'
import { decodeSharePayload } from '@/lib/shareUrl'
import { CommandHeader } from '@/components/workspace/CommandHeader'
import { EvidenceExplorer } from '@/components/workspace/EvidenceExplorer'
import { AiInvestigationEngine } from '@/components/workspace/AiInvestigationEngine'
import { NextBestActionPanel } from '@/components/workspace/NextBestActionPanel'
import { DependencyGraphPanel } from '@/components/workspace/DependencyGraphPanel'
import { InvestigationAssistant } from '@/components/workspace/InvestigationAssistant'

export function InvestigationWorkspace() {
  const { input, analysis, setInvestigation } = useInvestigation()
  const [hydrating, setHydrating] = useState(false)

  useEffect(() => {
    const hash = window.location.hash
    if (!hash.includes('share=') || analysis) return
    const payload = decodeSharePayload(hash)
    if (!payload?.input) return

    let cancelled = false
    setHydrating(true)
    void analyzeInvestigation(payload.input, { scenarioId: payload.scenarioId })
      .then((result) => {
        if (!cancelled) {
          setInvestigation(payload.input, result, payload.scenarioId)
        }
      })
      .finally(() => {
        if (!cancelled) setHydrating(false)
      })

    return () => {
      cancelled = true
    }
  }, [analysis, setInvestigation])

  if (hydrating) {
    return (
      <div className="flex h-full flex-col">
        <CommandHeader status="investigating" investigationTitle="Restoring…" />
        <div className="flex flex-1 items-center justify-center gap-2 text-[var(--color-muted)]">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-accent)]" />
          Restoring shared investigation…
        </div>
      </div>
    )
  }

  if (!input || !analysis) {
    return (
      <div className="flex h-full flex-col">
        <CommandHeader status="idle" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="max-w-md">
            <h1 className="text-2xl font-semibold tracking-tight">
              Investigation Command Center
            </h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              No active investigation. Start Guided Case Intake to populate the
              evidence explorer, AI engine, and dependency graph.
            </p>
          </div>
          <Link
            to="/investigations/new"
            className="inline-flex h-10 items-center rounded-md bg-[var(--color-accent)] px-4 text-sm font-semibold text-[#061018] transition-transform hover:scale-[1.02]"
          >
            Open Case Intake
          </Link>
        </div>
        <InvestigationAssistant analysis={null} />
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <CommandHeader
        investigationTitle={input.title}
        status="investigating"
      />

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_minmax(220px,32%)]">
        <div className="grid min-h-0 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
          <div className="min-h-0 max-h-[42vh] lg:max-h-none">
            <EvidenceExplorer input={input} analysis={analysis} />
          </div>
          <div className="min-h-0 max-h-[50vh] border-y border-[var(--color-border)] lg:max-h-none lg:border-y-0">
            <AiInvestigationEngine analysis={analysis} />
          </div>
          <div className="min-h-0 max-h-[42vh] lg:max-h-none">
            <NextBestActionPanel analysis={analysis} />
          </div>
        </div>
        <DependencyGraphPanel graph={analysis.graph} />
      </div>

      <InvestigationAssistant analysis={analysis} />
    </div>
  )
}
