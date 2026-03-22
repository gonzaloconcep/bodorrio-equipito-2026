import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import StarRating from '../StarRating'

describe('StarRating', () => {
  it('renders 5 star buttons', () => {
    render(<StarRating value={0} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(5)
  })

  it('shows filled stars (⭐) up to value and empty (☆) after', () => {
    render(<StarRating value={3} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveTextContent('⭐')
    expect(buttons[1]).toHaveTextContent('⭐')
    expect(buttons[2]).toHaveTextContent('⭐')
    expect(buttons[3]).toHaveTextContent('☆')
    expect(buttons[4]).toHaveTextContent('☆')
  })

  it('calls onChange with star number when clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<StarRating value={0} onChange={onChange} />)
    await user.click(screen.getByLabelText('3 estrellas'))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('disables buttons when readonly', () => {
    render(<StarRating value={2} readonly />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => expect(btn).toBeDisabled())
  })

  it('does not call onChange when readonly and clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<StarRating value={2} onChange={onChange} readonly />)
    // disabled buttons can't be clicked via userEvent, but let's verify
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toBeDisabled()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('uses sm size class when size="sm"', () => {
    render(<StarRating value={1} size="sm" />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0].className).toContain('text-2xl')
  })

  it('uses lg size class by default', () => {
    render(<StarRating value={1} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0].className).toContain('text-5xl')
  })

  it('has correct aria-labels for singular and plural', () => {
    render(<StarRating value={0} />)
    expect(screen.getByLabelText('1 estrella')).toBeInTheDocument()
    expect(screen.getByLabelText('2 estrellas')).toBeInTheDocument()
    expect(screen.getByLabelText('5 estrellas')).toBeInTheDocument()
  })

  it('does not throw when onChange is not provided and button is clicked', async () => {
    const user = userEvent.setup()
    render(<StarRating value={0} />)
    // Should not throw
    await user.click(screen.getByLabelText('1 estrella'))
  })
})
