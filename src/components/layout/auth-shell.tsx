'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { CommandPalette } from './command-palette'

interface AuthShellProps {
  children: React.ReactNode
  isAdmin: boolean
  userName: string
  alertCount: number
}

export function AuthShell({ children, isAdmin, userName, alertCount }: AuthShellProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    setSidebarCollapsed(localStorage.getItem('sidebar-collapsed') === 'true')

    function handleCollapse() {
      setSidebarCollapsed(localStorage.getItem('sidebar-collapsed') === 'true')
    }
    window.addEventListener('sidebar-collapse', handleCollapse)
    return () => window.removeEventListener('sidebar-collapse', handleCollapse)
  }, [])

  const toggleCommandPalette = useCallback(() => {
    setCommandPaletteOpen((prev) => !prev)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggleCommandPalette()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleCommandPalette])

  const marginLeft = sidebarCollapsed ? 64 : 256

  return (
    <div className="min-h-screen">
      <Sidebar isAdmin={isAdmin} userName={userName} />
      <div
        className="transition-[margin-left] duration-[250ms] max-lg:!ml-0"
        style={{ marginLeft }}
      >
        <Topbar
          userName={userName}
          isAdmin={isAdmin}
          alertCount={alertCount}
          onOpenCommandPalette={toggleCommandPalette}
        />
        {children}
      </div>
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        isAdmin={isAdmin}
      />
    </div>
  )
}
