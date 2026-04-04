'use client'

import { useRouter } from 'next/navigation'
import { TenantForm } from '@/components/admin/tenant-form'
import { clientApi } from '@/lib/api/client-api'
import { toast } from 'sonner'
import type { Tenant, CreateTenantPayload } from '@/lib/types'
import { Building2 } from 'lucide-react'

export default function NewTenantPage() {
  const router = useRouter()

  async function handleSubmit(data: CreateTenantPayload) {
    try {
      const tenant = await clientApi<Tenant>('/admin/tenants', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      toast.success('Cliente criado com sucesso')
      router.push(`/admin/tenants/${tenant.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar cliente')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5">
          <Building2 className="h-[18px] w-[18px] text-accent" />
        </div>
        <div>
          <h1 className="font-title text-[22px] font-bold text-text-primary">
            Novo Cliente
          </h1>
          <p className="text-[13px] text-text-muted">
            Configure um novo tenant na plataforma
          </p>
        </div>
      </div>

      <TenantForm onSubmit={handleSubmit} submitLabel="Criar Cliente" />
    </div>
  )
}
