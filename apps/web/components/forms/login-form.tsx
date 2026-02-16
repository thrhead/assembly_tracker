"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setErrors({ email: "", password: "" })

    // Basit validasyon
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: "E-posta gereklidir" }))
      setIsLoading(false)
      return
    }
    if (!formData.password) {
      setErrors(prev => ({ ...prev, password: "Şifre gereklidir" }))
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError("E-posta veya şifre hatalı")
        setIsLoading(false)
        return
      }

      // Başarılı giriş - yönlendirme middleware tarafından yapılacak
      router.push("/")
      router.refresh()
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.")
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Montaj Takip</h1>
        <p className="text-gray-600 mt-2">Hesabınıza giriş yapın</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-posta
          </label>
          <Input
            id="email"
            type="email"
            placeholder="ornek@sirket.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Şifre
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Hesabınız yok mu?{" "}
          <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Kayıt olun
          </Link>
        </p>
      </div>
    </div>
  )
}
