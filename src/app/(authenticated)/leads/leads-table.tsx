'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Search, ArrowUpDown, ArrowUp, ArrowDown,
  Flame, Thermometer, Snowflake,
  SmilePlus, Meh, Frown,
  ChevronLeft, ChevronRight, Users as UsersIcon,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { TEMPERATURA_COLORS, COLORS } from '@/lib/constants/theme'
import { formatPhone } from '@/lib/utils/format'
import type { Lead } from '@/lib/types'

const PER_PAGE_OPTIONS = [10, 25, 50]

const TEMP_CONFIG = {
  hot: { color: TEMPERATURA_COLORS.hot, icon: Flame, label: 'Quente' },
  warm: { color: TEMPERATURA_COLORS.warm, icon: Thermometer, label: 'Morno' },
  cold: { color: TEMPERATURA_COLORS.cold, icon: Snowflake, label: 'Frio' },
} as const

const ESTAGIO_CONFIG: Record<string, { label: string; color: string }> = {
  captured: { label: 'Captado', color: COLORS.accent },
  qualified: { label: 'Qualificado', color: '#3BBEB2' },
  negotiation: { label: 'Negociação', color: COLORS.emerald },
  converted: { label: 'Convertido', color: COLORS.gold },
  lost: { label: 'Perdido', color: COLORS.danger },
}

const SENTIMENTO_CONFIG = {
  positive: { icon: SmilePlus, color: COLORS.emerald, label: 'Positivo' },
  neutral: { icon: Meh, color: COLORS.textMuted, label: 'Neutro' },
  negative: { icon: Frown, color: COLORS.danger, label: 'Negativo' },
} as const

const TEMP_OPTIONS = ['todos', 'hot', 'warm', 'cold'] as const
const ESTAGIO_OPTIONS = ['todos', 'captured', 'qualified', 'negotiation', 'converted', 'lost'] as const

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

