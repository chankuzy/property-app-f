// src/hooks/useNotes.ts
import { api } from '../lib/api'
import { useApiResource } from './useApiResource'
import type { NotableType, Note, Paginated } from '../types'

export function useNotes(notableType: NotableType, notableId: number | undefined) {
  return useApiResource<Paginated<Note>>(
    () =>
      api.get<Paginated<Note>>('/notes', {
        notable_type: notableType,
        notable_id: notableId,
      }),
    [notableType, notableId],
  )
}

export function createNote(notableType: NotableType, notableId: number, body: string) {
  return api.post<{ data: Note }>('/notes', {
    notable_type: notableType,
    notable_id: notableId,
    body,
  })
}
