import type {
  AnalysisResult,
  CandidateCategory,
  CommandTarget,
  DiagnosticCommand,
  Fact,
  GraphEdge,
  GraphNode,
  Hypothesis,
  InvestigationCategory,
  InvestigationInput,
  SimilarInvestigation,
} from '@/types/investigation'
import type { Scenario, ScenarioFactsSpec, ScenarioGraphSpec } from '@/types/scenario'

const scenarioEnrichment: Record<
  number,
  {
    facts: ScenarioFactsSpec[]
    graph: ScenarioGraphSpec
    missingByCause: string[][]
    resolution: string[]
    verificationSteps: string[]
    lessonsLearned: string[]
    nextCommand: string
  }
> = {
  1: {
    facts: [
      { component: 'MachineConfigPool worker', status: 'Degraded', health: 'failed' },
      { component: 'Machine Config Operator', status: 'Degraded', health: 'failed' },
      { component: 'worker-2', status: 'Config mismatch', health: 'failed' },
      { component: 'sshd_config', status: 'Drifted', health: 'warning' },
    ],
    graph: {
      nodes: [
        { id: 'sshd', label: 'sshd_config drift', status: 'failed' },
        { id: 'mcd', label: 'Machine Config Daemon', status: 'failed' },
        { id: 'worker', label: 'worker-2', status: 'failed' },
        { id: 'mcp', label: 'MCP worker', status: 'failed' },
        { id: 'mco', label: 'Machine Config Operator', status: 'failed' },
      ],
      edges: [
        { id: 'e1', source: 'sshd', target: 'mcd' },
        { id: 'e2', source: 'mcd', target: 'worker' },
        { id: 'e3', source: 'worker', target: 'mcp' },
        { id: 'e4', source: 'mcp', target: 'mco' },
      ],
    },
    missingByCause: [
      ['Host audit/history for edits on worker-2', 'Diff vs desired MachineConfig'],
      ['Security agent install inventory', 'File integrity product logs'],
    ],
    nextCommand:
      'oc debug node/worker-2 -- chroot /host diff /etc/ssh/sshd_config /etc/ssh/sshd_config.rpmnew',
    resolution: [
      'Restore `/etc/ssh/sshd_config` from the desired MachineConfig content on worker-2.',
      'Encode any intentional SSH changes via a MachineConfig, never by editing the host.',
      'Confirm MCP worker recovers to Updated=True / Degraded=False.',
    ],
    verificationSteps: [
      'oc get mcp worker',
      'oc get co machine-config',
      'oc logs -n openshift-machine-config-operator daemonset/machine-config-daemon -c machine-config-daemon --tail=50',
    ],
    lessonsLearned: [
      'Out-of-band host file edits break MachineConfig reconciliation.',
      'MCD checksum mismatches are high-signal for config drift RCAs.',
      'Prefer MachineConfig/GitOps for SSH hardening changes.',
    ],
  },
  2: {
    facts: [
      { component: 'Authentication Operator', status: 'Degraded', health: 'failed' },
      { component: 'oauth-openshift', status: 'CrashLoop / x509', health: 'failed' },
      { component: 'Console login', status: 'Failing', health: 'failed' },
      { component: 'v4-0-config-system-session', status: 'Expired', health: 'failed' },
    ],
    graph: {
      nodes: [
        { id: 'secret', label: 'OAuth session secret', status: 'failed' },
        { id: 'oauth', label: 'oauth-openshift', status: 'failed' },
        { id: 'auth', label: 'Authentication', status: 'failed' },
        { id: 'console', label: 'Web Console', status: 'failed' },
        { id: 'apis', label: 'API webhooks', status: 'warning' },
      ],
      edges: [
        { id: 'e1', source: 'secret', target: 'oauth' },
        { id: 'e2', source: 'oauth', target: 'auth' },
        { id: 'e3', source: 'auth', target: 'console' },
        { id: 'e4', source: 'oauth', target: 'apis' },
      ],
    },
    missingByCause: [
      ['Secret rotation events', 'Operator condition history around expiry'],
      ['Custom ingress cert chain validation', 'Router TLS secret age'],
    ],
    nextCommand:
      'oc get secret v4-0-config-system-session -n openshift-authentication -o yaml',
    resolution: [
      'Trigger OAuth reconciliation by rotating/deleting the expired session secret.',
      'Restart degraded oauth-openshift pods and watch Authentication CO recover.',
      'Validate console login and token issuance after rotation.',
    ],
    verificationSteps: [
      'oc get co authentication',
      'oc get pods -n openshift-authentication',
      'oc logs deployment/oauth-openshift -n openshift-authentication --tail=50',
    ],
    lessonsLearned: [
      'Expired internal OAuth secrets present as console login loops / 500s.',
      'x509 expiry lines in oauth pods are a primary signal.',
      'Confirm automatic secret rotation path is healthy after recovery.',
    ],
  },
  3: {
    facts: [
      { component: 'Ingress Operator', status: 'Available', health: 'healthy' },
      { component: 'Router pods', status: 'Healthy', health: 'healthy' },
      { component: 'External apps', status: 'Unreachable', health: 'failed' },
      { component: 'AWS ELB SG', status: 'Ports blocked', health: 'failed' },
    ],
    graph: {
      nodes: [
        { id: 'sg', label: 'AWS Security Group', status: 'failed' },
        { id: 'elb', label: 'ELB / LoadBalancer', status: 'failed' },
        { id: 'router', label: 'Router pods', status: 'healthy' },
        { id: 'ingress', label: 'Ingress CO', status: 'healthy' },
        { id: 'apps', label: '*.apps routes', status: 'failed' },
      ],
      edges: [
        { id: 'e1', source: 'sg', target: 'elb' },
        { id: 'e2', source: 'elb', target: 'router' },
        { id: 'e3', source: 'router', target: 'ingress' },
        { id: 'e4', source: 'elb', target: 'apps' },
      ],
    },
    missingByCause: [
      ['CloudTrail actor / automation identity', 'SG rule diff before/after'],
      ['Subnet public/private mapping', 'Terraform plan drift for LB subnets'],
    ],
    nextCommand: 'oc describe svc router-default -n openshift-ingress',
    resolution: [
      'Restore AWS Security Group rules allowing 80/443 from required CIDRs to the Ingress ELB.',
      'Confirm ELB health checks pass and external curl succeeds.',
      'Lock down automation that mutated the SG out of band.',
    ],
    verificationSteps: [
      'oc get pods -n openshift-ingress -o wide',
      'oc get svc router-default -n openshift-ingress',
      'curl -Iv https://console-openshift-console.apps.cluster.domain',
    ],
    lessonsLearned: [
      'Healthy Ingress pods do not guarantee external path health.',
      'Cloud SG/firewall changes often look like “router failures”.',
      'Always compare internal vs external reachability early.',
    ],
  },
  4: {
    facts: [
      { component: 'ODF / Ceph', status: 'HEALTH_WARN', health: 'warning' },
      { component: 'osd.3', status: 'Latency >500ms', health: 'failed' },
      { component: 'RWO PVCs', status: 'Write stalls', health: 'failed' },
      { component: 'AWS gp3 volume', status: 'IOPS exhausted', health: 'failed' },
    ],
    graph: {
      nodes: [
        { id: 'disk', label: 'AWS gp3 IOPS', status: 'failed' },
        { id: 'osd', label: 'osd.3', status: 'failed' },
        { id: 'ceph', label: 'Ceph cluster', status: 'warning' },
        { id: 'pvc', label: 'RWO PVCs', status: 'failed' },
        { id: 'apps', label: 'Databases / apps', status: 'failed' },
      ],
      edges: [
        { id: 'e1', source: 'disk', target: 'osd' },
        { id: 'e2', source: 'osd', target: 'ceph' },
        { id: 'e3', source: 'ceph', target: 'pvc' },
        { id: 'e4', source: 'pvc', target: 'apps' },
      ],
    },
    missingByCause: [
      ['Cloud IOPS / burst credit metrics', 'Write spike workload owner'],
      ['SMART / disk error logs', 'Bare-metal replacement history'],
    ],
    nextCommand:
      'oc rsh -n openshift-storage $(oc get pods -n openshift-storage -l app=rook-ceph-operator -o jsonpath="{.items[0].metadata.name}") ceph osd perf',
    resolution: [
      'Raise provisioned IOPS/throughput for the affected OSD volume.',
      'Identify and throttle the write-heavy application if needed.',
      'Re-check Ceph latency and ODF dashboard after remediation.',
    ],
    verificationSteps: [
      'oc get storagecluster -n openshift-storage',
      'ceph osd perf (via rook-ceph-operator rsh)',
      'Confirm application write latency returns to baseline',
    ],
    lessonsLearned: [
      'OSD commit latency spikes often map to cloud disk throttling.',
      'Single slow OSD can degrade cluster-wide Ceph performance.',
      'Burst credit exhaustion is easy to miss without cloud metrics.',
    ],
  },
  5: {
    facts: [
      { component: 'worker-1', status: 'NotReady', health: 'failed' },
      { component: 'DiskPressure', status: 'True', health: 'failed' },
      { component: 'Kubelet', status: 'Status updates stalled', health: 'failed' },
      { component: '/var/log', status: '100% full', health: 'failed' },
    ],
    graph: {
      nodes: [
        { id: 'podlogs', label: 'Rogue pod logs', status: 'failed' },
        { id: 'disk', label: '/var/log full', status: 'failed' },
        { id: 'kubelet', label: 'Kubelet', status: 'failed' },
        { id: 'node', label: 'worker-1 NotReady', status: 'failed' },
        { id: 'workloads', label: 'Node pods', status: 'warning' },
      ],
      edges: [
        { id: 'e1', source: 'podlogs', target: 'disk' },
        { id: 'e2', source: 'disk', target: 'kubelet' },
        { id: 'e3', source: 'kubelet', target: 'node' },
        { id: 'e4', source: 'node', target: 'workloads' },
      ],
    },
    missingByCause: [
      ['Largest /var/log/pods directories', 'Owning Deployment / Namespace'],
      ['Image GC failures', 'container storage usage breakdown'],
    ],
    nextCommand: 'oc describe node worker-1.cluster.example.com',
    resolution: [
      'Clear the oversized log directory via OOB/console access to relieve DiskPressure.',
      'Fix or quarantine the noisy application and enforce log limits.',
      'Confirm node returns Ready and kubelet resumes heartbeats.',
    ],
    verificationSteps: [
      'oc get nodes',
      'oc get node worker-1.cluster.example.com -o jsonpath=\'{.status.conditions[?(@.type=="DiskPressure")]}\'',
      'oc get events --field-selector involvedObject.kind=Node',
    ],
    lessonsLearned: [
      'Log storms can take a node NotReady faster than CPU/memory pressure.',
      'DiskPressure + kubelet silence is a classic disk-exhaustion pattern.',
      'OOB access matters when oc debug itself times out.',
    ],
  },
  6: {
    facts: [
      { component: 'ClusterVersion', status: 'Stuck at 45%', health: 'warning' },
      { component: 'MCP master', status: '1 node pending', health: 'warning' },
      { component: 'master-3', status: 'Drain blocked', health: 'failed' },
      { component: 'PodDisruptionBudget', status: 'Blocking', health: 'failed' },
    ],
    graph: {
      nodes: [
        { id: 'pdb', label: 'Restrictive PDB', status: 'failed' },
        { id: 'drain', label: 'Node drain', status: 'failed' },
        { id: 'master', label: 'master-3', status: 'warning' },
        { id: 'mcp', label: 'MCP master', status: 'warning' },
        { id: 'upgrade', label: 'Cluster upgrade', status: 'warning' },
      ],
      edges: [
        { id: 'e1', source: 'pdb', target: 'drain' },
        { id: 'e2', source: 'drain', target: 'master' },
        { id: 'e3', source: 'master', target: 'mcp' },
        { id: 'e4', source: 'mcp', target: 'upgrade' },
      ],
    },
    missingByCause: [
      ['oc get pdb --all-namespaces output', 'Pods on master-3 protected by PDB'],
      ['etcd latency during drain window', 'Control-plane lease holders'],
    ],
    nextCommand: 'oc get pdb --all-namespaces',
    resolution: [
      'Identify and temporarily relax/remove the PDB blocking master-3 drain.',
      'Allow Machine Config Operator to complete reboot/update on master-3.',
      'Re-apply a safer PDB after the upgrade finishes.',
    ],
    verificationSteps: [
      'oc get clusterversion',
      'oc get mcp master',
      'oc get co machine-config',
    ],
    lessonsLearned: [
      'PDBs on control-plane nodes can stall upgrades indefinitely.',
      'Progressing=True with no Degraded can still be a hard block.',
      'Always inventory PDBs when MCP master stalls mid-upgrade.',
    ],
  },
}

