import { lessons, modules } from './course'
import type { Lesson } from './course'
import { italianLessons, italianModules } from './course.it'
import { exercises } from './exercises'
import type { Exercise } from './exercises'
import { italianExercises } from './exercises.it'
import { scenarios, x86Scenarios } from './scenarios'
import type { Scenario, X86Scenario } from './scenarios'
import { italianScenarios, italianX86Scenarios } from './scenarios.it'
import type { Language } from './language'

interface CourseContent {
  lessons: Lesson[]
  modules: typeof modules | typeof italianModules
  exercises: Exercise[]
  scenarios: Scenario[]
  x86Scenarios: X86Scenario[]
}

const contentByLanguage: Record<Language, CourseContent> = {
  en: { lessons, modules, exercises, scenarios, x86Scenarios },
  it: { lessons: italianLessons, modules: italianModules, exercises: italianExercises, scenarios: italianScenarios, x86Scenarios: italianX86Scenarios },
}

export function contentFor(language: Language): CourseContent {
  return contentByLanguage[language]
}
