import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Download, Printer } from 'lucide-react'
import { useInvestigation } from '@/context/InvestigationContext'
import { WorkflowStepper } from '@/components/WorkflowStepper'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function RCAReportPage() {
  const { input, analysis } = useInvestigation()

  if (!analysis || !input) {
    return (
      <div className="hero-grid mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent-soft)]">
          <Download className="h-7 w-7 text-[var(--color-accent)]" />
        </div>
        <h1 className="gradient-text text-xl font-bold">No RCA Available</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Run an investigation analysis first to generate the report.
        </p>
        <Link
          to="/investigations/new"
          className="glow-accent mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-[var(--color-accent)] px-5 text-sm font-semibold text-[#0d1117]"
        >
          Create Investigation
        </Link>
      </div>
    )
  }

  const { rca } = analysis

  function exportRca() {
    const lines = [
      '# Root Cause Analysis Report',
      '',
      `## Investigation`,
      input!.title,
      '',
      '## Problem Summary',
      rca.problemSummary,
      '',
      '## Symptoms',
      ...rca.symptoms.map((s) => `- ${s}`),
      '',
      '## Evidence',
      ...rca.evidence.map((e) => `- ${e}`),
      '',
      '## Investigation Timeline',
      ...rca.timeline.map((t) => `- ${t.time} — ${t.label}`),
      '',
      '## Root Cause',
      rca.rootCause,
      '',
      '## Resolution',
      ...rca.resolution.map((r, i) => `${i + 1}. ${r}`),
      '',
      '## Verification Steps',
      ...rca.verificationSteps.map((v) => `- ${v}`),
      '',
      '## Lessons Learned',
      ...rca.lessonsLearned.map((l) => `- ${l}`),
      '',
    ]

    const blob = new Blob([lines.join('\n')], {
      type: 'text/markdown;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${slugify(input!.title)}-rca.md`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--color-success)]/30 bg-[var(--color-success-soft)] px-3 py-1 text-xs font-medium text-[var(--color-success)]">
            <Download className="h-3 w-3" />
            Root Cause Analysis
          </div>
          <h1 className="gradient-text text-2xl font-bold tracking-tight">
            {input.title}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button onClick={exportRca}>
            <Download className="h-4 w-4" />
            Export RCA
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="py-4">
          <WorkflowStepper activeIndex={6} />
        </CardContent>
      </Card>

      <div className="space-y-4 print:space-y-3" id="rca-report">
        <ReportSection title="Problem Summary">
          <p className="text-sm leading-relaxed text-[var(--color-foreground)]">
            {rca.problemSummary}
          </p>
        </ReportSection>

        <ReportSection title="Symptoms">
          <BulletList items={rca.symptoms} />
        </ReportSection>

        <ReportSection title="Evidence">
          <ul className="space-y-1.5 font-mono text-sm text-[var(--color-accent)]">
            {rca.evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection title="Investigation Timeline">
          <ul className="space-y-2">
            {rca.timeline.map((event) => (
              <li
                key={`${event.time}-${event.label}`}
                className="flex gap-3 text-sm"
              >
                <span className="w-12 shrink-0 font-mono text-[var(--color-accent)]">
                  {event.time}
                </span>
                <span>{event.label}</span>
              </li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection title="Root Cause">
          <p className="text-sm leading-relaxed text-[var(--color-foreground)]">
            {rca.rootCause}
          </p>
        </ReportSection>

        <ReportSection title="Resolution">
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            {rca.resolution.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </ReportSection>

        <ReportSection title="Verification Steps">
          <ul className="space-y-1.5 font-mono text-sm text-[var(--color-accent)]">
            {rca.verificationSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection title="Lessons Learned">
          <BulletList items={rca.lessonsLearned} />
        </ReportSection>
      </div>
    </div>
  )
}

function ReportSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent)]/30" />
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
          {item}
        </li>
      ))}
    </ul>
  )
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
