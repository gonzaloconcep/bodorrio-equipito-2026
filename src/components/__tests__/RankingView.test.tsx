import { render, screen } from '@testing-library/react'
import RankingView from '../RankingView'
import { makeDish, makeReview, makeFullReviews } from '../../test/mocks'

describe('RankingView', () => {
  it('shows category headings for categories with dishes', () => {
    const dish = makeDish({ id: 'rv-1', category: 'entrante' })
    const reviews = [makeReview({ dish_id: 'rv-1', stars: 4 })]
    render(<RankingView dishes={[dish]} reviews={reviews} />)
    expect(screen.getByText('Entrante')).toBeInTheDocument()
  })

  it('renders dishes in correct order (highest avg first)', () => {
    const d1 = makeDish({ id: 'rv-2a', category: 'entrante', title: 'Bajo' })
    const d2 = makeDish({ id: 'rv-2b', category: 'entrante', title: 'Alto' })
    const reviews = [
      makeReview({ dish_id: 'rv-2a', stars: 2 }),
      makeReview({ dish_id: 'rv-2b', stars: 5 }),
    ]
    render(<RankingView dishes={[d1, d2]} reviews={reviews} />)
    const titles = screen.getAllByTestId('ranked-dish-title')
    expect(titles[0]).toHaveTextContent('Alto')
    expect(titles[1]).toHaveTextContent('Bajo')
  })

  it('shows winner indicator on first dish', () => {
    const d1 = makeDish({ id: 'rv-3a', category: 'entrante', title: 'Ganador' })
    const d2 = makeDish({ id: 'rv-3b', category: 'entrante', title: 'Segundo' })
    const reviews = [
      makeReview({ dish_id: 'rv-3a', stars: 5 }),
      makeReview({ dish_id: 'rv-3b', stars: 3 }),
    ]
    render(<RankingView dishes={[d1, d2]} reviews={reviews} />)
    const winnerCards = screen.getAllByTestId('ranked-dish')
    expect(winnerCards[0]).toHaveTextContent('Ganador')
  })

  it('displays stats for each dish', () => {
    const dish = makeDish({ id: 'rv-4', category: 'entrante' })
    const reviews = makeFullReviews('rv-4', { stars: 4, wedding_worthy: true })
    reviews[0].wedding_worthy = false
    render(<RankingView dishes={[dish]} reviews={reviews} />)
    expect(screen.getByText('83%')).toBeInTheDocument()
    expect(screen.getByText('6/6 reviews')).toBeInTheDocument()
  })

  it('shows unanimidad section when a dish has all yes', () => {
    const dish = makeDish({ id: 'rv-5', category: 'primero', title: 'Perfecto' })
    const reviews = makeFullReviews('rv-5', { stars: 5, wedding_worthy: true })
    render(<RankingView dishes={[dish]} reviews={reviews} />)
    expect(screen.getByText('Unanimidad')).toBeInTheDocument()
    expect(screen.getByTestId('unanimous-section')).toHaveTextContent('Perfecto')
  })

  it('hides unanimidad section when no dishes qualify', () => {
    const dish = makeDish({ id: 'rv-6', category: 'entrante' })
    const reviews = [makeReview({ dish_id: 'rv-6', stars: 3, wedding_worthy: false })]
    render(<RankingView dishes={[dish]} reviews={reviews} />)
    expect(screen.queryByText('Unanimidad')).not.toBeInTheDocument()
  })

  it('shows friendly message when there are no dishes', () => {
    render(<RankingView dishes={[]} reviews={[]} />)
    expect(screen.getByText(/no hay platos/i)).toBeInTheDocument()
  })
})
