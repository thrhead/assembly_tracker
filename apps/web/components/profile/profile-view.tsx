'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/lib/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { UserIcon, LockIcon, Loader2Icon, CheckCircle2Icon, AlertCircleIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileViewProps {
    role: 'ADMIN' | 'MANAGER' | 'WORKER' | 'CUSTOMER'
}

export function ProfileView({ role }: ProfileViewProps) {
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
                phone: (session.user as any).phone || ''
            })
        }
    }, [session])

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setProfileLoading(true)
        setProfileMessage(null)

        try {
            // Using a generic profile update endpoint if possible, or role-specific one
            const response = await fetch(`/api/${role.toLowerCase()}/profile`, {
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
            const response = await fetch(`/api/${role.toLowerCase()}/change-password`, {
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
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2Icon className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-gray-900">Hesap Ayarları</h1>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5 text-indigo-600" />
                        <CardTitle>Profil Bilgileri</CardTitle>
                    </div>
                    <CardDescription>
                        Kişisel bilgilerinizi güncelleyin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Ad Soyad</Label>
                            <Input
                                id="name"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-posta</Label>
                            <Input
                                id="email"
                                value={profileData.email}
                                disabled
                                className="bg-gray-50"
                            />
                            <p className="text-xs text-gray-500 italic">E-posta adresi değiştirilemez.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefon</Label>
                            <Input
                                id="phone"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                placeholder="05XX XXX XX XX"
                            />
                        </div>

                        {profileMessage && (
                            <div className={cn(
                                "p-3 rounded-md flex items-center gap-2 text-sm",
                                profileMessage.type === 'success' ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                            )}>
                                {profileMessage.type === 'success' ? <CheckCircle2Icon className="h-4 w-4" /> : <AlertCircleIcon className="h-4 w-4" />}
                                {profileMessage.text}
                            </div>
                        )}

                        <Button type="submit" disabled={profileLoading} className="w-full">
                            {profileLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                            Değişiklikleri Kaydet
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <LockIcon className="h-5 w-5 text-indigo-600" />
                        <CardTitle>Şifre Değiştir</CardTitle>
                    </div>
                    <CardDescription>
                        Hesap güvenliğiniz için düzenli olarak şifrenizi güncelleyin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Yeni Şifre</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>

                        {passwordMessage && (
                            <div className={cn(
                                "p-3 rounded-md flex items-center gap-2 text-sm",
                                passwordMessage.type === 'success' ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                            )}>
                                {passwordMessage.type === 'success' ? <CheckCircle2Icon className="h-4 w-4" /> : <AlertCircleIcon className="h-4 w-4" />}
                                {passwordMessage.text}
                            </div>
                        )}

                        <Button type="submit" disabled={passwordLoading} variant="outline" className="w-full">
                            {passwordLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                            Şifreyi Güncelle
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
