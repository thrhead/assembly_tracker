import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await auth()
  
  // Eğer giriş yapmışsa, rolüne göre yönlendir
  if (session?.user) {
    const role = session.user.role.toLowerCase()
    redirect(`/${role}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Montaj ve Servis <span className="text-indigo-600">Takip Sistemi</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Fabrika dışında çalışan montaj ve servis ekiplerinin işlerini kolayca takip edin. 
          Maliyet kontrolü, ekip yönetimi ve müşteri bildirimleri tek platformda.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Giriş Yap
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-indigo-600 text-3xl mb-3">📋</div>
            <h3 className="text-lg font-semibold mb-2">İş Takibi</h3>
            <p className="text-gray-600 text-sm">
              Montaj süreçlerini adım adım takip edin ve kontrol edin
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-indigo-600 text-3xl mb-3">👥</div>
            <h3 className="text-lg font-semibold mb-2">Ekip Yönetimi</h3>
            <p className="text-gray-600 text-sm">
              Ekiplerinizi yönetin, görevleri atayın ve ilerlemeyi izleyin
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-indigo-600 text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2">Raporlama</h3>
            <p className="text-gray-600 text-sm">
              Detaylı raporlar ve grafiklerle maliyet kontrolü yapın
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
