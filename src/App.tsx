import { useState } from 'react'
import { Home } from './components/Home'
import { Detail } from './components/Detail'
import { PracticeForm } from './components/PracticeForm'
import { BackupSheet } from './components/BackupSheet'
import { useStore } from './lib/useStore'

type View =
  | { name: 'home' }
  | { name: 'detail'; id: string }
  | { name: 'form'; id?: string }

export function App() {
  const store = useStore()
  const [view, setView] = useState<View>({ name: 'home' })
  const [showBackup, setShowBackup] = useState(false)

  const goHome = () => setView({ name: 'home' })

  return (
    <div className="app-shell">
      <main className="app">
        {view.name === 'home' && (
          <Home
            store={store}
            onOpen={(id) => setView({ name: 'detail', id })}
            onNew={() => setView({ name: 'form' })}
            onBackup={() => setShowBackup(true)}
          />
        )}

        {view.name === 'detail' && (
          <Detail
            store={store}
            id={view.id}
            onBack={goHome}
            onEdit={(id) => setView({ name: 'form', id })}
          />
        )}

        {view.name === 'form' && (
          <PracticeForm store={store} id={view.id} onDone={goHome} onCancel={goHome} />
        )}
      </main>

      {showBackup && <BackupSheet store={store} onClose={() => setShowBackup(false)} />}

      {store.error && (
        <div className="toast" role="alert">
          <span>{store.error}</span>
          <button onClick={store.clearError} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
    </div>
  )
}
