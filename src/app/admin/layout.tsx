import AdminLayoutWrapper from '@/components/AdminLayoutWrapper'
import { getCurrentUser } from '@/lib/auth-server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  return <AdminLayoutWrapper user={user}>{children}</AdminLayoutWrapper>
}
