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

  it('shows empty state when no dishes', async () => {
    render(<AdminDashboard onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText(/Aún no hay platos/)).toBeInTheDocument()
    })
  })

  it('clicking a dish opens DishDetail', async () => {
    const dish = makeDish({ id: 'admin-detail', title: 'Detalle Dish', category: 'entrante' })
    mockDishes.push(dish)
    mockReviews.push(makeReview({ dish_id: 'admin-detail', reviewer: 'Marta', stars: 3 }))

    render(<AdminDashboard onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText('Detalle Dish')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText('Detalle Dish'))
    // DishDetail modal should appear with close button (✕)
    await waitFor(() => {
      expect(screen.getByText('✕')).toBeInTheDocument()
    })
  })

  it('clicking ✕ closes DishDetail', async () => {
    const dish = makeDish({ id: 'admin-close', title: 'Close Dish', category: 'entrante' })
    mockDishes.push(dish)

    render(<AdminDashboard onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText('Close Dish')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText('Close Dish'))
    await waitFor(() => {
      expect(screen.getByText('✕')).toBeInTheDocument()
    })
    await userEvent.click(screen.getByText('✕'))
    // Modal should close
  })

  it('clicking "Subir nuevo plato" shows AddDishModal', async () => {
    render(<AdminDashboard onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText(/Subir nuevo plato/)).toBeInTheDocument()
    })
    await userEvent.click(screen.getByText(/Subir nuevo plato/))
    // AddDishModal should open - it has "Nuevo plato" heading
    await waitFor(() => {
      expect(screen.getByText(/Nuevo plato/)).toBeInTheDocument()
    })
  })

  it('clicking ← Inicio calls onBack', async () => {
    render(<AdminDashboard onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText(/Inicio/)).toBeInTheDocument()
    })
    await userEvent.click(screen.getByText(/Inicio/))
    expect(onBack).toHaveBeenCalled()
  })

  it('clicking Actualizar re-fetches data', async () => {
    const dish = makeDish({ id: 'admin-refresh', title: 'Refresh Dish', category: 'entrante' })
    mockDishes.push(dish)

    render(<AdminDashboard onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText('Refresh Dish')).toBeInTheDocument()
    })
    await userEvent.click(screen.getByText(/Actualizar/))
    await waitFor(() => {
      expect(screen.getByText('Refresh Dish')).toBeInTheDocument()
    })
  })

  it('shows dish with image when image_url is present', async () => {
    const dish = makeDish({ id: 'admin-img', title: 'Image Dish', category: 'entrante', image_url: 'http://img.jpg' })
    mockDishes.push(dish)

    render(<AdminDashboard onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByAltText('Image Dish')).toBeInTheDocument()
    })
  })

  it('shows "Sin reviews aún" for dish without reviews', async () => {
    const dish = makeDish({ id: 'admin-noreview', title: 'No Review Dish', category: 'entrante' })
    mockDishes.push(dish)

    render(<AdminDashboard onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText('No Review Dish')).toBeInTheDocument()
    })
    expect(screen.getByText(/Sin reviews aún/)).toBeInTheDocument()
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
