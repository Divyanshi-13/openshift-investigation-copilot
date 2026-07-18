import { Link } from 'react-router-dom'
import { Activity, FileText, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandHeaderProps {
  investigationTitle?: string
  status?: 'idle' | 'investigating' | 'resolved'
}

export function CommandHeader({
  investigationTitle = 'No active investigation',
  status = 'idle',
}: CommandHeaderProps) {
  return (
    <header className="relative flex h-12 shrink-0 items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 px-4 backdrop-blur-md">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/40 to-transparent" />
      <Link to="/" className="flex min-w-0 items-center gap-2.5">
        <div className="glow-accent flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent-soft)] font-mono text-xs font-bold text-[var(--color-accent)]">
          OI
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-semibold tracking-tight">
            OpenShift Investigation Copilot
          </p>
        </div>
      </Link>

      <div className="mx-auto flex min-w-0 max-w-xl flex-1 items-center justify-center gap-2 px-2">
        <span className="hidden text-[11px] uppercase tracking-[0.12em] text-[var(--color-muted-foreground)] md:inline">
          Investigation
        </span>
        <p className="truncate text-sm font-medium text-[var(--color-foreground)]">
          {investigationTitle}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <StatusPill status={status} />
        <Link
          to="/investigations/new"
          className="hidden items-center gap-1 rounded border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] lg:inline-flex"
        >
          <Plus className="h-3 w-3" />
          New
        </Link>
        <Link
          to="/investigations/rca"
          className="hidden items-center gap-1 rounded border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] lg:inline-flex"
        >
          <FileText className="h-3 w-3" />
          RCA
        </Link>
      </div>
    </header>
  )
}

function StatusPill({
  status,
}: {
  status: 'idle' | 'investigating' | 'resolved'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        status === 'investigating' &&
          'animate-pulse-soft border-[var(--color-warning)]/40 bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
        status === 'resolved' &&
          'border-[var(--color-success)]/40 bg-[var(--color-success-soft)] text-[var(--color-success)]',
        status === 'idle' &&
          'border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-muted)]',
      )}
    >
      <Activity className="h-3 w-3" />
      {status === 'investigating'
        ? 'Investigating'
        : status === 'resolved'
          ? 'Resolved'
          : 'Idle'}
    </span>
  )
}
