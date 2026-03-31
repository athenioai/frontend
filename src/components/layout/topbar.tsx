'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, LogOut, Search, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from './sidebar'
import { ThemeToggle } from './theme-toggle'

const BREADCRUMB_MAP: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/funil': 'Funil de Vendas',
  '/leads': 'Leads',
  '/campanhas': 'Campanhas',
  '/relatorios': 'Relatórios',
  '/configuracoes': 'Configurações',
  '/admin': 'Admin',
}

interface TopbarProps {
  userName: string
  isAdmin: boolean
  alertCount: number
  onOpenCommandPalette: () => void
}

export function Topbar({ userName, isAdmin, alertCount, onOpenCommandPalette }: TopbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const breadcrumb = BREADCRUMB_MAP[pathname] || pathname.split('/').filter(Boolean).pop() || 'Dashboard'

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-default bg-bg-base/70 px-4 backdrop-blur-xl">
      {/* Mobile menu */}
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="lg:hidden text-text-muted hover:text-text-primary p-2">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-border-default bg-bg-base p-0">
            <Sidebar isAdmin={isAdmin} userName={userName} />
          </SheetContent>
        </Sheet>

        {/* Logo for mobile */}
        <span className="text-[15px] tracking-tight lg:hidden">
          <span className="font-title text-lg font-bold text-accent">Athenio</span>
          <span className="text-text-subtle">.ai</span>
        </span>

        {/* Breadcrumb for desktop */}
        <span className="hidden text-[13px] font-medium text-text-muted lg:block">{breadcrumb}</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Search trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden items-center gap-2 rounded-lg border border-border-default bg-transparent px-3 py-1.5 text-sm text-text-subtle transition-colors hover:border-border-hover hover:text-text-muted sm:flex"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Buscar...</span>
          <kbd className="ml-2 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-text-subtle">
            ⌘K
          </kbd>
        </button>

        {/* Mobile search */}
        <button
          onClick={onOpenCommandPalette}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary sm:hidden"
        >
          <Search className="h-4 w-4" />
        </button>

        <ThemeToggle />

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary">
          <Bell className="h-4 w-4" />
          {alertCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

        {/* User dropdown */}
        <div className="ml-1 flex items-center gap-2">
          <span className="hidden text-sm text-text-muted lg:block">{userName}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-9 w-9 text-text-muted hover:text-danger"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
