// Server-only module — imports next/headers (not safe in client bundles)
import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from './auth'
import type { SessionPayload } from './auth'

export async function getCurrentUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}

export type { SessionPayload }
