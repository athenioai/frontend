'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, GitBranch, Users, Megaphone, FileText,
  Settings, Shield, Search, FileDown
} from 'lucide-react'
import { MOTION } from '@/lib/motion'

interface CommandItem {
  id: string
  label: string
  icon: typeof LayoutDashboard
  action: () => void
  group: 'Navegação' | 'Ações'
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  isAdmin: boolean
}

export function CommandPalette({ open, onClose, isAdmin }: CommandPaletteProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const navigate = useCallback((path: string) => {
    onClose()
    router.push(path)
  }, [onClose, router])

  const items: CommandItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard'), group: 'Navegação' },
    { id: 'funil', label: 'Funil de Vendas', icon: GitBranch, action: () => navigate('/funil'), group: 'Navegação' },
    { id: 'leads', label: 'Leads', icon: Users, action: () => navigate('/leads'), group: 'Navegação' },
    { id: 'campanhas', label: 'Campanhas', icon: Megaphone, action: () => navigate('/campanhas'), group: 'Navegação' },
    { id: 'relatorios', label: 'Relatórios', icon: FileText, action: () => navigate('/relatorios'), group: 'Navegação' },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, action: () => navigate('/configuracoes'), group: 'Navegação' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Shield, action: () => navigate('/admin'), group: 'Navegação' as const }] : []),
    { id: 'export-pdf', label: 'Exportar relatório PDF', icon: FileDown, action: () => navigate('/relatorios'), group: 'Ações' },
    { id: 'settings', label: 'Abrir configurações', icon: Settings, action: () => navigate('/configuracoes'), group: 'Ações' },
  ]

  const filtered = query
    ? items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : items

  const groups = Array.from(new Set(filtered.map((i) => i.group)))

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => (i + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault()
      filtered[selectedIndex].action()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION.duration.fast }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: MOTION.duration.fast, ease: MOTION.ease.out }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border-default bg-surface-1 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Buscar"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border-default px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-text-subtle" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar páginas, ações..."
                className="flex-1 bg-transparent text-lg text-text-primary placeholder:text-text-subtle outline-none"
              />
              <kbd className="rounded bg-surface-2 px-2 py-0.5 text-xs text-text-subtle">Esc</kbd>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-text-subtle">
                  Nenhum resultado encontrado
                </p>
              )}
              {groups.map((group) => (
                <div key={group}>
                  <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-text-subtle">
                    {group}
                  </p>
                  {filtered
                    .filter((item) => item.group === group)
                    .map((item) => {
                      const index = filtered.indexOf(item)
                      return (
                        <button
                          key={item.id}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                            index === selectedIndex
                              ? 'bg-accent/8 text-accent'
                              : 'text-text-muted hover:text-text-primary'
                          }`}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
