import { getMissingReviewers } from '../useMissingReviewers'
import { makeDish, makeReview, makeFullReviews } from '../../test/mocks'
import { REVIEWERS } from '../../types'

describe('getMissingReviewers', () => {
  const dish = makeDish({ id: 'test-dish' })

  it('returns all reviewers as missing when there are no reviews', () => {
    const result = getMissingReviewers(dish.id, [])
    expect(result.missing).toEqual(REVIEWERS)
    expect(result.isComplete).toBe(false)
    expect(result.reviewedCount).toBe(0)
    expect(result.totalCount).toBe(6)
  })

  it('returns correct missing reviewers when 3 of 6 have reviewed', () => {
    const reviews = [
      makeReview({ dish_id: dish.id, reviewer: 'Ana (madre)' }),
      makeReview({ dish_id: dish.id, reviewer: 'Lolo' }),
      makeReview({ dish_id: dish.id, reviewer: 'Marta' }),
    ]
    const result = getMissingReviewers(dish.id, reviews)
    expect(result.missing).toEqual(['Ana (cuñada)', 'Fernando', 'Gonzalo'])
    expect(result.isComplete).toBe(false)
    expect(result.reviewedCount).toBe(3)
    expect(result.totalCount).toBe(6)
  })

  it('returns empty missing when all 6 have reviewed', () => {
    const reviews = makeFullReviews(dish.id)
    const result = getMissingReviewers(dish.id, reviews)
    expect(result.missing).toEqual([])
    expect(result.isComplete).toBe(true)
    expect(result.reviewedCount).toBe(6)
    expect(result.totalCount).toBe(6)
  })

  it('ignores reviews for other dishes', () => {
    const reviews = [
      makeReview({ dish_id: 'other-dish', reviewer: 'Ana (madre)' }),
      makeReview({ dish_id: 'other-dish', reviewer: 'Lolo' }),
      makeReview({ dish_id: dish.id, reviewer: 'Gonzalo' }),
    ]
    const result = getMissingReviewers(dish.id, reviews)
    expect(result.missing).toHaveLength(5)
    expect(result.missing).not.toContain('Gonzalo')
    expect(result.reviewedCount).toBe(1)
  })
})
