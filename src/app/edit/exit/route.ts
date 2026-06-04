import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const returnTo = searchParams.get('return') ?? '/'

  const cookieStore = await cookies()
  cookieStore.delete('edit_mode')

  redirect(returnTo)
}
