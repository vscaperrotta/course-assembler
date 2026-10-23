import english from './translations/en.json' with { type: 'json' }
import italian from './translations/it.json' with { type: 'json' }

const dictionaries = { en: english, it: italian } as const

export type Language = keyof typeof dictionaries
export const supportedLanguages = Object.keys(dictionaries) as Language[]

export function translate(language: Language, key: string, values: readonly unknown[] = []): string {
  const dictionary = dictionaries[language] as Record<string, string>
  const englishDictionary = dictionaries.en as Record<string, string>
  const template = dictionary[key] ?? englishDictionary[key] ?? key
  return template.replace(/\{(\d+)\}/g, (placeholder, index: string) => String(values[Number(index)] ?? placeholder))
}
