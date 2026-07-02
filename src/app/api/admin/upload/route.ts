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
  // Optional bucket override — use 'videos' for video files
  const bucketParam = (formData.get('bucket') as string) || ''

  if (!file) return NextResponse.json({ error: 'Ficheiro em falta' }, { status: 400 })

  const isVideo = ['video/mp4', 'video/quicktime', 'video/webm'].includes(file.type)

  // Route to the correct bucket automatically
  const bucket = bucketParam || (isVideo ? 'videos' : 'media')

  // Validate type per bucket
  const allowed = bucket === 'videos'
    ? ['video/mp4', 'video/quicktime', 'video/webm']
    : ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']

  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo não suportado. Use JPEG, PNG, WebP, PDF, MP4, MOV ou WEBM.' }, { status: 400 })
  }

  const maxBytes = bucket === 'videos' ? 200 * 1024 * 1024 : 20 * 1024 * 1024
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `Ficheiro excede o limite de ${Math.round(maxBytes / 1024 / 1024)}MB.` },
      { status: 413 }
    )
  }

  // Build unique filename
  const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const slug     = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 40)
  const ts       = Date.now()
  const filename = `${folder}/${slug}-${ts}.${ext}`

  const buffer = await file.arrayBuffer()

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filename, buffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabaseAdmin.storage.from(bucket).getPublicUrl(filename)

  return NextResponse.json({ url: publicUrl, path: filename, bucket })
}

// DELETE /api/admin/upload?path=folder/filename.ext&bucket=media
export async function DELETE(request: Request) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const path   = searchParams.get('path')
  const bucket = searchParams.get('bucket') || 'media'
  if (!path) return NextResponse.json({ error: 'Path em falta' }, { status: 400 })

  const { error } = await supabaseAdmin.storage.from(bucket).remove([path])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
