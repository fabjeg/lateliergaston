import { createContext, useContext, useEffect, useCallback, useMemo } from 'react'
import { getSettings, invalidateSettingsCache } from '../services/settingsApi'

const DEFAULTS = {
  headingColor: '#7a3540',
  subtitleColor: '#4a4a4a',
  textColor: '#1a1a1a',
  buttonBg: '#7a3540',
  buttonText: '#ffffff',
  announcementBg: '#f8f4f0',
  ctaBg: '#2c3e50',
  fontFamily: 'Zen Loop',
  fontSize: '1.6rem',
  fontWeight: '500'
}

const CSS_VAR_MAP = {
  headingColor: '--heading-color',
  subtitleColor: '--subtitle-color',
  textColor: '--body-text-color',
  buttonBg: '--button-bg',
  buttonText: '--button-text',
  announcementBg: '--announcement-bg',
  ctaBg: '--cta-bg',
  fontFamily: '--body-font',
  fontSize: '--body-font-size',
  fontWeight: '--body-font-weight'
}

const ThemeContext = createContext()

function applyColors(colors) {
  const root = document.documentElement
  for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
    let value = colors[key] || DEFAULTS[key]
    if (key === 'fontFamily') {
      value = `'${value}'`
    }
    root.style.setProperty(cssVar, value)
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
    invalidateSettingsCache()
    return loadAndApply()
  }, [loadAndApply])

  const value = useMemo(() => ({
    refreshTheme,
    defaults: DEFAULTS
  }), [refreshTheme])

  return (
    <ThemeContext.Provider value={value}>
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
