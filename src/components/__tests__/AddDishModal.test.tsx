import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

vi.mock('../../hooks/useBodyScrollLock', () => ({
  useBodyScrollLock: vi.fn(),
}))

const mockInsert = vi.fn().mockResolvedValue({ error: null })
const mockUpload = vi.fn().mockResolvedValue({ error: null })

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert: (...args: unknown[]) => mockInsert(...args),
    }),
    storage: {
      from: () => ({
        upload: (...args: unknown[]) => mockUpload(...args),
        getPublicUrl: () => ({ data: { publicUrl: 'http://test.jpg' } }),
      }),
    },
  },
}))

const { default: AddDishModal } = await import('../AddDishModal')

describe('AddDishModal', () => {
  const onClose = vi.fn()
  const onSaved = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockInsert.mockResolvedValue({ error: null })
    mockUpload.mockResolvedValue({ error: null })
  })

  it('shows form with title input', () => {
    render(<AddDishModal onClose={onClose} onSaved={onSaved} />)
    expect(screen.getByPlaceholderText(/Risotto/)).toBeInTheDocument()
  })

  it('shows category buttons', () => {
    render(<AddDishModal onClose={onClose} onSaved={onSaved} />)
    expect(screen.getByText(/Entrante/)).toBeInTheDocument()
    expect(screen.getByText(/Postre/)).toBeInTheDocument()
    expect(screen.getByText(/Vino/)).toBeInTheDocument()
  })

  it('shows photo upload area', () => {
    render(<AddDishModal onClose={onClose} onSaved={onSaved} />)
    expect(screen.getByText(/Toca para hacer foto/)).toBeInTheDocument()
  })

  it('submit is disabled when title is empty', () => {
    render(<AddDishModal onClose={onClose} onSaved={onSaved} />)
    const submitBtn = screen.getByText(/Subir plato/)
    expect(submitBtn).toBeDisabled()
  })

  it('submit is enabled when title is filled', async () => {
    const user = userEvent.setup()
    render(<AddDishModal onClose={onClose} onSaved={onSaved} />)
    await user.type(screen.getByPlaceholderText(/Risotto/), 'Mi plato')
    const submitBtn = screen.getByText(/Subir plato/)
    expect(submitBtn).not.toBeDisabled()
  })

  it('submits without image and calls onSaved', async () => {
    const user = userEvent.setup()
    render(<AddDishModal onClose={onClose} onSaved={onSaved} />)

    await user.type(screen.getByPlaceholderText(/Risotto/), 'Croquetas')
    await user.click(screen.getByText(/Subir plato/))

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Croquetas',
          category: 'entrante',
          image_url: null,
        }),
      )
    })
    expect(onSaved).toHaveBeenCalled()
  })

  it('changes category when clicking a category button', async () => {
    const user = userEvent.setup()
    render(<AddDishModal onClose={onClose} onSaved={onSaved} />)

    await user.type(screen.getByPlaceholderText(/Risotto/), 'Tarta')
    await user.click(screen.getByText(/Postre/))
    await user.click(screen.getByText(/Subir plato/))

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'postre' }),
      )
    })
  })

  it('close button calls onClose', async () => {
    const user = userEvent.setup()
    render(<AddDishModal onClose={onClose} onSaved={onSaved} />)
    await user.click(screen.getByText('✕'))
    expect(onClose).toHaveBeenCalled()
  })

  it('submits with image file', async () => {
    const user = userEvent.setup()
    render(<AddDishModal onClose={onClose} onSaved={onSaved} />)

    await user.type(screen.getByPlaceholderText(/Risotto/), 'Plato foto')

    // Simulate file selection
    const file = new File(['photo'], 'dish.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    // Preview should show
    expect(screen.getByAltText('Preview')).toBeInTheDocument()

    await user.click(screen.getByText(/Subir plato/))

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalled()
    })
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Plato foto',
        image_url: 'http://test.jpg',
      }),
    )
    expect(onSaved).toHaveBeenCalled()
  })

  it('shows alert on insert error', async () => {
    const user = userEvent.setup()
    mockInsert.mockResolvedValue({ error: { message: 'Insert failed' } })
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(<AddDishModal onClose={onClose} onSaved={onSaved} />)
    await user.type(screen.getByPlaceholderText(/Risotto/), 'Fail dish')
    await user.click(screen.getByText(/Subir plato/))

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error al guardar: Insert failed')
    })
    expect(onSaved).not.toHaveBeenCalled()
    alertSpy.mockRestore()
  })

  it('shows alert on upload error', async () => {
    const user = userEvent.setup()
    mockUpload.mockResolvedValue({ error: { message: 'Upload failed' } })
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(<AddDishModal onClose={onClose} onSaved={onSaved} />)
    await user.type(screen.getByPlaceholderText(/Risotto/), 'Upload fail')

    const file = new File(['photo'], 'fail.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    await user.click(screen.getByText(/Subir plato/))

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error subiendo foto: Upload failed')
    })
    expect(onSaved).not.toHaveBeenCalled()
    alertSpy.mockRestore()
  })

  it('can remove a selected image preview', async () => {
    const user = userEvent.setup()
    render(<AddDishModal onClose={onClose} onSaved={onSaved} />)

    const file = new File(['photo'], 'dish.png', { type: 'image/png' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    expect(screen.getByAltText('Preview')).toBeInTheDocument()

    // Click the remove button (✕ on the image)
    const removeButtons = screen.getAllByText('✕')
    // The last ✕ is the image remove button (first is the close modal one)
    await user.click(removeButtons[removeButtons.length - 1])

    expect(screen.queryByAltText('Preview')).not.toBeInTheDocument()
    expect(screen.getByText(/Toca para hacer foto/)).toBeInTheDocument()
  })
})
