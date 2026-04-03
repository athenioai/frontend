import { NextResponse } from 'next/server'
import ReactPDF from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import React from 'react'
import path from 'path'
import { authService, campaignService, analyticsService, leadService } from '@/lib/services'

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#0E1012', color: '#F0EDE8', fontFamily: 'Helvetica' },
  // Logo header
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#4FD1C5', marginLeft: 8 },
  logoTextSuffix: { fontSize: 20, color: 'rgba(240,237,232,0.4)' },
  subtitle: { fontSize: 11, color: 'rgba(240,237,232,0.55)', marginBottom: 6 },
  divider: { height: 1, backgroundColor: 'rgba(240,237,232,0.08)', marginTop: 16, marginBottom: 24 },
  // Sections
  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#4FD1C5', marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' },
  sectionDivider: { height: 1, backgroundColor: 'rgba(79,209,197,0.15)', marginBottom: 10 },
  // Metrics
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, paddingVertical: 2 },
  label: { fontSize: 10, color: 'rgba(240,237,232,0.55)' },
  value: { fontSize: 10, fontWeight: 'bold', color: '#F0EDE8' },
  highlight: { fontSize: 22, fontWeight: 'bold', color: '#4FD1C5', marginBottom: 6 },
  highlightGold: { fontSize: 22, fontWeight: 'bold', color: '#E8C872', marginBottom: 6 },
  body: { fontSize: 10, color: 'rgba(240,237,232,0.7)', lineHeight: 1.6 },
  // KPI strip
  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  kpiCard: { flex: 1, backgroundColor: 'rgba(240,237,232,0.03)', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: 'rgba(240,237,232,0.06)' },
  kpiLabel: { fontSize: 8, color: 'rgba(240,237,232,0.45)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  kpiValue: { fontSize: 16, fontWeight: 'bold' },
  // Footer
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 8, color: 'rgba(240,237,232,0.3)' },
})

const logoPath = path.join(process.cwd(), 'public', 'logo', 'athenio-dark.png')

interface ReportData {
  mes: string
  ano: string
  roas: string
  totalLeads: number
  convertedLeads: number
  healthScore: number
  hoursSaved: number
  topCampaigns: { name: string; roas: number }[]
  topObjections: { objection: string; count: number }[]
}

