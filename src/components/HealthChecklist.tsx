import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface HealthChecklistProps {
  items: string[]
}

export function HealthChecklist({ items }: HealthChecklistProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cluster health checklist</CardTitle>
        <p className="text-xs text-[var(--color-muted)]">
          Pre-flight checks for the detected category before deep diving.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="flex gap-2 text-sm">
              <span className="mt-0.5 font-mono text-[var(--color-muted)]">[ ]</span>
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
