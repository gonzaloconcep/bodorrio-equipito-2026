import { useState } from 'react'
import type { Dish, Review, Reviewer } from '../types'
import { CATEGORY_MAP } from '../types'
import { supabase } from '../lib/supabase'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import StarRating from './StarRating'

interface Props {
  dish: Dish
  reviewer: Reviewer
  existingReview: Review | null
  onClose: () => void
  onSaved: () => void
}

export default function ReviewModal({ dish, reviewer, existingReview, onClose, onSaved }: Props) {
  const [stars, setStars] = useState(existingReview?.stars ?? 0)
  const [weddingWorthy, setWeddingWorthy] = useState<boolean | null>(
    existingReview?.wedding_worthy ?? null
  )
  const [comments, setComments] = useState(existingReview?.comments ?? '')
  const [saving, setSaving] = useState(false)

  const canSubmit = stars > 0 && weddingWorthy !== null && !saving

  useBodyScrollLock()

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSaving(true)

    const reviewData = {
      dish_id: dish.id,
      reviewer,
      stars,
      wedding_worthy: weddingWorthy,
      comments: comments.trim() || null,
    }

    const { error } = await supabase
      .from('reviews')
      .upsert(reviewData, { onConflict: 'dish_id,reviewer' })

    setSaving(false)
    if (error) {
      alert('Error al guardar: ' + error.message)
      return
    }
    onSaved()
  }

  const cat = CATEGORY_MAP[dish.category]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-cream rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90dvh] overflow-y-auto animate-slide-up">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-warm-gray-light mb-1">
                {cat.emoji} {cat.label}
              </p>
              <h2 className="text-2xl font-bold text-burgundy">{dish.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-2xl text-warm-gray hover:text-burgundy p-2"
            >
              ✕
            </button>
          </div>

          {/* Dish photo */}
          {dish.image_url && (
            <img
              src={dish.image_url}
              alt={dish.title}
              className="w-full h-48 object-cover rounded-2xl mb-6"
            />
          )}

          {/* Stars */}
          <div className="mb-6">
            <p className="text-center text-warm-gray font-medium mb-3">
              ¿Qué te ha parecido?
            </p>
            <StarRating value={stars} onChange={setStars} />
          </div>

          {/* Wedding worthy */}
          <div className="mb-6">
            <p className="text-center text-warm-gray font-medium mb-3">
              ¿Lo pondrías en la boda?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={() => setWeddingWorthy(true)}
                className={`py-4 px-8 rounded-2xl text-xl font-semibold transition-all
                  ${weddingWorthy === true
                    ? 'bg-olive text-white shadow-lg scale-105'
                    : 'bg-white text-olive border-2 border-olive/30 hover:border-olive'
                  }`}
              >
                SÍ ✅
              </button>
              <button
                type="button"
                onClick={() => setWeddingWorthy(false)}
                className={`py-4 px-8 rounded-2xl text-xl font-semibold transition-all
                  ${weddingWorthy === false
                    ? 'bg-burgundy text-white shadow-lg scale-105'
                    : 'bg-white text-burgundy border-2 border-burgundy/30 hover:border-burgundy'
                  }`}
              >
                NO ❌
              </button>
            </div>
          </div>

          {/* Comments */}
          <div className="mb-6">
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="¿Algún comentario? 💬"
              rows={3}
              className="w-full p-4 rounded-2xl bg-white border border-cream-dark resize-none
                         text-base focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-4 rounded-2xl text-lg font-semibold transition-all
              ${canSubmit
                ? 'bg-gold text-white shadow-lg hover:bg-gold-dark active:scale-[0.98]'
                : 'bg-cream-dark text-warm-gray-light cursor-not-allowed'
              }`}
          >
            {saving ? 'Guardando...' : existingReview ? 'Actualizar review ✏️' : 'Enviar review 🍽️'}
          </button>
        </div>
      </div>
    </div>
  )
}
