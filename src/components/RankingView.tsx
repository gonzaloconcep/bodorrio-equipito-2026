import type { Dish, Review } from '../types'
import { computeRanking } from '../hooks/useRanking'
import type { RankedDish } from '../hooks/useRanking'
import StarRating from './StarRating'

interface Props {
  dishes: Dish[]
  reviews: Review[]
}

function RankedDishCard({ ranked, position }: { ranked: RankedDish; position: number }) {
  const isWinner = position === 0

  return (
    <div
      data-testid="ranked-dish"
      className={`bg-white rounded-2xl p-4 border ${
        isWinner ? 'border-gold shadow-md' : 'border-cream-dark'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-warm-gray-light w-8 text-center">
          {isWinner ? '🏆' : `#${position + 1}`}
        </span>
        <div className="flex-1 min-w-0">
          <p data-testid="ranked-dish-title" className="font-semibold text-burgundy truncate">
            {ranked.dish.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <StarRating value={Math.round(ranked.avgStars)} size="sm" readonly />
            <span className="text-xs text-warm-gray-light">
              ({ranked.avgStars.toFixed(1)})
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-warm-gray">
            <span className="text-olive font-medium">
              {Math.round(ranked.yesPercentage)}%
            </span>
            <span>{ranked.reviewCount}/{6} reviews</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RankingView({ dishes, reviews }: Props) {
  const { categories, unanimousYes } = computeRanking(dishes, reviews)
  const categoriesWithDishes = categories.filter((c) => c.dishes.length > 0)

  if (dishes.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">📊</p>
        <p className="text-lg text-warm-gray">
          Aún no hay platos para el ranking
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {unanimousYes.length > 0 && (
        <div data-testid="unanimous-section" className="bg-gold/10 rounded-2xl p-4 border border-gold">
          <h2 className="text-lg font-bold text-gold mb-3 flex items-center gap-2">
            <span>✅</span>
            <span>Unanimidad</span>
          </h2>
          <div className="space-y-2">
            {unanimousYes.map((rd) => (
              <div key={rd.dish.id} className="flex items-center gap-2 text-burgundy font-medium">
                <span>🎉</span>
                <span>{rd.dish.title}</span>
                <span className="text-xs text-olive ml-auto">
                  {rd.avgStars.toFixed(1)} ⭐
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {categoriesWithDishes.map((cat) => (
        <div key={cat.category}>
          <h2 className="text-xl font-bold text-burgundy mb-3 flex items-center gap-2">
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </h2>
          <div className="space-y-3">
            {cat.dishes.map((ranked, i) => (
              <RankedDishCard key={ranked.dish.id} ranked={ranked} position={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
