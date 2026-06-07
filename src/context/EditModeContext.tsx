'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

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
    setTimeout(() => setStatus('idle'), 2500)
  }, [])

  // Block link navigation while in edit mode so links don't interfere with clicking to edit text
  useEffect(() => {
    if (!initialEditMode) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]')
      if (!link) return
      // Allow links marked as safe (e.g. EditModeBar "Sair" button)
      if (link.closest('[data-edit-safe]')) return
      // Allow links that open in new tab
      if ((link as HTMLAnchorElement).target === '_blank') return
      e.preventDefault()
    }
    document.addEventListener('click', handler, { capture: true })
    return () => document.removeEventListener('click', handler, { capture: true })
  }, [initialEditMode])

  return (
    <EditModeContext.Provider value={{ editMode: initialEditMode, status, beginSave, endSave }}>
      {children}
    </EditModeContext.Provider>
  )
}

export function useEditMode() {
  return useContext(EditModeContext)
}
