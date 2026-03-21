import type { Dish, Review, Reviewer, Category } from '../types'
import { REVIEWERS } from '../types'

let dishCounter = 0
let reviewCounter = 0

export function makeDish(overrides: Partial<Dish> = {}): Dish {
  dishCounter++
  return {
    id: `dish-${dishCounter}`,
    title: `Plato ${dishCounter}`,
    category: 'entrante' as Category,
    image_url: null,
    created_at: new Date().toISOString(),
    active: true,
    ...overrides,
  }
}

export function makeReview(overrides: Partial<Review> = {}): Review {
  reviewCounter++
  return {
    id: `review-${reviewCounter}`,
    dish_id: 'dish-1',
    reviewer: REVIEWERS[0] as Reviewer,
    stars: 4,
    wedding_worthy: true,
    comments: null,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export function makeFullReviews(
  dishId: string,
  defaults: Partial<Review> = {},
): Review[] {
  return REVIEWERS.map((reviewer) =>
    makeReview({ dish_id: dishId, reviewer, ...defaults }),
  )
}
