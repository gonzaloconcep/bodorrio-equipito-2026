import type { Review } from '../types'
import { getMissingReviewers } from '../hooks/useMissingReviewers'

interface Props {
  dishId: string
  reviews: Review[]
}

export default function MissingReviewersBadge({ dishId, reviews }: Props) {
  const { missing, isComplete } = getMissingReviewers(dishId, reviews)

  if (isComplete) {
    return (
      <span className="text-xs font-medium px-2 py-1 rounded-lg bg-olive/10 text-olive">
        Completo
      </span>
    )
  }

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {missing.map((name) => (
        <span
          key={name}
          className="text-xs font-medium px-2 py-0.5 rounded-lg bg-burgundy/10 text-burgundy"
        >
          {name}
        </span>
      ))}
    </div>
  )
}
