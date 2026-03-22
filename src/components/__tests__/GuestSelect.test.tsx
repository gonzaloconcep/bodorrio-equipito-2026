import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import GuestSelect from '../GuestSelect'
import { REVIEWERS } from '../../types'

describe('GuestSelect', () => {
  const onSelect = vi.fn()
  const onBack = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all 6 reviewers', () => {
    render(<GuestSelect onSelect={onSelect} onBack={onBack} />)
    REVIEWERS.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument()
    })
  })

  it('calls onSelect with the reviewer name when clicked', async () => {
    const user = userEvent.setup()
    render(<GuestSelect onSelect={onSelect} onBack={onBack} />)
    await user.click(screen.getByText('Marta'))
    expect(onSelect).toHaveBeenCalledWith('Marta')
  })

  it('shows a "Volver" back button that calls onBack', async () => {
    const user = userEvent.setup()
    render(<GuestSelect onSelect={onSelect} onBack={onBack} />)
    const backBtn = screen.getByText(/Volver/)
    expect(backBtn).toBeInTheDocument()
    await user.click(backBtn)
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('shows the heading text', () => {
    render(<GuestSelect onSelect={onSelect} onBack={onBack} />)
    expect(screen.getByText(/¿Quién eres/)).toBeInTheDocument()
  })

  it('calls onSelect with the correct name for each reviewer', async () => {
    const user = userEvent.setup()
    render(<GuestSelect onSelect={onSelect} onBack={onBack} />)
    await user.click(screen.getByText('Ana (madre)'))
    expect(onSelect).toHaveBeenCalledWith('Ana (madre)')
    await user.click(screen.getByText('Lolo'))
    expect(onSelect).toHaveBeenCalledWith('Lolo')
  })
})
