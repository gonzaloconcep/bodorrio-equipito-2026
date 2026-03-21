import { useMemo } from 'react'
import type { Review, Reviewer } from '../types'
import { REVIEWERS } from '../types'

export interface MissingReviewersResult {
  missing: Reviewer[]
  isComplete: boolean
  reviewedCount: number
  totalCount: number
}

export function getMissingReviewers(
  dishId: string,
  reviews: Review[],
): MissingReviewersResult {
  const dishReviews = reviews.filter((r) => r.dish_id === dishId)
  const reviewedSet = new Set(dishReviews.map((r) => r.reviewer))
  const missing = REVIEWERS.filter((r) => !reviewedSet.has(r))

  return {
    missing,
    isComplete: missing.length === 0,
    reviewedCount: reviewedSet.size,
    totalCount: REVIEWERS.length,
  }
}

export function useMissingReviewers(
  dishId: string,
  reviews: Review[],
): MissingReviewersResult {
  return useMemo(() => getMissingReviewers(dishId, reviews), [dishId, reviews])
}
