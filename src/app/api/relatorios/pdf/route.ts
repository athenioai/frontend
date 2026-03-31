import { NextResponse } from 'next/server'
import ReactPDF from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import React from 'react'

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#070C0C', color: '#FFFFFF', fontFamily: 'Helvetica' },
  header: { marginBottom: 30 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4FD1C5', marginBottom: 8 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#4FD1C5', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(79,209,197,0.3)', paddingBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 10, color: 'rgba(255,255,255,0.6)' },
  value: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  highlight: { fontSize: 18, fontWeight: 'bold', color: '#4FD1C5', marginBottom: 4 },
  body: { fontSize: 10, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 },
})

function ReportDocument({ mes, ano }: { mes: string; ano: string }) {
  return React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: styles.page },
      React.createElement(View, { style: styles.header },
        React.createElement(Text, { style: styles.title }, 'Athenio.ai'),
        React.createElement(Text, { style: styles.subtitle }, `Relatório de Resultados — ${mes}/${ano}`),
      ),
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Resumo Executivo'),
        React.createElement(Text, { style: styles.highlight }, 'ROAS: 3.55x'),
        React.createElement(Text, { style: styles.body }, '330 leads captados, 28 conversões confirmadas. A operação está saudável com Health Score médio de 78.'),
      ),
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'ROI — Evolução 3 Meses'),
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
          React.createElement(Text, { style: styles.value }, '3.55x'),
        ),
      ),
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Top 3 Campanhas por ROAS'),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, '1. Video Depoimentos - Premium'),
          React.createElement(Text, { style: styles.value }, '4.2x'),
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
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Top 3 Objeções do Período'),
        React.createElement(Text, { style: styles.body }, '1. Preço (42 ocorrências) — leads comparam com alternativas mais baratas\n2. Prazo (28) — insegurança sobre quando verão resultado\n3. Desconfiança (19) — pedem garantias adicionais'),
      ),
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Economia de Tempo'),
        React.createElement(Text, { style: styles.highlight }, '187 horas'),
        React.createElement(Text, { style: styles.body }, 'de trabalho humano economizadas neste mês pela automação.'),
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
