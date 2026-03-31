import Link from 'next/link'
import { adminService } from '@/lib/services'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils/format'
import { getHealthScoreColor } from '@/lib/constants/theme'

export default async function AdminPage() {
  const empresas = await adminService.getAllEmpresas()

  const sorted = [...empresas].sort((a, b) => a.health_score - b.health_score)

  return (
    <div className="space-y-6">
      <h1 className="font-title text-2xl font-bold">Painel Admin</h1>

      <div className="overflow-x-auto rounded-xl border border-border-default">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-default bg-bg-elevated/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Empresa</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Health Score</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">ROAS Mês</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Último Alerta</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Assinatura</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => (
              <tr
                key={e.id}
                className={`border-b border-border-default/50 transition-colors hover:bg-accent/5 ${
                  e.health_score < 60 ? 'bg-danger-bg' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <Link href={`/admin/${e.id}`} className="font-medium text-accent hover:underline">
                    {e.nome}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="font-title font-bold" style={{ color: getHealthScoreColor(e.health_score) }}>
                    {e.health_score}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{e.roas_mes.toFixed(1)}x</td>
                <td className="px-4 py-3 text-text-muted">
                  {e.ultimo_alerta ? formatRelativeTime(e.ultimo_alerta) : '—'}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={
                      e.assinatura_status === 'ativa'
                        ? 'border-accent text-accent'
                        : 'border-danger text-danger'
                    }
                  >
                    {e.assinatura_status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
