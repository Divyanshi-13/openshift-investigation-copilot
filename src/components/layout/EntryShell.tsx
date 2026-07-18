import { NavLink, Outlet } from 'react-router-dom'
import { FileSearch, LayoutDashboard, PlusCircle, Workflow } from 'lucide-react'
import { CommandHeader } from '@/components/workspace/CommandHeader'
import { useInvestigation } from '@/context/InvestigationContext'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/investigations/new', label: 'Case Intake', icon: PlusCircle },
  { to: '/investigations/analysis', label: 'Command Center', icon: Workflow },
  { to: '/investigations/rca', label: 'RCA Report', icon: FileSearch },
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
        <aside className="sidebar-nav hidden w-56 shrink-0 flex-col md:flex">
          <div className="border-b border-[var(--color-chrome-border)] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--color-accent)] font-mono text-xs font-bold text-white">
                OI
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  Investigation Copilot
                </p>
                <p className="text-[10px] text-[var(--color-chrome-muted)]">
                  v0.1.0 — Prototype
                </p>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-0.5 p-2">
            <p className="mb-1 mt-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-chrome-muted)]">
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
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-[var(--color-chrome-muted)] hover:bg-white/5 hover:text-white',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto border-t border-[var(--color-chrome-border)] p-3">
            <div className="rounded-md bg-white/5 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-chrome-muted)]">
                Status
              </p>
              <p className="mt-1 text-xs text-white/80">
                {input ? '1 active investigation' : 'No active investigation'}
              </p>
            </div>
          </div>
        </aside>
        <main className="scrollbar-thin min-h-0 flex-1 overflow-auto bg-[var(--color-background)]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
