'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from './sidebar'

export function Topbar({ userName, isAdmin }: { userName: string; isAdmin: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-default bg-bg-base/80 px-4 backdrop-blur-sm lg:pl-64">
      {/* Mobile menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="lg:hidden text-text-muted hover:text-text-primary p-2">
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-60 border-border-default bg-bg-base p-0">
          <Sidebar isAdmin={isAdmin} />
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-4">
        <span className="text-sm text-text-muted">{userName}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-text-muted hover:text-danger"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
