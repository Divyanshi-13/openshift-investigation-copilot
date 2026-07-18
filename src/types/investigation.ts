export type HealthStatus = 'failed' | 'warning' | 'healthy'

export type Platform = 'AWS' | 'Azure' | 'GCP' | 'bare-metal'
export type Topology = 'SNO' | 'compact' | 'HA'
export type ManagedService = 'None' | 'ROSA' | 'ARO' | 'OSD'
export type CommandTarget = 'live' | 'must-gather' | 'either'
export type Severity = 'critical' | 'high' | 'medium' | 'low'

export type InvestigationCategory =
  | 'Node Lifecycle'
  | 'Cluster Operators / OLM'
  | 'Machine Management'
  | 'Upgrades / Lifecycle'
  | 'Networking'
  | 'Storage'
  | 'Authentication'
  | 'Monitoring / Observability'
  | 'Unclassified'

export interface Fact {
  component: string
  status: string
  health: HealthStatus
}

export interface Hypothesis {
  id: string
  rootCause: string
  relevanceScore: number
  evidence: string[]
  missingInformation: string[]
}

export interface NextAction {
  command: string
  reason: string
}

export interface GraphNode {
  id: string
  label: string
  status: HealthStatus
  issueCount?: number
  statusLabel?: string
}

export interface GraphEdge {
  id: string
  source: string
  target: string
}

export interface TimelineEvent {
  time: string
  label: string
  description?: string
}

export interface RcaReport {
  problemSummary: string
  symptoms: string[]
  evidence: string[]
  timeline: TimelineEvent[]
  rootCause: string
  resolution: string[]
  verificationSteps: string[]
  lessonsLearned: string[]
}

export interface CandidateCategory {
  category: InvestigationCategory
  score: number
}

export interface DiagnosticCommand {
  command: string
  target: CommandTarget
  note?: string
}

export interface RelatedArticle {
  id: string
  title: string
}

export interface KnownBug {
  id: string
  summary: string
  fixedIn?: string
}

export interface SimilarInvestigation {
  scenarioId: number
  title: string
  category: InvestigationCategory
  severity: Severity
  overlapKeywords: string[]
}

export interface SbrSuggestion {
  team: string
  reason: string
}

export interface AnalysisResult {
  symptoms: string[]
  facts: Fact[]
  hypotheses: Hypothesis[]
  nextAction: NextAction
  graph: {
    nodes: GraphNode[]
    edges: GraphEdge[]
  }
  timeline: TimelineEvent[]
  rca: RcaReport
  category: InvestigationCategory
  candidateCategories: CandidateCategory[]
  severity: Severity
  patternGroups: string[]
  diagnosticCommands: DiagnosticCommand[]
  healthChecklist: string[]
  similarInvestigations: SimilarInvestigation[]
  sbrSuggestion?: SbrSuggestion
  relatedArticles: RelatedArticle[]
  knownBugs: KnownBug[]
  investigationHypothesis: string
  platformNote?: string
}

export interface InvestigationInput {
  title: string
  symptoms: string
  evidence: string
  ocpVersion: string
  platform: Platform
  topology: Topology
  managedService: ManagedService
  mustGatherAvailable: boolean
  recentChanges: string
}

export interface Investigation {
  id: string
  title: string
  status: 'open' | 'analyzing' | 'resolved'
  updatedAt: string
  summary: string
  input?: InvestigationInput
  analysis?: AnalysisResult
}

export interface RecentInvestigation {
  id: string
  title: string
  status: 'open' | 'analyzing' | 'resolved'
  updatedAt: string
  summary: string
  scenarioId: number
  category: InvestigationCategory
}
