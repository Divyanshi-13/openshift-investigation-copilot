import { Link } from 'react-router-dom'
import { ArrowRight, Plus, Radar } from 'lucide-react'
import { recentInvestigations } from '@/data/recentInvestigations'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { WorkflowStepper } from '@/components/WorkflowStepper'

function statusVariant(status: string) {
  if (status === 'resolved') return 'success' as const
  if (status === 'analyzing') return 'warning' as const
  return 'secondary' as const
}

export function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-xs text-[var(--color-muted)]">
            <Radar className="h-3.5 w-3.5 text-[var(--color-accent)]" />
            AI-powered troubleshooting workspace
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Investigation Command Center
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
            Enterprise troubleshooting workspace for OpenShift support —
            evidence explorer, AI reasoning engine, next-best action, and live
            dependency graph in one immersive view.
          </p>
        </div>
        <Link
          to="/investigations/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--color-accent)] px-4 text-sm font-medium text-[#0d1117] hover:bg-[#79b8ff]"
        >
          <Plus className="h-4 w-4" />
          Guided Case Intake
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Investigation Workflow</CardTitle>
          <CardDescription>
            Linear path from first signal to root cause report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkflowStepper activeIndex={0} />
        </CardContent>
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">
          Recent Investigations
        </h2>
      </div>

      <div className="grid gap-3">
        {recentInvestigations.map((investigation) => (
          <Card
            key={investigation.id}
            className="transition-colors hover:border-[var(--color-accent)]/35"
          >
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">
                    {investigation.title}
                  </h3>
                  <Badge variant="default">{investigation.category}</Badge>
                  <Badge variant={statusVariant(investigation.status)}>
                    {investigation.status}
                  </Badge>
                </div>
                <p className="text-sm text-[var(--color-muted)]">
                  {investigation.summary}
                </p>
                <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                  Updated {investigation.updatedAt}
                </p>
              </div>
              <Link
                to={`/investigations/new?scenario=${investigation.scenarioId}`}
                className="inline-flex items-center gap-1.5 text-sm text-[var(--color-accent)] hover:underline"
              >
                Open
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