function ReportDocument({ data }: { data: ReportData }) {
  const { mes, ano, roas, totalLeads, convertedLeads, healthScore, hoursSaved, topCampaigns, topObjections } = data

  return React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: styles.page },

      // --- Logo header ---
      React.createElement(View, { style: styles.logoRow },
        React.createElement(Image, { src: logoPath, style: { width: 140, height: 35 } }),
      ),
      React.createElement(Text, { style: styles.subtitle }, `Relatório de Resultados — ${mes}/${ano}`),
      React.createElement(View, { style: styles.divider }),

      // --- KPI Strip ---
      React.createElement(View, { style: styles.kpiRow },
        React.createElement(View, { style: styles.kpiCard },
          React.createElement(Text, { style: styles.kpiLabel }, 'ROAS'),
          React.createElement(Text, { style: { ...styles.kpiValue, color: '#4FD1C5' } }, roas),
        ),
        React.createElement(View, { style: styles.kpiCard },
          React.createElement(Text, { style: styles.kpiLabel }, 'Leads'),
          React.createElement(Text, { style: { ...styles.kpiValue, color: '#A78BFA' } }, String(totalLeads)),
        ),
        React.createElement(View, { style: styles.kpiCard },
          React.createElement(Text, { style: styles.kpiLabel }, 'Conversões'),
          React.createElement(Text, { style: { ...styles.kpiValue, color: '#34D399' } }, String(convertedLeads)),
        ),
        React.createElement(View, { style: styles.kpiCard },
          React.createElement(Text, { style: styles.kpiLabel }, 'Health Score'),
          React.createElement(Text, { style: { ...styles.kpiValue, color: '#E8C872' } }, String(healthScore)),
        ),
      ),

      // --- Resumo Executivo ---
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Resumo Executivo'),
        React.createElement(View, { style: styles.sectionDivider }),
        React.createElement(Text, { style: styles.body }, `${totalLeads} leads captados, ${convertedLeads} conversões confirmadas. A operação está ${healthScore >= 60 ? 'saudável' : 'precisando de atenção'} com Health Score médio de ${healthScore}. ROAS médio de ${roas} no período.`),
      ),

      // --- Top Campanhas ---
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, `Top ${topCampaigns.length} Campanhas por ROAS`),
        React.createElement(View, { style: styles.sectionDivider }),
        ...topCampaigns.map((campaign, i) =>
          React.createElement(View, { key: `camp-${i}`, style: styles.row },
            React.createElement(Text, { style: styles.label }, `${i + 1}. ${campaign.name}`),
            React.createElement(Text, { style: i === 0 ? { ...styles.value, color: '#34D399' } : styles.value }, `${campaign.roas.toFixed(1)}x`),
          )
        ),
      ),

      // --- Top Objeções ---
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, `Top ${topObjections.length} Objeções do Período`),
        React.createElement(View, { style: styles.sectionDivider }),
        React.createElement(Text, { style: styles.body },
          topObjections.map((obj, i) => `${i + 1}. ${obj.objection} (${obj.count} ocorrências)`).join('\n')
        ),
      ),

      // --- Economia de Tempo ---
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Economia de Tempo'),
        React.createElement(View, { style: styles.sectionDivider }),
        React.createElement(Text, { style: styles.highlightGold }, `${hoursSaved} horas`),
        React.createElement(Text, { style: styles.body }, 'de trabalho humano economizadas neste mês pela automação dos agentes Hermes, Ares e Athena.'),
      ),

      // --- Footer ---
      React.createElement(View, { style: styles.footer },
        React.createElement(Text, { style: styles.footerText }, 'Athenio.ai — Relatório gerado automaticamente'),
        React.createElement(Text, { style: styles.footerText }, `${mes}/${ano}`),
      ),
    )
  )
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mes = searchParams.get('mes') || '03'
  const ano = searchParams.get('ano') || '2026'

  // Load real data
  const user = await authService.getSession()
  let reportData: ReportData

  if (user) {
    const [roi, health, funnel, hoursSavedData, campaigns, objections] = await Promise.all([
      campaignService.getTotalRoi(user.company_id),
      analyticsService.getHealthScore(user.company_id),
      leadService.getFunnelStats(user.company_id, '30d'),
      analyticsService.getHoursSaved(user.company_id),
      campaignService.getAll(user.company_id),
      leadService.getTopObjections(user.company_id),
    ])

    const topCampaigns = [...campaigns]
      .sort((a, b) => b.roas - a.roas)
      .slice(0, 3)
      .map((c) => ({ name: c.name, roas: c.roas }))

    reportData = {
      mes,
      ano,
      roas: `${roi.roas.toFixed(2)}x`,
      totalLeads: funnel.captured + funnel.qualified + funnel.negotiation + funnel.converted,
      convertedLeads: funnel.converted,
      healthScore: health.score,
      hoursSaved: hoursSavedData.hours,
      topCampaigns: topCampaigns.length > 0 ? topCampaigns : [{ name: 'Sem campanhas no período', roas: 0 }],
      topObjections: objections.slice(0, 5),
    }
  } else {
    // Fallback with placeholder data
    reportData = {
      mes,
      ano,
      roas: '0.0x',
      totalLeads: 0,
      convertedLeads: 0,
      healthScore: 0,
      hoursSaved: 0,
      topCampaigns: [{ name: 'Sem dados disponíveis', roas: 0 }],
      topObjections: [],
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfStream = await ReactPDF.renderToStream(
    React.createElement(ReportDocument, { data: reportData }) as any
  )

  return new NextResponse(pdfStream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="athenio-relatorio-${mes}-${ano}.pdf"`,
    },
  })
}
