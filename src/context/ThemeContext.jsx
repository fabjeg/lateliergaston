import { createContext, useContext, useEffect, useCallback } from 'react'
import { getSettings } from '../services/settingsApi'

const DEFAULTS = {
  headingColor: '#7a3540',
  subtitleColor: '#4a4a4a',
  textColor: '#1a1a1a',
  buttonBg: '#7a3540',
  buttonText: '#ffffff',
  announcementBg: '#f8f4f0',
  ctaBg: '#2c3e50'
}

const CSS_VAR_MAP = {
  headingColor: '--heading-color',
  subtitleColor: '--subtitle-color',
  textColor: '--body-text-color',
  buttonBg: '--button-bg',
  buttonText: '--button-text',
  announcementBg: '--announcement-bg',
  ctaBg: '--cta-bg'
}

const ThemeContext = createContext()

function applyColors(colors) {
  const root = document.documentElement
  for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
    root.style.setProperty(cssVar, colors[key] || DEFAULTS[key])
  }
}

export function ThemeProvider({ children }) {
  const loadAndApply = useCallback(async () => {
    const result = await getSettings()
    if (result.success && result.settings) {
      applyColors(result.settings)
    } else {
      applyColors(DEFAULTS)
    }
  }, [])

  useEffect(() => {
    loadAndApply()
  }, [loadAndApply])

  const refreshTheme = useCallback(() => {
    return loadAndApply()
  }, [loadAndApply])

  return (
    <ThemeContext.Provider value={{ refreshTheme, defaults: DEFAULTS }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
