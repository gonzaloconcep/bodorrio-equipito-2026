import { computeRanking } from '../useRanking'
import { makeDish, makeReview, makeFullReviews } from '../../test/mocks'

describe('computeRanking', () => {
  it('returns empty categories and no unanimousYes with no data', () => {
    const result = computeRanking([], [])
    expect(result.categories).toHaveLength(5)
    result.categories.forEach((cat) => {
      expect(cat.dishes).toHaveLength(0)
      expect(cat.winner).toBeNull()
    })
    expect(result.unanimousYes).toHaveLength(0)
  })

  it('computes avgStars correctly for 1 dish with 1 review', () => {
    const dish = makeDish({ id: 'r-1', category: 'entrante' })
    const reviews = [makeReview({ dish_id: 'r-1', stars: 3 })]
    const result = computeRanking([dish], reviews)
    const entrante = result.categories.find((c) => c.category === 'entrante')!
    expect(entrante.dishes).toHaveLength(1)
    expect(entrante.dishes[0].avgStars).toBe(3)
    expect(entrante.dishes[0].isUnanimousYes).toBe(false)
    expect(entrante.dishes[0].isComplete).toBe(false)
  })

  it('marks dish as unanimousYes when 6/6 all say yes', () => {
    const dish = makeDish({ id: 'r-2', category: 'primero' })
    const reviews = makeFullReviews('r-2', { stars: 5, wedding_worthy: true })
    const result = computeRanking([dish], reviews)
    const primero = result.categories.find((c) => c.category === 'primero')!
    expect(primero.dishes[0].isUnanimousYes).toBe(true)
    expect(primero.dishes[0].isComplete).toBe(true)
    expect(result.unanimousYes).toHaveLength(1)
    expect(result.unanimousYes[0].dish.id).toBe('r-2')
  })

  it('computes yesPercentage correctly with mixed votes', () => {
    const dish = makeDish({ id: 'r-3', category: 'segundo' })
    const reviews = makeFullReviews('r-3', { stars: 4, wedding_worthy: true })
    reviews[0].wedding_worthy = false
    reviews[1].wedding_worthy = false
    const result = computeRanking([dish], reviews)
    const segundo = result.categories.find((c) => c.category === 'segundo')!
    expect(segundo.dishes[0].yesPercentage).toBeCloseTo(66.67, 1)
    expect(segundo.dishes[0].yesCount).toBe(4)
    expect(segundo.dishes[0].noCount).toBe(2)
    expect(segundo.dishes[0].isUnanimousYes).toBe(false)
  })

  it('sorts dishes by avgStars desc within same category', () => {
    const dish1 = makeDish({ id: 'r-4a', category: 'entrante', title: 'Low' })
    const dish2 = makeDish({ id: 'r-4b', category: 'entrante', title: 'High' })
    const reviews = [
      makeReview({ dish_id: 'r-4a', stars: 2 }),
      makeReview({ dish_id: 'r-4b', stars: 5 }),
    ]
    const result = computeRanking([dish1, dish2], reviews)
    const entrante = result.categories.find((c) => c.category === 'entrante')!
    expect(entrante.dishes[0].dish.title).toBe('High')
    expect(entrante.dishes[1].dish.title).toBe('Low')
    expect(entrante.winner!.dish.title).toBe('High')
  })

  it('uses yesPercentage as tiebreak when avgStars are equal', () => {
    const dish1 = makeDish({ id: 'r-5a', category: 'postre', title: 'LessYes' })
    const dish2 = makeDish({ id: 'r-5b', category: 'postre', title: 'MoreYes' })
    const reviews = [
      makeReview({ dish_id: 'r-5a', stars: 4, wedding_worthy: false }),
      makeReview({ dish_id: 'r-5b', stars: 4, wedding_worthy: true }),
    ]
    const result = computeRanking([dish1, dish2], reviews)
    const postre = result.categories.find((c) => c.category === 'postre')!
    expect(postre.dishes[0].dish.title).toBe('MoreYes')
  })

  it('produces independent rankings per category', () => {
    const d1 = makeDish({ id: 'r-6a', category: 'entrante' })
    const d2 = makeDish({ id: 'r-6b', category: 'postre' })
    const reviews = [
      makeReview({ dish_id: 'r-6a', stars: 3 }),
      makeReview({ dish_id: 'r-6b', stars: 5 }),
    ]
    const result = computeRanking([d1, d2], reviews)
    const entrante = result.categories.find((c) => c.category === 'entrante')!
    const postre = result.categories.find((c) => c.category === 'postre')!
    expect(entrante.dishes).toHaveLength(1)
    expect(postre.dishes).toHaveLength(1)
  })

  it('does NOT mark incomplete dish as unanimousYes even if all reviews say yes', () => {
    const dish = makeDish({ id: 'r-7', category: 'vino' })
    const reviews = [
      makeReview({ dish_id: 'r-7', stars: 5, wedding_worthy: true, reviewer: 'Ana (madre)' }),
      makeReview({ dish_id: 'r-7', stars: 5, wedding_worthy: true, reviewer: 'Lolo' }),
      makeReview({ dish_id: 'r-7', stars: 5, wedding_worthy: true, reviewer: 'Marta' }),
    ]
    const result = computeRanking([dish], reviews)
    const vino = result.categories.find((c) => c.category === 'vino')!
    expect(vino.dishes[0].isUnanimousYes).toBe(false)
    expect(vino.dishes[0].isComplete).toBe(false)
    expect(result.unanimousYes).toHaveLength(0)
  })
})