const categoryKeywords: Record<InvestigationCategory, string[]> = {
  'Node Lifecycle': [
    'machineconfig',
    'mcp',
    'kubelet',
    'sshd',
    'diskpressure',
    'notready',
    'cri-o',
    'csr',
  ],
  'Cluster Operators / OLM': ['subscription', 'csv', 'catalog', 'olm', 'operator'],
  'Machine Management': ['machineset', 'autoscaler', 'machine api', 'credentials'],
  'Upgrades / Lifecycle': ['upgrade', 'clusterversion', '4.15', '4.14', 'pdb'],
  Networking: ['ingress', 'router', 'elb', 'security group', 'dns', 'ovn'],
  Storage: ['odf', 'ceph', 'osd', 'pvc', 'iops', 'storage'],
  Authentication: ['authentication', 'oauth', 'console', 'x509', 'session', 'cert'],
  'Monitoring / Observability': ['prometheus', 'alertmanager', 'monitoring', 'metrics'],
  Unclassified: [],
}

const patternGroups: Array<{ name: string; terms: string[] }> = [
  { name: 'pod-failures', terms: ['crashloopbackoff', 'imagepullbackoff', 'crash loop'] },
  { name: 'cert-expiry', terms: ['x509', 'certificate has expired', 'tls', 'cert'] },
  { name: 'mcp-drift', terms: ['sshd_config', 'checksum', 'machine config', 'content is different'] },
  { name: 'disk-pressure', terms: ['diskpressure', '/var/log', 'disk space'] },
  { name: 'upgrade-stall', terms: ['upgrade', 'progressing', 'drain', 'pdb'] },
  { name: 'storage-latency', terms: ['osd', 'iops', 'ceph', 'latency'] },
]

