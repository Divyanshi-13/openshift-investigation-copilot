import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, Sparkles } from 'lucide-react'
import { useInvestigation } from '@/context/InvestigationContext'
import {
  analyzeInvestigation,
  getScenarioById,
  listScenarios,
  scenarioToFormDefaults,
} from '@/services/aiService'
import { WorkflowStepper } from '@/components/WorkflowStepper'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type {
  InvestigationInput,
  ManagedService,
  Platform,
  Topology,
} from '@/types/investigation'
import type { Scenario } from '@/types/scenario'

const defaultScenario = getScenarioById(2)
const textDefaults = defaultScenario
  ? scenarioToFormDefaults(defaultScenario)
  : {
      title: '',
      symptoms: '',
      evidence: '',
    }

const selectClass =
  'flex h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'

export function CreateInvestigation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setInvestigation } = useInvestigation()
  const scenarios = listScenarios()

  const scenarioParam = searchParams.get('scenario')
  const scenarioId = scenarioParam ? Number(scenarioParam) : undefined

  const [title, setTitle] = useState(textDefaults.title)
  const [symptoms, setSymptoms] = useState(textDefaults.symptoms)
  const [evidence, setEvidence] = useState(textDefaults.evidence)
  const [ocpVersion, setOcpVersion] = useState('4.15.0')
  const [platform, setPlatform] = useState<Platform>('AWS')
  const [topology, setTopology] = useState<Topology>('HA')
  const [managedService, setManagedService] = useState<ManagedService>('None')
  const [mustGatherAvailable, setMustGatherAvailable] = useState(false)
  const [recentChanges, setRecentChanges] = useState('')
  const [activeScenarioId, setActiveScenarioId] = useState<number | undefined>(
    defaultScenario?.scenario_id,
  )
  const [scenarioFilter, setScenarioFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const groupedScenarios = useMemo(() => {
    const q = scenarioFilter.toLowerCase().trim()
    const filtered = scenarios.filter(
      (s) =>
        !q ||
        s.problem_title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    )
    const groups = new Map<string, Scenario[]>()
    for (const s of filtered) {
      const list = groups.get(s.category) ?? []
      list.push(s)
      groups.set(s.category, list)
    }
    return [...groups.entries()]
  }, [scenarios, scenarioFilter])

  useEffect(() => {
    if (!scenarioId || Number.isNaN(scenarioId)) return
    applyScenario(scenarioId)
  }, [scenarioId])

  function applyScenario(id: number) {
    const scenario = getScenarioById(id)
    if (!scenario) return
    const form = scenarioToFormDefaults(scenario)
    setTitle(form.title)
    setSymptoms(form.symptoms)
    setEvidence(form.evidence)
    setActiveScenarioId(scenario.scenario_id)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const input: InvestigationInput = {
        title,
        symptoms,
        evidence,
        ocpVersion,
        platform,
        topology,
        managedService,
        mustGatherAvailable,
        recentChanges,
      }
      const analysis = await analyzeInvestigation(input, {
        scenarioId: activeScenarioId,
      })
      setInvestigation(input, analysis, activeScenarioId)
      navigate('/investigations/analysis') // Command Center
    } catch {
      setError('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Guided Case Intake
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Capture environment context, symptoms, and evidence. Mock analysis maps
          intake to curated OpenShift scenarios — not a chatbot.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="py-4">
          <WorkflowStepper activeIndex={1} />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sample scenarios</CardTitle>
          <CardDescription>
            Search and load a scenario grouped by category.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={scenarioFilter}
            onChange={(e) => setScenarioFilter(e.target.value)}
            placeholder="Filter by title or category…"
          />
          <div className="max-h-56 space-y-3 overflow-y-auto rounded-md border border-[var(--color-border)] p-3">
            {groupedScenarios.map(([category, items]) => (
              <div key={category}>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">
                  {category}
                </p>
                <div className="space-y-1">
                  {items.map((s) => (
                    <button
                      key={s.scenario_id}
                      type="button"
                      onClick={() => applyScenario(s.scenario_id)}
                      className={`block w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                        activeScenarioId === s.scenario_id
                          ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                          : 'hover:bg-[var(--color-surface-elevated)]'
                      }`}
                    >
                      {s.problem_title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {groupedScenarios.length === 0 && (
              <p className="text-sm text-[var(--color-muted)]">No scenarios match.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Case details</CardTitle>
          <CardDescription>
            Environment fields narrow relevance (e.g. AWS ELB vs Azure).
            {activeScenarioId != null && <> Scenario #{activeScenarioId} loaded.</>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="title">Investigation Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setActiveScenarioId(undefined)
                }}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ocpVersion">OCP version</Label>
                <Input
                  id="ocpVersion"
                  value={ocpVersion}
                  onChange={(e) => setOcpVersion(e.target.value)}
                  placeholder="4.15.0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <select
                  id="platform"
                  className={selectClass}
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as Platform)}
                >
                  <option value="AWS">AWS</option>
                  <option value="Azure">Azure</option>
                  <option value="GCP">GCP</option>
                  <option value="bare-metal">bare-metal</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="topology">Cluster topology</Label>
                <select
                  id="topology"
                  className={selectClass}
                  value={topology}
                  onChange={(e) => setTopology(e.target.value as Topology)}
                >
                  <option value="SNO">SNO</option>
                  <option value="compact">compact</option>
                  <option value="HA">HA</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="managed">Managed service</Label>
                <select
                  id="managed"
                  className={selectClass}
                  value={managedService}
                  onChange={(e) =>
                    setManagedService(e.target.value as ManagedService)
                  }
                >
                  <option value="None">None</option>
                  <option value="ROSA">ROSA</option>
                  <option value="ARO">ARO</option>
                  <option value="OSD">OSD</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={mustGatherAvailable}
                onChange={(e) => setMustGatherAvailable(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--color-border)]"
              />
              Must-gather available
            </label>

            <div className="space-y-2">
              <Label htmlFor="recentChanges">What changed?</Label>
              <Textarea
                id="recentChanges"
                value={recentChanges}
                onChange={(e) => setRecentChanges(e.target.value)}
                className="min-h-[90px] font-sans"
                placeholder="Recent upgrade? Config change? Certificate rotation? Node scaling?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptoms</Label>
              <Textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => {
                  setSymptoms(e.target.value)
                  setActiveScenarioId(undefined)
                }}
                className="min-h-[110px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidence">Evidence</Label>
              <Textarea
                id="evidence"
                value={evidence}
                onChange={(e) => {
                  setEvidence(e.target.value)
                  setActiveScenarioId(undefined)
                }}
                className="min-h-[200px]"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-[var(--color-danger)]">{error}</p>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="min-w-[180px]">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze Investigation
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
