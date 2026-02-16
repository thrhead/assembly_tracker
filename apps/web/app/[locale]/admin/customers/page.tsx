import { auth } from "@/lib/auth"
import { redirect } from "@/lib/navigation"
import { CustomerDialog } from "@/components/admin/customer-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon, Building2Icon, PhoneIcon, MailIcon, PencilIcon } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { getCustomers } from "@/lib/data/customers"

export default async function CustomersPage(props: {
  searchParams: Promise<{ search?: string }>
}) {
  const searchParams = await props.searchParams
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const { customers } = await getCustomers({
    filter: { search: searchParams.search },
    limit: 50
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Müşteriler</h1>
          <p className="text-gray-500 mt-2">Müşteri firmaları ve yetkili kişileri yönetin.</p>
        </div>
        <CustomerDialog />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <form>
              <Input
                name="search"
                placeholder="Firma, isim veya e-posta ara..."
                className="pl-10"
                defaultValue={searchParams.search}
              />
            </form>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Firma</TableHead>
              <TableHead>Yetkili Kişi</TableHead>
              <TableHead>İletişim</TableHead>
              <TableHead>İş Sayısı</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Kayıt Tarihi</TableHead>
              <TableHead className="w-[50px]">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded text-indigo-600">
                      <Building2Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.company}</p>
                      {customer.taxId && (
                        <p className="text-xs text-gray-500">VN: {customer.taxId}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{customer.user.name}</div>
                  <div className="text-sm text-gray-500">{customer.user.email}</div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {customer.user.phone && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <PhoneIcon className="h-3 w-3" />
                        {customer.user.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MailIcon className="h-3 w-3" />
                      <span className="truncate max-w-[150px]">{customer.user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {customer._count.jobs} İş
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={customer.user.isActive ? "default" : "destructive"}>
                    {customer.user.isActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(customer.createdAt), 'd MMM yyyy', { locale: tr })}
                </TableCell>
                <TableCell>
                  <CustomerDialog
                    customer={customer}
                    trigger={
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Düzenle</span>
                        <PencilIcon className="h-4 w-4 text-gray-500" />
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Müşteri bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
