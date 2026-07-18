import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  FileSearch,
  Layers,
  Plus,
  Radar,
  Search,
  Shield,
  Zap,
} from 'lucide-react'
import { recentInvestigations } from '@/data/recentInvestigations'
import scenarios from '@/data/scenarios.json'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { WorkflowStepper } from '@/components/WorkflowStepper'
import type { Scenario } from '@/types/scenario'

const typed = scenarios as Scenario[]

function statusVariant(status: string) {
  if (status === 'resolved') return 'success' as const
  if (status === 'analyzing') return 'warning' as const
  return 'secondary' as const
}

const categoryColors: Record<string, string> = {
  'Node Lifecycle': '#f79009',
  'Cluster Operators / OLM': '#a78bfa',
  'Machine Management': '#4da3ff',
  'Upgrades / Lifecycle': '#f04438',
  Networking: '#4da3ff',
  Storage: '#3dd68c',
  Authentication: '#a78bfa',
  'Monitoring / Observability': '#f0b429',
  Unclassified: '#6b7687',
}

const categoryBorderClass: Record<string, string> = {
  'Node Lifecycle': 'category-border-provisioning',
  'Cluster Operators / OLM': 'category-border-authentication',
  'Machine Management': 'category-border-networking',
  'Upgrades / Lifecycle': 'category-border-upgrades',
  Networking: 'category-border-networking',
  Storage: 'category-border-storage',
  Authentication: 'category-border-authentication',
  'Monitoring / Observability': 'category-border-performance',
}

function computeStats() {
  const catCounts: Record<string, number> = {}
  const sevCounts: Record<string, number> = {}
  for (const s of typed) {
    catCounts[s.category] = (catCounts[s.category] ?? 0) + 1
    sevCounts[s.severity] = (sevCounts[s.severity] ?? 0) + 1
  }
  return {
    total: typed.length,
    categories: Object.entries(catCounts).sort(([, a], [, b]) => b - a),
    severities: Object.entries(sevCounts),
    active: recentInvestigations.filter((i) => i.status !== 'resolved').length,
    resolved: recentInvestigations.filter((i) => i.status === 'resolved').length,
  }
}

function DonutChart({
  segments,
  size = 120,
}: {
  segments: Array<{ label: string; value: number; color: string }>
  size?: number
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  const r = (size - 16) / 2
  const cx = size / 2
  const cy = size / 2
  const strokeWidth = 14
  const circumference = 2 * Math.PI * r
  let offset = 0

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg) => {
        const pct = seg.value / total
        const dashLen = pct * circumference
        const dashOffset = -offset
        offset += dashLen
        return (
          <circle
            key={seg.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLen} ${circumference - dashLen}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            className="transition-all duration-700"
          />
        )
      })}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fill="var(--color-foreground)"
        fontSize="20"
        fontWeight="700"
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fill="var(--color-muted)"
        fontSize="10"
      >
        scenarios
      </text>
    </svg>
  )
}

function BarChartH({
  items,
  maxValue,
}: {
  items: Array<{ label: string; value: number; color: string }>
  maxValue: number
}) {
  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-[var(--color-foreground)]">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
            <span className="font-mono text-[var(--color-muted)]">
              {item.value}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--color-background)]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function SeverityChart({
  severities,
}: {
  severities: Array<[string, number]>
}) {
  const sevColors: Record<string, string> = {
    critical: '#f04438',
    high: '#f79009',
    medium: '#f0b429',
    low: '#3dd68c',
  }
  const maxVal = Math.max(...severities.map(([, v]) => v))

  return (
    <div className="flex items-end gap-3">
      {severities.map(([sev, count]) => (
        <div key={sev} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-sm font-bold text-[var(--color-foreground)]">
            {count}
          </span>
          <div
            className="w-full rounded-t-md transition-all duration-700"
            style={{
              height: `${Math.max(20, (count / maxVal) * 64)}px`,
              backgroundColor: sevColors[sev] ?? '#6b7687',
            }}
          />
          <span className="text-[10px] capitalize text-[var(--color-muted)]">
            {sev}
          </span>
        </div>
      ))}
    </div>
  )
}

