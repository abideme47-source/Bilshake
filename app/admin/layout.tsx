import { AdminLocaleProvider } from "@/components/admin/admin-locale"
import "../admin.css"

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminLocaleProvider>{children}</AdminLocaleProvider>
}
