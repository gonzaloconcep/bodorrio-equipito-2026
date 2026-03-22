import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import WelcomeScreen from '../WelcomeScreen'

describe('WelcomeScreen', () => {
  const onAdmin = vi.fn()
  const onGuest = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows "Soy invitado" button that calls onGuest', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<WelcomeScreen onAdmin={onAdmin} onGuest={onGuest} />)
    const btn = screen.getByText(/Soy invitado/)
    await user.click(btn)
    expect(onGuest).toHaveBeenCalledTimes(1)
  })

  it('shows "Soy Gonzalo" button that opens emoji challenge modal', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<WelcomeScreen onAdmin={onAdmin} onGuest={onGuest} />)
    await user.click(screen.getByText(/Soy Gonzalo/))
    expect(screen.getByText(/emoji secreto/)).toBeInTheDocument()
  })

  it('calls onAdmin when picking the ring emoji 💍', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<WelcomeScreen onAdmin={onAdmin} onGuest={onGuest} />)
    await user.click(screen.getByText(/Soy Gonzalo/))
    await user.click(screen.getByText('💍'))
    expect(onAdmin).toHaveBeenCalledTimes(1)
  })

  it('shows error message when picking a wrong emoji', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<WelcomeScreen onAdmin={onAdmin} onGuest={onGuest} />)
    await user.click(screen.getByText(/Soy Gonzalo/))
    await user.click(screen.getByText('🥂'))
    expect(screen.getByText(/Ese no es/)).toBeInTheDocument()
    expect(onAdmin).not.toHaveBeenCalled()
  })

  it('clears error message after timeout', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<WelcomeScreen onAdmin={onAdmin} onGuest={onGuest} />)
    await user.click(screen.getByText(/Soy Gonzalo/))
    await user.click(screen.getByText('🥂'))
    expect(screen.getByText(/Ese no es/)).toBeInTheDocument()

    vi.advanceTimersByTime(1100)
    await waitFor(() => {
      expect(screen.queryByText(/Ese no es/)).not.toBeInTheDocument()
    })
  })

  it('closes the modal when clicking the backdrop', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<WelcomeScreen onAdmin={onAdmin} onGuest={onGuest} />)
    await user.click(screen.getByText(/Soy Gonzalo/))
    expect(screen.getByText(/emoji secreto/)).toBeInTheDocument()

    // The backdrop is the div with bg-black/50
    const backdrop = screen.getByText(/emoji secreto/).closest('.fixed')!.querySelector('.bg-black\\/50') as HTMLElement
    await user.click(backdrop)
    expect(screen.queryByText(/emoji secreto/)).not.toBeInTheDocument()
  })

  it('shows the app title', () => {
    render(<WelcomeScreen onAdmin={onAdmin} onGuest={onGuest} />)
    expect(screen.getByText('Bodorrio 2026')).toBeInTheDocument()
  })
})
