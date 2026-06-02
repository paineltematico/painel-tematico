import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paineltematico.pt'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static pages
  const statics: MetadataRoute.Sitemap = [
    { url: BASE_URL,                  lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/imoveis`,     lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/projetos`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/construcao`,  lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/sobre`,       lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/blog`,        lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/contacto`,    lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Dynamic: imoveis
  const { data: imoveis } = await supabase
    .from('imoveis')
    .select('slug, created_at')
    .eq('disponivel', true)

  const imovelPages: MetadataRoute.Sitemap = (imoveis ?? []).map((i) => ({
    url: `${BASE_URL}/imoveis/${i.slug}`,
    lastModified: new Date(i.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Dynamic: projetos
  const { data: projetos } = await supabase
    .from('projetos')
    .select('slug, created_at')
    .eq('ativo', true)

  const projetoPages: MetadataRoute.Sitemap = (projetos ?? []).map((p) => ({
    url: `${BASE_URL}/projetos/${p.slug}`,
    lastModified: new Date(p.created_at),
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  // Dynamic: artigos/blog
  const { data: artigos } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('publicado', true)

  const artigoPages: MetadataRoute.Sitemap = (artigos ?? []).map((a) => ({
    url: `${BASE_URL}/blog/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...statics, ...imovelPages, ...projetoPages, ...artigoPages]
}
