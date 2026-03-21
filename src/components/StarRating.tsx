interface Props {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'lg'
  readonly?: boolean
}

export default function StarRating({ value, onChange, size = 'lg', readonly = false }: Props) {
  const starSize = size === 'lg' ? 'text-5xl' : 'text-2xl'
  const touchTarget = size === 'lg' ? 'min-w-[48px] min-h-[48px]' : ''

  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${starSize} ${touchTarget} flex items-center justify-center
                     transition-transform ${!readonly ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'cursor-default'}
                     select-none`}
          aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
        >
          {star <= value ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  )
}
