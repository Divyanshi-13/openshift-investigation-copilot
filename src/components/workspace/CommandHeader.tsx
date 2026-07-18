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
    <header className="masthead relative flex h-12 shrink-0 items-center gap-4 px-4">
      <Link to="/" className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-[var(--color-accent)] font-mono text-[10px] font-bold text-white">
          OI
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-semibold tracking-tight text-white">
            OpenShift Investigation Copilot
          </p>
        </div>
      </Link>

      <div className="mx-auto flex min-w-0 max-w-xl flex-1 items-center justify-center gap-2 px-2">
        <span className="hidden text-[11px] uppercase tracking-[0.12em] text-[var(--color-chrome-muted)] md:inline">
          Investigation
        </span>
        <p className="truncate text-sm font-medium text-white/90">
          {investigationTitle}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <StatusPill status={status} />
        <Link
          to="/investigations/new"
          className="hidden items-center gap-1 rounded border border-[var(--color-chrome-border)] px-2 py-1 text-xs text-[var(--color-chrome-muted)] transition-colors hover:border-white/40 hover:text-white lg:inline-flex"
        >
          <Plus className="h-3 w-3" />
          New
        </Link>
        <Link
          to="/investigations/rca"
          className="hidden items-center gap-1 rounded border border-[var(--color-chrome-border)] px-2 py-1 text-xs text-[var(--color-chrome-muted)] transition-colors hover:border-white/40 hover:text-white lg:inline-flex"
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
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        status === 'investigating' &&
          'animate-pulse-soft bg-[var(--color-warning)]/20 text-[var(--color-warning)]',
        status === 'resolved' &&
          'bg-[var(--color-success)]/20 text-[#4ade80]',
        status === 'idle' &&
          'bg-white/10 text-[var(--color-chrome-muted)]',
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