const sbrByCategory: Partial<Record<InvestigationCategory, string>> = {
  'Node Lifecycle': 'Node / MCO SBR',
  'Cluster Operators / OLM': 'Operator Framework SBR',
  'Machine Management': 'Cloud / Machine API SBR',
  'Upgrades / Lifecycle': 'Upgrade SBR',
  Networking: 'Networking SBR',
  Storage: 'Storage / ODF SBR',
  Authentication: 'Authentication / Console SBR',
  'Monitoring / Observability': 'Monitoring SBR',
}

const checklists: Record<InvestigationCategory, string[]> = {
  'Node Lifecycle': [
    'Are all nodes Ready except the suspected one?',
    'Is MachineConfigPool Degraded or Progressing?',
    'Was there a recent host-level config change?',
    'Can you reach the node via OOB / cloud console?',
  ],
  'Cluster Operators / OLM': [
    'Are ClusterOperators Available/Progressing/Degraded expected?',
    'Are CatalogSources and Subscriptions healthy?',
    'Was an operator upgraded recently?',
  ],
  'Machine Management': [
    'Are MachineSets / Machines in Running state?',
    'Do cloud credentials still authenticate?',
    'Is the autoscaler blocking scale events?',
  ],
  'Upgrades / Lifecycle': [
    'What does `oc get clusterversion` report?',
    'Which MCP is stuck (master vs worker)?',
    'Are any PDBs blocking drains?',
    'Was etcd healthy before the upgrade?',
  ],
  Networking: [
    'Can workloads reach each other inside the cluster?',
    'Are Ingress router pods Running?',
    'Does external curl fail while internal curl works?',
    'Any recent cloud SG / firewall changes?',
  ],
  Storage: [
    'What is Ceph / StorageCluster health?',
    'Is a single OSD showing elevated latency?',
    'Any cloud disk IOPS / burst alerts?',
  ],
  Authentication: [
    'Is ClusterOperator authentication Degraded?',
    'Are oauth-openshift pods Running or CrashLooping?',
    'Any x509 / secret expiry messages?',
    'Does kubeadmin / IDP login both fail?',
  ],
  'Monitoring / Observability': [
    'Is the monitoring stack PVC filling up?',
    'Are Prometheus / Alertmanager pods Ready?',
    'Did alert rules change recently?',
  ],
  Unclassified: [
    'Provide more symptoms and operator status.',
    'Confirm OCP version, platform, and recent changes.',
    'Attach must-gather if available.',
  ],
}

