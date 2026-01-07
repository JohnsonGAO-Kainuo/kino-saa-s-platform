"use client"

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { User, Shield, Globe, Moon, Loader2, Save, UserCircle, Settings as SettingsIcon } from 'lucide-react'
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { user } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile')
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name)
      setUsername(user.email?.split('@')[0] || '')
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings</h1>
        
        <div className="flex gap-8 items-start">
          {/* Internal Sidebar */}
          <div className="w-64 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id 
                    ? "bg-white text-[#6366f1] shadow-sm border border-slate-200" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-[#6366f1]" : "text-slate-400")} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Settings Content */}
          <div className="flex-1 space-y-8">
            {activeTab === 'profile' && (
              <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-6 mb-10">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                      {user?.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                      ) : (
                        <UserCircle className="w-12 h-12 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Welcome back, {fullName || username}</h2>
                      <p className="text-slate-500">Manage your profile information</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold">Name</Label>
                        <Input 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="border-slate-200 h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold">Username</Label>
                        <Input 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="border-slate-200 h-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold">Email</Label>
                        <Input 
                          value={user?.email || ''}
                          disabled
                          className="border-slate-200 h-10 bg-slate-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold">Language</Label>
                        <select 
                          value={language}
                          onChange={(e) => setLanguage(e.target.value as any)}
                          className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                        >
                          <option value="en">English (US)</option>
                          <option value="zh-TW">繁體中文</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-6">Asset Library</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] rounded-2xl p-6 text-white h-32 flex flex-col justify-between">
                        <span className="font-bold text-sm">Logo</span>
                        <div className="flex justify-between items-end">
                          <span className="text-xs opacity-80">Upload</span>
                          <button className="bg-white/20 p-2 rounded-full"><Save className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-[#10b981] to-[#059669] rounded-2xl p-6 text-white h-32 flex flex-col justify-between">
                        <span className="font-bold text-sm">Stamps</span>
                        <div className="flex justify-between items-end">
                          <span className="text-xs opacity-80">Upload</span>
                          <button className="bg-white/20 p-2 rounded-full"><Save className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button 
                      onClick={handleUpdateProfile} 
                      disabled={saving}
                      className="bg-[#6366f1] hover:bg-[#5658d2] text-white px-8"
                    >
                      {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      Save Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'preferences' && (
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-8">Preferences</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-100 rounded-lg"><Moon className="w-5 h-5 text-slate-600" /></div>
                        <div>
                          <p className="font-bold text-slate-800">Theme</p>
                          <p className="text-xs text-slate-500">Dark mode and appearance</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-100 rounded-lg"><Globe className="w-5 h-5 text-slate-600" /></div>
                        <div>
                          <p className="font-bold text-slate-800">Language</p>
                          <p className="text-xs text-slate-500">System display language</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-8">Security</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-100 rounded-lg"><Shield className="w-5 h-5 text-slate-600" /></div>
                        <div>
                          <p className="font-bold text-slate-800">Theme</p>
                          <p className="text-xs text-slate-500">Dark mode and appearance</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-100 rounded-lg"><Globe className="w-5 h-5 text-slate-600" /></div>
                        <div>
                          <p className="font-bold text-slate-800">Language</p>
                          <p className="text-xs text-slate-500">System display language</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
