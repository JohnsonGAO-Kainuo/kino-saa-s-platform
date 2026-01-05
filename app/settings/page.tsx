"use client"

import React, { useState } from 'react'
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { User, Mail, Shield, LogOut, Bell, Globe, Moon, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <DashboardHeader />
      
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight">Account Settings</h1>
          <p className="text-[#4f566b] text-sm mt-1">Manage your personal account preferences and security.</p>
        </div>

        <div className="space-y-6">
          {/* Account Overview */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#4f566b] mb-2 px-1">
              <User className="w-4 h-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Account Information</h2>
            </div>
            <Card className="border-border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-[#6366f1]/10 flex items-center justify-center border-2 border-white shadow-sm">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} className="w-full h-full rounded-full object-cover" alt="Avatar" />
                    ) : (
                      <span className="text-2xl font-bold text-[#6366f1]">
                        {user?.email?.[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-[#1a1f36]">{user?.user_metadata?.full_name || 'User'}</p>
                    <div className="flex items-center gap-2 text-sm text-[#4f566b]">
                      <Mail className="w-3.5 h-3.5" />
                      {user?.email}
                    </div>
                    <p className="text-[11px] text-[#16a34a] font-medium bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">
                      Google Account Connected
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
              <h2 className="text-sm font-semibold uppercase tracking-wider">Preferences</h2>
            </div>
            <Card className="border-border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-0 divide-y divide-[#f7f9fc]">
                <div className="p-4 flex items-center justify-between hover:bg-[#fcfdfe] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1a1f36]">Interface Language</p>
                      <p className="text-xs text-[#4f566b]">System display language</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[#6366f1] text-xs font-semibold">English</Button>
                </div>
                
                <div className="p-4 flex items-center justify-between hover:bg-[#fcfdfe] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Moon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1a1f36]">Appearance</p>
                      <p className="text-xs text-[#4f566b]">Choose between light and dark themes</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[#6366f1] text-xs font-semibold">Light Mode</Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Danger Zone */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-2 text-red-500 mb-2 px-1">
              <Shield className="w-4 h-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Security & Session</h2>
            </div>
            <Card className="border-red-100 shadow-sm bg-red-50/30">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#1a1f36]">Sign out from this device</p>
                  <p className="text-xs text-red-600/70 mt-0.5">Your data is safely synced to the cloud.</p>
                </div>
                <Button 
                  onClick={handleSignOut}
                  disabled={loading}
                  variant="outline" 
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 bg-white shadow-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogOut className="w-4 h-4 mr-2" />}
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}

