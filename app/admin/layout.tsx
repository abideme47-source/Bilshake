import { AdminLocaleProvider } from "@/components/admin/admin-locale"

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminLocaleProvider>{children}</AdminLocaleProvider>
}
