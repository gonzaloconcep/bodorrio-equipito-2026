import { useState, useEffect, useCallback } from 'react'
import type { Category, Dish, Review, Reviewer } from '../types'
import { CATEGORIES, CATEGORY_MAP } from '../types'
import { supabase } from '../lib/supabase'
import ReviewModal from './ReviewModal'
import StarRating from './StarRating'

interface Props {
  reviewer: Reviewer
  onChangeGuest: () => void
  onBack: () => void
}

export default function GuestDashboard({ reviewer, onChangeGuest, onBack }: Props) {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<Category | 'todas'>('todas')
  const [reviewFilter, setReviewFilter] = useState<'todas' | 'pendiente' | 'hecha'>('pendiente')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [dishRes, reviewRes] = await Promise.all([
      supabase.from('dishes').select('*').eq('active', true).order('created_at'),
      supabase.from('reviews').select('*').eq('reviewer', reviewer),
    ])
    setDishes(dishRes.data ?? [])
    setReviews(reviewRes.data ?? [])
    setLoading(false)
  }, [reviewer])

  useEffect(() => { fetchData() }, [fetchData])

  const getReviewForDish = (dishId: string) =>
    reviews.find((r) => r.dish_id === dishId) ?? null

  const filteredDishes = dishes.filter((d) => {
    if (categoryFilter !== 'todas' && d.category !== categoryFilter) return false
    if (reviewFilter === 'pendiente' && getReviewForDish(d.id)) return false
    if (reviewFilter === 'hecha' && !getReviewForDish(d.id)) return false
    return true
  })

  const groupedDishes = CATEGORIES
    .map((cat) => ({
      ...cat,
      dishes: filteredDishes.filter((d) => d.category === cat.value),
    }))
    .filter((g) => g.dishes.length > 0)

  return (
    <div className="min-h-dvh px-4 py-6 max-w-lg mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-warm-gray hover:text-burgundy transition-colors">
          ← Inicio
        </button>
        <button
          onClick={onChangeGuest}
          className="text-sm text-warm-gray-light hover:text-burgundy transition-colors"
        >
          Cambiar usuario
        </button>
      </div>

      <h1 className="text-2xl font-bold text-burgundy mb-1">
        ¡Hola, {reviewer.split(' ')[0]}! 👋
      </h1>
      <p className="text-warm-gray mb-4">
        Puntúa los platos de la prueba de menú
      </p>

      {/* Refresh */}
      <button
        onClick={fetchData}
        className="mb-6 py-2 px-4 bg-white border border-cream-dark rounded-xl text-sm
                   text-warm-gray hover:border-gold transition-colors flex items-center gap-2 mx-auto"
      >
        🔄 Actualizar platos
      </button>

      {/* Filters */}
      {!loading && dishes.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('todas')}
              className={`py-1.5 px-3 rounded-xl text-sm font-medium transition-all ${
                categoryFilter === 'todas'
                  ? 'bg-burgundy text-white'
                  : 'bg-white text-warm-gray border border-cream-dark'
              }`}
            >
              Todas
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={`py-1.5 px-3 rounded-xl text-sm font-medium transition-all ${
                  categoryFilter === cat.value
                    ? 'bg-burgundy text-white'
                    : 'bg-white text-warm-gray border border-cream-dark'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {([['todas', 'Todas'], ['pendiente', 'Pendientes'], ['hecha', 'Hechas']] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setReviewFilter(value)}
                className={`py-1.5 px-3 rounded-xl text-sm font-medium transition-all ${
                  reviewFilter === value
                    ? 'bg-gold text-white'
                    : 'bg-white text-warm-gray border border-cream-dark'
                }`}
              >
                {value === 'pendiente' ? '⭐ ' : value === 'hecha' ? '✅ ' : ''}{label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-warm-gray-light text-lg">
          Cargando platos... 🍽️
        </div>
      ) : dishes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🍽️</p>
          <p className="text-lg text-warm-gray">
            Gonzalo aún no ha subido ningún plato...
          </p>
          <p className="text-warm-gray-light">¡Paciencia!</p>
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
                  const review = getReviewForDish(dish.id)
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
                          {review ? (
                            <div className="mt-1">
                              <StarRating value={review.stars} size="sm" readonly />
                              <p className="text-xs text-olive mt-1">
                                {review.wedding_worthy ? '✅ Sí boda' : '❌ No boda'}
                                {' · '}
                                <span className="text-warm-gray-light">Toca para editar</span>
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-gold mt-1 font-medium">
                              Sin puntuar · Toca para valorar ⭐
                            </p>
                          )}
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

      {/* Review Modal */}
      {selectedDish && (
        <ReviewModal
          key={selectedDish.id}
          dish={selectedDish}
          reviewer={reviewer}
          existingReview={getReviewForDish(selectedDish.id)}
          hasNext={dishes.some((d) => d.id !== selectedDish.id && !getReviewForDish(d.id))}
          onClose={() => setSelectedDish(null)}
          onSaved={() => {
            setSelectedDish(null)
            fetchData()
          }}
          onSavedAndNext={async () => {
            const freshReviews = (await supabase.from('reviews').select('*').eq('reviewer', reviewer)).data ?? []
            const reviewedIds = new Set(freshReviews.map((r) => r.dish_id))
            reviewedIds.add(selectedDish.id)
            const next = dishes.find((d) => d.id !== selectedDish.id && !reviewedIds.has(d.id))
            setReviews(freshReviews)
            setSelectedDish(next ?? null)
            if (!next) fetchData()
          }}
        />
      )}
    </div>
  )
}
