import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { makeDish, makeReview, makeFullReviews } from '../../test/mocks'
import type { Dish, Review } from '../../types'

// Mock supabase
const mockDishes: Dish[] = []
const mockReviews: Review[] = []

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        order: () =>
          Promise.resolve({
            data: table === 'dishes' ? mockDishes : mockReviews,
            error: null,
          }),
        then: (resolve: (v: unknown) => void) =>
          resolve({
            data: table === 'reviews' ? mockReviews : mockDishes,
            error: null,
          }),
      }),
    }),
    storage: { from: () => ({}) },
  },
}))

// Must import after mock
const { default: AdminDashboard } = await import('../AdminDashboard')

describe('AdminDashboard', () => {
  const onBack = vi.fn()

  beforeEach(() => {
    mockDishes.length = 0
    mockReviews.length = 0
  })

  it('shows "Completo" badge when a dish has all reviews', async () => {
    const dish = makeDish({ id: 'admin-1', title: 'Paella', category: 'primero' })
    mockDishes.push(dish)
    mockReviews.push(...makeFullReviews('admin-1'))

    render(<AdminDashboard onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText('Paella')).toBeInTheDocument()
    })
    expect(screen.getByText('Completo')).toBeInTheDocument()
  })

  it('shows missing reviewer names when reviews are partial', async () => {
    const dish = makeDish({ id: 'admin-2', title: 'Sopa', category: 'entrante' })
    mockDishes.push(dish)
    mockReviews.push(
      makeReview({ dish_id: 'admin-2', reviewer: 'Ana (madre)' }),
      makeReview({ dish_id: 'admin-2', reviewer: 'Lolo' }),
    )

    render(<AdminDashboard onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText('Sopa')).toBeInTheDocument()
    })
    expect(screen.getByText('Marta')).toBeInTheDocument()
    expect(screen.getByText('Fernando')).toBeInTheDocument()
    expect(screen.getByText('Gonzalo')).toBeInTheDocument()
  })

  it('toggles between dishes and ranking views', async () => {
    const dish = makeDish({ id: 'admin-3', title: 'Tarta', category: 'postre' })
    mockDishes.push(dish)
    mockReviews.push(makeReview({ dish_id: 'admin-3', stars: 5 }))

    render(<AdminDashboard onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText('Tarta')).toBeInTheDocument()
    })

    const rankingTab = screen.getByRole('button', { name: /top platos/i })
    await userEvent.click(rankingTab)
    // Ranking view should show category heading and ranked dish
    expect(screen.getByTestId('ranked-dish')).toBeInTheDocument()

    const dishesTab = screen.getByRole('button', { name: /^platos$/i })
    await userEvent.click(dishesTab)
    // Back to dishes view — the add dish button should be visible
    expect(screen.getByText('Subir nuevo plato', { exact: false })).toBeInTheDocument()
  })

  it('ranking shows dishes ordered by stars', async () => {
    const d1 = makeDish({ id: 'admin-4a', title: 'Peor', category: 'entrante' })
    const d2 = makeDish({ id: 'admin-4b', title: 'Mejor', category: 'entrante' })
    mockDishes.push(d1, d2)
    mockReviews.push(
      makeReview({ dish_id: 'admin-4a', stars: 2 }),
      makeReview({ dish_id: 'admin-4b', stars: 5 }),
    )

    render(<AdminDashboard onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText('Peor')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /top platos/i }))
    const titles = screen.getAllByTestId('ranked-dish-title')
    expect(titles[0]).toHaveTextContent('Mejor')
    expect(titles[1]).toHaveTextContent('Peor')
  })
})
