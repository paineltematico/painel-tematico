'use client'

/**
 * EditableText — inline CMS for site_settings fields.
 *
 * THREE states:
 *   1. View mode  (editMode=false) → renders as plain element, no interaction
 *   2. Standby    (editMode=true)  → dashed-underline hint + hover tooltip
 *                                    NOT contentEditable → links still work normally
 *   3. Editing    (user clicked)   → contentEditable with ring, saves on Blur / Enter
 *
 * The key fix: state 2 is NOT contentEditable, so nothing blocks navigation.
 * Only an explicit click on the editable text activates state 3.
 */

import { useRef, useState } from 'react'
import { useEditMode } from '@/context/EditModeContext'

interface Props {
  /** Key in site_settings table */
  settingKey: string
  /** Current value from DB / settings default */
  value: string
  /** HTML tag to render (default: span) */
  as?: keyof React.JSX.IntrinsicElements
  className?: string
  /** Allow line breaks (default: false → Enter submits) */
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
  const [isEditing, setIsEditing] = useState(false)
  const committedRef = useRef(value)
  const elRef = useRef<HTMLElement>(null)

  const El = Tag as React.ElementType

  // ── STATE 1: view mode ───────────────────────────────────────────────────
  if (!editMode) {
    return <El className={className}>{displayValue}</El>
  }

  // ── STATE 2: standby (edit mode but not yet editing) ─────────────────────
  if (!isEditing) {
    return (
      <El
        className={[
          className,
          'relative cursor-pointer group/et',
          'underline decoration-dashed decoration-[#4ecdc4]/50 underline-offset-4',
          'hover:decoration-[#4ecdc4] transition-all duration-150',
        ].join(' ')}
        onClick={() => setIsEditing(true)}
        title={`Clique para editar (${settingKey})`}
      >
        {displayValue}
        {/* Tooltip badge on hover */}
        <span
          className="pointer-events-none invisible group-hover/et:visible
                     absolute -top-7 left-0 z-50
                     text-[10px] font-semibold font-sans not-italic tracking-wide
                     text-white bg-[#1F3F44] px-2 py-1 rounded-md shadow-lg whitespace-nowrap
                     border border-[#4ecdc4]/30"
        >
          ✎ editar
        </span>
      </El>
    )
  }

  // ── STATE 3: actively editing ────────────────────────────────────────────
  const handleBlur = async (e: React.FocusEvent<HTMLElement>) => {
    setIsEditing(false)
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
      // Restore on error
      if (elRef.current) elRef.current.textContent = committedRef.current
      endSave(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault()
      ;(e.currentTarget as HTMLElement).blur()
    }
    if (e.key === 'Escape') {
      if (elRef.current) elRef.current.textContent = committedRef.current
      setIsEditing(false)
    }
  }

  return (
    <El
      ref={elRef as React.Ref<HTMLSpanElement>}
      contentEditable
      suppressContentEditableWarning
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus
      spellCheck
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={[
        className,
        'outline-none cursor-text',
        'ring-2 ring-[#4ecdc4] ring-offset-2 rounded-md bg-[#4ecdc4]/8',
      ].join(' ')}
    >
      {displayValue}
    </El>
  )
}
