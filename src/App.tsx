import { useState, useEffect } from 'react'
import type { Reviewer } from './types'
import WelcomeScreen from './components/WelcomeScreen'
import GuestSelect from './components/GuestSelect'
import GuestDashboard from './components/GuestDashboard'
import AdminDashboard from './components/AdminDashboard'

type Route = 'welcome' | 'guest-select' | 'guest' | 'admin'

function App() {
  const [route, setRoute] = useState<Route>('welcome')
  const [currentGuest, setCurrentGuest] = useState<Reviewer | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('bodorrio-guest')
    if (saved) {
      setCurrentGuest(saved as Reviewer)
    }
  }, [])

  const handleGuestSelect = (guest: Reviewer) => {
    localStorage.setItem('bodorrio-guest', guest)
    setCurrentGuest(guest)
    setRoute('guest')
  }

  const handleChangeGuest = () => {
    localStorage.removeItem('bodorrio-guest')
    setCurrentGuest(null)
    setRoute('guest-select')
  }

  const handleBack = () => {
    setRoute('welcome')
  }

  return (
    <div className="min-h-dvh">
      {route === 'welcome' && (
        <WelcomeScreen
          onAdmin={() => setRoute('admin')}
          onGuest={() => {
            if (currentGuest) {
              setRoute('guest')
            } else {
              setRoute('guest-select')
            }
          }}
        />
      )}
      {route === 'guest-select' && (
        <GuestSelect onSelect={handleGuestSelect} onBack={handleBack} />
      )}
      {route === 'guest' && currentGuest && (
        <GuestDashboard
          reviewer={currentGuest}
          onChangeGuest={handleChangeGuest}
          onBack={handleBack}
        />
      )}
      {route === 'admin' && (
        <AdminDashboard onBack={handleBack} />
      )}
    </div>
  )
}

export default App
