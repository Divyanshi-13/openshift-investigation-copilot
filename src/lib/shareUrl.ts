import type { InvestigationInput } from '@/types/investigation'

export interface SharePayload {
  input: InvestigationInput
  scenarioId?: number
}

export function encodeSharePayload(payload: SharePayload): string {
  const json = JSON.stringify(payload)
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeSharePayload(hash: string): SharePayload | null {
  try {
    const raw = hash.replace(/^#/, '').replace(/^share=/, '')
    if (!raw) return null
    const padded = raw + '='.repeat((4 - (raw.length % 4)) % 4)
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(base64)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    return JSON.parse(json) as SharePayload
  } catch {
    return null
  }
}

export function buildShareUrl(payload: SharePayload): string {
  const encoded = encodeSharePayload(payload)
  const url = new URL(window.location.href)
  url.pathname = '/investigations/analysis'
  url.search = ''
  url.hash = `share=${encoded}`
  return url.toString()
}
