import { useMemo } from 'react'
import type { Dish, Review, Category } from '../types'
import { CATEGORIES, REVIEWERS } from '../types'

export interface RankedDish {
  dish: Dish
  avgStars: number
  yesPercentage: number
  yesCount: number
  noCount: number
  reviewCount: number
  isUnanimousYes: boolean
  isComplete: boolean
}

export interface CategoryRanking {
  category: Category
  label: string
  emoji: string
  dishes: RankedDish[]
  winner: RankedDish | null
}

export interface RankingSummary {
  categories: CategoryRanking[]
  unanimousYes: RankedDish[]
}

export function computeRanking(dishes: Dish[], reviews: Review[]): RankingSummary {
  const reviewsByDish = new Map<string, Review[]>()
  for (const r of reviews) {
    const arr = reviewsByDish.get(r.dish_id) ?? []
    arr.push(r)
    reviewsByDish.set(r.dish_id, arr)
  }

  const rankedDishes = dishes.map((dish): RankedDish => {
    const dishReviews = reviewsByDish.get(dish.id) ?? []
    const reviewCount = dishReviews.length
    const avgStars = reviewCount > 0
      ? dishReviews.reduce((sum, r) => sum + r.stars, 0) / reviewCount
      : 0
    const yesCount = dishReviews.filter((r) => r.wedding_worthy).length
    const noCount = reviewCount - yesCount
    const yesPercentage = reviewCount > 0 ? (yesCount / reviewCount) * 100 : 0
    const isComplete = reviewCount >= REVIEWERS.length
    const isUnanimousYes = isComplete && yesCount === reviewCount

    return {
      dish, avgStars, yesPercentage, yesCount, noCount,
      reviewCount, isUnanimousYes, isComplete,
    }
  })

  const categories: CategoryRanking[] = CATEGORIES.map((cat) => {
    const catDishes = rankedDishes
      .filter((rd) => rd.dish.category === cat.value)
      .sort((a, b) => {
        if (b.avgStars !== a.avgStars) return b.avgStars - a.avgStars
        return b.yesPercentage - a.yesPercentage
      })

    return {
      category: cat.value,
      label: cat.label,
      emoji: cat.emoji,
      dishes: catDishes,
      winner: catDishes.length > 0 ? catDishes[0] : null,
    }
  })

  const unanimousYes = rankedDishes.filter((rd) => rd.isUnanimousYes)

  return { categories, unanimousYes }
}

export function useRanking(dishes: Dish[], reviews: Review[]): RankingSummary {
  return useMemo(() => computeRanking(dishes, reviews), [dishes, reviews])
}
