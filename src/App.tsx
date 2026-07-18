import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { InvestigationProvider } from '@/context/InvestigationContext'
import { EntryShell } from '@/components/layout/EntryShell'
import { Dashboard } from '@/pages/Dashboard'
import { CreateInvestigation } from '@/pages/CreateInvestigation'
import { InvestigationWorkspace } from '@/pages/InvestigationWorkspace'
import { RCAReportPage } from '@/pages/RCAReportPage'

export default function App() {
  return (
    <InvestigationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="investigations/analysis" element={<InvestigationWorkspace />} />
          <Route element={<EntryShell />}>
            <Route index element={<Dashboard />} />
            <Route path="investigations/new" element={<CreateInvestigation />} />
            <Route path="investigations/rca" element={<RCAReportPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </InvestigationProvider>
  )
}
