'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TenantForm } from '@/components/admin/tenant-form'
import { DecisionTimeline } from '@/components/admin/decision-timeline'
import { StatusBadge, TEMPERATURE_COLORS, FUNNEL_COLORS } from '@/components/common/status-badge'
import { EmptyState } from '@/components/common/empty-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useApi } from '@/hooks/useApi'
import { clientApi } from '@/lib/api/client-api'
import { toast } from 'sonner'
import { formatRelativeTime } from '@/lib/utils/format'
import { Trash2, Users, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { AnimateIn } from '@/components/ui/animate-in'
import type { Tenant, Lead, OrchestratorDecision, CreateTenantPayload } from '@/lib/types'

interface TenantDetailTabsProps {
  tenant: Tenant
}

function ReadinessItem({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-[rgba(255,255,255,0.03)] px-4 py-3 transition-colors hover:bg-[rgba(255,255,255,0.06)]">
      {ready ? (
        <CheckCircle2 className="h-4 w-4 text-emerald" />
      ) : (
        <XCircle className="h-4 w-4 text-danger" />
      )}
      <span className="text-[13px] text-text-primary">{label}</span>
    </div>
  )
}

function OverviewTab({ tenant }: { tenant: Tenant }) {
  const readiness = [
    { label: 'Perfil da empresa', ready: !!tenant.name },
    { label: 'WhatsApp configurado', ready: !!tenant.whatsapp_phone_id },
    { label: 'Orchestrator configurado', ready: !!tenant.orchestrator_config },
    { label: 'Pagamento configurado', ready: !!(tenant.asaas_key || tenant.stripe_key) },
    { label: 'Meta Ads configurado', ready: !!tenant.meta_account_id },
  ]

  return (
    <div className="space-y-6">
      <AnimateIn>
        <div className="card-surface p-6">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
            Checklist de Prontidao
          </p>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
            {readiness.map((item) => (
              <ReadinessItem key={item.label} {...item} />
            ))}
          </div>
        </div>
      </AnimateIn>

      <AnimateIn delay={0.1}>
        <div className="card-surface p-6">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
            Informacoes
          </p>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div>
              <p className="text-[12px] text-text-muted">Nome</p>
              <p className="text-[14px] font-medium text-text-primary">{tenant.name}</p>
            </div>
            <div>
              <p className="text-[12px] text-text-muted">Slug</p>
              <p className="font-mono text-[14px] text-text-primary">{tenant.slug}</p>
            </div>
            {tenant.tone_of_voice && (
              <div>
                <p className="text-[12px] text-text-muted">Tom de voz</p>
                <p className="text-[14px] font-medium capitalize text-text-primary">
                  {tenant.tone_of_voice}
                </p>
              </div>
            )}
            {tenant.alert_phone && (
              <div>
                <p className="text-[12px] text-text-muted">Telefone para alertas</p>
                <p className="text-[14px] text-text-primary">{tenant.alert_phone}</p>
              </div>
            )}
          </div>
        </div>
      </AnimateIn>
    </div>
  )
}

function ConfigTab({ tenant }: { tenant: Tenant }) {
  const router = useRouter()

  const handleSubmit = useCallback(
    async (data: CreateTenantPayload) => {
      try {
        await clientApi<Tenant>(`/admin/tenants/${tenant.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        })
        toast.success('Alteracoes salvas com sucesso')
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao salvar alteracoes')
      }
    },
    [tenant.id, router],
  )

  return (
    <TenantForm
      initialData={tenant}
      onSubmit={handleSubmit}
      submitLabel="Salvar alteracoes"
      maskKeys
    />
  )
}

function LeadsTab({ tenantId }: { tenantId: string }) {
  const [offset, setOffset] = useState(0)
  const limit = 20
  const { data: leads, loading } = useApi<Lead[]>(
    `/admin/tenants/${tenantId}/leads?limit=${limit}&offset=${offset}`,
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  if (!leads || leads.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum lead"
        description="Este tenant ainda nao possui leads."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default bg-surface-2/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  Telefone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  Temp
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  Funil
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  Whale
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  Agente
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  Atualizado
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-border-default/50 transition-colors hover:bg-accent/5"
                >
                  <td className="px-4 py-3 font-medium text-text-primary">{lead.name}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-text-muted">{lead.phone}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.temperature} colorMap={TEMPERATURE_COLORS} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.funnel_stage} colorMap={FUNNEL_COLORS} />
                  </td>
                  <td className="px-4 py-3">
                    {lead.score >= 85 ? (
                      <Badge variant="outline" className="border-gold/30 bg-gold/10 text-gold">
                        Whale
                      </Badge>
                    ) : (
                      <span className="text-[12px] text-text-subtle">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-text-muted">
                    {lead.assigned_agent ?? '--'}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-text-subtle">
                    {formatRelativeTime(lead.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-text-muted">
          Mostrando {offset + 1} - {offset + leads.length}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset(offset + limit)}
            disabled={leads.length < limit}
          >
            Proximo
          </Button>
        </div>
      </div>
    </div>
  )
}

function DecisionsTab({ tenantId }: { tenantId: string }) {
  const { data: decisions, loading } = useApi<OrchestratorDecision[]>(
    `/admin/tenants/${tenantId}/decisions`,
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  return <DecisionTimeline decisions={decisions ?? []} />
}

export function TenantDetailTabs({ tenant }: TenantDetailTabsProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = useCallback(async () => {
    setDeleting(true)
    try {
      await clientApi(`/admin/tenants/${tenant.id}`, { method: 'DELETE' })
      toast.success('Cliente excluido com sucesso')
      router.push('/admin/tenants')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir cliente')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }, [tenant.id, router])

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Excluir
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="overview">Visao Geral</TabsTrigger>
          <TabsTrigger value="config">Configuracao</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="decisions">Decisoes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab tenant={tenant} />
        </TabsContent>

        <TabsContent value="config">
          <ConfigTab tenant={tenant} />
        </TabsContent>

        <TabsContent value="leads">
          <LeadsTab tenantId={tenant.id} />
        </TabsContent>

        <TabsContent value="decisions">
          <DecisionsTab tenantId={tenant.id} />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir cliente"
        message={`Esta acao e irreversivel. Todos os dados do tenant "${tenant.name}" serao removidos.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
        requireSlug={tenant.slug}
        loading={deleting}
      />
    </>
  )
}
