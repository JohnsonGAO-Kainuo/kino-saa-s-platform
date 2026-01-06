"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './auth-context'
import { supabase } from './supabase'

type Language = 'en' | 'zh-TW'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => Promise<void>
  t: (en: string, zh: string) => string
  loading: boolean
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  t: (en: string) => en,
  loading: true,
})

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()
  const [language, setLanguageState] = useState<Language>('en')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLanguagePreference() {
      if (user) {
        try {
          const { data } = await supabase
            .from('company_settings')
            .select('ui_language')
            .eq('user_id', user.id)
            .single()
          
          if (data?.ui_language) {
            setLanguageState(data.ui_language as Language)
          }
        } catch (error) {
          console.error('Failed to load language preference:', error)
        }
      }
      setLoading(false)
    }
    loadLanguagePreference()
  }, [user])

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang)
    if (user) {
      try {
        await supabase
          .from('company_settings')
          .upsert({
            user_id: user.id,
            ui_language: lang,
            updated_at: new Date().toISOString(),
          })
      } catch (error) {
        console.error('Failed to save language preference:', error)
      }
    }
  }

  const t = (en: string, zh: string) => {
    return language === 'zh-TW' ? zh : en
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, loading }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)


