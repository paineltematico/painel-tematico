import ProjetoForm from '@/components/ProjetoForm'

export default function NovoProjetoPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Novo Projeto</h1>
      </div>
      <ProjetoForm />
    </div>
  )
}
