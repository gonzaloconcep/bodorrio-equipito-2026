import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { makeDish, makeReview } from '../../test/mocks'
import type { Dish, Review } from '../../types'

const mockDishes: Dish[] = []
const mockReviews: Review[] = []

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        eq: (_col: string, _val: unknown) => ({
          order: () =>
            Promise.resolve({
              data: mockDishes,
              error: null,
            }),
          then: (resolve: (v: unknown) => void) =>
            resolve({
              data: mockReviews,
              error: null,
            }),
        }),
        order: () =>
          Promise.resolve({
            data: mockDishes,
            error: null,
          }),
      }),
      upsert: () => Promise.resolve({ error: null }),
    }),
    storage: { from: () => ({}) },
  },
}))

// Mock ReviewModal to avoid complex nested rendering
vi.mock('../ReviewModal', () => ({
  default: ({ dish, onClose, onSaved }: { dish: { title: string }; onClose: () => void; onSaved: () => void }) => (
    <div data-testid="review-modal">
      <span>{dish.title}</span>
      <button onClick={onClose}>close-modal</button>
      <button onClick={onSaved}>save-modal</button>
    </div>
  ),
}))

const { default: GuestDashboard } = await import('../GuestDashboard')

describe('GuestDashboard', () => {
  const onChangeGuest = vi.fn()
  const onBack = vi.fn()

  beforeEach(() => {
    mockDishes.length = 0
    mockReviews.length = 0
    vi.clearAllMocks()
  })

  it('shows greeting with reviewer first name', async () => {
    render(<GuestDashboard reviewer="Ana (madre)" onChangeGuest={onChangeGuest} onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText(/¡Hola, Ana!/)).toBeInTheDocument()
    })
  })

  it('shows empty state when no dishes', async () => {
    render(<GuestDashboard reviewer="Marta" onChangeGuest={onChangeGuest} onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText(/aún no ha subido/i)).toBeInTheDocument()
    })
  })

  it('shows dishes grouped by category', async () => {
    mockDishes.push(
      makeDish({ id: 'gd-1', title: 'Ensalada', category: 'entrante' }),
      makeDish({ id: 'gd-2', title: 'Flan', category: 'postre' }),
    )

    render(<GuestDashboard reviewer="Marta" onChangeGuest={onChangeGuest} onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText('Ensalada')).toBeInTheDocument()
    })
    expect(screen.getByText('Flan')).toBeInTheDocument()
    expect(screen.getByText('Entrante')).toBeInTheDocument()
    expect(screen.getByText('Postre')).toBeInTheDocument()
  })

  it('category filter shows only dishes of that category', async () => {
    const user = userEvent.setup()
    mockDishes.push(
      makeDish({ id: 'gd-3', title: 'Sopa', category: 'entrante' }),
      makeDish({ id: 'gd-4', title: 'Helado', category: 'postre' }),
    )

    render(<GuestDashboard reviewer="Marta" onChangeGuest={onChangeGuest} onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText('Sopa')).toBeInTheDocument()
    })

    // Click on Postre category filter button (has emoji prefix)
    const postreButtons = screen.getAllByText(/Postre/)
    // The filter button is the one in the flex-wrap gap-2 container
    await user.click(postreButtons[0])
    expect(screen.getByText('Helado')).toBeInTheDocument()
    expect(screen.queryByText('Sopa')).not.toBeInTheDocument()

    // Click on Todas to reset - get first "Todas" which is the category filter
    const todasButtons = screen.getAllByText('Todas')
    await user.click(todasButtons[0])
    expect(screen.getByText('Sopa')).toBeInTheDocument()
    expect(screen.getByText('Helado')).toBeInTheDocument()
  })

  it('review filter defaults to pendiente', async () => {
    mockDishes.push(
      makeDish({ id: 'gd-5', title: 'Reviewed Dish', category: 'entrante' }),
      makeDish({ id: 'gd-6', title: 'Pending Dish', category: 'entrante' }),
    )
    mockReviews.push(
      makeReview({ dish_id: 'gd-5', reviewer: 'Marta', stars: 4 }),
    )

    render(<GuestDashboard reviewer="Marta" onChangeGuest={onChangeGuest} onBack={onBack} />)
    await waitFor(() => {
      // Default filter is 'pendiente', so only unreviewed dish should show
      expect(screen.getByText('Pending Dish')).toBeInTheDocument()
    })
    expect(screen.queryByText('Reviewed Dish')).not.toBeInTheDocument()
  })

  it('clicking a dish opens ReviewModal', async () => {
    const user = userEvent.setup()
    mockDishes.push(makeDish({ id: 'gd-7', title: 'Paella', category: 'primero' }))

    render(<GuestDashboard reviewer="Marta" onChangeGuest={onChangeGuest} onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText('Paella')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Paella'))
    expect(screen.getByTestId('review-modal')).toBeInTheDocument()
  })

  it('Actualizar platos button re-fetches', async () => {
    const user = userEvent.setup()
    mockDishes.push(makeDish({ id: 'gd-8', title: 'Arroz', category: 'primero' }))

    render(<GuestDashboard reviewer="Marta" onChangeGuest={onChangeGuest} onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText('Arroz')).toBeInTheDocument()
    })

    await user.click(screen.getByText(/Actualizar platos/))
    // Should still show the dish after refresh
    await waitFor(() => {
      expect(screen.getByText('Arroz')).toBeInTheDocument()
    })
  })

  it('shows review status filter buttons', async () => {
    const user = userEvent.setup()
    mockDishes.push(
      makeDish({ id: 'gd-9', title: 'Plato A', category: 'entrante' }),
      makeDish({ id: 'gd-10', title: 'Plato B', category: 'entrante' }),
    )
    mockReviews.push(
      makeReview({ dish_id: 'gd-9', reviewer: 'Marta', stars: 3 }),
    )

    render(<GuestDashboard reviewer="Marta" onChangeGuest={onChangeGuest} onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText('Plato B')).toBeInTheDocument()
    })

    // Switch to "Hechas" filter (has ✅ prefix)
    await user.click(screen.getByText(/Hechas/))
    expect(screen.getByText('Plato A')).toBeInTheDocument()
    expect(screen.queryByText('Plato B')).not.toBeInTheDocument()

    // Switch to "Todas" review filter
    // There are two "Todas" buttons: category and review filter. Pick the review one.
    const allButtons = screen.getAllByText('Todas')
    await user.click(allButtons[allButtons.length - 1])
    expect(screen.getByText('Plato A')).toBeInTheDocument()
    expect(screen.getByText('Plato B')).toBeInTheDocument()
  })

  it('back and change guest buttons work', async () => {
    const user = userEvent.setup()
    render(<GuestDashboard reviewer="Marta" onChangeGuest={onChangeGuest} onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText(/Inicio/)).toBeInTheDocument()
    })
    await user.click(screen.getByText(/Inicio/))
    expect(onBack).toHaveBeenCalled()
    await user.click(screen.getByText(/Cambiar usuario/))
    expect(onChangeGuest).toHaveBeenCalled()
  })

  it('closing ReviewModal clears selected dish', async () => {
    const user = userEvent.setup()
    mockDishes.push(makeDish({ id: 'gd-close', title: 'Close Me', category: 'primero' }))

    render(<GuestDashboard reviewer="Marta" onChangeGuest={onChangeGuest} onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText('Close Me')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Close Me'))
    expect(screen.getByTestId('review-modal')).toBeInTheDocument()

    await user.click(screen.getByText('close-modal'))
    expect(screen.queryByTestId('review-modal')).not.toBeInTheDocument()
  })

  it('saving from ReviewModal closes modal and re-fetches', async () => {
    const user = userEvent.setup()
    mockDishes.push(makeDish({ id: 'gd-save', title: 'Save Me', category: 'primero' }))

    render(<GuestDashboard reviewer="Marta" onChangeGuest={onChangeGuest} onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText('Save Me')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Save Me'))
    expect(screen.getByTestId('review-modal')).toBeInTheDocument()

    await user.click(screen.getByText('save-modal'))
    expect(screen.queryByTestId('review-modal')).not.toBeInTheDocument()
  })

  it('shows dish image when image_url is present', async () => {
    mockDishes.push(
      makeDish({ id: 'gd-11', title: 'With Image', category: 'entrante', image_url: 'http://img.jpg' }),
    )

    render(<GuestDashboard reviewer="Marta" onChangeGuest={onChangeGuest} onBack={onBack} />)
    await waitFor(() => {
      expect(screen.getByText('With Image')).toBeInTheDocument()
    })
    expect(screen.getByAltText('With Image')).toBeInTheDocument()
  })
})
