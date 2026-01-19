"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './auth-context'
import { supabase } from './supabase'
import { getTranslation } from './translations'

export type Language = 'en' | 'zh-TW'

export const languageNames: Record<Language, string> = {
  'en': 'English',
  'zh-TW': '繁體中文'
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => Promise<void>
  t: (key: string) => string
  loading: boolean
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  t: (key: string) => key,
  loading: true,
})

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()
  const [language, setLanguageState] = useState<Language>('en')
  const [loading, setLoading] = useState(false) // Don't block initial render

  useEffect(() => {
    // Set loading to false immediately to not block render
    setLoading(false)
    
    // Load language preference in background (non-blocking)
    if (user) {
      // Use setTimeout to defer the query and not block initial render
      const timeoutId = setTimeout(async () => {
        try {
          const { data, error } = await supabase
            .schema('kino')
            .from('company_settings')
            .select('ui_language')
            .eq('user_id', user.id)
            .single()
          
          // Handle case where no settings exist yet (PGRST116 = no rows returned)
          if (error && error.code !== 'PGRST116') {
            console.error('Failed to load language preference:', error)
          } else if (data?.ui_language) {
            setLanguageState(data.ui_language as Language)
          }
        } catch (error) {
          console.error('Failed to load language preference:', error)
        }
      }, 0) // Defer to next tick
      
      return () => clearTimeout(timeoutId)
    }
  }, [user])

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang)
    if (user) {
      try {
        await supabase
          .schema('kino')
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

  const t = (key: string) => {
    return getTranslation(key, language)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, loading }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)


