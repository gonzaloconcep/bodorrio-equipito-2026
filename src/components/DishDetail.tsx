import type { Dish, Review } from '../types'
import { CATEGORY_MAP, REVIEWERS } from '../types'
import StarRating from './StarRating'
import { useEffect } from 'react'

interface Props {
  dish: Dish
  reviews: Review[]
  onClose: () => void
}

export default function DishDetail({ dish, reviews, onClose }: Props) {
  const dishReviews = reviews.filter((r) => r.dish_id === dish.id)
  const cat = CATEGORY_MAP[dish.category]
  const avgStars = dishReviews.length
    ? dishReviews.reduce((sum, r) => sum + r.stars, 0) / dishReviews.length
    : 0
  const yesCount = dishReviews.filter((r) => r.wedding_worthy).length
  const noCount = dishReviews.filter((r) => !r.wedding_worthy).length

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-cream rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90dvh] overflow-y-auto animate-slide-up">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-warm-gray-light mb-1">{cat.emoji} {cat.label}</p>
              <h2 className="text-2xl font-bold text-burgundy">{dish.title}</h2>
            </div>
            <button onClick={onClose} className="text-2xl text-warm-gray hover:text-burgundy p-2">
              ✕
            </button>
          </div>

          {dish.image_url && (
            <img
              src={dish.image_url}
              alt={dish.title}
              className="w-full h-48 object-cover rounded-2xl mb-4"
            />
          )}

          {/* Summary */}
          <div className="bg-white rounded-2xl p-4 mb-6 border border-cream-dark">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gold">{avgStars.toFixed(1)}</p>
                <p className="text-xs text-warm-gray-light">Media ⭐</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-olive">{yesCount}</p>
                <p className="text-xs text-warm-gray-light">SÍ boda ✅</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-burgundy">{noCount}</p>
                <p className="text-xs text-warm-gray-light">NO boda ❌</p>
              </div>
            </div>
            <p className="text-center text-xs text-warm-gray-light mt-2">
              {dishReviews.length} de {REVIEWERS.length} reviews
            </p>
          </div>

          {/* Individual reviews */}
          <h3 className="text-lg font-bold text-burgundy mb-3">Reviews individuales</h3>
          {dishReviews.length === 0 ? (
            <p className="text-warm-gray-light text-center py-4">
              Aún no hay reviews para este plato
            </p>
          ) : (
            <div className="space-y-3">
              {dishReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl p-4 border border-cream-dark"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-burgundy">{review.reviewer}</p>
                    <span className={`text-sm font-medium px-2 py-1 rounded-lg ${
                      review.wedding_worthy
                        ? 'bg-olive/10 text-olive'
                        : 'bg-burgundy/10 text-burgundy'
                    }`}>
                      {review.wedding_worthy ? '✅ Sí boda' : '❌ No boda'}
                    </span>
                  </div>
                  <StarRating value={review.stars} size="sm" readonly />
                  {review.comments && (
                    <p className="text-warm-gray text-sm mt-2 italic">
                      "{review.comments}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Missing reviews */}
          {dishReviews.length < REVIEWERS.length && (
            <div className="mt-4">
              <p className="text-xs text-warm-gray-light">
                Faltan:{' '}
                {REVIEWERS.filter(
                  (r) => !dishReviews.some((dr) => dr.reviewer === r)
                ).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