function parseRelevance(value: string): number {
  const match = value.match(/(\d+)/)
  return match ? Number(match[1]) : 50
}

export function scenarioToAnalysis(
  scenario: Scenario,
  allScenarios: Scenario[],
  input?: InvestigationInput,
): AnalysisResult {
  const enrichment = scenarioEnrichment[scenario.scenario_id]
  const primaryScore = parseRelevance(scenario.confidence_ranking)
  let secondaryScore = Math.max(25, primaryScore - 25)

  const platformMismatch =
    input != null &&
    scenario.platform_tags != null &&
    scenario.platform_tags.length > 0 &&
    !scenario.platform_tags.includes(input.platform)

  if (platformMismatch) {
    secondaryScore = Math.max(15, secondaryScore - 20)
  }

  const hypotheses: Hypothesis[] = scenario.possible_root_causes.map(
    (rootCause, index) => ({
      id: `s${scenario.scenario_id}-h${index + 1}`,
      rootCause: shortenCause(rootCause),
      relevanceScore: index === 0 ? (platformMismatch ? primaryScore - 15 : primaryScore) : secondaryScore,
      evidence:
        index === 0
          ? scenario.important_findings
          : scenario.important_findings.slice(0, 1),
      missingInformation:
        enrichment?.missingByCause[index] ??
        ['Additional corroborating evidence needed'],
    }),
  )

  const facts: Fact[] =
    enrichment?.facts ??
    scenario.important_findings.slice(0, 3).map((finding, index) => ({
      component: `Finding ${index + 1}`,
      status: finding.slice(0, 48),
      health: 'warning' as const,
    }))

  const nodes: GraphNode[] = enrichment?.graph.nodes ?? [
    { id: 'a', label: 'Cause', status: 'failed' },
    { id: 'b', label: 'Impact', status: 'failed' },
  ]
  const edges: GraphEdge[] = enrichment?.graph.edges ?? [
    { id: 'e1', source: 'a', target: 'b' },
  ]

  const haystack = [
    input?.title,
    input?.symptoms,
    input?.evidence,
    scenario.problem_title,
    ...scenario.symptoms,
    ...scenario.important_findings,
  ]
    .filter(Boolean)
    .join('\n')
    .toLowerCase()

  const candidateCategories = scoreCategories(haystack, scenario.category)
  const patterns = detectPatterns(haystack)
  const diagnosticCommands = buildDiagnosticCommands(scenario, input?.mustGatherAvailable ?? false)
  const similarInvestigations = findSimilar(scenario, allScenarios)
  const topRelevance = hypotheses[0]?.relevanceScore ?? 0
  const sbrSuggestion =
    scenario.severity === 'critical' && topRelevance < 90
      ? {
          team: sbrByCategory[scenario.category] ?? 'General OpenShift SBR',
          reason: `Critical severity with top relevance ${topRelevance}. Engage specialist bandwidth if Start-here commands do not clear the path.`,
        }
      : undefined

  let platformNote: string | undefined
  if (platformMismatch) {
    platformNote = `Selected platform is ${input!.platform}, but this scenario is tagged for ${(scenario.platform_tags ?? []).join(', ')}. Treat AWS-specific remediation steps cautiously.`
  }

  if (input?.recentChanges?.trim()) {
    patterns.push('recent-change-reported')
  }

  return {
    symptoms: scenario.symptoms,
    facts,
    hypotheses,
    nextAction: {
      command: enrichment?.nextCommand ?? scenario.openshift_commands[0],
      reason: scenario.recommended_next_troubleshooting_action,
    },
    graph: { nodes, edges },
    timeline: [
      {
        time: '10:15',
        label: 'Symptoms collected',
        description: scenario.symptoms[0],
      },
      {
        time: '10:18',
        label: 'Evidence analyzed',
        description: `Reviewed ${scenario.openshift_commands.length} OpenShift commands.`,
      },
      {
        time: '10:22',
        label: 'Hypothesis generated',
        description: hypotheses[0]?.rootCause,
      },
      {
        time: '10:30',
        label: 'Root cause identified',
        description: `Relevance score ${primaryScore}`,
      },
    ],
    rca: {
      problemSummary: scenario.problem_title,
      symptoms: scenario.symptoms,
      evidence: [...scenario.openshift_commands, ...scenario.important_findings],
      timeline: [
        { time: '10:15', label: 'Symptoms collected' },
        { time: '10:18', label: 'Evidence analyzed' },
        { time: '10:22', label: 'Hypothesis generated' },
        { time: '10:30', label: 'Root cause identified' },
      ],
      rootCause: scenario.final_rca,
      resolution: enrichment?.resolution ?? [
        scenario.recommended_next_troubleshooting_action,
      ],
      verificationSteps:
        enrichment?.verificationSteps ?? scenario.openshift_commands.slice(0, 3),
      lessonsLearned: enrichment?.lessonsLearned ?? [
        'Validate top hypothesis with the highest-information-gain command first.',
        'Capture ClusterOperator + node/MCP evidence early in the workflow.',
      ],
    },
    category: scenario.category,
    candidateCategories,
    severity: scenario.severity,
    patternGroups: patterns,
    diagnosticCommands,
    healthChecklist: checklists[scenario.category] ?? checklists.Unclassified,
    similarInvestigations,
    sbrSuggestion,
    relatedArticles: scenario.related_articles ?? [],
    knownBugs: scenario.known_bugs ?? [],
    investigationHypothesis: scenario.final_rca,
    platformNote,
  }
}

