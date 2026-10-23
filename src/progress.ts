import { lessons } from './course.ts'
import { exercises } from './exercises.ts'

export const PROGRESS_KEY = 'officina-assembly-progress-v1'
export interface Progress { version: 1; completed: string[]; passed: string[]; answers: Record<string, string>; drafts: Record<string, string>; selectedLesson: string }
export function emptyProgress(): Progress { return { version: 1, completed: [], passed: [], answers: {}, drafts: {}, selectedLesson: 'computer' } }
function stringMap(value: unknown, name: string): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${name} deve essere un oggetto.`)
  const pairs = Object.entries(value)
  if (pairs.length > 300 || pairs.some(([key, item]) => key.length > 100 || typeof item !== 'string' || item.length > 20000)) throw new Error(`${name} contiene dati non validi o troppo lunghi.`)
  return Object.fromEntries(pairs) as Record<string, string>
}
function stringList(value: unknown, name: string): string[] {
  if (!Array.isArray(value) || value.length > 300 || value.some(item => typeof item !== 'string' || item.length > 100)) throw new Error(`${name} deve essere un elenco di identificatori.`)
  return [...new Set(value)]
}
export function parseProgress(json: string): Progress {
  if (json.length > 2_000_000) throw new Error('Il file dei progressi è troppo grande.')
  let raw: unknown
  try { raw = JSON.parse(json) } catch { throw new Error('Il file non contiene JSON valido.') }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Il formato dei progressi non è valido.')
  const value = raw as Record<string, unknown>
  if (value.version !== 1) throw new Error('Versione dei progressi non supportata: serve la versione 1.')
  if (typeof value.selectedLesson !== 'string' || value.selectedLesson.length > 100) throw new Error('Lezione selezionata non valida.')
  const completed = stringList(value.completed, 'completed')
  const passed = stringList(value.passed, 'passed')
  const answers = stringMap(value.answers, 'answers')
  const drafts = stringMap(value.drafts, 'drafts')
  const lessonIds = new Set(lessons.map(item => item.id))
  const exerciseIds = new Set(exercises.map(item => item.id))
  if (!lessonIds.has(value.selectedLesson) || completed.some(id => !lessonIds.has(id)) || Object.keys(answers).some(id => !lessonIds.has(id))) throw new Error('Il file contiene lezioni sconosciute.')
  if (passed.some(id => !exerciseIds.has(id)) || Object.keys(drafts).some(id => !exerciseIds.has(id))) throw new Error('Il file contiene esercizi sconosciuti.')
  return { version: 1, completed, passed, answers, drafts, selectedLesson: value.selectedLesson }
}
export function loadProgress(): Progress {
  try { const saved = localStorage.getItem(PROGRESS_KEY); return saved ? parseProgress(saved) : emptyProgress() } catch { return emptyProgress() }
}
export function saveProgress(progress: Progress): void { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)) } catch { /* The course remains usable when storage is unavailable. */ } }
export function progressJson(progress: Progress): string { return JSON.stringify(progress, null, 2) }
