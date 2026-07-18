import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth-server'

// heic-convert precisa do runtime Node (não Edge)
export const runtime = 'nodejs'

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

  // HEIC/HEIF (fotos de iPhone) — o browser não os mostra, por isso convertemos
  // para JPEG no servidor. Detetar por mime OU por extensão (o mime varia).
  const nameExt = file.name.split('.').pop()?.toLowerCase() ?? ''
  const isHeic = ['image/heic', 'image/heif'].includes(file.type) || ['heic', 'heif'].includes(nameExt)

  // Route to the correct bucket automatically
  const bucket = bucketParam || (isVideo ? 'videos' : 'media')

  // Validate type per bucket (HEIC é aceite e convertido a seguir)
  const allowed = bucket === 'videos'
    ? ['video/mp4', 'video/quicktime', 'video/webm']
    : ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']

  if (!isHeic && !allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo não suportado. Use JPEG, PNG, WebP, HEIC, PDF, MP4, MOV ou WEBM.' }, { status: 400 })
  }

  const maxBytes = bucket === 'videos' ? 200 * 1024 * 1024 : 20 * 1024 * 1024
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `Ficheiro excede o limite de ${Math.round(maxBytes / 1024 / 1024)}MB.` },
      { status: 413 }
    )
  }

  let buffer: ArrayBuffer | Buffer | Uint8Array = await file.arrayBuffer()
  let ext = nameExt || 'bin'
  let contentType = file.type || 'application/octet-stream'

  // Converter HEIC → JPEG
  if (isHeic) {
    try {
      const heicConvert = (await import('heic-convert')).default
      const out = await heicConvert({
        buffer: Buffer.from(buffer as ArrayBuffer),
        format: 'JPEG',
        quality: 0.9,
      })
      buffer = out
      ext = 'jpg'
      contentType = 'image/jpeg'
    } catch (e) {
      console.error('[upload] HEIC convert error:', e)
      return NextResponse.json({ error: 'Não foi possível converter a imagem HEIC. Tente exportar como JPEG.' }, { status: 422 })
    }
  }

  // Build unique filename
  const slug     = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 40)
  const ts       = Date.now()
  const filename = `${folder}/${slug}-${ts}.${ext}`

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filename, buffer, { contentType, upsert: false })

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