function buildDiagnosticCommands(
  scenario: Scenario,
  mustGatherAvailable: boolean,
): DiagnosticCommand[] {
  const targets = scenario.command_targets ?? []
  return scenario.openshift_commands.slice(0, 3).map((command, index) => {
    const target = (targets[index] ?? 'either') as CommandTarget
    let note: string | undefined
    if (target === 'must-gather') {
      note = mustGatherAvailable
        ? 'Run against must-gather output'
        : 'Prefer must-gather; live cluster also works if accessible'
    } else if (target === 'live') {
      note = 'Best run against the live cluster'
    } else {
      note = mustGatherAvailable
        ? 'Works on live cluster or must-gather'
        : 'Run on live cluster'
    }
    return { command, target, note }
  })
}

function scoreCategories(
  haystack: string,
  primary: InvestigationCategory,
): CandidateCategory[] {
  const scores: CandidateCategory[] = (
    Object.keys(categoryKeywords) as InvestigationCategory[]
  )
    .filter((c) => c !== 'Unclassified')
    .map((category) => {
      const hits = categoryKeywords[category].filter((k) => haystack.includes(k))
      let score = hits.length * 10
      if (category === primary) score += 40
      return { category, score }
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  if (scores.length === 0) {
    return [{ category: 'Unclassified', score: 10 }]
  }
  return scores
}

function detectPatterns(haystack: string): string[] {
  return patternGroups
    .filter((group) => group.terms.some((t) => haystack.includes(t)))
    .map((group) => group.name)
}

function findSimilar(
  scenario: Scenario,
  allScenarios: Scenario[],
): SimilarInvestigation[] {
  const primaryKeywords = buildKeywords(scenario)
  return allScenarios
    .filter((s) => s.scenario_id !== scenario.scenario_id)
    .map((s) => {
      const overlap = buildKeywords(s).filter((k) => primaryKeywords.includes(k))
      const sameCategory = s.category === scenario.category
      const sameSeverity = s.severity === scenario.severity
      return {
        scenarioId: s.scenario_id,
        title: s.problem_title,
        category: s.category,
        severity: s.severity,
        overlapKeywords: overlap.slice(0, 4),
        score: overlap.length + (sameCategory ? 3 : 0) + (sameSeverity ? 1 : 0),
      }
    })
    .filter((s) => s.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ score: _score, ...rest }) => rest)
}

