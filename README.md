# OpenShift Investigation Copilot

AI-powered investigation workspace for OpenShift support engineers.

This is a **troubleshooting workflow** prototype — not a chatbot. It walks engineers from symptoms through evidence, AI findings, hypothesis ranking, dependency graphing, next-best action, and RCA report generation.

Mock AI responses are returned from `src/services/aiService.ts` so no cluster access, customer data, or external AI API is required.

## Tech stack

- React + TypeScript (Vite)
- Tailwind CSS
- shadcn/ui-style components
- React Flow (`@xyflow/react`) for dependency graphs
- React Router

## Folder structure

```
src/
  components/
    layout/           # App shell + sidebar navigation
    ui/               # Reusable shadcn-style primitives
    *.tsx             # Workflow widgets (facts, hypotheses, graph, timeline…)
  context/            # Investigation state (persisted in sessionStorage)
  data/               # Static recent-investigation mock list
  pages/              # Dashboard, Create, Analysis, RCA
  services/
    aiService.ts      # Mock AI layer — swap for a real API later
  types/              # Shared TypeScript contracts
  App.tsx             # Routes
  main.tsx            # Entry
  index.css           # Dark enterprise theme tokens
```

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Other scripts

```bash
npm run build    # production build
npm run preview  # preview production build
npm run lint     # oxlint
```

## Workflow pages

1. **Dashboard** — app name + recent investigations (category badges)
2. **Guided Case Intake** — environment context, must-gather, what-changed, scenario picker → Analyze
3. **Command Center** (`/investigations/analysis`) — Immersive 3-column workspace: Evidence Explorer | AI Investigation Engine | Next Best Action, plus React Flow dependency graph and investigation assistant
4. **RCA Report** — professional report with Export RCA (Markdown download)

## Replacing the mock AI

`analyzeInvestigation()` in `src/services/aiService.ts` currently returns mock JSON shaped as `AnalysisResult`.

To integrate a real model/API later:

1. Keep the `AnalysisResult` TypeScript contract stable
2. Replace the mock body with an HTTP call
3. Map the API payload into `AnalysisResult`

No UI changes should be required if the contract is preserved.
# openshift-investigation-copilot
# openshift-investigation-copilot
