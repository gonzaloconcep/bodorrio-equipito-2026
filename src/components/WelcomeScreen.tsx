import { useState } from 'react'

interface Props {
  onAdmin: () => void
  onGuest: () => void
}

const EMOJI_OPTIONS = ['💍', '💒', '🥂', '🍷', '💐', '🎂']

export default function WelcomeScreen({ onAdmin, onGuest }: Props) {
  const [showEmojiChallenge, setShowEmojiChallenge] = useState(false)
  const [wrongAnswer, setWrongAnswer] = useState(false)

  const handleEmojiPick = (emoji: string) => {
    if (emoji === '💍') {
      onAdmin()
    } else {
      setWrongAnswer(true)
      setTimeout(() => setWrongAnswer(false), 1000)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 animate-fade-in">
      <div className="text-6xl mb-6">💒</div>
      <h1 className="text-4xl md:text-5xl font-bold text-burgundy text-center mb-3">
        Bodorrio 2026
      </h1>
      <p className="text-xl md:text-2xl text-warm-gray font-light mb-2 font-display italic">
        Prueba de Menú
      </p>
      <p className="text-warm-gray-light mb-12 text-lg">
        🍽️ Probamos, puntuamos, ¡elegimos! 🥂
      </p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={onGuest}
          className="w-full py-4 px-6 bg-burgundy text-white rounded-2xl text-lg font-semibold
                     shadow-lg hover:bg-burgundy-light active:scale-[0.98] transition-all"
        >
          Soy invitado 🥂
        </button>
        <button
          onClick={() => setShowEmojiChallenge(true)}
          className="w-full py-4 px-6 bg-olive text-white rounded-2xl text-lg font-semibold
                     shadow-lg hover:bg-olive-light active:scale-[0.98] transition-all"
        >
          Soy Gonzalo 👨‍🍳
        </button>
      </div>

      {/* Emoji challenge modal */}
      {showEmojiChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEmojiChallenge(false)} />
          <div className="relative bg-cream rounded-3xl p-8 max-w-xs w-full mx-4 animate-slide-up text-center">
            <h3 className="text-xl font-bold text-burgundy mb-2">
              ¿Cuál es el emoji secreto? 🤫
            </h3>
            <p className="text-warm-gray text-sm mb-6">
              Solo Gonzalo lo sabe...
            </p>
            <div className="grid grid-cols-3 gap-3">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiPick(emoji)}
                  className="text-4xl p-3 bg-white rounded-2xl border border-cream-dark
                             hover:shadow-md active:scale-95 transition-all min-h-[60px]"
                >
                  {emoji}
                </button>
              ))}
            </div>
            {wrongAnswer && (
              <p className="mt-4 text-burgundy font-medium animate-fade-in">
                Ese no es... ¡inténtalo otra vez! 😄
              </p>
            )}
          </div>
        </div>
      )}

      <p className="mt-16 text-sm text-warm-gray-light">
        Con mucho amor 💛
      </p>
    </div>
  )
}
