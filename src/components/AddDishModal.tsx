import { useState, useRef } from 'react'
import type { Category } from '../types'
import { CATEGORIES } from '../types'
import { supabase } from '../lib/supabase'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'

interface Props {
  onClose: () => void
  onSaved: () => void
}

export default function AddDishModal({ onClose, onSaved }: Props) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('entrante')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useBodyScrollLock()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const handleSubmit = async () => {
    if (!title.trim()) return
    setSaving(true)

    let imageUrl: string | null = null

    if (imageFile) {
      const ext = imageFile.name.split('.').pop() ?? 'jpg'
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('dish-photos')
        .upload(fileName, imageFile)

      if (uploadError) {
        alert('Error subiendo foto: ' + uploadError.message)
        setSaving(false)
        return
      }

      const { data: urlData } = supabase.storage.from('dish-photos').getPublicUrl(fileName)
      imageUrl = urlData.publicUrl
    }

    const { error } = await supabase.from('dishes').insert({
      title: title.trim(),
      category,
      image_url: imageUrl,
    })

    setSaving(false)
    if (error) {
      alert('Error al guardar: ' + error.message)
      return
    }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center h-dvh">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-cream rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90dvh] overflow-y-auto overscroll-contain animate-slide-up">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-burgundy">Nuevo plato 📸</h2>
            <button onClick={onClose} className="text-2xl text-warm-gray hover:text-burgundy p-2">
              ✕
            </button>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-warm-gray mb-1">
              Nombre del plato
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Risotto de boletus"
              className="w-full p-4 rounded-2xl bg-white border border-cream-dark text-base
                         focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-warm-gray mb-1">
              Categoría
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`py-2 px-4 rounded-xl text-sm font-medium transition-all
                    ${category === cat.value
                      ? 'bg-burgundy text-white'
                      : 'bg-white text-warm-gray border border-cream-dark hover:border-burgundy/30'
                    }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-warm-gray mb-1">
              Foto del plato
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-2xl"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null)
                    setPreview(null)
                    if (fileRef.current) fileRef.current.value = ''
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white w-8 h-8 rounded-full
                             flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-cream-dark rounded-2xl
                           text-warm-gray-light hover:border-gold transition-colors"
              >
                📷 Toca para hacer foto o seleccionar
              </button>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || saving}
            className={`w-full py-4 rounded-2xl text-lg font-semibold transition-all
              ${title.trim() && !saving
                ? 'bg-olive text-white shadow-lg hover:bg-olive-light active:scale-[0.98]'
                : 'bg-cream-dark text-warm-gray-light cursor-not-allowed'
              }`}
          >
            {saving ? 'Subiendo...' : 'Subir plato 🍽️'}
          </button>
        </div>
      </div>
    </div>
  )
}
