export type Category = 'entrante' | 'primero' | 'segundo' | 'postre' | 'vino'

export type Reviewer = 'Ana (madre)' | 'Lolo' | 'Marta' | 'Ana (cuñada)' | 'Fernando' | 'Gonzalo'

export interface Dish {
  id: string
  title: string
  category: Category
  image_url: string | null
  created_at: string
  active: boolean
}

export interface Review {
  id: string
  dish_id: string
  reviewer: Reviewer
  stars: number
  wedding_worthy: boolean
  comments: string | null
  created_at: string
}

export const REVIEWERS: Reviewer[] = [
  'Ana (madre)',
  'Lolo',
  'Marta',
  'Ana (cuñada)',
  'Fernando',
  'Gonzalo',
]

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'entrante', label: 'Entrante', emoji: '🥗' },
  { value: 'primero', label: 'Primero', emoji: '🍝' },
  { value: 'segundo', label: 'Segundo', emoji: '🥩' },
  { value: 'postre', label: 'Postre', emoji: '🍰' },
  { value: 'vino', label: 'Vino', emoji: '🍷' },
]

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c])
) as unknown as Record<Category, { label: string; emoji: string }>
