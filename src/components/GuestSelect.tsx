import { REVIEWERS } from '../types'
import type { Reviewer } from '../types'

const GUEST_EMOJIS: Record<Reviewer, string> = {
  'Ana (madre)': '👩',
  'Lolo': '👨',
  'Marta': '👩‍🦰',
  'Ana (cuñada)': '👱‍♀️',
  'Fernando': '🧔',
  'Gonzalo': '👨‍🍳',
}

interface Props {
  onSelect: (guest: Reviewer) => void
  onBack: () => void
}

export default function GuestSelect({ onSelect, onBack }: Props) {
  return (
    <div className="min-h-dvh px-6 py-8 animate-fade-in">
      <button
        onClick={onBack}
        className="text-warm-gray mb-6 flex items-center gap-1 hover:text-burgundy transition-colors"
      >
        ← Volver
      </button>

      <h1 className="text-3xl font-bold text-burgundy text-center mb-2">
        ¿Quién eres? 🤔
      </h1>
      <p className="text-center text-warm-gray mb-8">
        Selecciona tu nombre para empezar
      </p>

      <div className="flex flex-col gap-3 max-w-sm mx-auto">
        {REVIEWERS.map((name) => (
          <button
            key={name}
            onClick={() => onSelect(name)}
            className="w-full py-5 px-6 bg-white rounded-2xl text-lg font-semibold text-burgundy
                       shadow-md hover:shadow-lg hover:bg-cream-dark active:scale-[0.98]
                       transition-all flex items-center gap-4 border border-cream-dark"
          >
            <span className="text-3xl">{GUEST_EMOJIS[name]}</span>
            <span>{name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
