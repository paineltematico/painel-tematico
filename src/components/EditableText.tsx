'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditMode } from '@/context/EditModeContext'

interface Props {
  /** Key in site_settings table */
  settingKey: string
  /** Current value from DB */
  value: string
  /** HTML tag to render as (default: span) */
  as?: keyof React.JSX.IntrinsicElements
  className?: string
  /** Allow newlines (default: false — Enter = submit) */
  multiline?: boolean
}

export function EditableText({
  settingKey,
  value,
  as: Tag = 'span',
  className = '',
  multiline = false,
}: Props) {
  const { editMode, beginSave, endSave } = useEditMode()
  const [displayValue, setDisplayValue] = useState(value)
  const [focused, setFocused] = useState(false)
  const elRef = useRef<HTMLElement>(null)
  // Track the "committed" value to avoid saving when content hasn't changed
  const committedRef = useRef(value)

  // Sync display value with incoming prop on first mount only
  useEffect(() => {
    committedRef.current = value
    setDisplayValue(value)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally only on mount

  // When NOT in edit mode, just render text normally
  if (!editMode) {
    // Cast needed because Tag is a dynamic string
    const El = Tag as React.ElementType
    return <El className={className}>{displayValue}</El>
  }

  const handleBlur = async (e: React.FocusEvent<HTMLElement>) => {
    setFocused(false)
    const newVal = e.currentTarget.textContent ?? ''
    if (newVal === committedRef.current) return

    beginSave()
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: settingKey, value: newVal }),
      })
      if (!res.ok) throw new Error()
      committedRef.current = newVal
      setDisplayValue(newVal)
      endSave(true)
    } catch {
      // Restore original on error
      if (elRef.current) elRef.current.textContent = committedRef.current
      endSave(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault()
      ;(e.currentTarget as HTMLElement).blur()
    }
    // Escape = cancel, restore original
    if (e.key === 'Escape') {
      if (elRef.current) elRef.current.textContent = committedRef.current
      ;(e.currentTarget as HTMLElement).blur()
    }
  }

  const El = Tag as React.ElementType
  return (
    <El
      ref={elRef as React.Ref<HTMLSpanElement>}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={[
        className,
        'outline-none cursor-text relative transition-all duration-150',
        focused
          ? 'ring-2 ring-[#4ecdc4] ring-offset-2 rounded-md bg-[#4ecdc4]/8'
          : 'underline decoration-dashed decoration-[#4ecdc4]/60 underline-offset-4 hover:decoration-[#4ecdc4]',
      ].join(' ')}
      title="Clique para editar"
    >
      {displayValue}
    </El>
  )
}
