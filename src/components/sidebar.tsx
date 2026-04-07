'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard,
  MessagesSquare,
  CalendarDays,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  User,
  Users,
} from 'lucide-react'
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

const ADMIN_ITEMS = [
  { href: '/admin/planos', label: 'Planos', icon: CreditCard },
  { href: '/admin/usuarios', label: 'Usuários', icon: Users },
]

interface SidebarProps {
  userName: string
}

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed))
  }, [collapsed])

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  // ── Desktop nav ──

  const desktopNav = (
    <nav className="flex-1 space-y-1 px-2 pt-5">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          isActive={isActive(item.href)}
          collapsed={collapsed}
        />
      ))}

      {/* Admin section */}
      <div className="pt-4 pb-1">
        <div className="mx-1 h-px bg-gradient-to-r from-transparent via-[rgba(240,237,232,0.06)] to-transparent" />
        {!collapsed && (
          <p className="mt-3 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle">
            Admin
          </p>
        )}
      </div>
      {ADMIN_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          isActive={isActive(item.href)}
          collapsed={collapsed}
        />
      ))}
    </nav>
  )

  // ── Mobile nav (always expanded) ──

  const mobileNav = (
    <nav className="flex-1 space-y-1 px-3 pt-5">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          isActive={isActive(item.href)}
          collapsed={false}
          onClick={() => setMobileOpen(false)}
        />
      ))}
      <div className="pt-4 pb-1">
        <div className="mx-2 h-px bg-gradient-to-r from-transparent via-[rgba(240,237,232,0.06)] to-transparent" />
        <p className="mt-3 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle">
          Admin
        </p>
      </div>
      {ADMIN_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          isActive={isActive(item.href)}
          collapsed={false}
          onClick={() => setMobileOpen(false)}
        />
      ))}
    </nav>
  )

  // ── User section ──

  const userDropdown = (
    <AnimatePresence>
      {userMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setUserMenuOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: MOTION.ease.out }}
            className={cn(
              'absolute bottom-full z-50 mb-2 overflow-hidden rounded-xl border border-border-default bg-surface-2 shadow-[0_-4px_32px_rgba(0,0,0,0.3)]',
              collapsed ? 'left-2 right-2' : 'left-3 right-3',
            )}
          >
            <div className="p-1.5">
              <Link
                href="/configuracoes?tab=perfil"
                onClick={() => {
                  setUserMenuOpen(false)
                  setMobileOpen(false)
                }}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-text-muted transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-text-primary"
              >
                <User className="h-4 w-4 shrink-0" />
                <span className={collapsed ? 'hidden' : ''}>Meu perfil</span>
              </Link>
              <Link
                href="/configuracoes"
                onClick={() => {
                  setUserMenuOpen(false)
                  setMobileOpen(false)
                }}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-text-muted transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-text-primary"
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span className={collapsed ? 'hidden' : ''}>
                  Configurações
                </span>
              </Link>
              <div className="my-1.5 mx-2 h-px bg-border-default/50" />
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-text-muted transition-colors hover:bg-danger/[0.08] hover:text-danger"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span className={collapsed ? 'hidden' : ''}>Sair</span>
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  const userButton = (
    <button
      onClick={() => setUserMenuOpen(!userMenuOpen)}
      className={cn(
        'flex w-full items-center rounded-xl transition-all duration-150',
        collapsed
          ? 'justify-center px-0 py-2.5'
          : 'gap-3 px-3 py-2.5',
        userMenuOpen
          ? 'bg-[rgba(255,255,255,0.05)]'
          : 'hover:bg-[rgba(255,255,255,0.03)]',
      )}
    >
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 text-[11px] font-bold text-accent">
        <div className="absolute inset-0 rounded-xl ring-1 ring-accent/25" />
        {initials}
      </div>
      {!collapsed && (
        <>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-[13px] font-medium text-text-primary">
              {userName}
            </p>
          </div>
          <ChevronUp
            className={cn(
              'h-4 w-4 text-text-subtle transition-transform duration-200',
              !userMenuOpen && 'rotate-180',
            )}
          />
        </>
      )}
    </button>
  )

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className={cn(
          'relative hidden lg:flex lg:shrink-0 lg:flex-col lg:bg-surface-1 transition-[width] duration-200 ease-out',
          collapsed ? 'lg:w-16' : 'lg:w-[260px]',
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-accent/[0.03] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-accent/25 to-transparent" />

        {/* Header: logo + toggle */}
        <div
          className={cn(
            'relative flex items-center pt-5 pb-4',
            collapsed ? 'justify-center px-2' : 'justify-between px-5',
          )}
        >
          {collapsed ? (
            <button
              onClick={() => {
                setCollapsed(false)
                setUserMenuOpen(false)
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-subtle transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-text-muted"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          ) : (
            <>
              <Logo width={120} height={30} />
              <button
                onClick={() => {
                  setCollapsed(true)
                  setUserMenuOpen(false)
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-text-subtle transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-text-muted"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>

        <div
          className={cn(
            'h-px bg-gradient-to-r from-accent/10 via-[rgba(240,237,232,0.06)] to-transparent',
            collapsed ? 'mx-2' : 'mx-5',
          )}
        />

        {desktopNav}

        {/* User section */}
        <div className="relative mt-auto">
          <div
            className={cn(
              'h-px bg-gradient-to-r from-transparent via-[rgba(240,237,232,0.08)] to-transparent',
              collapsed ? 'mx-2' : 'mx-5',
            )}
          />
          {userDropdown}
          <div className={cn('pb-4', collapsed ? 'px-2 pt-3' : 'px-3 pt-3')}>
            {userButton}
          </div>
        </div>
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
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-4 top-6 flex h-8 w-8 items-center justify-center rounded-xl text-text-subtle transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-text-primary"
                aria-label="Fechar menu"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="relative px-6 pt-7 pb-5">
                <Logo width={130} height={32} />
              </div>
              <div className="mx-5 h-px bg-gradient-to-r from-accent/10 via-[rgba(240,237,232,0.06)] to-transparent" />
              {mobileNav}
              {/* Mobile user section (always expanded) */}
              <div className="relative mt-auto">
                <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[rgba(240,237,232,0.08)] to-transparent" />
                {userDropdown}
                <div className="px-3 pt-3 pb-4">{userButton}</div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function NavLink({
  item,
  isActive: active,
  collapsed = false,
  onClick,
}: {
  item: {
    href: string
    label: string
    icon: React.ComponentType<{ className?: string }>
  }
  isActive: boolean
  collapsed?: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        'group relative flex items-center rounded-xl text-[13px] font-medium transition-all duration-200',
        collapsed
          ? 'h-10 justify-center px-0'
          : 'h-10 gap-3 px-3',
        active ? 'text-accent' : 'text-text-muted hover:text-text-primary',
      )}
    >
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
      {!active && (
        <div className="absolute inset-0 rounded-xl bg-[rgba(255,255,255,0.04)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      )}
      {active && !collapsed && (
        <motion.div
          layoutId="sidebar-active-bar"
          className="absolute -left-2 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-accent"
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
      {!collapsed && <span className="relative">{item.label}</span>}
    </Link>
  )
}
