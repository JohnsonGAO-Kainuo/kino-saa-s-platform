"use client"

import React, { useState, useEffect } from 'react'
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useAuth } from '@/lib/auth-context'
import { useLanguage, languageNames, type Language } from '@/lib/language-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { User, Mail, Shield, LogOut, Bell, Globe, Moon, Loader2, ArrowLeft, Save, Check } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function SettingsPage() {
  const { user } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name)
    }
  }, [user])

  const handleUpdateProfile = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      })
      if (error) throw error
      toast.success('Profile updated!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <DashboardHeader />
      
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 text-[#4f566b] hover:text-[#1a1f36] text-sm mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t('Back to Dashboard', '返回主頁')}
            </Link>
            <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight">{t('Account Settings', '帳戶設定')}</h1>
            <p className="text-[#4f566b] text-sm mt-1">{t('Manage your personal account preferences and security.', '管理您的個人帳戶偏好和安全設定。')}</p>
          </div>
          <Button 
            onClick={handleUpdateProfile} 
            disabled={saving}
            className="bg-[#6366f1] hover:bg-[#5658d2] text-white gap-2 shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t('Save Profile', '保存設定')}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Account Overview */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#4f566b] mb-2 px-1">
              <User className="w-4 h-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">{t('Account Information', '帳戶資訊')}</h2>
            </div>
            <Card className="border-border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-8">
                  <div className="w-20 h-20 rounded-full bg-[#6366f1]/10 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} className="w-full h-full rounded-full object-cover" alt="Avatar" />
                    ) : (
                      <span className="text-2xl font-bold text-[#6366f1]">
                        {user?.email?.[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="fullName" className="text-xs font-medium text-muted-foreground uppercase">{t('Full Name', '姓名')}</Label>
                        <Input 
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={t('Your Name', '您的姓名')}
                          className="bg-white border-[#e6e9ef]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground uppercase">{t('Email Address', '電郵地址')}</Label>
                        <div className="flex items-center h-10 px-3 bg-slate-50 border border-[#e6e9ef] rounded-md text-sm text-[#4f566b]">
                          <Mail className="w-3.5 h-3.5 mr-2" />
                          {user?.email}
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#16a34a] font-medium bg-green-50 px-2 py-0.5 rounded-full inline-block">
                      {t('Google Account Connected', 'Google 帳戶已連接')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Preferences */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#4f566b] mb-2 px-1">
              <Bell className="w-4 h-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">{t('Preferences', '偏好設定')}</h2>
            </div>
            <Card className="border-border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-0 divide-y divide-[#f7f9fc]">
                <div className="p-4 flex items-center justify-between hover:bg-[#fcfdfe] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1a1f36]">{t('Interface Language', '界面語言')}</p>
                      <p className="text-xs text-[#4f566b]">{t('System display language', '系統顯示語言')}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-[#6366f1] text-xs font-semibold hover:bg-[#6366f1]/5">
                        {languageNames[language]}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {(Object.keys(languageNames) as Language[]).map((lang) => (
                        <DropdownMenuItem 
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          className="cursor-pointer flex items-center justify-between"
                        >
                          <span>{languageNames[lang]}</span>
                          {language === lang && <Check className="w-4 h-4 text-[#6366f1]" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="p-4 flex items-center justify-between hover:bg-[#fcfdfe] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Moon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1a1f36]">{t('Appearance', '外觀')}</p>
                      <p className="text-xs text-[#4f566b]">{t('Choose between light and dark themes', '選擇淺色或深色主題')}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[#6366f1] text-xs font-semibold">{t('Light Mode', '淺色模式')}</Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Danger Zone */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-2 text-red-500 mb-2 px-1">
              <Shield className="w-4 h-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">{t('Security & Session', '安全與登出')}</h2>
            </div>
            <Card className="border-red-100 shadow-sm bg-red-50/30">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#1a1f36]">{t('Sign out from this device', '登出此裝置')}</p>
                  <p className="text-xs text-red-600/70 mt-0.5">{t('Your data is safely synced to the cloud.', '您的資料已安全同步至雲端。')}</p>
                </div>
                <Button 
                  onClick={handleSignOut}
                  disabled={loading}
                  variant="outline" 
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 bg-white shadow-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogOut className="w-4 h-4 mr-2" />}
                  {t('Sign Out', '登出')}
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}

