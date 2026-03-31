'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileDown, Loader2 } from 'lucide-react'
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
    { title: 'Leads Recuperados via Remarketing', content: `14 leads retornaram ao funil via remarketing, representando ${formatCurrency(8540)} em valor potencial.` },
    { title: 'Top 3 Campanhas', content: '1. Video Depoimentos (4.2x ROAS)\n2. Carrossel Benefícios (2.8x)\n3. Imagem Promo (1.1x)' },
    { title: 'Top 3 Objeções', content: '1. Preço (42)\n2. Prazo (28)\n3. Desconfiança (19)' },
    { title: 'Economia de Tempo', content: '187 horas de trabalho humano economizadas.' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="font-title text-2xl font-bold">Relatórios</h1>

      <div className="flex items-end gap-4">
        <div>
          <p className="mb-1 text-xs text-text-subtle">Mês</p>
          <Select value={mes} onValueChange={(v: string | null) => { if (v) setMes(v) }}>
            <SelectTrigger className="w-40 border-border-default bg-bg-input text-text-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border-default bg-[#0C1818]">
              {MESES.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="mb-1 text-xs text-text-subtle">Ano</p>
          <Select value={ano} onValueChange={(v: string | null) => { if (v) setAno(v) }}>
            <SelectTrigger className="w-28 border-border-default bg-bg-input text-text-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border-default bg-[#0C1818]">
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleDownload}
          disabled={loading}
          className="rounded-full bg-accent px-6 font-semibold text-[#070C0C] shadow-[0_0_40px_rgba(79,209,197,0.3)] hover:bg-accent-light"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparando seu relatório de resultados...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Baixar PDF
            </>
          )}
        </Button>
      </div>

      {/* Preview */}
      <div>
        <p className="mb-3 text-sm text-text-muted">
          Preview — {mesLabel} {ano}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {previewSections.map((s) => (
            <div key={s.title} className="glass-card">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent">{s.title}</p>
              <p className="whitespace-pre-line text-sm text-text-muted">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
