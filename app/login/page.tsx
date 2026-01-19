"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Loader2, Mail, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check terms agreement for sign up
    if (isSignUp && !agreedToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy to continue.')
      return
    }
    
    setLoading(true)
    setEmailSent(false)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        
        // Show success message and email sent state
        setEmailSent(true)
        toast.success('Verification email sent! Please check your inbox.', {
          duration: 5000,
        })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred. Please try again.')
      setEmailSent(false)
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
          queryParams: {
            prompt: 'select_account', // Force account selection
            access_type: 'offline',
          },
        },
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-[420px] border border-border shadow-[0_8px_40px_rgba(0,0,0,0.08)] rounded-[24px] bg-card overflow-hidden">
        <CardHeader className="pt-10 pb-6 px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-[14px] flex items-center justify-center shadow-lg shadow-primary/20">
              <img src="/kino-logo.svg" alt="Kino Logo" className="w-full h-full object-cover p-2" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            {isSignUp ? 'Create your account' : 'Sign in to Kino'}
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-3 text-base">
            {isSignUp 
              ? 'Start generating professional documents today' 
              : 'Welcome back to your document dashboard'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8 pt-2">
          {emailSent && (
            <Alert className="mb-6 border-primary/20 bg-primary/5 rounded-[16px]">
              <Mail className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm text-foreground">
                <strong className="font-semibold">Verification email sent!</strong>
                <br />
                Please check your inbox at <span className="font-medium">{email}</span> and click the confirmation link to activate your account.
                <br />
                <span className="text-xs text-muted-foreground mt-1 block">
                  Didn't receive it? Check your spam folder or try signing up again.
                </span>
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailSent(false)
                }}
                required 
                disabled={emailSent}
                className="h-12 border-border bg-input focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-[16px] transition-all"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
                {!isSignUp && (
                  <button type="button" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
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
                disabled={emailSent}
                className="h-12 border-border bg-input focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-[16px] transition-all"
              />
            </div>
            
            {/* Terms Agreement Checkbox - Only shown on sign up */}
            {isSignUp && (
              <div className="flex items-start space-x-3 py-2">
                <Checkbox 
                  id="terms" 
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  disabled={emailSent}
                  className="mt-0.5"
                />
                <label 
                  htmlFor="terms" 
                  className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                >
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:underline font-medium" target="_blank">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:underline font-medium" target="_blank">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            )}
            
            <Button 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg hover:shadow-xl rounded-[16px] transition-all" 
              type="submit" 
              disabled={loading || googleLoading || emailSent || (isSignUp && !agreedToTerms)}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {emailSent ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Email Sent
                </>
              ) : isSignUp ? (
                'Continue'
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground font-semibold tracking-wider">Or continue with</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-12 border-border hover:bg-secondary text-foreground font-medium shadow-sm hover:shadow-md rounded-[16px] transition-all flex items-center justify-center gap-3"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading || emailSent || (isSignUp && !agreedToTerms)}
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
              onClick={() => {
                setIsSignUp(!isSignUp)
                setEmailSent(false)
                setEmail('')
                setPassword('')
                setAgreedToTerms(false)
              }}
              className="text-sm text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Get started"}
            </button>
          </div>
        </CardContent>
      </Card>
      
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
        &copy; 2026 Kino SaaS Platform. Built with ❤️ in Hong Kong.
      </div>
    </div>
  )
}


