import { NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  const opts = { maxAge: 0, path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' }
  response.cookies.set(COOKIE_NAME, '', opts)
  response.cookies.set('admin_session', '', opts)
  return response
}
