import AdminSidebar from '@/components/AdminSidebar'
import { getCurrentUser } from '@/lib/auth-server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <AdminSidebar user={user} />
      <main className="flex-1 min-w-0 p-6 lg:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
