import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach } from 'vitest'

// Mock child components
vi.mock('../WelcomeScreen', () => ({
  default: ({ onAdmin, onGuest }: { onAdmin: () => void; onGuest: () => void }) => (
    <div data-testid="welcome">
      <button onClick={onGuest}>guest-btn</button>
      <button onClick={onAdmin}>admin-btn</button>
    </div>
  ),
}))

vi.mock('../GuestSelect', () => ({
  default: ({ onSelect, onBack }: { onSelect: (g: string) => void; onBack: () => void }) => (
    <div data-testid="guest-select">
      <button onClick={() => onSelect('Marta')}>select-marta</button>
      <button onClick={onBack}>back-btn</button>
    </div>
  ),
}))

vi.mock('../GuestDashboard', () => ({
  default: ({ reviewer, onChangeGuest, onBack }: { reviewer: string; onChangeGuest: () => void; onBack: () => void }) => (
    <div data-testid="guest-dashboard">
      <span>{reviewer}</span>
      <button onClick={onChangeGuest}>change-guest</button>
      <button onClick={onBack}>back-btn</button>
    </div>
  ),
}))

vi.mock('../AdminDashboard', () => ({
  default: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="admin-dashboard">
      <button onClick={onBack}>back-btn</button>
    </div>
  ),
}))

const { default: App } = await import('../../App')

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initially shows the welcome screen', () => {
    render(<App />)
    expect(screen.getByTestId('welcome')).toBeInTheDocument()
  })

  it('navigates to guest-select when clicking guest (no saved guest)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('guest-btn'))
    expect(screen.getByTestId('guest-select')).toBeInTheDocument()
  })

  it('navigates directly to guest dashboard when saved guest exists in localStorage', async () => {
    localStorage.setItem('bodorrio-guest', 'Lolo')
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('guest-btn'))
    expect(screen.getByTestId('guest-dashboard')).toBeInTheDocument()
    expect(screen.getByText('Lolo')).toBeInTheDocument()
  })

  it('selecting a guest saves to localStorage and shows dashboard', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('guest-btn'))
    await user.click(screen.getByText('select-marta'))
    expect(localStorage.getItem('bodorrio-guest')).toBe('Marta')
    expect(screen.getByTestId('guest-dashboard')).toBeInTheDocument()
    expect(screen.getByText('Marta')).toBeInTheDocument()
  })

  it('admin route works', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('admin-btn'))
    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument()
  })

  it('back navigation from admin returns to welcome', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('admin-btn'))
    await user.click(screen.getByText('back-btn'))
    expect(screen.getByTestId('welcome')).toBeInTheDocument()
  })

  it('back navigation from guest-select returns to welcome', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('guest-btn'))
    expect(screen.getByTestId('guest-select')).toBeInTheDocument()
    await user.click(screen.getByText('back-btn'))
    expect(screen.getByTestId('welcome')).toBeInTheDocument()
  })

  it('change guest clears localStorage and shows guest-select', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('guest-btn'))
    await user.click(screen.getByText('select-marta'))
    expect(screen.getByTestId('guest-dashboard')).toBeInTheDocument()
    await user.click(screen.getByText('change-guest'))
    expect(localStorage.getItem('bodorrio-guest')).toBeNull()
    expect(screen.getByTestId('guest-select')).toBeInTheDocument()
  })
})
