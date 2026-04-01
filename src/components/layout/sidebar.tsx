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

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed') === 'true'
    if (stored !== collapsed) setCollapsed(stored)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
          isActive
            ? 'bg-accent/8 text-accent'
            : 'text-text-muted hover:bg-[rgba(255,255,255,0.03)] hover:text-text-primary'
        }`}
      >
        {isActive && (
          <motion.span
            layoutId="sidebar-active"
            className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-accent shadow-[0_0_8px_rgba(79,209,197,0.4)]"
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
        <Icon className="h-[16px] w-[16px] shrink-0 opacity-80" />
        {!collapsed && <span>{label}</span>}
        {collapsed && (
          <span className="pointer-events-none absolute left-full ml-3 rounded-lg border border-border-default bg-surface-2 px-2.5 py-1.5 text-[11px] font-medium text-text-primary opacity-0 shadow-xl backdrop-blur-sm transition-opacity group-hover:opacity-100">
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
      className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border-default bg-bg-base/80 backdrop-blur-xl lg:flex"
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-4">
        {collapsed ? (
          <LogoMark size={28} />
        ) : (
          <Logo width={120} height={30} />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <p className={`mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-subtle/50 ${collapsed ? 'sr-only' : ''}`}>
          Menu
        </p>
        <div className="space-y-0.5">
          {NAV_MAIN.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>

        <div className="my-4 mx-3 border-t border-border-default" />

        <p className={`mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-subtle/50 ${collapsed ? 'sr-only' : ''}`}>
          Gestão
        </p>
        <div className="space-y-0.5">
          {NAV_SECONDARY.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>

        {isAdmin && (
          <>
            <div className="my-4 mx-3 border-t border-border-default" />
            <NavItem href="/admin" label="Admin" icon={Shield} />
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-border-default p-3">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'px-2'}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent/5 text-[11px] font-bold text-accent ring-1 ring-accent/10">
            {getInitials(userName)}
          </div>
          {!collapsed && (
            <span className="truncate text-[13px] text-text-muted">{userName}</span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mt-2 flex w-full items-center justify-center rounded-lg p-2 text-text-subtle/50 transition-colors hover:bg-[rgba(255,255,255,0.03)] hover:text-text-muted"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>
    </motion.aside>
  )
}
