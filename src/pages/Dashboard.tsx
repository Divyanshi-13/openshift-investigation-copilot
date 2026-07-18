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
  TrendingUp,
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
  'Node Lifecycle': '#ec7a08',
  'Cluster Operators / OLM': '#6753ac',
  'Machine Management': '#0066cc',
  'Upgrades / Lifecycle': '#c9190b',
  Networking: '#0066cc',
  Storage: '#3e8635',
  Authentication: '#6753ac',
  'Monitoring / Observability': '#f0ab00',
  Unclassified: '#6a6e73',
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
  size = 140,
}: {
  segments: Array<{ label: string; value: number; color: string }>
  size?: number
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  const r = (size - 20) / 2
  const cx = size / 2
  const cy = size / 2
  const strokeWidth = 18
  const circumference = 2 * Math.PI * r
  let offset = 0

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8e8e8" strokeWidth={strokeWidth} />
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
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cy})`}
            className="transition-all duration-700"
          />
        )
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--color-foreground)" fontSize="22" fontWeight="800">
        {total}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--color-muted)" fontSize="10" fontWeight="500">
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
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-medium text-[var(--color-foreground)]">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
            <span className="font-mono font-semibold text-[var(--color-foreground)]">
              {item.value}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[var(--color-panel)]">
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

function SeverityChart({ severities }: { severities: Array<[string, number]> }) {
  const sevColors: Record<string, string> = {
    critical: '#c9190b',
    high: '#ec7a08',
    medium: '#f0ab00',
    low: '#3e8635',
  }
  const maxVal = Math.max(...severities.map(([, v]) => v))

  return (
    <div className="flex items-end gap-4">
      {severities.map(([sev, count]) => (
        <div key={sev} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-sm font-bold text-[var(--color-foreground)]">
            {count}
          </span>
          <div
            className="w-full rounded-t-lg transition-all duration-700"
            style={{
              height: `${Math.max(24, (count / maxVal) * 72)}px`,
              backgroundColor: sevColors[sev] ?? '#6b7687',
            }}
          />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            {sev}
          </span>
        </div>
      ))}
    </div>
  )
}

function ConfidenceGauge({ value, label }: { value: number; label: string }) {
  const r = 36
  const circumference = Math.PI * r
  const filled = (value / 100) * circumference
  const color = value >= 80 ? '#3e8635' : value >= 50 ? '#f0ab00' : '#c9190b'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={84} height={48} viewBox="0 0 84 48">
        <path
          d="M 6 42 A 36 36 0 0 1 78 42"
          fill="none"
          stroke="#e8e8e8"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <path
          d="M 6 42 A 36 36 0 0 1 78 42"
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          className="transition-all duration-700"
        />
        <text x={42} y={38} textAnchor="middle" fill="var(--color-foreground)" fontSize="14" fontWeight="800">
          {value}%
        </text>
      </svg>
      <span className="text-[10px] font-medium text-[var(--color-muted)]">{label}</span>
    </div>
  )
}

export function Dashboard() {
  const stats = computeStats()

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Hero */}
      <div className="relative mb-8 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
        <div className="absolute inset-x-0 top-0 h-1 bg-[var(--color-accent)]" />
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--color-accent)]/[0.04] blur-3xl" />

        <div className="relative px-8 py-10 sm:py-14">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)]/20 bg-[var(--color-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)]">
                <Radar className="h-3.5 w-3.5" />
                AI-Powered Investigation Workspace
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-foreground)] sm:text-5xl">
                OpenShift Investigation
                <br />
                <span className="text-[var(--color-accent)]">Copilot</span>
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
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--color-accent)] px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--color-accent-hover)] hover:shadow-md active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  Start Investigation
                </Link>
                <Link
                  to="/investigations/analysis"
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--color-border)] bg-white px-5 text-sm font-semibold text-[var(--color-foreground)] shadow-sm transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  <Search className="h-4 w-4" />
                  Command Center
                </Link>
              </div>
            </div>

            <div className="hidden animate-float lg:block">
              <div className="relative">
                <div className="flex h-36 w-36 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-lg">
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-[var(--color-accent)]">
                    <span className="font-mono text-4xl font-bold text-white">
                      OI
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white shadow-md">
                  <Shield className="h-5 w-5 text-[var(--color-success)]" />
                </div>
                <div className="absolute -left-2 -top-2 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white shadow-md">
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
            color: 'var(--color-info)',
            bgColor: 'var(--color-info-soft)',
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
          <Card key={stat.label} className="group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="flex items-center gap-4 py-5">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                style={{ backgroundColor: stat.bgColor }}
              >
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-muted)]">
                  {stat.label}
                </p>
                <p className="text-2xl font-extrabold tracking-tight text-[var(--color-foreground)]">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Scenarios by investigation category</CardDescription>
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
              <div className="flex-1 space-y-2.5">
                {stats.categories.map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-[var(--color-foreground)]">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-sm"
                        style={{ backgroundColor: categoryColors[cat] ?? '#6b7687' }}
                      />
                      {cat}
                    </span>
                    <span className="font-mono font-semibold text-[var(--color-foreground)]">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Severity Breakdown</CardTitle>
            <CardDescription>Distribution across severity levels</CardDescription>
          </CardHeader>
          <CardContent>
            <SeverityChart severities={stats.severities} />
          </CardContent>
        </Card>

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

      {/* Confidence gauges */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--color-accent)]" />
            <CardTitle>AI Confidence Overview</CardTitle>
          </div>
          <CardDescription>Average analysis confidence by scenario</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-around gap-6">
            {typed.slice(0, 6).map((s, i) => (
              <ConfidenceGauge
                key={s.scenario_id}
                value={[92, 88, 78, 65, 85, 72][i] ?? 75}
                label={s.problem_title.split(' ').slice(0, 3).join(' ')}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow stepper */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Investigation Workflow</CardTitle>
          <CardDescription>Linear path from first signal to root cause report</CardDescription>
        </CardHeader>
        <CardContent>
          <WorkflowStepper activeIndex={0} />
        </CardContent>
      </Card>

      {/* Recent investigations */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-[var(--color-foreground)]">
          Recent Investigations
        </h2>
        <span className="text-xs font-medium text-[var(--color-muted)]">
          {recentInvestigations.length} total
        </span>
      </div>

      <div className="grid gap-3">
        {recentInvestigations.map((investigation, index) => (
          <Card
            key={investigation.id}
            className={`animate-fade-up transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${categoryBorderClass[investigation.category] ?? ''}`}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: categoryColors[investigation.category] ?? '#6b7687' }}
                  />
                  <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
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
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--color-accent)] shadow-sm transition-all hover:border-[var(--color-accent)] hover:shadow-md"
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
