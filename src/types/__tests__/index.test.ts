import { CATEGORIES, REVIEWERS, CATEGORY_MAP } from '../index'

describe('types constants', () => {
  it('CATEGORIES has 5 entries', () => {
    expect(CATEGORIES).toHaveLength(5)
  })

  it('CATEGORIES has expected values', () => {
    const values = CATEGORIES.map((c) => c.value)
    expect(values).toEqual(['entrante', 'primero', 'segundo', 'postre', 'vino'])
  })

  it('each category has label and emoji', () => {
    CATEGORIES.forEach((cat) => {
      expect(cat.label).toBeTruthy()
      expect(cat.emoji).toBeTruthy()
    })
  })

  it('REVIEWERS has 6 entries', () => {
    expect(REVIEWERS).toHaveLength(6)
  })

  it('REVIEWERS contains expected names', () => {
    expect(REVIEWERS).toContain('Ana (madre)')
    expect(REVIEWERS).toContain('Lolo')
    expect(REVIEWERS).toContain('Marta')
    expect(REVIEWERS).toContain('Ana (cuñada)')
    expect(REVIEWERS).toContain('Fernando')
    expect(REVIEWERS).toContain('Gonzalo')
  })

  it('CATEGORY_MAP maps each category value to label and emoji', () => {
    expect(CATEGORY_MAP.entrante).toEqual({ value: 'entrante', label: 'Entrante', emoji: '🥗' })
    expect(CATEGORY_MAP.primero).toEqual({ value: 'primero', label: 'Primero', emoji: '🍝' })
    expect(CATEGORY_MAP.segundo).toEqual({ value: 'segundo', label: 'Segundo', emoji: '🥩' })
    expect(CATEGORY_MAP.postre).toEqual({ value: 'postre', label: 'Postre', emoji: '🍰' })
    expect(CATEGORY_MAP.vino).toEqual({ value: 'vino', label: 'Vino', emoji: '🍷' })
  })

  it('CATEGORY_MAP has all 5 entries', () => {
    expect(Object.keys(CATEGORY_MAP)).toHaveLength(5)
  })
})
