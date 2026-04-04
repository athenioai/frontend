import Link from 'next/link'
import { adminService } from '@/lib/services'
import { formatDate } from '@/lib/utils/format'
import { Building2, Plus } from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'

export default async function TenantsPage() {
  const tenants = await adminService.getTenants()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5">
            <Building2 className="h-[18px] w-[18px] text-accent" />
          </div>
          <div>
            <h1 className="font-title text-[22px] font-bold text-text-primary">
              Clientes
            </h1>
            <p className="text-[13px] text-text-muted">
              Gerencie todos os tenants da plataforma
            </p>
          </div>
        </div>
        <Link
          href="/admin/tenants/new"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-accent px-5 text-[13px] font-semibold text-primary-foreground hover:brightness-110 transition-all"
        >
          <Plus className="mr-1 h-4 w-4" />
          Novo Cliente
        </Link>
      </div>

      {tenants.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nenhum cliente"
          description="Crie o primeiro cliente para comecar."
          actionLabel="Criar Cliente"
          actionHref="/admin/tenants/new"
        />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default bg-surface-2/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                    Data de Criacao
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                    Acoes
                  </th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-border-default/50 transition-colors hover:bg-accent/5"
                  >
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {t.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-text-muted">
                      {t.slug}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {formatDate(t.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/tenants/${t.id}`}
                        className="text-[13px] text-accent hover:underline"
                      >
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
