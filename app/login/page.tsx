"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        toast.success('Check your email for confirmation!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px] border-[#e6e9ef] shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] rounded-xl bg-white overflow-hidden">
        <CardHeader className="pt-8 pb-4 px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-10 h-10 bg-[#6366f1] rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-xl font-bold text-white">K</span>
            </div>
          </div>
          <CardTitle className="text-[24px] font-semibold tracking-tight text-[#1a1f36]">
            {isSignUp ? 'Create your account' : 'Sign in to Kino'}
          </CardTitle>
          <CardDescription className="text-[#4f566b] mt-2">
            {isSignUp 
              ? 'Start generating professional documents today' 
              : 'Welcome back to your document dashboard'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8 pt-2">
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium text-[#1a1f36]">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="h-10 border-[#e6e9ef] focus:border-[#6366f1] focus:ring-[2px] focus:ring-[#6366f1]/10 bg-white transition-all duration-200"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[13px] font-medium text-[#1a1f36]">Password</Label>
                {!isSignUp && (
                  <button type="button" className="text-[13px] font-medium text-[#6366f1] hover:text-[#5658d2]">
                    Forgot password?
                  </button>
                )}
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="h-10 border-[#e6e9ef] focus:border-[#6366f1] focus:ring-[2px] focus:ring-[#6366f1]/10 bg-white transition-all duration-200"
              />
            </div>
            
            <Button 
              className="w-full h-10 bg-[#6366f1] hover:bg-[#5658d2] text-white font-medium shadow-sm transition-all duration-200" 
              type="submit" 
              disabled={loading || googleLoading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? 'Continue' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#e6e9ef]"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-[#8792a2] font-medium">Or continue with</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-10 border-[#e6e9ef] hover:bg-[#f7f9fc] text-[#4f566b] font-medium shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            type="button"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Google
          </Button>
          
          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[14px] text-[#6366f1] hover:text-[#5658d2] font-medium transition-colors"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Get started"}
            </button>
          </div>
        </CardContent>
      </Card>
      
      <div className="fixed bottom-8 text-[12px] text-[#8792a2]">
        &copy; 2026 Kino SaaS Platform. Built with ❤️ in Hong Kong.
      </div>
    </div>
  )
}


