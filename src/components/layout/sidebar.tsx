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
  Shield,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { MOTION } from '@/lib/motion'
import { Logo, LogoMark } from '@/components/ui/logo'

const NAV_MAIN = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/funil', label: 'Funil', icon: GitBranch },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/campanhas', label: 'Campanhas', icon: Megaphone },
]

const NAV_SECONDARY = [
  { href: '/relatorios', label: 'Relatórios', icon: FileText },
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
}

export function Sidebar({ isAdmin, userName }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
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
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: Shield, section: 'admin' }] : []),
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
          title={collapsed ? label : undefined}
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
          {!collapsed && (
            <span className="relative z-10">{label}</span>
          )}

          {/* Collapsed tooltip */}
          {collapsed && (
            <span className="pointer-events-none absolute left-full ml-3 z-50 rounded-lg border border-border-hover bg-surface-2 px-2.5 py-1.5 text-[11px] font-medium text-text-primary opacity-0 shadow-xl backdrop-blur-sm transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1">
              {label}
            </span>
          )}
        </Link>
      </motion.div>
    )
  }

  let itemIndex = 0

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: MOTION.duration.normal, ease: MOTION.ease.inOut }}
      style={{ overflow: 'clip' }}
      className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border-default bg-bg-base/80 backdrop-blur-xl lg:flex"
    >
      {/* Subtle inner edge highlight */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[rgba(255,255,255,0.04)] to-transparent" />

      {/* Logo + collapse toggle */}
      <div className="flex h-16 items-center justify-between px-4">
        {collapsed ? (
          <LogoMark size={28} />
        ) : (
          <Logo width={120} height={30} />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-subtle/50 transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)] hover:text-text-muted"
        >
          {collapsed ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <AnimatePresence>
          {!collapsed && (
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
          {!collapsed && (
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
            <NavItem href="/admin" label="Admin" icon={Shield} index={itemIndex++} />
          </>
        )}
      </nav>

      {/* Footer — user avatar */}
      <div className="border-t border-border-default p-3">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'px-2'}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent/5 text-[11px] font-bold text-accent ring-1 ring-accent/10">
            {getInitials(userName)}
          </div>
          {!collapsed && (
            <span className="truncate text-[13px] text-text-muted">{userName}</span>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
