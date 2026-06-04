import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth-server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/admin/upload
// Body: multipart/form-data com campo "file" e opcional "folder" (ex: imoveis, projetos, equipa)
export async function POST(request: Request) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const formData = await request.formData()
  const file   = formData.get('file') as File | null
  const folder = (formData.get('folder') as string) || 'geral'

  if (!file) return NextResponse.json({ error: 'Ficheiro em falta' }, { status: 400 })

  // Validate type (images + PDF + video)
  const allowed = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'video/mp4', 'video/quicktime', 'video/webm',
  ]
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo não suportado. Use JPEG, PNG, WebP, PDF, MP4, MOV ou WEBM.' }, { status: 400 })
  }

  // Build unique filename
  const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const slug     = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 40)
  const ts       = Date.now()
  const filename = `${folder}/${slug}-${ts}.${ext}`

  const buffer = await file.arrayBuffer()

  const { error } = await supabaseAdmin.storage
    .from('media')
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('media')
    .getPublicUrl(filename)

  return NextResponse.json({ url: publicUrl, path: filename })
}

// DELETE /api/admin/upload?path=folder/filename.jpg
export async function DELETE(request: Request) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')
  if (!path) return NextResponse.json({ error: 'Path em falta' }, { status: 400 })

  const { error } = await supabaseAdmin.storage.from('media').remove([path])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
