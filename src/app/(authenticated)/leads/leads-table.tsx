'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowUpDown, Search } from 'lucide-react'
import { TEMPERATURA_COLORS } from '@/lib/constants/theme'
import type { Lead } from '@/lib/types'

const SENTIMENTO_EMOJI = { positivo: '+', neutro: '~', negativo: '-' } as const
const PER_PAGE_OPTIONS = [10, 25, 50]

export function LeadsTable({ leads: initialLeads }: { leads: Lead[] }) {
  const [busca, setBusca] = useState('')
  const [tempFilter, setTempFilter] = useState<string>('all')
  const [estagioFilter, setEstagioFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<keyof Lead>('updated_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const filtered = useMemo(() => {
    let result = [...initialLeads]

    if (busca) {
      const q = busca.toLowerCase()
      result = result.filter((l) => l.nome.toLowerCase().includes(q) || l.telefone.includes(q))
    }
    if (tempFilter !== 'all') {
      result = result.filter((l) => l.temperatura === tempFilter)
    }
    if (estagioFilter !== 'all') {
      result = result.filter((l) => l.estagio_funil === estagioFilter)
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

  function toggleSort(col: keyof Lead) {
    if (sortBy === col) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(col)
      setSortOrder('asc')
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPage(1) }}
            className="border-border-default bg-surface-2 pl-9 text-text-primary placeholder:text-text-subtle focus:border-accent"
          />
        </div>
        <Select value={tempFilter} onValueChange={(v: string | null) => { if (v) { setTempFilter(v); setPage(1) } }}>
          <SelectTrigger className="w-36 border-border-default bg-surface-2 text-text-muted">
            <SelectValue placeholder="Temperatura" />
          </SelectTrigger>
          <SelectContent className="border-border-default bg-surface-2">
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="frio">Frio</SelectItem>
            <SelectItem value="morno">Morno</SelectItem>
            <SelectItem value="quente">Quente</SelectItem>
          </SelectContent>
        </Select>
        <Select value={estagioFilter} onValueChange={(v: string | null) => { if (v) { setEstagioFilter(v); setPage(1) } }}>
          <SelectTrigger className="w-40 border-border-default bg-surface-2 text-text-muted">
            <SelectValue placeholder="Estágio" />
          </SelectTrigger>
          <SelectContent className="border-border-default bg-surface-2">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="captado">Captado</SelectItem>
            <SelectItem value="qualificado">Qualificado</SelectItem>
            <SelectItem value="negociacao">Negociação</SelectItem>
            <SelectItem value="convertido">Convertido</SelectItem>
            <SelectItem value="perdido">Perdido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border-default md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-default bg-bg-elevated/50">
              {[
                { key: 'nome', label: 'Nome' },
                { key: 'telefone', label: 'Telefone' },
                { key: 'temperatura', label: 'Temp.' },
                { key: 'estagio_funil', label: 'Estágio' },
                { key: 'agente_responsavel', label: 'Agente' },
                { key: 'sentimento', label: 'Sent.' },
                { key: 'produto_interesse', label: 'Produto' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle hover:text-text-primary"
                  onClick={() => toggleSort(key as keyof Lead)}
                >
                  <span className="flex items-center gap-1">
                    {label}
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((lead) => (
              <tr key={lead.id} className="border-b border-border-default/50 hover:bg-accent/5">
                <td className="px-4 py-3 font-medium">{lead.nome}</td>
                <td className="px-4 py-3 text-text-muted">{lead.telefone}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    style={{ borderColor: TEMPERATURA_COLORS[lead.temperatura], color: TEMPERATURA_COLORS[lead.temperatura] }}
                  >
                    {lead.temperatura}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-text-muted">{lead.estagio_funil}</td>
                <td className="px-4 py-3 text-text-muted">{lead.agente_responsavel ?? '—'}</td>
                <td className="px-4 py-3 text-text-muted">{SENTIMENTO_EMOJI[lead.sentimento]}</td>
                <td className="px-4 py-3 text-text-muted">{lead.produto_interesse}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {paginated.map((lead) => (
          <div key={lead.id} className="card-surface space-y-2 p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{lead.nome}</span>
              <Badge
                variant="outline"
                style={{ borderColor: TEMPERATURA_COLORS[lead.temperatura], color: TEMPERATURA_COLORS[lead.temperatura] }}
              >
                {lead.temperatura}
              </Badge>
            </div>
            <p className="text-xs text-text-muted">{lead.telefone} · {lead.estagio_funil} · {lead.agente_responsavel ?? 'sem agente'}</p>
            <p className="text-xs text-text-subtle">{lead.produto_interesse}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-text-muted">
        <div className="flex items-center gap-2">
          <span>Mostrar</span>
          <Select value={String(perPage)} onValueChange={(v: string | null) => { if (v) { setPerPage(Number(v)); setPage(1) } }}>
            <SelectTrigger className="w-20 border-border-default bg-surface-2 text-text-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border-default bg-surface-2">
              {PER_PAGE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded px-3 py-1 text-text-muted hover:bg-accent/10 disabled:opacity-30"
          >
            Anterior
          </button>
          <span>{page} de {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded px-3 py-1 text-text-muted hover:bg-accent/10 disabled:opacity-30"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  )
}