function shortenCause(cause: string): string {
  const firstSentence = cause.split('. ')[0]
  return firstSentence.length > 110
    ? `${firstSentence.slice(0, 107)}…`
    : firstSentence
}

export function matchScenario(
  scenarios: Scenario[],
  title: string,
  symptomsText: string,
  evidenceText: string,
  scenarioId?: number,
): Scenario {
  if (scenarioId != null) {
    const exact = scenarios.find((s) => s.scenario_id === scenarioId)
    if (exact) return exact
  }

  const haystack = `${title}\n${symptomsText}\n${evidenceText}`.toLowerCase()

  const scored = scenarios.map((scenario) => {
    const keywords = buildKeywords(scenario)
    const score = keywords.reduce(
      (sum, keyword) => (haystack.includes(keyword) ? sum + 1 : sum),
      0,
    )
    return { scenario, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.score > 0 ? scored[0].scenario : scenarios[0]
}

function buildKeywords(scenario: Scenario): string[] {
  const fromTitle = scenario.problem_title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 4)

  const extras: Record<number, string[]> = {
    1: ['machineconfigpool', 'sshd', 'mcp', 'machine-config', 'worker-2'],
    2: ['authentication', 'oauth', 'console', 'x509', 'session'],
    3: ['ingress', 'router', 'elb', 'security group', 'apps.cluster'],
    4: ['odf', 'ceph', 'osd', 'storage', 'iops', 'gp3'],
    5: ['notready', 'diskpressure', 'kubelet', 'var/log', 'worker-1'],
    6: [
      'upgrade',
      '4.15',
      'pdb',
      'poddisruptionbudget',
      'master-3',
      'clusterversion',
    ],
  }

  return [...new Set([...(extras[scenario.scenario_id] ?? []), ...fromTitle])]
}
