import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Radar, Search, Workflow } from 'lucide-react'
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
        <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-[var(--color-background)] px-6 text-center">
          <div className="relative">
            <div className="animate-float flex h-24 w-24 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white shadow-lg">
              <Workflow className="h-10 w-10 text-[var(--color-accent)]" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white shadow-md">
              <Radar className="h-4 w-4 text-[var(--color-warning)]" />
            </div>
            <div className="absolute -left-1 -top-1 flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white shadow-md">
              <Search className="h-4 w-4 text-[var(--color-success)]" />
            </div>
          </div>
          <div className="max-w-md">
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-foreground)]">
              Investigation Command Center
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
              No active investigation. Start a Guided Case Intake to populate the
              evidence explorer, AI reasoning engine, and dependency graph.
            </p>
          </div>
          <Link
            to="/investigations/new"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--color-accent)] px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--color-accent-hover)] hover:shadow-md active:scale-[0.98]"
          >
            <Radar className="h-4 w-4" />
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

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_minmax(200px,30%)]">
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
