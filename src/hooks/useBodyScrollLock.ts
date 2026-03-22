import { useEffect } from 'react'

export function useBodyScrollLock() {
  useEffect(() => {
    const scrollY = window.scrollY
    const origBodyOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = origBodyOverflow
      window.scrollTo(0, scrollY)
    }
  }, [])
}
