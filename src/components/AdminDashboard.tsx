import { useState, useEffect, useCallback } from 'react'
import type { Dish, Review } from '../types'
import { CATEGORIES, CATEGORY_MAP, REVIEWERS } from '../types'
import { supabase } from '../lib/supabase'
import AddDishModal from './AddDishModal'
import DishDetail from './DishDetail'
import StarRating from './StarRating'

interface Props {
  onBack: () => void
}

export default function AdminDashboard({ onBack }: Props) {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDish, setShowAddDish] = useState(false)
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [dishRes, reviewRes] = await Promise.all([
      supabase.from('dishes').select('*').order('created_at'),
      supabase.from('reviews').select('*'),
    ])
    setDishes(dishRes.data ?? [])
    setReviews(reviewRes.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const getReviewsForDish = (dishId: string) =>
    reviews.filter((r) => r.dish_id === dishId)

  const groupedDishes = CATEGORIES
    .map((cat) => ({
      ...cat,
      dishes: dishes.filter((d) => d.category === cat.value),
    }))
    .filter((g) => g.dishes.length > 0)

  return (
    <div className="min-h-dvh px-4 py-6 max-w-lg mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-warm-gray hover:text-burgundy transition-colors">
          ← Inicio
        </button>
        <button
          onClick={fetchData}
          className="text-sm text-warm-gray-light hover:text-burgundy transition-colors"
        >
          🔄 Actualizar
        </button>
      </div>

      <h1 className="text-2xl font-bold text-burgundy mb-1">
        Panel de Gonzalo 👨‍🍳
      </h1>
      <p className="text-warm-gray mb-6">
        Sube platos y mira las reviews de todos
      </p>

      {/* Add dish button */}
      <button
        onClick={() => setShowAddDish(true)}
        className="w-full py-4 mb-8 bg-olive text-white rounded-2xl text-lg font-semibold
                   shadow-lg hover:bg-olive-light active:scale-[0.98] transition-all
                   flex items-center justify-center gap-2"
      >
        📸 Subir nuevo plato
      </button>

      {loading ? (
        <div className="text-center py-20 text-warm-gray-light text-lg">
          Cargando... 🍽️
        </div>
      ) : dishes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📸</p>
          <p className="text-lg text-warm-gray">
            Aún no hay platos. ¡Sube el primero!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedDishes.map((group) => (
            <div key={group.value}>
              <h2 className="text-xl font-bold text-burgundy mb-3 flex items-center gap-2">
                <span>{group.emoji}</span>
                <span>{group.label}</span>
              </h2>
              <div className="space-y-3">
                {group.dishes.map((dish) => {
                  const dishReviews = getReviewsForDish(dish.id)
                  const avg = dishReviews.length
                    ? dishReviews.reduce((s, r) => s + r.stars, 0) / dishReviews.length
                    : 0
                  const yesCount = dishReviews.filter((r) => r.wedding_worthy).length
                  const noCount = dishReviews.filter((r) => !r.wedding_worthy).length

                  return (
                    <button
                      key={dish.id}
                      onClick={() => setSelectedDish(dish)}
                      className="w-full bg-white rounded-2xl shadow-sm border border-cream-dark
                                 overflow-hidden hover:shadow-md active:scale-[0.99] transition-all text-left"
                    >
                      <div className="flex items-center gap-4 p-4">
                        {dish.image_url ? (
                          <img
                            src={dish.image_url}
                            alt={dish.title}
                            className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-cream-dark rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                            {CATEGORY_MAP[dish.category].emoji}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-burgundy truncate">{dish.title}</p>
                          <div className="mt-1">
                            {dishReviews.length > 0 ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <StarRating value={Math.round(avg)} size="sm" readonly />
                                  <span className="text-xs text-warm-gray-light">
                                    ({avg.toFixed(1)})
                                  </span>
                                </div>
                                <p className="text-xs text-warm-gray mt-1">
                                  {dishReviews.length}/{REVIEWERS.length} reviews
                                  {' · '}
                                  <span className="text-olive">{yesCount} sí</span>
                                  {' · '}
                                  <span className="text-burgundy">{noCount} no</span>
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-warm-gray-light">
                                Sin reviews aún
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dish Modal */}
      {showAddDish && (
        <AddDishModal
          onClose={() => setShowAddDish(false)}
          onSaved={() => {
            setShowAddDish(false)
            fetchData()
          }}
        />
      )}

      {/* Dish Detail Modal */}
      {selectedDish && (
        <DishDetail
          dish={selectedDish}
          reviews={reviews}
          onClose={() => setSelectedDish(null)}
        />
      )}
    </div>
  )
}
