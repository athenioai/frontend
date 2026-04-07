'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { LayoutDashboard, MessagesSquare, CalendarDays, Settings, LogOut, Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'
import { MOTION } from '@/lib/motion'
import { logoutAction } from '@/app/(authenticated)/actions'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/conversas', label: 'Conversas', icon: MessagesSquare },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

interface SidebarProps {
  userName: string
}

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const navItems = (
    <nav className="flex-1 space-y-1 px-3 pt-5">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'group relative flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-all duration-200',
              active
                ? 'text-accent'
                : 'text-text-muted hover:text-text-primary',
            )}
          >
            {/* Animated active background */}
            {active && (
              <motion.div
                layoutId="sidebar-active-bg"
                className="absolute inset-0 rounded-xl bg-accent/[0.12]"
                style={{
                  boxShadow:
                    '0 0 20px rgba(79, 209, 197, 0.06), inset 0 1px 0 rgba(79, 209, 197, 0.08)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              />
            )}

            {/* Hover background (only when not active) */}
            {!active && (
              <div className="absolute inset-0 rounded-xl bg-[rgba(255,255,255,0.04)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            )}

            {/* Active left bar */}
            {active && (
              <motion.div
                layoutId="sidebar-active-bar"
                className="absolute -left-3 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-accent"
                style={{ boxShadow: '2px 0 8px rgba(79, 209, 197, 0.3)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              />
            )}

            <item.icon
              className={cn(
                'relative h-[18px] w-[18px] shrink-0 transition-colors duration-200',
                active
                  ? 'text-accent'
                  : 'text-text-subtle group-hover:text-text-muted',
              )}
            />
            <span className="relative">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  const userSection = (
    <div className="mt-auto">
      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[rgba(240,237,232,0.08)] to-transparent" />

      <div className="space-y-1 p-3 pb-4">
        {/* User row */}
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 text-[11px] font-bold text-accent">
            <div className="absolute inset-0 rounded-xl ring-1 ring-accent/25" />
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-text-primary">
              {userName}
            </p>
          </div>
        </div>

        {/* Logout */}
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-[13px] text-text-subtle transition-all duration-200 hover:bg-danger/[0.08] hover:text-danger"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="relative hidden lg:flex lg:w-[260px] lg:shrink-0 lg:flex-col lg:bg-surface-1">
        {/* Top accent glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-accent/[0.03] to-transparent" />

        {/* Right edge glow line */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-accent/25 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-accent/[0.02] to-transparent" />

        {/* Logo */}
        <div className="relative px-6 pt-7 pb-5">
          <Logo width={130} height={32} />
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-gradient-to-r from-accent/10 via-[rgba(240,237,232,0.06)] to-transparent" />

        {navItems}
        {userSection}
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-border-default bg-surface-1/90 px-4 backdrop-blur-xl lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-text-primary"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Logo width={100} height={25} />
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3, ease: MOTION.ease.out }}
              className="fixed inset-y-0 left-0 z-50 flex w-[300px] flex-col bg-surface-1 shadow-[4px_0_40px_rgba(0,0,0,0.4)] lg:hidden"
            >
              {/* Close */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-4 top-6 flex h-8 w-8 items-center justify-center rounded-xl text-text-subtle transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-text-primary"
                aria-label="Fechar menu"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Logo */}
              <div className="relative px-6 pt-7 pb-5">
                <Logo width={130} height={32} />
              </div>

              <div className="mx-5 h-px bg-gradient-to-r from-accent/10 via-[rgba(240,237,232,0.06)] to-transparent" />

              {navItems}
              {userSection}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