export function LeadsTable({ leads: initialLeads }: { leads: Lead[] }) {
  const searchParams = useSearchParams()
  const paramEstagio = searchParams.get('estagio')
  const initialEstagio = paramEstagio || 'Todos'

  const [busca, setBusca] = useState('')
  const [tempFilter, setTempFilter] = useState<string>('Todos')
  const [estagioFilter, setEstagioFilter] = useState<string>(initialEstagio)
  const [sortBy, setSortBy] = useState<keyof Lead>('updated_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const router = useRouter()

  const filtered = useMemo(() => {
    let result = [...initialLeads]

    if (busca) {
      const q = busca.toLowerCase()
      result = result.filter((l) => l.name.toLowerCase().includes(q) || l.phone.includes(q))
    }
    if (tempFilter !== 'Todos') {
      result = result.filter((l) => l.temperature === tempFilter)
    }
    if (estagioFilter !== 'Todos') {
      result = result.filter((l) => l.funnel_stage === estagioFilter)
    }

    result.sort((a, b) => {
      const av = a[sortBy], bv = b[sortBy]
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortOrder === 'desc' ? -cmp : cmp
    })

    return result
  }, [initialLeads, busca, tempFilter, estagioFilter, sortBy, sortOrder])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, filtered.length)

  function toggleSort(col: keyof Lead) {
    if (sortBy === col) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(col)
      setSortOrder('asc')
    }
  }

  function SortIcon({ col }: { col: keyof Lead }) {
    if (sortBy !== col) return <ArrowUpDown className="h-3 w-3 opacity-30" />
    return sortOrder === 'asc'
      ? <ArrowUp className="h-3 w-3 text-accent" />
      : <ArrowDown className="h-3 w-3 text-accent" />
  }

  return (
    <div className="space-y-5">
      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPage(1) }}
            className="h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] pl-10 text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"
          />
        </div>

        <Select value={tempFilter} onValueChange={(v: string | null) => { if (v) { setTempFilter(v); setPage(1) } }}>
          <SelectTrigger className="w-full sm:w-40 !h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-[13px] text-text-muted transition-all duration-200 hover:border-border-hover">
            <SelectValue placeholder="Temperatura" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border-default bg-surface-2 p-1">
            <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="hot">🔥 Quente</SelectItem>
              <SelectItem value="warm">🌡️ Morno</SelectItem>
              <SelectItem value="cold">❄️ Frio</SelectItem>
            </SelectContent>
          </Select>

        <Select value={estagioFilter} onValueChange={(v: string | null) => { if (v) { setEstagioFilter(v); setPage(1) } }}>
          <SelectTrigger className="w-full sm:w-40 !h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-[13px] text-text-muted transition-all duration-200 hover:border-border-hover">
            <SelectValue placeholder="Estágio" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border-default bg-surface-2 p-1">
            <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="captured">Captado</SelectItem>
              <SelectItem value="qualified">Qualificado</SelectItem>
              <SelectItem value="negotiation">Negociação</SelectItem>
              <SelectItem value="converted">Convertido</SelectItem>
              <SelectItem value="lost">Perdido</SelectItem>
            </SelectContent>
          </Select>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border-default md:block">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border-default bg-[rgba(240,237,232,0.03)]">
              {[
                { key: 'name', label: 'Lead' },
                { key: 'temperature', label: 'Temperatura' },
                { key: 'funnel_stage', label: 'Estágio' },
                { key: 'score', label: 'Score' },
                { key: 'sentiment', label: 'Sentimento' },
                { key: 'assigned_agent', label: 'Agente' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="cursor-pointer px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-text-subtle transition-colors hover:text-text-muted"
                  onClick={() => toggleSort(key as keyof Lead)}
                >
                  <span className="flex items-center gap-1.5">
                    {label}
                    <SortIcon col={key as keyof Lead} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((lead) => {
              const temp = TEMP_CONFIG[lead.temperature]
              const TempIcon = temp.icon
              const estagio = ESTAGIO_CONFIG[lead.funnel_stage]
              const sentimento = SENTIMENTO_CONFIG[lead.sentiment]
              const SentIcon = sentimento.icon

              return (
                <tr key={lead.id} onClick={() => router.push(`/leads/${lead.id}`)} className="group cursor-pointer border-b border-border-default/50 transition-colors hover:bg-[rgba(255,255,255,0.02)]">
                  {/* Lead — avatar + name + phone + product */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(240,237,232,0.05)] text-[10px] font-bold text-text-subtle">
                        {getInitials(lead.name)}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{lead.name}</p>
                        <p className="text-[11px] text-text-subtle">{formatPhone(lead.phone)} · {lead.product_interest}</p>
                      </div>
                    </div>
                  </td>

                  {/* Temperatura — badge with icon */}
                  <td className="px-4 py-3.5">
                    <span
                      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold"
                      style={{ backgroundColor: `${temp.color}15`, color: temp.color }}
                    >
                      <TempIcon className="h-2.5 w-2.5" />
                      {temp.label}
                    </span>
                  </td>

                  {/* Estágio — colored badge */}
                  <td className="px-4 py-3.5">
                    {estagio ? (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold"
                        style={{ backgroundColor: `${estagio.color}12`, color: estagio.color }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: estagio.color }} />
                        {estagio.label}
                      </span>
                    ) : (
                      <span className="text-text-subtle">{lead.funnel_stage}</span>
                    )}
                  </td>

                  {/* Score — progress ring */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="relative h-6 w-6">
                        <svg className="h-6 w-6 -rotate-90" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(240,237,232,0.06)" strokeWidth="2.5" />
                          <circle
                            cx="12" cy="12" r="10" fill="none"
                            stroke={lead.score >= 70 ? COLORS.emerald : lead.score >= 40 ? COLORS.gold : COLORS.danger}
                            strokeWidth="2.5" strokeLinecap="round"
                            strokeDasharray={`${(lead.score / 100) * 62.83} 62.83`}
                          />
                        </svg>
                      </div>
                      <span className="text-[12px] font-medium text-text-primary">{lead.score}</span>
                    </div>
                  </td>

                  {/* Sentimento — icon + label */}
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: sentimento.color }}>
                      <SentIcon className="h-3.5 w-3.5" />
                      {sentimento.label}
                    </span>
                  </td>

                  {/* Agente */}
                  <td className="px-4 py-3.5">
                    {lead.assigned_agent ? (
                      <span className="text-[12px] font-medium text-text-muted capitalize">
                        {lead.assigned_agent}
                        <span className="ml-1 text-text-subtle">
                          ({lead.assigned_agent === 'ares' ? 'Marketing' : lead.assigned_agent === 'kairos' ? 'Comercial' : 'Orquestrador'})
                        </span>
                      </span>
                    ) : (
                      <span className="text-[12px] text-text-subtle">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {paginated.map((lead) => {
          const temp = TEMP_CONFIG[lead.temperature]
          const TempIcon = temp.icon
          const estagio = ESTAGIO_CONFIG[lead.funnel_stage]

          return (
            <div key={lead.id} onClick={() => router.push(`/leads/${lead.id}`)} className="card-surface cursor-pointer p-4 transition-colors hover:border-border-hover">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(240,237,232,0.05)] text-[10px] font-bold text-text-subtle">
                    {getInitials(lead.name)}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-text-primary">{lead.name}</p>
                    <p className="text-[11px] text-text-subtle">{formatPhone(lead.phone)}</p>
                  </div>
                </div>
                <span
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold shrink-0"
                  style={{ backgroundColor: `${temp.color}15`, color: temp.color }}
                >
                  <TempIcon className="h-2.5 w-2.5" />
                  {temp.label}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {estagio && (
                  <span
                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold"
                    style={{ backgroundColor: `${estagio.color}12`, color: estagio.color }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: estagio.color }} />
                    {estagio.label}
                  </span>
                )}
                <span className="text-[11px] text-text-subtle">Score {lead.score}</span>
                <span className="text-[11px] text-text-subtle">· {lead.product_interest}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(240,237,232,0.04)]">
            <UsersIcon className="h-5 w-5 text-text-subtle" />
          </div>
          <p className="text-[14px] font-medium text-text-muted">Nenhum lead encontrado</p>
          <p className="mt-1 text-[13px] text-text-subtle">Tente ajustar os filtros ou a busca</p>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-text-subtle">
            Mostrando <span className="font-medium text-text-muted">{start}–{end}</span> de <span className="font-medium text-text-muted">{filtered.length}</span> leads
          </p>
          <div className="flex items-center gap-1.5">
            {/* Per page */}
            <div className="flex items-center gap-1.5 mr-4">
              {PER_PAGE_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => { setPerPage(n); setPage(1) }}
                  className={`rounded-lg px-2.5 py-1 text-[12px] font-medium transition-all duration-200 ${
                    perPage === n
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-subtle hover:bg-[rgba(240,237,232,0.04)] hover:text-text-muted'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-all duration-200 hover:bg-[rgba(240,237,232,0.04)] disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[60px] text-center text-[12px] font-medium text-text-muted">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-all duration-200 hover:bg-[rgba(240,237,232,0.04)] disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
