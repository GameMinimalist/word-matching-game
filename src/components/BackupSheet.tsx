import { useRef } from 'react'
import type { Store } from '../lib/useStore'

interface SheetProps {
  store: Store
  onClose: () => void
}

export function BackupSheet({ store, onClose }: SheetProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const archived = store.data.practices.filter((p) => p.archived)

  const handleExport = () => {
    const blob = new Blob([store.exportJSON()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `tally-backup-${stamp}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = (file: File) => {
    if (!window.confirm('Importing replaces all current data on this device. Continue?')) return
    const reader = new FileReader()
    reader.onload = () => store.importJSON(String(reader.result))
    reader.readAsText(file)
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-label="Backup and settings"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <div className="sheet-title">Backup &amp; data</div>

        <p className="sheet-note">
          Your data lives <b>only on this device</b> — nothing is sent anywhere. Export a backup
          regularly: clearing Safari data or removing the app will erase it.
        </p>

        <button className="primary" onClick={handleExport}>
          Export backup (.json)
        </button>
        <button className="secondary" onClick={() => fileRef.current?.click()}>
          Import from backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleImportFile(f)
            e.target.value = ''
          }}
        />

        {archived.length > 0 && (
          <>
            <div className="sheet-subhead">Archived</div>
            <div className="archived-list">
              {archived.map((p) => (
                <div key={p.id} className="archived-row">
                  <span>{p.name}</span>
                  <button className="text-btn" onClick={() => store.archivePractice(p.id)}>
                    Unarchive
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <button className="text-btn close-sheet" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  )
}
