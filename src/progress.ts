import { lessons } from './course.ts'
import { exercises } from './exercises.ts'
import { supportedLanguages, translate } from './language.ts'
import type { Language } from './language.ts'

export const PROGRESS_KEY = 'officina-assembly-progress-v1'
export interface Progress { version: 1; language: Language; completed: string[]; passed: string[]; answers: Record<string, string>; drafts: Record<string, string>; selectedLesson: string }
export function emptyProgress(): Progress { return { version: 1, language: 'en', completed: [], passed: [], answers: {}, drafts: {}, selectedLesson: 'computer' } }
function stringMap(value: unknown, name: string, language: Language): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(translate(language, '{0} must be an object.', [name]))
  const pairs = Object.entries(value)
  if (pairs.length > 300 || pairs.some(([key, item]) => key.length > 100 || typeof item !== 'string' || item.length > 20000)) throw new Error(translate(language, '{0} contains invalid or overly long data.', [name]))
  return Object.fromEntries(pairs) as Record<string, string>
}
function stringList(value: unknown, name: string, language: Language): string[] {
  if (!Array.isArray(value) || value.length > 300 || value.some(item => typeof item !== 'string' || item.length > 100)) throw new Error(translate(language, '{0} must be a list of identifiers.', [name]))
  return [...new Set(value)]
}
export function parseProgress(json: string, language: Language = 'en'): Progress {
  if (json.length > 2_000_000) throw new Error(translate(language, 'The progress file is too large.'))
  let raw: unknown
  try { raw = JSON.parse(json) } catch { throw new Error(translate(language, 'The file does not contain valid JSON.')) }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error(translate(language, 'The progress format is invalid.'))
  const value = raw as Record<string, unknown>
  if (value.version !== 1) throw new Error(translate(language, 'Unsupported progress version: version 1 is required.'))
  if (value.language !== undefined && (typeof value.language !== 'string' || !supportedLanguages.includes(value.language as Language))) throw new Error(translate(language, 'Invalid course language.'))
  const savedLanguage: Language = value.language === undefined ? 'en' : value.language as Language
  if (typeof value.selectedLesson !== 'string' || value.selectedLesson.length > 100) throw new Error(translate(language, 'Invalid selected lesson.'))
  const completed = stringList(value.completed, 'completed', language)
  const passed = stringList(value.passed, 'passed', language)
  const answers = stringMap(value.answers, 'answers', language)
  const drafts = stringMap(value.drafts, 'drafts', language)
  const lessonIds = new Set(lessons.map(item => item.id))
  const exerciseIds = new Set(exercises.map(item => item.id))
  if (!lessonIds.has(value.selectedLesson) || completed.some(id => !lessonIds.has(id)) || Object.keys(answers).some(id => !lessonIds.has(id))) throw new Error(translate(language, 'The file contains unknown lessons.'))
  if (passed.some(id => !exerciseIds.has(id)) || Object.keys(drafts).some(id => !exerciseIds.has(id))) throw new Error(translate(language, 'The file contains unknown exercises.'))
  return { version: 1, language: savedLanguage, completed, passed, answers, drafts, selectedLesson: value.selectedLesson }
}
export function loadProgress(): Progress {
  try { const saved = localStorage.getItem(PROGRESS_KEY); return saved ? parseProgress(saved) : emptyProgress() } catch { return emptyProgress() }
}
export function saveProgress(progress: Progress): void { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)) } catch { /* The course remains usable when storage is unavailable. */ } }
export function progressJson(progress: Progress): string { return JSON.stringify(progress, null, 2) }
