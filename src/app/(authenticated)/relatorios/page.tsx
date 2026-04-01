'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, FileDown, Loader2, TrendingUp, Users, Clock, AlertTriangle, Target } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'

const MESES = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
]

const SECTION_ICONS = [TrendingUp, Target, TrendingUp, AlertTriangle, Clock]
const SECTION_COLORS = ['#4FD1C5', '#A78BFA', '#E8C872', '#F07070', '#34D399']

export default function RelatoriosPage() {
  const [mes, setMes] = useState('03')
  const [ano, setAno] = useState('2026')
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const res = await fetch(`/api/relatorios/pdf?mes=${mes}&ano=${ano}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `athenio-relatorio-${mes}-${ano}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  const mesLabel = MESES.find((m) => m.value === mes)?.label || mes

  const previewSections = [
    { title: 'Resumo Executivo', content: `330 leads captados, 28 conversões. ROAS médio 3.55x. Health Score médio: 78.` },
    { title: 'Leads Recuperados', content: `14 leads retornaram ao funil via remarketing, representando ${formatCurrency(8540)} em valor potencial.` },
    { title: 'Top 3 Campanhas', content: '1. Video Depoimentos (4.2x ROAS)\n2. Carrossel Benefícios (2.8x)\n3. Imagem Promo (1.1x)' },
    { title: 'Top 3 Objeções', content: '1. Preço (42)\n2. Prazo (28)\n3. Desconfiança (19)' },
    { title: 'Economia de Tempo', content: '187 horas de trabalho humano economizadas.' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet/15 to-violet/5">
            <FileText className="h-[18px] w-[18px] text-violet" />
          </div>
          <div>
            <h1 className="font-title text-[22px] font-bold text-text-primary">Relatórios</h1>
            <p className="text-[13px] text-text-muted">Exporte relatórios mensais de performance</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card-surface p-6">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
          Gerar relatório
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <p className="mb-1.5 text-[12px] font-medium text-text-muted">Mês</p>
            <Select value={mes} onValueChange={(v: string | null) => { if (v) setMes(v) }}>
              <SelectTrigger className="!h-11 w-full rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-[13px] text-text-muted transition-all duration-200 hover:border-border-hover">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border-default bg-surface-2 p-1">
                {MESES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-32">
            <p className="mb-1.5 text-[12px] font-medium text-text-muted">Ano</p>
            <Select value={ano} onValueChange={(v: string | null) => { if (v) setAno(v) }}>
              <SelectTrigger className="!h-11 w-full rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-[13px] text-text-muted transition-all duration-200 hover:border-border-hover">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border-default bg-surface-2 p-1">
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleDownload}
            disabled={loading}
            className="h-11 rounded-xl bg-accent px-6 text-[14px] font-semibold text-primary-foreground shadow-[0_0_24px_rgba(79,209,197,0.12)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_32px_rgba(79,209,197,0.18)] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FileDown className="h-4 w-4" />
                Baixar PDF
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
          Preview — {mesLabel} {ano}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {previewSections.map((s, i) => {
            const Icon = SECTION_ICONS[i]
            const color = SECTION_COLORS[i]
            return (
              <div key={s.title} className="card-surface group overflow-hidden p-5">
                <div
                  className="absolute left-0 right-0 top-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, ${color}, transparent 70%)` }}
                />
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${color}12` }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color }} />
                  </div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color }}>
                    {s.title}
                  </p>
                </div>
                <p className="whitespace-pre-line text-[13px] leading-relaxed text-text-muted">
                  {s.content}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
