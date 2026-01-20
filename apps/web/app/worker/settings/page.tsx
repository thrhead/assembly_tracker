'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserIcon, LockIcon, Loader2Icon, CheckCircle2Icon, AlertCircleIcon } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Load user data
  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: session.user.phone || ''
      })
    }
  }, [session])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMessage(null)

    try {
      const response = await fetch('/api/worker/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Profil güncellenemedi')
      }

      setProfileMessage({ type: 'success', text: 'Profil bilgileriniz başarıyla güncellendi' })
      
      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.user.name,
          phone: data.user.phone
        }
      })
    } catch (error: any) {
      setProfileMessage({ type: 'error', text: error.message })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMessage(null)

    // Client-side validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor' })
      setPasswordLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır' })
      setPasswordLoading(false)
      return
    }

    try {
      const response = await fetch('/api/worker/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Şifre değiştirilemedi')
      }

      setPasswordMessage({ type: 'success', text: data.message })
      
      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error.message })
    } finally {
      setPasswordLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profil & Ayarlar</h1>
        <p className="text-gray-600 mt-1">Profil bilgilerinizi ve şifrenizi yönetin</p>
      </div>

      <div className="space-y-6">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-indigo-600" />
              <CardTitle>Profil Bilgileri</CardTitle>
            </div>
            <CardDescription>İsim ve telefon bilgilerinizi güncelleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  İsim
                </label>
                <Input
                  id="name"
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                  disabled={profileLoading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta
                </label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">E-posta adresi değiştirilemez</p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="555-123-4567"
                  disabled={profileLoading}
                />
              </div>

              {profileMessage && (
                <div className={`flex items-center gap-2 p-3 rounded-md ${
                  profileMessage.type === 'success' 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-red-50 text-red-800'
                }`}>
                  {profileMessage.type === 'success' ? (
                    <CheckCircle2Icon className="h-4 w-4" />
                  ) : (
                    <AlertCircleIcon className="h-4 w-4" />
                  )}
                  <span className="text-sm">{profileMessage.text}</span>
                </div>
              )}

              <Button type="submit" disabled={profileLoading} className="w-full">
                {profileLoading ? (
                  <>
                    <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  'Profili Güncelle'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Change Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LockIcon className="h-5 w-5 text-indigo-600" />
              <CardTitle>Şifre Değiştir</CardTitle>
            </div>
            <CardDescription>Hesap güvenliğiniz için şifrenizi güncelleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Mevcut Şifre
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  disabled={passwordLoading}
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Yeni Şifre
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  disabled={passwordLoading}
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">En az 6 karakter olmalıdır</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Yeni Şifre (Tekrar)
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  disabled={passwordLoading}
                  minLength={6}
                />
              </div>

              {passwordMessage && (
                <div className={`flex items-center gap-2 p-3 rounded-md ${
                  passwordMessage.type === 'success' 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-red-50 text-red-800'
                }`}>
                  {passwordMessage.type === 'success' ? (
                    <CheckCircle2Icon className="h-4 w-4" />
                  ) : (
                    <AlertCircleIcon className="h-4 w-4" />
                  )}
                  <span className="text-sm">{passwordMessage.text}</span>
                </div>
              )}

              <Button type="submit" disabled={passwordLoading} className="w-full" variant="outline">
                {passwordLoading ? (
                  <>
                    <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                    Değiştiriliyor...
                  </>
                ) : (
                  'Şifreyi Değiştir'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
