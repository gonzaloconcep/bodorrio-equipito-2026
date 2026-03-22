import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'
import { useBodyScrollLock } from '../useBodyScrollLock'

describe('useBodyScrollLock', () => {
  beforeEach(() => {
    document.body.style.overflow = ''
    window.scrollTo = vi.fn()
  })

  it('sets body overflow to hidden on mount', () => {
    renderHook(() => useBodyScrollLock())
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('scrolls to top on mount', () => {
    renderHook(() => useBodyScrollLock())
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('restores overflow on unmount', () => {
    document.body.style.overflow = 'auto'
    const { unmount } = renderHook(() => useBodyScrollLock())
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('auto')
  })

  it('restores scroll position on unmount', () => {
    // Simulate a scroll position
    Object.defineProperty(window, 'scrollY', { value: 150, writable: true })
    const { unmount } = renderHook(() => useBodyScrollLock())
    // On mount it scrolls to 0,0
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
    unmount()
    // On unmount it restores to saved scroll position
    expect(window.scrollTo).toHaveBeenCalledWith(0, 150)
    // Reset
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
  })
})
