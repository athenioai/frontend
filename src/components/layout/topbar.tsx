'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, LogOut, Search, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from './sidebar'
import { ThemeToggle } from './theme-toggle'
import { Logo } from '@/components/ui/logo'

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
          <SheetTrigger className="lg:hidden text-text-muted hover:text-text-primary p-2 transition-colors">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-border-default bg-bg-base p-0">
            <Sidebar isAdmin={isAdmin} userName={userName} />
          </SheetContent>
        </Sheet>

        {/* Logo for mobile */}
        <Logo width={110} height={28} className="lg:hidden" />

        {/* Breadcrumb for desktop */}
        <span className="hidden text-[13px] font-medium text-text-muted lg:block">{breadcrumb}</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Search trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden items-center gap-2 rounded-xl border border-border-default bg-[rgba(255,255,255,0.02)] px-3 py-1.5 text-[13px] text-text-subtle transition-all duration-200 hover:border-border-hover hover:bg-[rgba(255,255,255,0.04)] hover:text-text-muted sm:flex"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Buscar...</span>
          <kbd className="ml-2 rounded-md bg-[rgba(255,255,255,0.05)] px-1.5 py-0.5 text-[10px] font-medium text-text-subtle">
            ⌘K
          </kbd>
        </button>

        {/* Mobile search */}
        <button
          onClick={onOpenCommandPalette}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-all duration-200 hover:bg-[rgba(255,255,255,0.04)] hover:text-text-primary sm:hidden"
        >
          <Search className="h-4 w-4" />
        </button>

        <ThemeToggle />

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-all duration-200 hover:bg-[rgba(255,255,255,0.04)] hover:text-text-primary">
          <Bell className="h-4 w-4" />
          {alertCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white shadow-[0_0_6px_rgba(240,112,112,0.4)]">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

        {/* Separator */}
        <div className="mx-1 h-5 w-[1px] bg-border-default" />

        {/* User */}
        <div className="flex items-center gap-2">
          <span className="hidden text-[13px] text-text-muted lg:block">{userName}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-9 w-9 rounded-xl text-text-muted transition-all duration-200 hover:bg-[rgba(240,112,112,0.08)] hover:text-danger"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
