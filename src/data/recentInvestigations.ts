import scenarios from '@/data/scenarios.json'
import type { RecentInvestigation } from '@/types/investigation'
import type { Scenario } from '@/types/scenario'

const statusCycle: Array<RecentInvestigation['status']> = [
  'analyzing',
  'open',
  'open',
  'resolved',
  'analyzing',
  'open',
]

const updatedAtCycle = [
  '35 minutes ago',
  '2 hours ago',
  '5 hours ago',
  '1 day ago',
  '2 days ago',
  '3 days ago',
]

export const recentInvestigations: RecentInvestigation[] = (
  scenarios as Scenario[]
).map((scenario, index) => ({
  id: `scenario-${scenario.scenario_id}`,
  title: scenario.problem_title,
  status: statusCycle[index] ?? 'open',
  updatedAt: updatedAtCycle[index] ?? 'recently',
  summary: scenario.symptoms[0],
  scenarioId: scenario.scenario_id,
  category: scenario.category,
}))
