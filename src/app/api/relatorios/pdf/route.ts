import { NextResponse } from 'next/server'
import ReactPDF from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import React from 'react'
import path from 'path'

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

function ReportDocument({ mes, ano }: { mes: string; ano: string }) {
  return React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: styles.page },

      // ─── Logo header ───
      React.createElement(View, { style: styles.logoRow },
        React.createElement(Image, { src: logoPath, style: { width: 140, height: 35 } }),
      ),
      React.createElement(Text, { style: styles.subtitle }, `Relatório de Resultados — ${mes}/${ano}`),
      React.createElement(View, { style: styles.divider }),

      // ─── KPI Strip ───
      React.createElement(View, { style: styles.kpiRow },
        React.createElement(View, { style: styles.kpiCard },
          React.createElement(Text, { style: styles.kpiLabel }, 'ROAS'),
          React.createElement(Text, { style: { ...styles.kpiValue, color: '#4FD1C5' } }, '3.55x'),
        ),
        React.createElement(View, { style: styles.kpiCard },
          React.createElement(Text, { style: styles.kpiLabel }, 'Leads'),
          React.createElement(Text, { style: { ...styles.kpiValue, color: '#A78BFA' } }, '330'),
        ),
        React.createElement(View, { style: styles.kpiCard },
          React.createElement(Text, { style: styles.kpiLabel }, 'Conversões'),
          React.createElement(Text, { style: { ...styles.kpiValue, color: '#34D399' } }, '28'),
        ),
        React.createElement(View, { style: styles.kpiCard },
          React.createElement(Text, { style: styles.kpiLabel }, 'Health Score'),
          React.createElement(Text, { style: { ...styles.kpiValue, color: '#E8C872' } }, '78'),
        ),
      ),

      // ─── Resumo Executivo ───
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Resumo Executivo'),
        React.createElement(View, { style: styles.sectionDivider }),
        React.createElement(Text, { style: styles.body }, '330 leads captados, 28 conversões confirmadas. A operação está saudável com Health Score médio de 78. ROAS médio de 3.55x no período.'),
      ),

      // ─── ROI Evolução ───
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'ROI — Evolução 3 Meses'),
        React.createElement(View, { style: styles.sectionDivider }),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Janeiro'),
          React.createElement(Text, { style: styles.value }, '2.8x'),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Fevereiro'),
          React.createElement(Text, { style: styles.value }, '3.1x'),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Março'),
          React.createElement(Text, { style: { ...styles.value, color: '#4FD1C5' } }, '3.55x'),
        ),
      ),

      // ─── Top 3 Campanhas ───
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Top 3 Campanhas por ROAS'),
        React.createElement(View, { style: styles.sectionDivider }),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, '1. Video Depoimentos - Premium'),
          React.createElement(Text, { style: { ...styles.value, color: '#34D399' } }, '4.2x'),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, '2. Carrossel Benefícios - Multi'),
          React.createElement(Text, { style: styles.value }, '2.8x'),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, '3. Imagem Promo - Básico'),
          React.createElement(Text, { style: styles.value }, '1.1x'),
        ),
      ),

      // ─── Top 3 Objeções ───
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Top 3 Objeções do Período'),
        React.createElement(View, { style: styles.sectionDivider }),
        React.createElement(Text, { style: styles.body }, '1. Preço (42 ocorrências) — leads comparam com alternativas mais baratas\n2. Prazo (28) — insegurança sobre quando verão resultado\n3. Desconfiança (19) — pedem garantias adicionais'),
      ),

      // ─── Economia de Tempo ───
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Economia de Tempo'),
        React.createElement(View, { style: styles.sectionDivider }),
        React.createElement(Text, { style: styles.highlightGold }, '187 horas'),
        React.createElement(Text, { style: styles.body }, 'de trabalho humano economizadas neste mês pela automação dos agentes Hermes, Ares e Athena.'),
      ),

      // ─── Footer ───
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfStream = await ReactPDF.renderToStream(
    React.createElement(ReportDocument, { mes, ano }) as any
  )

  return new NextResponse(pdfStream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="athenio-relatorio-${mes}-${ano}.pdf"`,
    },
  })
}
