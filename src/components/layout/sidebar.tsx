'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard,
  GitBranch,
  Users,
  Megaphone,
  FileText,
  Settings,
  Headset,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Package,
  BookOpen,
  MessageSquare,
  Bell,
  Building2,
  AlertTriangle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { MOTION } from '@/lib/motion'
import { Logo, LogoMark } from '@/components/ui/logo'

const NAV_MAIN = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/funil', label: 'Funil', icon: GitBranch },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/campanhas', label: 'Campanhas', icon: Megaphone },
  { href: '/conversas', label: 'Conversas', icon: MessageSquare },
  { href: '/alertas', label: 'Alertas', icon: Bell },
]

const NAV_ADMIN = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/tenants', label: 'Clientes', icon: Building2 },
  { href: '/admin/dlq', label: 'DLQ', icon: AlertTriangle },
]

const NAV_SECONDARY = [
  { href: '/produtos', label: 'Produtos', icon: Package },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  { href: '/relatorios', label: 'Relatórios', icon: FileText },
  { href: '/suporte', label: 'Suporte', icon: Headset },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface SidebarProps {
  isAdmin: boolean
  userName: string
  mobile?: boolean
}

export function Sidebar({ isAdmin, userName, mobile = false }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (mobile) {
      setMounted(true)
      return
    }
    const stored = localStorage.getItem('sidebar-collapsed') === 'true'
    if (stored !== collapsed) setCollapsed(stored)
    // Small delay so the stagger animation plays on first render
    requestAnimationFrame(() => setMounted(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed))
    window.dispatchEvent(new Event('sidebar-collapse'))
  }, [collapsed])

  const allItems = [
    ...NAV_MAIN.map((item) => ({ ...item, section: 'main' })),
    ...NAV_SECONDARY.map((item) => ({ ...item, section: 'secondary' })),
    ...(isAdmin ? NAV_ADMIN.map((item) => ({ ...item, section: 'admin' })) : []),
  ]


  function NavItem({
    href,
    label,
    icon: Icon,
    index,
  }: {
    href: string
    label: string
    icon: typeof LayoutDashboard
    index: number
  }) {
    const isActive = pathname === href || pathname.startsWith(href + '/')
    return (
      <motion.div
        initial={mounted ? false : { opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.35,
          ease: MOTION.ease.out,
          delay: mounted ? 0 : 0.05 + index * 0.04,
        }}
      >
        <Link
          href={href}
          title={effectiveCollapsed ? label : undefined}
          className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
            isActive
              ? 'text-accent'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {/* Active background — gradient glow */}
          {isActive && (
            <motion.span
              layoutId="sidebar-active-bg"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent/10 via-accent/[0.06] to-transparent"
              transition={{ duration: 0.25, ease: MOTION.ease.out }}
            />
          )}

          {/* Active left indicator — glowing bar */}
          {isActive && (
            <motion.span
              layoutId="sidebar-active-bar"
              className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-accent shadow-[0_0_8px_rgba(79,209,197,0.5)]"
              transition={{ duration: 0.25, ease: MOTION.ease.out }}
            />
          )}

          {/* Hover background */}
          {!isActive && (
            <span className="absolute inset-0 rounded-xl bg-[rgba(255,255,255,0.00)] transition-colors duration-200 group-hover:bg-[rgba(255,255,255,0.04)]" />
          )}

          {/* Icon with hover scale */}
          <span className="relative z-10 transition-transform duration-200 group-hover:scale-110">
            <Icon className={`h-[16px] w-[16px] shrink-0 ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-90'} transition-opacity duration-200`} />
          </span>

          {/* Label */}
          {!effectiveCollapsed && (
            <span className="relative z-10 whitespace-nowrap">{label}</span>
          )}
        </Link>
      </motion.div>
    )
  }

  const effectiveCollapsed = mobile ? false : collapsed

  let itemIndex = 0

  return (
    <motion.aside
      initial={false}
      animate={{ width: mobile ? '100%' : (effectiveCollapsed ? 64 : 256) }}
      transition={{ duration: MOTION.duration.normal, ease: MOTION.ease.inOut }}
      className={
        mobile
          ? 'flex h-full w-full flex-col overflow-hidden bg-bg-base'
          : 'fixed left-0 top-0 z-40 hidden h-screen flex-col overflow-hidden border-r border-border-default bg-bg-base/80 backdrop-blur-xl lg:flex'
      }
    >
      {/* Subtle inner edge highlight */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[rgba(255,255,255,0.04)] to-transparent" />

      {/* Logo + collapse toggle */}
      <div className="flex h-16 items-center justify-between px-4">
        {effectiveCollapsed ? (
          <LogoMark size={28} />
        ) : (
          <Logo width={120} height={30} />
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-subtle/50 transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)] hover:text-text-muted"
          >
            {collapsed ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-hidden px-2 py-2">
        <AnimatePresence>
          {!effectiveCollapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-subtle/40"
            >
              Menu
            </motion.p>
          )}
        </AnimatePresence>
        <div className="space-y-0.5">
          {NAV_MAIN.map((item) => (
            <NavItem key={item.href} {...item} index={itemIndex++} />
          ))}
        </div>

        {/* Gradient separator */}
        <div className="my-4 mx-3 h-[1px] bg-gradient-to-r from-transparent via-border-default to-transparent" />

        <AnimatePresence>
          {!effectiveCollapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-subtle/40"
            >
              Gestão
            </motion.p>
          )}
        </AnimatePresence>
        <div className="space-y-0.5">
          {NAV_SECONDARY.map((item) => (
            <NavItem key={item.href} {...item} index={itemIndex++} />
          ))}
        </div>

        {isAdmin && (
          <>
            <div className="my-4 mx-3 h-[1px] bg-gradient-to-r from-transparent via-border-default to-transparent" />
            <AnimatePresence>
              {!effectiveCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-subtle/40"
                >
                  Admin
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {NAV_ADMIN.map((item) => (
                <NavItem key={item.href} {...item} index={itemIndex++} />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Footer — user + logout */}
      <div className="border-t border-border-default p-3">
        <div className={`flex items-center gap-3 ${effectiveCollapsed ? 'justify-center' : 'px-2'}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent/5 text-[11px] font-bold text-accent ring-1 ring-accent/10">
            {getInitials(userName)}
          </div>
          {!effectiveCollapsed && (
            <>
              <span className="flex-1 truncate text-[13px] text-text-muted">{userName}</span>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' })
                  router.push('/login')
                }}
                title="Sair"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-text-subtle/50 transition-all duration-200 hover:bg-[rgba(240,112,112,0.08)] hover:text-danger"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
        {effectiveCollapsed && (
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' })
              router.push('/login')
            }}
            title="Sair"
            className="mt-2 flex w-full items-center justify-center rounded-lg p-2 text-text-subtle/50 transition-all duration-200 hover:bg-[rgba(240,112,112,0.08)] hover:text-danger"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </motion.aside>
  )
}
