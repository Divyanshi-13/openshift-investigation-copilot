import type {
  HealthStatus,
  InvestigationCategory,
  KnownBug,
  RelatedArticle,
  Severity,
} from '@/types/investigation'

export interface Scenario {
  scenario_id: number
  problem_title: string
  category: InvestigationCategory
  severity: Severity
  symptoms: string[]
  openshift_commands: string[]
  important_findings: string[]
  possible_root_causes: string[]
  confidence_ranking: string
  recommended_next_troubleshooting_action: string
  final_rca: string
  related_articles: RelatedArticle[]
  known_bugs: KnownBug[]
  command_targets?: Array<'live' | 'must-gather' | 'either'>
  platform_tags?: string[]
}

export interface ScenarioGraphSpec {
  nodes: Array<{ id: string; label: string; status: HealthStatus }>
  edges: Array<{ id: string; source: string; target: string }>
}

export interface ScenarioFactsSpec {
  component: string
  status: string
  health: HealthStatus
}
