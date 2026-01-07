"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './auth-context'
import { supabase } from './supabase'

export type Language = 'en' | 'zh-TW' | 'fr' | 'ja' | 'es' | 'de' | 'ko'

export const languageNames: Record<Language, string> = {
  'en': 'English',
  'zh-TW': '繁體中文',
  'fr': 'Français',
  'ja': '日本語',
  'es': 'Español',
  'de': 'Deutsch',
  'ko': '한국어'
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => Promise<void>
  t: (en: string, zh: string, others?: Partial<Record<Language, string>>) => string
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
          }, { onConflict: 'user_id' })
      } catch (error) {
        console.error('Failed to save language preference:', error)
      }
    }
  }

  const t = (en: string, zh: string, others?: Partial<Record<Language, string>>) => {
    if (language === 'zh-TW') return zh
    if (others && others[language]) return others[language]!
    return en
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, loading }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)


