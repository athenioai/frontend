import { adminService } from '@/lib/services'
import { notFound } from 'next/navigation'
import { TenantDetailTabs } from '@/components/admin/tenant-detail-tabs'
import { Badge } from '@/components/ui/badge'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TenantDetailPage({ params }: PageProps) {
  const { id } = await params
  let tenant
  try {
    tenant = await adminService.getTenant(id)
  } catch {
    notFound()
  }

  const hasProfile = !!tenant.name
  const hasWhatsApp = !!tenant.whatsapp_phone_id
  const hasOrchestrator = !!tenant.orchestrator_config
  const isReady = hasProfile && hasWhatsApp && hasOrchestrator

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-title text-[22px] font-bold text-text-primary">
              {tenant.name}
            </h1>
            <span className="font-mono text-[13px] text-text-subtle">{tenant.slug}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            {isReady ? (
              <Badge
                variant="outline"
                className="border-emerald/30 bg-emerald/10 text-emerald"
              >
                Pronto
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-gold/30 bg-gold/10 text-gold"
              >
                Incompleto
              </Badge>
            )}
          </div>
        </div>
      </div>

      <TenantDetailTabs tenant={tenant} />
    </div>
  )
}