export function Dashboard() {
  const stats = computeStats()

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Hero */}
      <div className="hero-grid relative mb-8 overflow-hidden rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-panel)] to-[var(--color-background)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--color-accent)]/5 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[var(--color-accent)]/3 blur-3xl" />

        <div className="relative px-8 py-10 sm:py-14">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent-soft)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent)]">
                <Radar className="h-3.5 w-3.5" />
                AI-Powered Investigation Workspace
              </div>
              <h1 className="gradient-text text-4xl font-bold tracking-tight sm:text-5xl">
                OpenShift Investigation
                <br />
                Copilot
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--color-muted)]">
                Enterprise troubleshooting for OpenShift support — from first
                signal to root cause report. Evidence explorer, AI reasoning
                engine, dependency graph, and next-best action in one immersive
                workspace.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/investigations/new"
                  className="glow-accent inline-flex h-10 items-center gap-2 rounded-md bg-[var(--color-accent)] px-5 text-sm font-semibold text-[#0d1117] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  Start Investigation
                </Link>
                <Link
                  to="/investigations/analysis"
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--color-border)] px-5 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  <Search className="h-4 w-4" />
                  Command Center
                </Link>
              </div>
            </div>

            {/* Hero illustration */}
            <div className="hidden animate-float lg:block">
              <div className="relative">
                <div className="flex h-36 w-36 items-center justify-center rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent-soft)]">
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-surface)]">
                    <span className="font-mono text-4xl font-bold text-[var(--color-accent)]">
                      OI
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-success)]/40 bg-[var(--color-success-soft)]">
                  <Shield className="h-5 w-5 text-[var(--color-success)]" />
                </div>
                <div className="absolute -left-2 -top-2 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-warning)]/40 bg-[var(--color-warning-soft)]">
                  <Zap className="h-5 w-5 text-[var(--color-warning)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Total Scenarios',
            value: stats.total,
            icon: Layers,
            color: 'var(--color-accent)',
            bgColor: 'var(--color-accent-soft)',
          },
          {
            label: 'Categories',
            value: stats.categories.length,
            icon: BarChart3,
            color: 'var(--color-success)',
            bgColor: 'var(--color-success-soft)',
          },
          {
            label: 'Active Cases',
            value: stats.active,
            icon: Radar,
            color: 'var(--color-warning)',
            bgColor: 'var(--color-warning-soft)',
          },
          {
            label: 'Resolved',
            value: stats.resolved,
            icon: FileSearch,
            color: 'var(--color-success)',
            bgColor: 'var(--color-success-soft)',
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="group transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-accent)]/30"
          >
            <CardContent className="flex items-center gap-4 py-5">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                style={{ backgroundColor: stat.bgColor }}
              >
                <stat.icon
                  className="h-5 w-5"
                  style={{ color: stat.color }}
                />
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted)]">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {/* Category distribution donut */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>
              Scenarios by investigation category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <DonutChart
                segments={stats.categories.map(([cat, count]) => ({
                  label: cat,
                  value: count,
                  color: categoryColors[cat] ?? '#6b7687',
                }))}
              />
              <div className="flex-1 space-y-2">
                {stats.categories.map(([cat, count]) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-2 text-[var(--color-foreground)]">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: categoryColors[cat] ?? '#6b7687',
                        }}
                      />
                      {cat}
                    </span>
                    <span className="font-mono text-[var(--color-muted)]">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Severity bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Severity Breakdown</CardTitle>
            <CardDescription>Distribution across severity levels</CardDescription>
          </CardHeader>
          <CardContent>
            <SeverityChart severities={stats.severities} />
          </CardContent>
        </Card>

        {/* Category bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Scenarios by Category</CardTitle>
            <CardDescription>Horizontal breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartH
              items={stats.categories.map(([cat, count]) => ({
                label: cat,
                value: count,
                color: categoryColors[cat] ?? '#6b7687',
              }))}
              maxValue={Math.max(...stats.categories.map(([, v]) => v))}
            />
          </CardContent>
        </Card>
      </div>

      {/* Workflow stepper */}
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

      {/* Recent investigations */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">
          Recent Investigations
        </h2>
        <span className="text-xs text-[var(--color-muted-foreground)]">
          {recentInvestigations.length} total
        </span>
      </div>

      <div className="grid gap-3">
        {recentInvestigations.map((investigation, index) => (
          <Card
            key={investigation.id}
            className={`animate-fade-up transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-accent)]/35 ${categoryBorderClass[investigation.category] ?? ''}`}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      backgroundColor:
                        categoryColors[investigation.category] ?? '#6b7687',
                    }}
                  />
                  <h3 className="text-sm font-semibold">
                    {investigation.title}
                  </h3>
                  <Badge variant="default">{investigation.category}</Badge>
                  <Badge variant={statusVariant(investigation.status)}>
                    {investigation.status}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                  {investigation.summary}
                </p>
                <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                  Updated {investigation.updatedAt}
                </p>
              </div>
              <Link
                to={`/investigations/new?scenario=${investigation.scenarioId}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-accent)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
              >
                Investigate
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
