"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useAuth } from '@/lib/auth-context'
import { useLanguage, languageNames, type Language } from '@/lib/language-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { User, Mail, Shield, LogOut, Bell, Globe, Moon, Loader2, Save, Check } from 'lucide-react'
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
    <div className="min-h-screen bg-background p-6 md:p-10 text-foreground">
      <main className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{t('Account Settings')}</h1>
            <p className="text-muted-foreground text-lg mt-2">{t('Manage your personal account preferences and security.')}</p>
          </div>
          <Button 
            onClick={handleUpdateProfile} 
            disabled={saving}
            className="h-12 px-8 rounded-[16px] text-base gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {t('Save Profile')}
          </Button>
        </div>

        <div className="space-y-8">
          {/* Account Overview */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground">{t('Account Information')}</h2>
            </div>
            <Card className="border border-border shadow-sm bg-card overflow-hidden rounded-[24px]">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="w-24 h-24 rounded-[20px] bg-primary/5 flex items-center justify-center border-2 border-border shadow-sm shrink-0 overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      <span className="text-3xl font-bold text-primary">
                        {user?.email?.[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 space-y-6 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('Full Name')}</Label>
                        <Input 
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={t('Your Name')}
                          className="bg-secondary/20 border-border/50 h-12 rounded-[14px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('Email Address')}</Label>
                        <div className="flex items-center h-12 px-4 bg-secondary/10 border border-border/50 rounded-[14px] text-sm text-muted-foreground">
                          <Mail className="w-4 h-4 mr-3 text-muted-foreground/70" />
                          {user?.email}
                        </div>
                      </div>
                    </div>
                    {user?.app_metadata?.provider === 'google' && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100">
                        <Check className="w-3 h-3" />
                        {t('Google Account Connected')}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Preferences */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-foreground">{t('Preferences')}</h2>
            </div>
            <Card className="border border-border shadow-sm bg-card overflow-hidden rounded-[24px]">
              <CardContent className="p-0 divide-y divide-border/40">
                <div className="p-6 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[12px] bg-secondary/50 flex items-center justify-center border border-border/50">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">{t('Interface Language')}</p>
                      <p className="text-sm text-muted-foreground">{t('System display language')}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-10 px-4 rounded-[12px] text-sm font-semibold border-border/50 bg-background hover:bg-secondary/50">
                        {languageNames[language]}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-[16px] p-1.5 border-border">
                      {(Object.keys(languageNames) as Language[]).map((lang) => (
                        <DropdownMenuItem 
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          className="cursor-pointer flex items-center justify-between rounded-[10px] py-2.5 px-3"
                        >
                          <span className="font-medium">{languageNames[lang]}</span>
                          {language === lang && <Check className="w-4 h-4 text-primary" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="p-6 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[12px] bg-secondary/50 flex items-center justify-center border border-border/50">
                      <Moon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">{t('Appearance')}</p>
                      <p className="text-sm text-muted-foreground">{t('Choose between light and dark themes')}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="h-10 px-4 rounded-[12px] text-sm font-semibold border-border/50 bg-background hover:bg-secondary/50">
                    {t('Light Mode')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Danger Zone */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-foreground">{t('Security & Session')}</h2>
            </div>
            <Card className="border border-red-100 shadow-sm bg-red-50/20 overflow-hidden rounded-[24px]">
              <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-base font-bold text-foreground">{t('Sign out from this device')}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t('Your data is safely synced to the cloud.')}</p>
                </div>
                <Button 
                  onClick={handleSignOut}
                  disabled={loading}
                  variant="outline" 
                  className="h-11 px-6 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 bg-white shadow-sm rounded-[14px] w-full sm:w-auto"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogOut className="w-4 h-4 mr-2" />}
                  {t('Sign Out')}
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}
