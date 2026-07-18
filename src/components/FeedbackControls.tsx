import { useEffect, useState } from 'react'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type Vote = 'up' | 'down' | null

interface FeedbackControlsProps {
  hypothesisId: string
}

const STORAGE_KEY = 'oic-hypothesis-feedback'

function loadAll(): Record<string, { vote: Vote; note: string }> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, { vote: Vote; note: string }>) : {}
  } catch {
    return {}
  }
}

function saveOne(id: string, vote: Vote, note: string) {
  const all = loadAll()
  all[id] = { vote, note }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function FeedbackControls({ hypothesisId }: FeedbackControlsProps) {
  const stored = loadAll()[hypothesisId]
  const [vote, setVote] = useState<Vote>(stored?.vote ?? null)
  const [note, setNote] = useState(stored?.note ?? '')
  const [showNote, setShowNote] = useState(stored?.vote === 'down')

  useEffect(() => {
    saveOne(hypothesisId, vote, note)
  }, [hypothesisId, vote, note])

  return (
    <div className="mt-4 border-t border-[var(--color-border-subtle)] pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-[var(--color-muted)]">Was this helpful?</span>
        <Button
          type="button"
          size="sm"
          variant={vote === 'up' ? 'default' : 'ghost'}
          className={cn(vote === 'up' && 'bg-[var(--color-success)] text-white')}
          onClick={() => {
            setVote('up')
            setShowNote(false)
          }}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={vote === 'down' ? 'default' : 'ghost'}
          className={cn(vote === 'down' && 'bg-[var(--color-danger)] text-white')}
          onClick={() => {
            setVote('down')
            setShowNote(true)
          }}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </Button>
      </div>
      {showNote && (
        <Textarea
          className="mt-2 min-h-[72px] font-sans"
          placeholder="Why was this not helpful? (optional — used to tune matching)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      )}
    </div>
  )
}
