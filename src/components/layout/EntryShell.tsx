import { NavLink, Outlet } from 'react-router-dom'
import { FileSearch, LayoutDashboard, PlusCircle, Workflow } from 'lucide-react'
import { CommandHeader } from '@/components/workspace/CommandHeader'
import { useInvestigation } from '@/context/InvestigationContext'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/investigations/new', label: 'Case Intake', icon: PlusCircle },
  { to: '/investigations/analysis', label: 'Command Center', icon: Workflow },
  { to: '/investigations/rca', label: 'RCA', icon: FileSearch },
]

export function EntryShell() {
  const { input } = useInvestigation()

  return (
    <div className="flex h-full min-h-0 flex-col">
      <CommandHeader
        investigationTitle={input?.title}
        status={input ? 'investigating' : 'idle'}
      />
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-[var(--color-border)] bg-gradient-to-b from-[var(--color-panel)] to-[var(--color-background)] md:flex">
          <div className="border-b border-[var(--color-border-subtle)] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent-soft)] font-mono text-xs font-bold text-[var(--color-accent)]">
                OI
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--color-foreground)]">
                  Investigation Copilot
                </p>
                <p className="text-[10px] text-[var(--color-muted-foreground)]">
                  v0.1.0 — Prototype
                </p>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-0.5 p-2">
            <p className="mb-1 mt-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted-foreground)]">
              Navigation
            </p>
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-all duration-150',
                    isActive
                      ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] shadow-[inset_0_0_0_1px_rgba(77,163,255,0.15)]'
                      : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto border-t border-[var(--color-border-subtle)] p-3">
            <div className="rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-background)] px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-muted-foreground)]">
                Status
              </p>
              <p className="mt-1 text-xs text-[var(--color-foreground)]">
                {input ? '1 active investigation' : 'No active investigation'}
              </p>
            </div>
          </div>
        </aside>
        <main className="scrollbar-thin min-h-0 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
