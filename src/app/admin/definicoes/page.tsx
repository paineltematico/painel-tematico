import { getSettings } from '@/lib/settings'
import SettingsForm from './SettingsForm'
import { Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DefinicoesPage() {
  const settings = await getSettings()

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#00545F]/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-[#00545F]" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Definições</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Conteúdo e informações do site público</p>
        </div>
      </div>

      <SettingsForm initial={settings} />
    </div>
  )
}
