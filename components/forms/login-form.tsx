"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!formData.email || !formData.password) {
      toast.error("Lütfen tüm alanları doldurun")
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
        toast.error("E-posta veya şifre hatalı")
        setIsLoading(false)
        return
      }

      toast.success("Giriş başarılı")
      router.push("/")
      router.refresh()
    } catch (err) {
      toast.error("Bir hata oluştu")
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8 mt-12 flex justify-center">
        <svg className="w-24 h-24 text-[#008080]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79l5.59 5.59L13 19.93zm6.93-7.93c-.47 3.9-3.85 6.95-7.93 6.95-.62 0-1.21-.08-1.79-.21l5.59-5.59 4.13-1.15zM12 4c.62 0 1.21.08 1.79.21L6.21 8.8c-.13-.58-.21-1.17-.21-1.79 0-3.9 3.05-7.23 6.93-7.93zm-6.93 7.93c.47-3.9 3.85-6.95 7.93-6.95.62 0 1.21.08 1.79.21L17.79 8.8c.13.58.21 1.17.21 1.79 0 3.9-3.05 7.23-6.93 7.93zM12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
          <path d="M19.14 12.98c.04-.32.06-.64.06-.98s-.02-.66-.06-.98l1.77-1.38c.14-.11.19-.3.12-.47l-1.7-2.95c-.07-.12-.2-.19-.35-.19-.04 0-.08.01-.12.02l-2.12.79c-.38-.28-.78-.51-1.2-.69l-.37-2.27c-.03-.18-.19-.32-.38-.32H9.37c-.19 0-.34.14-.37.32l-.37 2.27c-.42.18-.82.41-1.2.69L5.3 4.29c-.04-.01-.08-.02-.12-.02-.15 0-.28.07-.35.19l-1.7 2.95c-.07.17-.02.36.12.47l1.77 1.38c-.04.32-.06.64-.06.98s.02.66.06.98l-1.77 1.38c-.14.11-.19.3-.12.47l1.7 2.95c.07.12.2.19.35.19.04 0-.08.01-.12.02l2.12-.79c.38.28.78.51 1.2.69l.37 2.27c.03.18.19.32.38.32h5.26c.19 0 .34-.14.37-.32l.37-2.27c.42-.18.82-.41 1.2-.69l2.12.79c.04.01.08.02.12.02.15 0 .28-.07.35-.19l1.7-2.95c.07-.17.02-.36-.12-.47l-1.77-1.38zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"></path>
          <path d="M12 12c-1.66 0-3 1.34-3 3s1.34 3 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#008080"></path>
          <path d="M15 9l-3 3H9l3-3h3zM9 15l3-3h3l-3 3H9z" fill="#008080"></path>
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-[#008080] mb-2 tracking-tight text-center">
        FactoryOps Login
      </h1>
      <p className="text-base text-gray-600 mb-8 text-center">
        Secure Access for Teams & Managers
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label className="sr-only" htmlFor="email">Username or Email</label>
          <input
            id="email"
            name="email"
            type="text"
            placeholder="Username or Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#008080] focus:border-[#008080] sm:text-base"
            disabled={isLoading}
          />
        </div>

        <div className="relative">
          <label className="sr-only" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#008080] focus:border-[#008080] sm:text-base"
            disabled={isLoading}
          />
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-[#008080] hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008080] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Logging In..." : "Log In"}
        </button>
      </form>

      <div className="flex justify-between w-full mt-4 text-sm px-1">
        <a className="font-medium text-[#008080] hover:text-teal-700 cursor-pointer">
          Forgot Password?
        </a>
        <Link href="/register" className="font-medium text-[#008080] hover:text-teal-700">
          Sign Up
        </Link>
      </div>
    </div>
  )
}
