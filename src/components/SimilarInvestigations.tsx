import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SimilarInvestigation } from '@/types/investigation'

interface SimilarInvestigationsProps {
  items: SimilarInvestigation[]
}

export function SimilarInvestigations({ items }: SimilarInvestigationsProps) {
  if (items.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Similar investigations</CardTitle>
        <p className="text-xs text-[var(--color-muted)]">
          Other scenarios with overlapping keywords / category+severity.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.scenarioId}
            className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-[var(--color-border-subtle)] px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Badge variant="secondary">{item.category}</Badge>
                <Badge variant="warning">{item.severity}</Badge>
                {item.overlapKeywords.map((k) => (
                  <Badge key={k} variant="default">
                    {k}
                  </Badge>
                ))}
              </div>
            </div>
            <Link
              to={`/investigations/new?scenario=${item.scenarioId}`}
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              Open
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
