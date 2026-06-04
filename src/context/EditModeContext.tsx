'use client'

import { createContext, useContext, useState, useCallback } from 'react'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface EditModeContextType {
  editMode: boolean
  status: SaveStatus
  beginSave: () => void
  endSave: (ok: boolean) => void
}

const EditModeContext = createContext<EditModeContextType>({
  editMode: false,
  status: 'idle',
  beginSave: () => {},
  endSave: () => {},
})

export function EditModeProvider({
  children,
  initialEditMode,
}: {
  children: React.ReactNode
  initialEditMode: boolean
}) {
  const [status, setStatus] = useState<SaveStatus>('idle')

  const beginSave = useCallback(() => setStatus('saving'), [])
  const endSave = useCallback((ok: boolean) => {
    setStatus(ok ? 'saved' : 'error')
    // Reset after a moment
    setTimeout(() => setStatus('idle'), 2500)
  }, [])

  return (
    <EditModeContext.Provider value={{ editMode: initialEditMode, status, beginSave, endSave }}>
      {children}
    </EditModeContext.Provider>
  )
}

export function useEditMode() {
  return useContext(EditModeContext)
}
