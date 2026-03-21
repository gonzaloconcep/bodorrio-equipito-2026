import { render, screen } from '@testing-library/react'
import MissingReviewersBadge from '../MissingReviewersBadge'
import { makeDish, makeReview, makeFullReviews } from '../../test/mocks'
import { REVIEWERS } from '../../types'

describe('MissingReviewersBadge', () => {
  const dish = makeDish({ id: 'badge-dish' })

  it('renders "Completo" when all reviewers have reviewed', () => {
    const reviews = makeFullReviews(dish.id)
    render(<MissingReviewersBadge dishId={dish.id} reviews={reviews} />)
    expect(screen.getByText('Completo')).toBeInTheDocument()
  })

  it('renders missing reviewer names when 2 are missing', () => {
    const reviewed = REVIEWERS.slice(0, 4)
    const reviews = reviewed.map((reviewer) =>
      makeReview({ dish_id: dish.id, reviewer }),
    )
    render(<MissingReviewersBadge dishId={dish.id} reviews={reviews} />)
    expect(screen.getByText('Fernando')).toBeInTheDocument()
    expect(screen.getByText('Gonzalo')).toBeInTheDocument()
    expect(screen.queryByText('Completo')).not.toBeInTheDocument()
  })

  it('renders all 6 names when there are no reviews', () => {
    render(<MissingReviewersBadge dishId={dish.id} reviews={[]} />)
    for (const name of REVIEWERS) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
  })
})
