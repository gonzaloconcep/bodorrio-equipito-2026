import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { makeDish, makeReview } from '../../test/mocks'

vi.mock('../../hooks/useBodyScrollLock', () => ({
  useBodyScrollLock: vi.fn(),
}))

const mockUpsert = vi.fn().mockResolvedValue({ error: null })

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      upsert: (...args: unknown[]) => mockUpsert(...args),
    }),
  },
}))

const { default: ReviewModal } = await import('../ReviewModal')

describe('ReviewModal', () => {
  const dish = makeDish({ id: 'rm-1', title: 'Test Dish', category: 'entrante' })
  const onClose = vi.fn()
  const onSaved = vi.fn()
  const onSavedAndNext = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUpsert.mockResolvedValue({ error: null })
  })

  const renderModal = (props = {}) =>
    render(
      <ReviewModal
        dish={dish}
        reviewer="Marta"
        existingReview={null}
        hasNext={false}
        onClose={onClose}
        onSaved={onSaved}
        onSavedAndNext={onSavedAndNext}
        {...props}
      />,
    )

  it('shows dish title', () => {
    renderModal()
    expect(screen.getByText('Test Dish')).toBeInTheDocument()
  })

  it('shows category info', () => {
    renderModal()
    expect(screen.getByText(/Entrante/)).toBeInTheDocument()
  })

  it('submit button is disabled when stars=0 and weddingWorthy not selected', () => {
    renderModal()
    const submitBtn = screen.getByText(/Enviar review/)
    expect(submitBtn).toBeDisabled()
  })

  it('submit button enabled after selecting stars and wedding worthy', async () => {
    const user = userEvent.setup()
    renderModal()

    // Click 4 stars
    await user.click(screen.getByLabelText('4 estrellas'))
    // Click SÍ
    await user.click(screen.getByText(/^SÍ/))

    const submitBtn = screen.getByText(/Enviar review/)
    expect(submitBtn).not.toBeDisabled()
  })

  it('submits and calls onSaved', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByLabelText('3 estrellas'))
    await user.click(screen.getByText(/^NO/))
    await user.click(screen.getByText(/Enviar review/))

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalled()
    })
    expect(onSaved).toHaveBeenCalled()
  })

  it('passes correct data to supabase upsert', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByLabelText('5 estrellas'))
    await user.click(screen.getByText(/^SÍ/))

    const textarea = screen.getByPlaceholderText(/comentario/)
    await user.type(textarea, 'Muy bueno')

    await user.click(screen.getByText(/Enviar review/))

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          dish_id: 'rm-1',
          reviewer: 'Marta',
          stars: 5,
          wedding_worthy: true,
          comments: 'Muy bueno',
        }),
        { onConflict: 'dish_id,reviewer' },
      )
    })
  })

  it('shows "Guardar y siguiente" when hasNext=true', () => {
    renderModal({ hasNext: true })
    expect(screen.getByText(/Guardar y siguiente/)).toBeInTheDocument()
  })

  it('does not show "Guardar y siguiente" when hasNext=false', () => {
    renderModal({ hasNext: false })
    expect(screen.queryByText(/Guardar y siguiente/)).not.toBeInTheDocument()
  })

  it('"Guardar y siguiente" calls onSavedAndNext', async () => {
    const user = userEvent.setup()
    renderModal({ hasNext: true })

    await user.click(screen.getByLabelText('4 estrellas'))
    await user.click(screen.getByText(/^SÍ/))
    await user.click(screen.getByText(/Guardar y siguiente/))

    await waitFor(() => {
      expect(onSavedAndNext).toHaveBeenCalled()
    })
  })

  it('close button calls onClose', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByText('✕'))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows "Actualizar review" when existingReview is present', () => {
    const review = makeReview({ dish_id: 'rm-1', reviewer: 'Marta', stars: 3, wedding_worthy: true })
    renderModal({ existingReview: review })
    expect(screen.getByText(/Actualizar review/)).toBeInTheDocument()
  })

  it('pre-fills form with existing review data', () => {
    const review = makeReview({ dish_id: 'rm-1', reviewer: 'Marta', stars: 4, wedding_worthy: false, comments: 'Meh' })
    renderModal({ existingReview: review })
    // Stars should be filled (4 filled)
    const buttons = screen.getAllByRole('button').filter((b) => b.textContent === '⭐')
    expect(buttons).toHaveLength(4)
    // Comments textarea should have value
    const textarea = screen.getByPlaceholderText(/comentario/) as HTMLTextAreaElement
    expect(textarea.value).toBe('Meh')
  })

  it('shows dish image when available', () => {
    const dishWithImage = makeDish({ id: 'rm-2', title: 'Photo Dish', category: 'postre', image_url: 'http://photo.jpg' })
    renderModal({ dish: dishWithImage })
    expect(screen.getByAltText('Photo Dish')).toBeInTheDocument()
  })

  it('shows alert on upsert error', async () => {
    const user = userEvent.setup()
    mockUpsert.mockResolvedValue({ error: { message: 'DB error' } })
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    renderModal()
    await user.click(screen.getByLabelText('3 estrellas'))
    await user.click(screen.getByText(/^SÍ/))
    await user.click(screen.getByText(/Enviar review/))

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error al guardar: DB error')
    })
    expect(onSaved).not.toHaveBeenCalled()
    alertSpy.mockRestore()
  })

  it('trims empty comments to null', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByLabelText('3 estrellas'))
    await user.click(screen.getByText(/^NO/))
    await user.click(screen.getByText(/Enviar review/))

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ comments: null }),
        expect.anything(),
      )
    })
  })
})
