import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserDialog } from "@/components/admin/user-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { getUsers } from "@/lib/data/users"

export default async function UsersPage(props: {
  searchParams: Promise<{ search?: string }>
}) {
  const searchParams = await props.searchParams
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const { users } = await getUsers({
    filter: { search: searchParams.search },
    limit: 100 // Temporarily fetch more since pagination UI isn't here yet
  })

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-800",
    MANAGER: "bg-purple-100 text-purple-800",
    TEAM_LEAD: "bg-blue-100 text-blue-800",
    WORKER: "bg-green-100 text-green-800",
    CUSTOMER: "bg-orange-100 text-orange-800",
  }

  const roleLabels: Record<string, string> = {
    ADMIN: "Yönetici",
    MANAGER: "Müdür",
    TEAM_LEAD: "Takım Lideri",
    WORKER: "Çalışan",
    CUSTOMER: "Müşteri",
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kullanıcılar</h1>
          <p className="text-gray-500 mt-2">Sistemdeki tüm kullanıcıları buradan yönetebilirsiniz.</p>
        </div>
        <UserDialog />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <form>
              <Input 
                name="search" 
                placeholder="İsim veya e-posta ara..." 
                className="pl-10"
                defaultValue={searchParams.search}
              />
            </form>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad Soyad</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Kayıt Tarihi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={roleColors[user.role] || ""}>
                    {roleLabels[user.role] || user.role}
                  </Badge>
                </TableCell>
                <TableCell>{(user as any).phone || '-'}</TableCell>
                <TableCell>
                  <Badge variant={(user as any).isActive ? "default" : "destructive"}>
                    {(user as any).isActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(user.createdAt), 'd MMM yyyy', { locale: tr })}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Kullanıcı bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
