import ArtigoForm from '@/components/ArtigoForm'

export default function NovoBlogPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Novo Artigo</h1>
      </div>
      <ArtigoForm />
    </div>
  )
}
