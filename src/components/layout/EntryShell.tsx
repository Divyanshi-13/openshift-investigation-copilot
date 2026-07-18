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
        <aside className="hidden w-52 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-panel)] md:flex">
          <nav className="flex flex-col gap-0.5 p-2">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                      : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]',
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="scrollbar-thin min-h-0 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
