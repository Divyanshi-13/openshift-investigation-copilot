import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TimelineEvent } from '@/types/investigation'

interface InvestigationTimelineProps {
  events: TimelineEvent[]
}

export function InvestigationTimeline({ events }: InvestigationTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Investigation Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-0 border-l border-[var(--color-border)] pl-5">
          {events.map((event, index) => (
            <li key={`${event.time}-${event.label}`} className="relative pb-6 last:pb-0">
              <span className="absolute -left-[1.4rem] top-1 flex h-3 w-3 items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-background)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
              </span>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-xs text-[var(--color-accent)]">
                  {event.time}
                </span>
                <span className="text-sm font-medium">{event.label}</span>
              </div>
              {event.description && (
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {event.description}
                </p>
              )}
              {index < events.length - 1 && <span className="sr-only">then</span>}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
