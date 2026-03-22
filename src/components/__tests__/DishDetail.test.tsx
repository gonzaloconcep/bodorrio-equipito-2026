import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { makeDish, makeReview } from '../../test/mocks'

vi.mock('../../hooks/useBodyScrollLock', () => ({
  useBodyScrollLock: vi.fn(),
}))

import DishDetail from '../DishDetail'

describe('DishDetail', () => {
  const dish = makeDish({ id: 'dd-1', title: 'Tortilla', category: 'entrante' })
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows dish title', () => {
    render(<DishDetail dish={dish} reviews={[]} onClose={onClose} />)
    expect(screen.getByText('Tortilla')).toBeInTheDocument()
  })

  it('shows category', () => {
    render(<DishDetail dish={dish} reviews={[]} onClose={onClose} />)
    expect(screen.getByText(/Entrante/)).toBeInTheDocument()
  })

  it('shows average stars', () => {
    const reviews = [
      makeReview({ dish_id: 'dd-1', reviewer: 'Marta', stars: 4 }),
      makeReview({ dish_id: 'dd-1', reviewer: 'Lolo', stars: 2 }),
    ]
    render(<DishDetail dish={dish} reviews={reviews} onClose={onClose} />)
    expect(screen.getByText('3.0')).toBeInTheDocument()
  })

  it('shows yes/no counts', () => {
    const reviews = [
      makeReview({ dish_id: 'dd-1', reviewer: 'Marta', stars: 4, wedding_worthy: true }),
      makeReview({ dish_id: 'dd-1', reviewer: 'Lolo', stars: 2, wedding_worthy: false }),
      makeReview({ dish_id: 'dd-1', reviewer: 'Fernando', stars: 3, wedding_worthy: true }),
    ]
    render(<DishDetail dish={dish} reviews={reviews} onClose={onClose} />)
    // 2 yes, 1 no
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('shows individual reviews with reviewer name', () => {
    const reviews = [
      makeReview({ dish_id: 'dd-1', reviewer: 'Marta', stars: 5, wedding_worthy: true, comments: 'Delicioso' }),
    ]
    render(<DishDetail dish={dish} reviews={reviews} onClose={onClose} />)
    expect(screen.getByText('Marta')).toBeInTheDocument()
    expect(screen.getByText(/"Delicioso"/)).toBeInTheDocument()
  })

  it('shows "Aún no hay reviews" when empty', () => {
    render(<DishDetail dish={dish} reviews={[]} onClose={onClose} />)
    expect(screen.getByText(/Aún no hay reviews/)).toBeInTheDocument()
  })

  it('shows missing reviewers', () => {
    const reviews = [
      makeReview({ dish_id: 'dd-1', reviewer: 'Marta', stars: 4 }),
    ]
    render(<DishDetail dish={dish} reviews={reviews} onClose={onClose} />)
    // Should list missing reviewers
    expect(screen.getByText(/Faltan:/)).toBeInTheDocument()
    expect(screen.getByText(/Lolo/)).toBeInTheDocument()
    expect(screen.getByText(/Fernando/)).toBeInTheDocument()
  })

  it('close button calls onClose', async () => {
    const user = userEvent.setup()
    render(<DishDetail dish={dish} reviews={[]} onClose={onClose} />)
    await user.click(screen.getByText('✕'))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows 0.0 average when no reviews', () => {
    render(<DishDetail dish={dish} reviews={[]} onClose={onClose} />)
    expect(screen.getByText('0.0')).toBeInTheDocument()
  })

  it('shows review count', () => {
    const reviews = [
      makeReview({ dish_id: 'dd-1', reviewer: 'Marta', stars: 4 }),
    ]
    render(<DishDetail dish={dish} reviews={reviews} onClose={onClose} />)
    expect(screen.getByText(/1 de 6 reviews/)).toBeInTheDocument()
  })

  it('shows wedding worthy badges on individual reviews', () => {
    const reviews = [
      makeReview({ dish_id: 'dd-1', reviewer: 'Marta', stars: 4, wedding_worthy: true }),
      makeReview({ dish_id: 'dd-1', reviewer: 'Lolo', stars: 2, wedding_worthy: false }),
    ]
    render(<DishDetail dish={dish} reviews={reviews} onClose={onClose} />)
    expect(screen.getByText(/Sí boda/)).toBeInTheDocument()
    expect(screen.getByText(/No boda/)).toBeInTheDocument()
  })

  it('shows dish image when available', () => {
    const dishWithImg = makeDish({ id: 'dd-2', title: 'Imagen', category: 'postre', image_url: 'http://img.jpg' })
    render(<DishDetail dish={dishWithImg} reviews={[]} onClose={onClose} />)
    expect(screen.getByAltText('Imagen')).toBeInTheDocument()
  })

  it('does not show missing reviewers section when all have reviewed', () => {
    const reviews = [
      makeReview({ dish_id: 'dd-1', reviewer: 'Ana (madre)', stars: 4 }),
      makeReview({ dish_id: 'dd-1', reviewer: 'Lolo', stars: 3 }),
      makeReview({ dish_id: 'dd-1', reviewer: 'Marta', stars: 5 }),
      makeReview({ dish_id: 'dd-1', reviewer: 'Ana (cuñada)', stars: 2 }),
      makeReview({ dish_id: 'dd-1', reviewer: 'Fernando', stars: 4 }),
      makeReview({ dish_id: 'dd-1', reviewer: 'Gonzalo', stars: 3 }),
    ]
    render(<DishDetail dish={dish} reviews={reviews} onClose={onClose} />)
    expect(screen.queryByText(/Faltan:/)).not.toBeInTheDocument()
  })

  it('only counts reviews for the current dish', () => {
    const reviews = [
      makeReview({ dish_id: 'dd-1', reviewer: 'Marta', stars: 5 }),
      makeReview({ dish_id: 'other-dish', reviewer: 'Lolo', stars: 1 }),
    ]
    render(<DishDetail dish={dish} reviews={reviews} onClose={onClose} />)
    // Average should be 5.0, not 3.0
    expect(screen.getByText('5.0')).toBeInTheDocument()
  })
})
