'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import {
  LayoutDashboard,
  GitBranch,
  Users,
  Megaphone,
  FileText,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { MOTION } from '@/lib/motion'

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
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed))
    window.dispatchEvent(new Event('sidebar-collapse'))
  }, [collapsed])

  function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: typeof LayoutDashboard }) {
    const isActive = pathname === href || pathname.startsWith(href + '/')
    return (
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-accent/8 text-accent'
            : 'text-text-muted hover:bg-[var(--sidebar-item-active)] hover:text-text-primary'
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-accent" />
        )}
        <Icon className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && <span>{label}</span>}
        {collapsed && (
          <span className="pointer-events-none absolute left-full ml-2 rounded-md bg-surface-2 px-2 py-1 text-xs text-text-primary opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            {label}
          </span>
        )}
      </Link>
    )
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: MOTION.duration.normal, ease: MOTION.ease.inOut }}
      className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border-default bg-bg-base lg:flex"
    >
      {/* Logo */}
      <div className="flex h-14 items-center px-4">
        <span className="font-title text-lg font-bold text-accent">
          {collapsed ? 'A' : 'Athenio.ai'}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-0.5">
          {NAV_MAIN.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>

        <div className="my-3 mx-2 border-t border-border-default" />

        <div className="space-y-0.5">
          {NAV_SECONDARY.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>

        {isAdmin && (
          <>
            <div className="my-3 mx-2 border-t border-border-default" />
            <NavItem href="/admin" label="Admin" icon={Shield} />
          </>
        )}
      </nav>

      {/* Footer: avatar + collapse toggle */}
      <div className="border-t border-border-default p-2">
        {!collapsed && (
          <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
              {getInitials(userName)}
            </div>
            <span className="truncate text-sm text-text-muted">{userName}</span>
          </div>
        )}
        {collapsed && (
          <div className="mb-2 flex justify-center py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
              {getInitials(userName)}
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-text-subtle hover:bg-[var(--sidebar-item-active)] hover:text-text-primary transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </motion.aside>
  )
}
