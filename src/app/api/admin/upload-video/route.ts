import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth-server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/admin/upload-video
export async function POST(request: Request) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const formData = await request.formData()
  const file     = formData.get('file') as File | null
  const folder   = (formData.get('folder') as string) || 'hero'

  if (!file) return NextResponse.json({ error: 'Ficheiro em falta' }, { status: 400 })

  const allowed = ['video/mp4', 'video/webm', 'video/quicktime']
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Use MP4, WebM ou MOV.' }, { status: 400 })
  }

  const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'mp4'
  const slug     = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 40)
  const ts       = Date.now()
  const filename = `${folder}/${slug}-${ts}.${ext}`

  const buffer = await file.arrayBuffer()

  const { error } = await supabaseAdmin.storage
    .from('videos')
    .upload(filename, buffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('videos')
    .getPublicUrl(filename)

  return NextResponse.json({ url: publicUrl, path: filename })
}

// DELETE /api/admin/upload-video?path=hero/filename.mp4
export async function DELETE(request: Request) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')
  if (!path) return NextResponse.json({ error: 'Path em falta' }, { status: 400 })

  const { error } = await supabaseAdmin.storage.from('videos').remove([path])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
