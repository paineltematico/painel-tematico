import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const user = await getCurrentUser()
  const { searchParams } = new URL(req.url)
  const returnTo = searchParams.get('return') ?? '/'

  if (!user) {
    redirect(`/admin/login?return=${encodeURIComponent(`/edit?return=${returnTo}`)}`)
  }

  const cookieStore = await cookies()
  cookieStore.set('edit_mode', '1', {
    path: '/',
    httpOnly: false,   // must be readable by JS in EditModeContext
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8h
  })

  redirect(returnTo)
}
