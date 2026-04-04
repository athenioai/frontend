# Onboarding, Produtos & Knowledge Base — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add onboarding wizard, product management, knowledge base, and readiness checklist pages to the Olympus frontend, integrating with the new backend API endpoints.

**Architecture:** New types and services following the existing interface + apiClient pattern. Shared form components used both in the fullscreen onboarding wizard (`/onboarding`) and in standalone sidebar pages (`/produtos`, `/knowledge-base`). Readiness banner on dashboard when onboarding is incomplete.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Motion (framer-motion), Lucide icons, Sonner toasts, existing shadcn/ui components (Button, Input, Label, Badge, Dialog, Select).

---

## File Structure

### New Files

```
src/lib/types/product.ts                          — Product, Variant, CreateProductPayload, CreateVariantPayload
src/lib/types/knowledge.ts                        — KnowledgeEntry, CreateKnowledgeEntryPayload
src/lib/types/readiness.ts                        — ReadinessCheck, ReadinessResult
src/lib/types/company-profile.ts                  — CompanyProfile, CreateCompanyProfilePayload

src/lib/services/interfaces/company-profile-service.ts  — ICompanyProfileService
src/lib/services/interfaces/product-service.ts          — IProductService
src/lib/services/interfaces/knowledge-service.ts        — IKnowledgeService
src/lib/services/interfaces/readiness-service.ts        — IReadinessService
src/lib/services/company-profile-service.ts             — CompanyProfileService
src/lib/services/product-service.ts                     — ProductService
src/lib/services/knowledge-service.ts                   — KnowledgeService
src/lib/services/readiness-service.ts                   — ReadinessService

src/components/onboarding/onboarding-stepper.tsx        — Horizontal stepper with 4 steps
src/components/onboarding/company-profile-form.tsx      — Company profile form
src/components/onboarding/product-form.tsx              — Product + variants form
src/components/onboarding/product-card.tsx              — Product display card
src/components/onboarding/knowledge-entry-list.tsx      — Knowledge Q&A list
src/components/onboarding/knowledge-entry-form.tsx      — Knowledge entry create/edit form
src/components/onboarding/readiness-checklist.tsx       — Readiness checklist display

src/components/widgets/readiness-banner.tsx              — Dashboard banner for incomplete onboarding

src/lib/api/client-api.ts                               — Browser-side API client (uses Supabase browser client)

src/app/onboarding/layout.tsx                           — Fullscreen layout (no sidebar)
src/app/onboarding/page.tsx                             — Wizard page with 4 steps

src/app/(authenticated)/produtos/page.tsx               — Products management page
src/app/(authenticated)/knowledge-base/page.tsx         — Knowledge base management page
```

### Modified Files

```
src/lib/types/index.ts                            — Add exports for new types
src/lib/services/index.ts                         — Add new service singletons
src/components/layout/sidebar.tsx                  — Add Produtos + Knowledge Base nav items
src/app/(authenticated)/dashboard/page.tsx         — Add readiness banner
```

---

## Task 1: Types

**Files:**
- Create: `src/lib/types/company-profile.ts`
- Create: `src/lib/types/product.ts`
- Create: `src/lib/types/knowledge.ts`
- Create: `src/lib/types/readiness.ts`
- Modify: `src/lib/types/index.ts`

- [ ] **Step 1: Create company-profile types**

```typescript
// src/lib/types/company-profile.ts
export type ToneOfVoice = 'formal' | 'informal' | 'neutro' | 'ousado'

export interface CompanyProfile {
  id: string
  tenant_id: string
  company_name: string
  description?: string
  segment?: string
  target_audience?: string
  tone?: ToneOfVoice
  differentials?: string[]
  created_at: string
  updated_at: string
}

export interface CreateCompanyProfilePayload {
  company_name: string
  description?: string
  segment?: string
  target_audience?: string
  tone?: ToneOfVoice
  differentials?: string[]
}
```

- [ ] **Step 2: Create product types**

```typescript
// src/lib/types/product.ts
export type BillingCycle = 'monthly' | 'yearly' | 'one_time'

export interface Variant {
  id: string
  product_id: string
  name: string
  price_cents: number
  billing_cycle?: BillingCycle
  features?: string[]
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  tenant_id: string
  name: string
  description?: string
  benefits?: string[]
  objection_busters?: string[]
  is_active: boolean
  variants: Variant[]
  created_at: string
  updated_at: string
}

export interface CreateVariantPayload {
  name: string
  price_cents: number
  billing_cycle?: BillingCycle
  features?: string[]
}

export interface CreateProductPayload {
  name: string
  description?: string
  benefits?: string[]
  objection_busters?: string[]
  variants: CreateVariantPayload[]
}
```

- [ ] **Step 3: Create knowledge types**

```typescript
// src/lib/types/knowledge.ts
export interface KnowledgeEntry {
  id: string
  question: string
  answer: string
  tags: string[]
}

export interface CreateKnowledgeEntryPayload {
  question: string
  answer: string
  tags?: string[]
}
```

- [ ] **Step 4: Create readiness types**

```typescript
// src/lib/types/readiness.ts
export type ReadinessCheckName =
  | 'company_profile'
  | 'products'
  | 'knowledge_base'
  | 'whatsapp'
  | 'orchestrator_config'

export interface ReadinessCheck {
  name: ReadinessCheckName
  ready: boolean
  detail: string
}

export interface ReadinessResult {
  ready: boolean
  checks: ReadinessCheck[]
}
```

- [ ] **Step 5: Update types index**

Add to the end of `src/lib/types/index.ts`:

```typescript
export * from './company-profile'
export * from './product'
export * from './knowledge'
export * from './readiness'
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/types/company-profile.ts src/lib/types/product.ts src/lib/types/knowledge.ts src/lib/types/readiness.ts src/lib/types/index.ts
git commit -m "feat: add types for company profile, products, knowledge base, and readiness"
```

---

## Task 2: Service Interfaces

**Files:**
- Create: `src/lib/services/interfaces/company-profile-service.ts`
- Create: `src/lib/services/interfaces/product-service.ts`
- Create: `src/lib/services/interfaces/knowledge-service.ts`
- Create: `src/lib/services/interfaces/readiness-service.ts`

- [ ] **Step 1: Create company profile service interface**

```typescript
// src/lib/services/interfaces/company-profile-service.ts
import type { CompanyProfile, CreateCompanyProfilePayload } from '@/lib/types'

export interface ICompanyProfileService {
  get(): Promise<CompanyProfile | null>
  create(data: CreateCompanyProfilePayload): Promise<CompanyProfile>
  update(data: Partial<CreateCompanyProfilePayload>): Promise<CompanyProfile>
}
```

- [ ] **Step 2: Create product service interface**

```typescript
// src/lib/services/interfaces/product-service.ts
import type { Product, CreateProductPayload, Variant, CreateVariantPayload } from '@/lib/types'

export interface IProductService {
  getAll(): Promise<Product[]>
  getById(id: string): Promise<Product>
  create(data: CreateProductPayload): Promise<Product>
  update(id: string, data: Partial<CreateProductPayload>): Promise<Product>
  delete(id: string): Promise<void>
  addVariant(productId: string, data: CreateVariantPayload): Promise<Variant>
  updateVariant(id: string, data: Partial<CreateVariantPayload>): Promise<Variant>
  deleteVariant(id: string): Promise<void>
}
```

- [ ] **Step 3: Create knowledge service interface**

```typescript
// src/lib/services/interfaces/knowledge-service.ts
import type { KnowledgeEntry, CreateKnowledgeEntryPayload } from '@/lib/types'

export interface IKnowledgeService {
  getAll(): Promise<KnowledgeEntry[]>
  create(data: CreateKnowledgeEntryPayload): Promise<KnowledgeEntry>
  update(id: string, data: Partial<CreateKnowledgeEntryPayload>): Promise<KnowledgeEntry>
  delete(id: string): Promise<void>
}
```

- [ ] **Step 4: Create readiness service interface**

```typescript
// src/lib/services/interfaces/readiness-service.ts
import type { ReadinessResult } from '@/lib/types'

export interface IReadinessService {
  check(): Promise<ReadinessResult>
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/interfaces/company-profile-service.ts src/lib/services/interfaces/product-service.ts src/lib/services/interfaces/knowledge-service.ts src/lib/services/interfaces/readiness-service.ts
git commit -m "feat: add service interfaces for company profile, products, knowledge, readiness"
```

---

## Task 3: Service Implementations

**Files:**
- Create: `src/lib/services/company-profile-service.ts`
- Create: `src/lib/services/product-service.ts`
- Create: `src/lib/services/knowledge-service.ts`
- Create: `src/lib/services/readiness-service.ts`
- Modify: `src/lib/services/index.ts`

- [ ] **Step 1: Implement CompanyProfileService**

```typescript
// src/lib/services/company-profile-service.ts
import type { ICompanyProfileService } from './interfaces/company-profile-service'
import type { CompanyProfile, CreateCompanyProfilePayload } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class CompanyProfileService implements ICompanyProfileService {
  async get(): Promise<CompanyProfile | null> {
    try {
      return await apiClient<CompanyProfile>('/api/company/profile')
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) return null
      throw error
    }
  }

  async create(data: CreateCompanyProfilePayload): Promise<CompanyProfile> {
    return apiClient<CompanyProfile>('/api/company/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async update(data: Partial<CreateCompanyProfilePayload>): Promise<CompanyProfile> {
    return apiClient<CompanyProfile>('/api/company/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
}
```

- [ ] **Step 2: Implement ProductService**

```typescript
// src/lib/services/product-service.ts
import type { IProductService } from './interfaces/product-service'
import type { Product, CreateProductPayload, Variant, CreateVariantPayload } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class ProductService implements IProductService {
  async getAll(): Promise<Product[]> {
    return apiClient<Product[]>('/api/company/products')
  }

  async getById(id: string): Promise<Product> {
    return apiClient<Product>(`/api/company/products/${id}`)
  }

  async create(data: CreateProductPayload): Promise<Product> {
    return apiClient<Product>('/api/company/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async update(id: string, data: Partial<CreateProductPayload>): Promise<Product> {
    return apiClient<Product>(`/api/company/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete(id: string): Promise<void> {
    await apiClient<void>(`/api/company/products/${id}`, { method: 'DELETE' })
  }

  async addVariant(productId: string, data: CreateVariantPayload): Promise<Variant> {
    return apiClient<Variant>(`/api/company/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateVariant(id: string, data: Partial<CreateVariantPayload>): Promise<Variant> {
    return apiClient<Variant>(`/api/company/variants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteVariant(id: string): Promise<void> {
    await apiClient<void>(`/api/company/variants/${id}`, { method: 'DELETE' })
  }
}
```

- [ ] **Step 3: Implement KnowledgeService**

```typescript
// src/lib/services/knowledge-service.ts
import type { IKnowledgeService } from './interfaces/knowledge-service'
import type { KnowledgeEntry, CreateKnowledgeEntryPayload } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class KnowledgeService implements IKnowledgeService {
  async getAll(): Promise<KnowledgeEntry[]> {
    return apiClient<KnowledgeEntry[]>('/api/company/knowledge')
  }

  async create(data: CreateKnowledgeEntryPayload): Promise<KnowledgeEntry> {
    return apiClient<KnowledgeEntry>('/api/company/knowledge', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async update(id: string, data: Partial<CreateKnowledgeEntryPayload>): Promise<KnowledgeEntry> {
    return apiClient<KnowledgeEntry>(`/api/company/knowledge/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete(id: string): Promise<void> {
    await apiClient<void>(`/api/company/knowledge/${id}`, { method: 'DELETE' })
  }
}
```

- [ ] **Step 4: Implement ReadinessService**

```typescript
// src/lib/services/readiness-service.ts
import type { IReadinessService } from './interfaces/readiness-service'
import type { ReadinessResult } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class ReadinessService implements IReadinessService {
  async check(): Promise<ReadinessResult> {
    return apiClient<ReadinessResult>('/api/company/readiness')
  }
}
```

- [ ] **Step 5: Update services index**

Replace the full contents of `src/lib/services/index.ts` with:

```typescript
import { LeadService } from './lead-service'
import { CampaignService } from './campaign-service'
import { AnalyticsService } from './analytics-service'
import { AlertService } from './alert-service'
import { CompanyService } from './company-service'
import { AdminService } from './admin-service'
import { AuthService } from './auth-service'
import { CompanyProfileService } from './company-profile-service'
import { ProductService } from './product-service'
import { KnowledgeService } from './knowledge-service'
import { ReadinessService } from './readiness-service'

export const leadService = new LeadService()
export const campaignService = new CampaignService()
export const analyticsService = new AnalyticsService()
export const alertService = new AlertService()
export const companyService = new CompanyService()
export const adminService = new AdminService()
export const authService = new AuthService()
export const companyProfileService = new CompanyProfileService()
export const productService = new ProductService()
export const knowledgeService = new KnowledgeService()
export const readinessService = new ReadinessService()
```

- [ ] **Step 6: Create browser-side API client**

The existing `apiClient` in `src/lib/api/client.ts` uses the server-side Supabase client and can only run in Server Components. Client components (the wizard, products page, knowledge base page) need a browser-side equivalent. Create it:

```typescript
// src/lib/api/client-api.ts
import { createClient } from '@/lib/supabase/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3003'

export async function clientApi<T>(path: string, options?: RequestInit): Promise<T> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as Record<string, string>).message ?? `Erro: ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/services/company-profile-service.ts src/lib/services/product-service.ts src/lib/services/knowledge-service.ts src/lib/services/readiness-service.ts src/lib/services/index.ts src/lib/api/client-api.ts
git commit -m "feat: add service implementations and browser-side API client"
```

---

## Task 4: Sidebar Navigation Update

**Files:**
- Modify: `src/components/layout/sidebar.tsx`

- [ ] **Step 1: Add new nav items**

In `src/components/layout/sidebar.tsx`, add `Package` and `BookOpen` to the lucide-react imports:

```typescript
import {
  LayoutDashboard,
  GitBranch,
  Users,
  Megaphone,
  FileText,
  Settings,
  Shield,
  Headset,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Package,
  BookOpen,
} from 'lucide-react'
```

Then add the new items to `NAV_SECONDARY`, inserting them before the existing items:

```typescript
const NAV_SECONDARY = [
  { href: '/produtos', label: 'Produtos', icon: Package },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  { href: '/relatorios', label: 'Relatórios', icon: FileText },
  { href: '/suporte', label: 'Suporte', icon: Headset },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/sidebar.tsx
git commit -m "feat: add Produtos and Knowledge Base to sidebar navigation"
```

---

## Task 5: OnboardingStepper Component

**Files:**
- Create: `src/components/onboarding/onboarding-stepper.tsx`

- [ ] **Step 1: Create the stepper component**

```typescript
// src/components/onboarding/onboarding-stepper.tsx
'use client'

import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { MOTION } from '@/lib/motion'

const STEPS = [
  { number: 1, label: 'Perfil da Empresa' },
  { number: 2, label: 'Produtos' },
  { number: 3, label: 'Knowledge Base' },
  { number: 4, label: 'Checklist' },
]

interface OnboardingStepperProps {
  currentStep: number
  onStepClick: (step: number) => void
}

export function OnboardingStepper({ currentStep, onStepClick }: OnboardingStepperProps) {
  return (
    <nav className="flex items-center justify-center gap-0" aria-label="Progresso do onboarding">
      {STEPS.map((step, i) => {
        const status = step.number < currentStep
          ? 'completed'
          : step.number === currentStep
            ? 'current'
            : 'upcoming'

        const canClick = step.number <= currentStep

        return (
          <div key={step.number} className="flex items-center">
            {/* Connector line (before each step except the first) */}
            {i > 0 && (
              <div className="relative mx-2 h-[2px] w-12 sm:w-20 bg-border-default overflow-hidden rounded-full">
                {step.number <= currentStep && (
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
                  />
                )}
              </div>
            )}

            {/* Step circle + label */}
            <button
              type="button"
              onClick={() => canClick && onStepClick(step.number)}
              disabled={!canClick}
              className="flex flex-col items-center gap-1.5 disabled:cursor-default"
              aria-current={status === 'current' ? 'step' : undefined}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold transition-all duration-300 ${
                  status === 'completed'
                    ? 'bg-accent text-primary-foreground shadow-[0_0_16px_rgba(79,209,197,0.25)]'
                    : status === 'current'
                      ? 'border-2 border-accent text-accent shadow-[0_0_16px_rgba(79,209,197,0.15)]'
                      : 'border border-border-default text-text-subtle'
                }`}
              >
                {status === 'completed' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-[11px] font-medium whitespace-nowrap transition-colors duration-200 ${
                  status === 'upcoming' ? 'text-text-subtle' : 'text-text-muted'
                }`}
              >
                {step.label}
              </span>
            </button>
          </div>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/onboarding/onboarding-stepper.tsx
git commit -m "feat: add OnboardingStepper component"
```

---

## Task 6: CompanyProfileForm Component

**Files:**
- Create: `src/components/onboarding/company-profile-form.tsx`

- [ ] **Step 1: Create the form component**

```typescript
// src/components/onboarding/company-profile-form.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X, Loader2 } from 'lucide-react'
import type { CompanyProfile, CreateCompanyProfilePayload, ToneOfVoice } from '@/lib/types'

const INPUT_CLASS = "h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"

const TONE_OPTIONS: { value: ToneOfVoice; label: string; description: string }[] = [
  { value: 'formal', label: 'Formal', description: 'Profissional e respeitoso' },
  { value: 'informal', label: 'Informal', description: 'Próximo e descontraído' },
  { value: 'neutro', label: 'Neutro', description: 'Equilibrado e objetivo' },
  { value: 'ousado', label: 'Ousado', description: 'Direto e provocativo' },
]

interface CompanyProfileFormProps {
  initialData?: CompanyProfile | null
  onSubmit: (data: CreateCompanyProfilePayload) => Promise<void>
  submitLabel?: string
}

export function CompanyProfileForm({ initialData, onSubmit, submitLabel = 'Salvar' }: CompanyProfileFormProps) {
  const [companyName, setCompanyName] = useState(initialData?.company_name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [segment, setSegment] = useState(initialData?.segment ?? '')
  const [targetAudience, setTargetAudience] = useState(initialData?.target_audience ?? '')
  const [tone, setTone] = useState<ToneOfVoice | ''>(initialData?.tone ?? '')
  const [differentials, setDifferentials] = useState<string[]>(initialData?.differentials ?? [])
  const [newDifferential, setNewDifferential] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function addDifferential() {
    const trimmed = newDifferential.trim()
    if (!trimmed || differentials.length >= 10) return
    setDifferentials((prev) => [...prev, trimmed])
    setNewDifferential('')
  }

  function removeDifferential(index: number) {
    setDifferentials((prev) => prev.filter((_, i) => i !== index))
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (companyName.trim().length < 2) errs.companyName = 'Nome deve ter pelo menos 2 caracteres'
    if (companyName.trim().length > 200) errs.companyName = 'Nome deve ter no máximo 200 caracteres'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      await onSubmit({
        company_name: companyName.trim(),
        ...(description.trim() && { description: description.trim() }),
        ...(segment.trim() && { segment: segment.trim() }),
        ...(targetAudience.trim() && { target_audience: targetAudience.trim() }),
        ...(tone && { tone }),
        ...(differentials.length > 0 && { differentials }),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Name */}
      <div className="space-y-1.5">
        <Label className="text-[12px] font-medium text-text-muted">
          Nome da Empresa <span className="text-danger">*</span>
        </Label>
        <Input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className={INPUT_CLASS}
          placeholder="Ex: Escola Fluent English"
        />
        {errors.companyName && (
          <p className="text-[11px] text-danger">{errors.companyName}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-[12px] font-medium text-text-muted">Descrição</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"
          placeholder="Descreva brevemente o que sua empresa faz..."
        />
      </div>

      {/* Segment + Target Audience */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-[12px] font-medium text-text-muted">Segmento</Label>
          <Input
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            className={INPUT_CLASS}
            placeholder="Ex: Educação, SaaS, Varejo..."
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px] font-medium text-text-muted">Público-alvo</Label>
          <Input
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className={INPUT_CLASS}
            placeholder="Ex: Profissionais 25-45 anos"
          />
        </div>
      </div>

      {/* Tone of Voice */}
      <div className="space-y-2">
        <Label className="text-[12px] font-medium text-text-muted">Tom de Voz</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TONE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTone(option.value)}
              className={`rounded-xl border p-3 text-left transition-all duration-200 ${
                tone === option.value
                  ? 'border-accent/40 bg-accent/5 shadow-[0_0_12px_rgba(79,209,197,0.1)]'
                  : 'border-border-default bg-transparent hover:border-border-hover'
              }`}
            >
              <p className={`text-[13px] font-medium ${tone === option.value ? 'text-accent' : 'text-text-primary'}`}>
                {option.label}
              </p>
              <p className="text-[11px] text-text-subtle">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Differentials */}
      <div className="space-y-2">
        <Label className="text-[12px] font-medium text-text-muted">
          Diferenciais {differentials.length > 0 && `(${differentials.length}/10)`}
        </Label>
        <div className="flex gap-2">
          <Input
            value={newDifferential}
            onChange={(e) => setNewDifferential(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDifferential())}
            className={INPUT_CLASS + ' flex-1'}
            placeholder="Ex: Certificado internacional"
            disabled={differentials.length >= 10}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addDifferential}
            disabled={!newDifferential.trim() || differentials.length >= 10}
            className="h-11 rounded-xl"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <AnimatePresence>
          {differentials.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {differentials.map((diff, i) => (
                <motion.span
                  key={diff + i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-surface-1 px-3 py-1.5 text-[12px] text-text-muted"
                >
                  {diff}
                  <button type="button" onClick={() => removeDifferential(i)} className="text-text-subtle hover:text-danger transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={saving}
        className="h-11 w-full rounded-xl bg-accent px-6 text-[14px] font-semibold text-primary-foreground shadow-[0_0_24px_rgba(79,209,197,0.12)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_32px_rgba(79,209,197,0.18)] active:scale-[0.99]"
      >
        {saving ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Salvando...
          </span>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/onboarding/company-profile-form.tsx
git commit -m "feat: add CompanyProfileForm component"
```

---

## Task 7: ProductForm and ProductCard Components

**Files:**
- Create: `src/components/onboarding/product-form.tsx`
- Create: `src/components/onboarding/product-card.tsx`

- [ ] **Step 1: Create ProductForm component**

```typescript
// src/components/onboarding/product-form.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X, Loader2, Trash2 } from 'lucide-react'
import type { CreateProductPayload, CreateVariantPayload, BillingCycle, Product } from '@/lib/types'

const INPUT_CLASS = "h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"

const BILLING_LABELS: Record<BillingCycle, string> = {
  monthly: 'Mensal',
  yearly: 'Anual',
  one_time: 'Único',
}

interface VariantDraft {
  name: string
  price: string // display value in BRL (e.g. "97,00")
  billing_cycle: BillingCycle
  features: string[]
  newFeature: string
}

function emptyVariant(): VariantDraft {
  return { name: '', price: '', billing_cycle: 'one_time', features: [], newFeature: '' }
}

function parsePriceToCents(display: string): number {
  const clean = display.replace(/\./g, '').replace(',', '.')
  const num = parseFloat(clean)
  return isNaN(num) ? 0 : Math.round(num * 100)
}

interface ProductFormProps {
  initialData?: Product
  onSubmit: (data: CreateProductPayload) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export function ProductForm({ initialData, onSubmit, onCancel, submitLabel = 'Salvar Produto' }: ProductFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [benefits, setBenefits] = useState<string[]>(initialData?.benefits ?? [])
  const [newBenefit, setNewBenefit] = useState('')
  const [objectionBusters, setObjectionBusters] = useState<string[]>(initialData?.objection_busters ?? [])
  const [newObjection, setNewObjection] = useState('')
  const [variants, setVariants] = useState<VariantDraft[]>(
    initialData?.variants.map((v) => ({
      name: v.name,
      price: (v.price_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      billing_cycle: v.billing_cycle ?? 'one_time',
      features: v.features ?? [],
      newFeature: '',
    })) ?? [emptyVariant()]
  )
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function addListItem(list: string[], setList: (v: string[]) => void, value: string, setValue: (v: string) => void) {
    const trimmed = value.trim()
    if (!trimmed) return
    setList([...list, trimmed])
    setValue('')
  }

  function updateVariant(index: number, updates: Partial<VariantDraft>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...updates } : v)))
  }

  function addVariantFeature(variantIndex: number) {
    const variant = variants[variantIndex]
    const trimmed = variant.newFeature.trim()
    if (!trimmed) return
    updateVariant(variantIndex, {
      features: [...variant.features, trimmed],
      newFeature: '',
    })
  }

  function removeVariantFeature(variantIndex: number, featureIndex: number) {
    const variant = variants[variantIndex]
    updateVariant(variantIndex, {
      features: variant.features.filter((_, i) => i !== featureIndex),
    })
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (name.trim().length < 2) errs.name = 'Nome deve ter pelo menos 2 caracteres'
    if (variants.length === 0) errs.variants = 'Adicione pelo menos 1 variante'
    variants.forEach((v, i) => {
      if (!v.name.trim()) errs[`variant_${i}_name`] = 'Nome da variante é obrigatório'
      if (parsePriceToCents(v.price) < 1) errs[`variant_${i}_price`] = 'Preço deve ser maior que R$ 0,00'
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const payload: CreateProductPayload = {
        name: name.trim(),
        ...(description.trim() && { description: description.trim() }),
        ...(benefits.length > 0 && { benefits }),
        ...(objectionBusters.length > 0 && { objection_busters: objectionBusters }),
        variants: variants.map((v): CreateVariantPayload => ({
          name: v.name.trim(),
          price_cents: parsePriceToCents(v.price),
          billing_cycle: v.billing_cycle,
          ...(v.features.length > 0 && { features: v.features }),
        })),
      }
      await onSubmit(payload)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Name */}
      <div className="space-y-1.5">
        <Label className="text-[12px] font-medium text-text-muted">
          Nome do Produto <span className="text-danger">*</span>
        </Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className={INPUT_CLASS} placeholder="Ex: Curso de Inglês" />
        {errors.name && <p className="text-[11px] text-danger">{errors.name}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-[12px] font-medium text-text-muted">Descrição</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"
          placeholder="Descreva o produto..."
        />
      </div>

      {/* Benefits */}
      <div className="space-y-2">
        <Label className="text-[12px] font-medium text-text-muted">Benefícios</Label>
        <div className="flex gap-2">
          <Input value={newBenefit} onChange={(e) => setNewBenefit(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem(benefits, setBenefits, newBenefit, setNewBenefit))} className={INPUT_CLASS + ' flex-1'} placeholder="Ex: Certificado reconhecido" />
          <Button type="button" variant="outline" onClick={() => addListItem(benefits, setBenefits, newBenefit, setNewBenefit)} className="h-11 rounded-xl"><Plus className="h-4 w-4" /></Button>
        </div>
        {benefits.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {benefits.map((b, i) => (
              <span key={b + i} className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-surface-1 px-3 py-1.5 text-[12px] text-text-muted">
                {b}
                <button type="button" onClick={() => setBenefits(benefits.filter((_, j) => j !== i))} className="text-text-subtle hover:text-danger transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Objection Busters */}
      <div className="space-y-2">
        <Label className="text-[12px] font-medium text-text-muted">Quebra-objeções</Label>
        <div className="flex gap-2">
          <Input value={newObjection} onChange={(e) => setNewObjection(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem(objectionBusters, setObjectionBusters, newObjection, setNewObjection))} className={INPUT_CLASS + ' flex-1'} placeholder="Ex: 7 dias de garantia" />
          <Button type="button" variant="outline" onClick={() => addListItem(objectionBusters, setObjectionBusters, newObjection, setNewObjection)} className="h-11 rounded-xl"><Plus className="h-4 w-4" /></Button>
        </div>
        {objectionBusters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {objectionBusters.map((o, i) => (
              <span key={o + i} className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-surface-1 px-3 py-1.5 text-[12px] text-text-muted">
                {o}
                <button type="button" onClick={() => setObjectionBusters(objectionBusters.filter((_, j) => j !== i))} className="text-text-subtle hover:text-danger transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Variants */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-[12px] font-medium text-text-muted">
            Variantes <span className="text-danger">*</span>
          </Label>
          <Button type="button" variant="ghost" size="sm" onClick={() => setVariants([...variants, emptyVariant()])} className="text-accent text-[12px]">
            <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar variante
          </Button>
        </div>
        {errors.variants && <p className="text-[11px] text-danger">{errors.variants}</p>}

        <AnimatePresence>
          {variants.map((variant, vi) => (
            <motion.div
              key={vi}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="card-surface overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-border-default px-4 py-2.5">
                <span className="text-[12px] font-medium text-text-muted">Variante {vi + 1}</span>
                {variants.length > 1 && (
                  <button type="button" onClick={() => setVariants(variants.filter((_, i) => i !== vi))} className="text-text-subtle hover:text-danger transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="space-y-4 p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-text-subtle">Nome</Label>
                    <Input value={variant.name} onChange={(e) => updateVariant(vi, { name: e.target.value })} className={INPUT_CLASS} placeholder="Ex: Plano Basic" />
                    {errors[`variant_${vi}_name`] && <p className="text-[11px] text-danger">{errors[`variant_${vi}_name`]}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-text-subtle">Preço (R$)</Label>
                    <Input value={variant.price} onChange={(e) => updateVariant(vi, { price: e.target.value })} className={INPUT_CLASS} placeholder="97,00" inputMode="decimal" />
                    {errors[`variant_${vi}_price`] && <p className="text-[11px] text-danger">{errors[`variant_${vi}_price`]}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-text-subtle">Cobrança</Label>
                    <div className="flex gap-1.5">
                      {(['one_time', 'monthly', 'yearly'] as BillingCycle[]).map((cycle) => (
                        <button
                          key={cycle}
                          type="button"
                          onClick={() => updateVariant(vi, { billing_cycle: cycle })}
                          className={`flex-1 rounded-lg border px-2 py-2 text-[11px] font-medium transition-all duration-200 ${
                            variant.billing_cycle === cycle
                              ? 'border-accent/40 bg-accent/5 text-accent'
                              : 'border-border-default text-text-subtle hover:border-border-hover'
                          }`}
                        >
                          {BILLING_LABELS[cycle]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Variant Features */}
                <div className="space-y-2">
                  <Label className="text-[11px] font-medium text-text-subtle">Features da variante</Label>
                  <div className="flex gap-2">
                    <Input value={variant.newFeature} onChange={(e) => updateVariant(vi, { newFeature: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVariantFeature(vi))} className={INPUT_CLASS + ' flex-1'} placeholder="Ex: Acesso ilimitado" />
                    <Button type="button" variant="outline" size="sm" onClick={() => addVariantFeature(vi)} className="h-11 rounded-xl"><Plus className="h-3.5 w-3.5" /></Button>
                  </div>
                  {variant.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {variant.features.map((f, fi) => (
                        <span key={f + fi} className="inline-flex items-center gap-1 rounded-md border border-border-default px-2 py-1 text-[11px] text-text-muted">
                          {f}
                          <button type="button" onClick={() => removeVariantFeature(vi, fi)} className="text-text-subtle hover:text-danger"><X className="h-2.5 w-2.5" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="h-11 flex-1 rounded-xl">
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={saving}
          className="h-11 flex-1 rounded-xl bg-accent px-6 text-[14px] font-semibold text-primary-foreground shadow-[0_0_24px_rgba(79,209,197,0.12)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_32px_rgba(79,209,197,0.18)] active:scale-[0.99]"
        >
          {saving ? (
            <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Salvando...</span>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Create ProductCard component**

```typescript
// src/components/onboarding/product-card.tsx
'use client'

import { motion } from 'motion/react'
import { Package, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'

const BILLING_LABELS: Record<string, string> = {
  monthly: 'Mensal',
  yearly: 'Anual',
  one_time: 'Único',
}

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface ProductCardProps {
  product: Product
  onEdit: () => void
  onDelete: () => void
  index?: number
}

export function ProductCard({ product, onEdit, onDelete, index = 0 }: ProductCardProps) {
  const prices = product.variants.map((v) => v.price_cents).sort((a, b) => a - b)
  const priceRange = prices.length === 1
    ? formatPrice(prices[0])
    : `${formatPrice(prices[0])} – ${formatPrice(prices[prices.length - 1])}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="card-surface card-surface-interactive overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Package className="h-[18px] w-[18px] text-accent" />
            </div>
            <div>
              <h3 className="font-title text-[15px] font-bold text-text-primary">{product.name}</h3>
              <p className="text-[12px] text-text-subtle">
                {product.variants.length} variante{product.variants.length !== 1 && 's'}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={onEdit} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-subtle hover:bg-accent/10 hover:text-accent transition-all">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={onDelete} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-subtle hover:bg-danger-bg hover:text-danger transition-all">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {product.description && (
          <p className="mt-3 text-[13px] text-text-muted line-clamp-2">{product.description}</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="font-title text-[16px] font-bold text-accent">{priceRange}</span>
          <div className="flex gap-1.5">
            {[...new Set(product.variants.map((v) => v.billing_cycle ?? 'one_time'))].map((cycle) => (
              <Badge key={cycle} variant="secondary" className="text-[10px]">
                {BILLING_LABELS[cycle] ?? cycle}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/product-form.tsx src/components/onboarding/product-card.tsx
git commit -m "feat: add ProductForm and ProductCard components"
```

---

## Task 8: KnowledgeEntryList and KnowledgeEntryForm Components

**Files:**
- Create: `src/components/onboarding/knowledge-entry-list.tsx`
- Create: `src/components/onboarding/knowledge-entry-form.tsx`

- [ ] **Step 1: Create KnowledgeEntryForm component**

```typescript
// src/components/onboarding/knowledge-entry-form.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X, Loader2 } from 'lucide-react'
import type { KnowledgeEntry, CreateKnowledgeEntryPayload } from '@/lib/types'

const INPUT_CLASS = "h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"

interface KnowledgeEntryFormProps {
  initialData?: KnowledgeEntry
  onSubmit: (data: CreateKnowledgeEntryPayload) => Promise<void>
  onCancel: () => void
}

export function KnowledgeEntryForm({ initialData, onSubmit, onCancel }: KnowledgeEntryFormProps) {
  const [question, setQuestion] = useState(initialData?.question ?? '')
  const [answer, setAnswer] = useState(initialData?.answer ?? '')
  const [tags, setTags] = useState<string[]>(initialData?.tags.filter((t) => t !== 'auto' && t !== 'manual') ?? [])
  const [newTag, setNewTag] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function addTag() {
    const trimmed = newTag.trim()
    if (!trimmed || tags.length >= 10) return
    setTags([...tags, trimmed])
    setNewTag('')
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (question.trim().length < 5) errs.question = 'Pergunta deve ter pelo menos 5 caracteres'
    if (answer.trim().length < 5) errs.answer = 'Resposta deve ter pelo menos 5 caracteres'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      await onSubmit({
        question: question.trim(),
        answer: answer.trim(),
        ...(tags.length > 0 && { tags }),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-[12px] font-medium text-text-muted">
          Pergunta <span className="text-danger">*</span>
        </Label>
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} className={INPUT_CLASS} placeholder="Ex: Vocês emitem nota fiscal?" />
        {errors.question && <p className="text-[11px] text-danger">{errors.question}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-[12px] font-medium text-text-muted">
          Resposta <span className="text-danger">*</span>
        </Label>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={3}
          className="rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"
          placeholder="Escreva a resposta..."
        />
        {errors.answer && <p className="text-[11px] text-danger">{errors.answer}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-[12px] font-medium text-text-muted">Tags</Label>
        <div className="flex gap-2">
          <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className={INPUT_CLASS + ' flex-1'} placeholder="Ex: fiscal" />
          <Button type="button" variant="outline" onClick={addTag} className="h-11 rounded-xl"><Plus className="h-4 w-4" /></Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <span key={tag + i} className="inline-flex items-center gap-1 rounded-md border border-border-default px-2 py-1 text-[11px] text-text-muted">
                {tag}
                <button type="button" onClick={() => setTags(tags.filter((_, j) => j !== i))} className="text-text-subtle hover:text-danger"><X className="h-2.5 w-2.5" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="h-11 flex-1 rounded-xl">Cancelar</Button>
        <Button
          type="submit"
          disabled={saving}
          className="h-11 flex-1 rounded-xl bg-accent px-6 text-[14px] font-semibold text-primary-foreground shadow-[0_0_24px_rgba(79,209,197,0.12)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_32px_rgba(79,209,197,0.18)]"
        >
          {saving ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Salvando...</span> : (initialData ? 'Atualizar' : 'Adicionar')}
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Create KnowledgeEntryList component**

```typescript
// src/components/onboarding/knowledge-entry-list.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Plus, Sparkles, User, MessageSquareText } from 'lucide-react'
import { KnowledgeEntryForm } from './knowledge-entry-form'
import type { KnowledgeEntry, CreateKnowledgeEntryPayload } from '@/lib/types'

interface KnowledgeEntryListProps {
  entries: KnowledgeEntry[]
  onCreate: (data: CreateKnowledgeEntryPayload) => Promise<void>
  onUpdate: (id: string, data: Partial<CreateKnowledgeEntryPayload>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
}

export function KnowledgeEntryList({ entries, onCreate, onUpdate, onDelete, isLoading }: KnowledgeEntryListProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  async function handleCreate(data: CreateKnowledgeEntryPayload) {
    await onCreate(data)
    setShowForm(false)
  }

  async function handleUpdate(data: CreateKnowledgeEntryPayload) {
    if (!editingId) return
    await onUpdate(editingId, data)
    setEditingId(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-surface p-5">
            <div className="space-y-3">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          </div>
        ))}
        <p className="text-center text-[13px] text-text-muted">A IA está gerando o knowledge base...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Add button */}
      {!showForm && (
        <Button variant="outline" onClick={() => setShowForm(true)} className="h-10 rounded-xl text-[13px]">
          <Plus className="h-4 w-4 mr-1.5" /> Nova Entrada
        </Button>
      )}

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card-surface p-5">
            <KnowledgeEntryForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries */}
      {entries.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mb-4">
            <MessageSquareText className="h-6 w-6 text-accent" />
          </div>
          <p className="text-[14px] font-medium text-text-primary">Nenhuma entrada no knowledge base</p>
          <p className="mt-1 text-[12px] text-text-subtle">Entries serão geradas automaticamente ao cadastrar produtos</p>
        </div>
      )}

      <AnimatePresence>
        {entries.map((entry, i) => {
          const isAuto = entry.tags.includes('auto')
          const isEditing = editingId === entry.id

          if (isEditing) {
            return (
              <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-surface p-5">
                <KnowledgeEntryForm initialData={entry} onSubmit={handleUpdate} onCancel={() => setEditingId(null)} />
              </motion.div>
            )
          }

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ delay: i * 0.03 }}
              className="card-surface overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className={`text-[10px] ${isAuto ? 'text-accent bg-accent/10' : 'text-violet bg-violet/10'}`}>
                        {isAuto ? <><Sparkles className="h-2.5 w-2.5 mr-0.5" />Auto</> : <><User className="h-2.5 w-2.5 mr-0.5" />Manual</>}
                      </Badge>
                      {entry.tags.filter((t) => t !== 'auto' && t !== 'manual' && !t.startsWith('product:')).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                    <p className="text-[14px] font-medium text-text-primary">{entry.question}</p>
                    <p className="mt-1.5 text-[13px] text-text-muted leading-relaxed">{entry.answer}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => setEditingId(entry.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-subtle hover:bg-accent/10 hover:text-accent transition-all">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => onDelete(entry.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-subtle hover:bg-danger-bg hover:text-danger transition-all">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/knowledge-entry-form.tsx src/components/onboarding/knowledge-entry-list.tsx
git commit -m "feat: add KnowledgeEntryForm and KnowledgeEntryList components"
```

---

## Task 9: ReadinessChecklist Component

**Files:**
- Create: `src/components/onboarding/readiness-checklist.tsx`

- [ ] **Step 1: Create the readiness checklist component**

```typescript
// src/components/onboarding/readiness-checklist.tsx
'use client'

import { motion } from 'motion/react'
import { CheckCircle2, XCircle, Rocket, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ReadinessCheck } from '@/lib/types'

const CLIENT_CHECKS = ['company_profile', 'products', 'knowledge_base'] as const

const CHECK_LABELS: Record<string, string> = {
  company_profile: 'Perfil da Empresa',
  products: 'Produtos Cadastrados',
  knowledge_base: 'Knowledge Base',
}

const CHECK_STEP_MAP: Record<string, number> = {
  company_profile: 1,
  products: 2,
  knowledge_base: 3,
}

interface ReadinessChecklistProps {
  checks: ReadinessCheck[]
  isLoading?: boolean
  onGoToDashboard: () => void
  onGoToStep?: (step: number) => void
}

export function ReadinessChecklist({ checks, isLoading, onGoToDashboard, onGoToStep }: ReadinessChecklistProps) {
  const clientChecks = checks.filter((c) => (CLIENT_CHECKS as readonly string[]).includes(c.name))
  const allReady = clientChecks.every((c) => c.ready)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {clientChecks.map((check, i) => (
          <motion.div
            key={check.name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-surface flex items-center gap-4 p-4"
          >
            <motion.div
              initial={false}
              animate={{ scale: check.ready ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              {check.ready ? (
                <CheckCircle2 className="h-6 w-6 text-success shrink-0" />
              ) : (
                <XCircle className="h-6 w-6 text-danger shrink-0" />
              )}
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-text-primary">
                {CHECK_LABELS[check.name] ?? check.name}
              </p>
              <p className="text-[12px] text-text-subtle">{check.detail}</p>
            </div>
            {!check.ready && onGoToStep && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onGoToStep(CHECK_STEP_MAP[check.name] ?? 1)}
                className="shrink-0 text-[12px] text-accent"
              >
                Resolver
              </Button>
            )}
          </motion.div>
        ))}
      </div>

      {allReady && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-hero p-6 text-center"
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10">
            <Rocket className="h-7 w-7 text-success" />
          </div>
          <h3 className="font-title text-[18px] font-bold text-text-primary">Sistema pronto!</h3>
          <p className="mt-1 text-[13px] text-text-muted">
            Tudo configurado. Seus agentes de IA estão prontos para operar.
          </p>
          <Button
            onClick={onGoToDashboard}
            className="mt-4 h-11 rounded-xl bg-accent px-8 text-[14px] font-semibold text-primary-foreground shadow-[0_0_24px_rgba(79,209,197,0.12)] hover:brightness-110 hover:shadow-[0_0_32px_rgba(79,209,197,0.18)]"
          >
            Ir para o Dashboard
          </Button>
        </motion.div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/onboarding/readiness-checklist.tsx
git commit -m "feat: add ReadinessChecklist component"
```

---

## Task 10: Onboarding Wizard Page

**Files:**
- Create: `src/app/onboarding/layout.tsx`
- Create: `src/app/onboarding/page.tsx`

- [ ] **Step 1: Create onboarding layout (fullscreen, no sidebar)**

```typescript
// src/app/onboarding/layout.tsx
import { redirect } from 'next/navigation'
import { authService } from '@/lib/services'

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  return (
    <div className="relative min-h-screen bg-bg-base">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(79,209,197,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(79,209,197,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
```

- [ ] **Step 2: Create onboarding wizard page**

```typescript
// src/app/onboarding/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { OnboardingStepper } from '@/components/onboarding/onboarding-stepper'
import { CompanyProfileForm } from '@/components/onboarding/company-profile-form'
import { ProductForm } from '@/components/onboarding/product-form'
import { ProductCard } from '@/components/onboarding/product-card'
import { KnowledgeEntryList } from '@/components/onboarding/knowledge-entry-list'
import { ReadinessChecklist } from '@/components/onboarding/readiness-checklist'
import { clientApi } from '@/lib/api/client-api'
import { MOTION } from '@/lib/motion'
import type {
  CompanyProfile,
  CreateCompanyProfilePayload,
  Product,
  CreateProductPayload,
  KnowledgeEntry,
  CreateKnowledgeEntryPayload,
  ReadinessCheck,
} from '@/lib/types'

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)

  // Step 1 state
  const [profile, setProfile] = useState<CompanyProfile | null>(null)

  // Step 2 state
  const [products, setProducts] = useState<Product[]>([])
  const [showProductForm, setShowProductForm] = useState(false)

  // Step 3 state
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [entriesLoading, setEntriesLoading] = useState(false)

  // Step 4 state
  const [checks, setChecks] = useState<ReadinessCheck[]>([])
  const [checksLoading, setChecksLoading] = useState(false)

  // Determine initial step based on readiness
  useEffect(() => {
    async function init() {
      try {
        const readiness = await clientApi<{ ready: boolean; checks: ReadinessCheck[] }>('/api/company/readiness')
        const profileCheck = readiness.checks.find((c) => c.name === 'company_profile')
        const productsCheck = readiness.checks.find((c) => c.name === 'products')
        const kbCheck = readiness.checks.find((c) => c.name === 'knowledge_base')

        if (!profileCheck?.ready) {
          setCurrentStep(1)
        } else if (!productsCheck?.ready) {
          setCurrentStep(2)
        } else if (!kbCheck?.ready) {
          setCurrentStep(3)
        } else {
          setCurrentStep(4)
        }

        // Load existing profile
        try {
          const existingProfile = await clientApi<CompanyProfile>('/api/company/profile')
          setProfile(existingProfile)
        } catch {
          // 404 — no profile yet
        }

        // Load existing products
        try {
          const existingProducts = await clientApi<Product[]>('/api/company/products')
          setProducts(existingProducts)
        } catch {
          // no products yet
        }
      } catch {
        // readiness endpoint failed, start from step 1
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Step 1: Save profile
  async function handleProfileSubmit(data: CreateCompanyProfilePayload) {
    try {
      if (profile) {
        const updated = await clientApi<CompanyProfile>('/api/company/profile', {
          method: 'PUT',
          body: JSON.stringify(data),
        })
        setProfile(updated)
      } else {
        try {
          const created = await clientApi<CompanyProfile>('/api/company/profile', {
            method: 'POST',
            body: JSON.stringify(data),
          })
          setProfile(created)
        } catch (err) {
          if (err instanceof Error && err.message.includes('409')) {
            const updated = await clientApi<CompanyProfile>('/api/company/profile', {
              method: 'PUT',
              body: JSON.stringify(data),
            })
            setProfile(updated)
          } else {
            throw err
          }
        }
      }
      toast.success('Perfil salvo com sucesso!')
      setCurrentStep(2)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar perfil')
    }
  }

  // Step 2: Product CRUD
  async function handleCreateProduct(data: CreateProductPayload) {
    try {
      const created = await clientApi<Product>('/api/company/products', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      setProducts((prev) => [...prev, created])
      setShowProductForm(false)
      toast.success('Produto criado! Knowledge base sendo gerado...')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar produto')
    }
  }

  async function handleDeleteProduct(id: string) {
    try {
      await clientApi<void>(`/api/company/products/${id}`, { method: 'DELETE' })
      setProducts((prev) => prev.filter((p) => p.id !== id))
      toast.success('Produto removido')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao deletar produto')
    }
  }

  function goToStep2Next() {
    if (products.length === 0) {
      toast.error('Cadastre pelo menos 1 produto para continuar')
      return
    }
    setCurrentStep(3)
    loadEntries()
  }

  // Step 3: Knowledge base
  const loadEntries = useCallback(async () => {
    setEntriesLoading(true)
    try {
      const data = await clientApi<KnowledgeEntry[]>('/api/company/knowledge')
      setEntries(data)

      // If no entries yet, poll
      if (data.length === 0) {
        const interval = setInterval(async () => {
          try {
            const polled = await clientApi<KnowledgeEntry[]>('/api/company/knowledge')
            if (polled.length > 0) {
              setEntries(polled)
              setEntriesLoading(false)
              clearInterval(interval)
            }
          } catch {
            clearInterval(interval)
          }
        }, 5000)

        // Stop polling after 60s
        setTimeout(() => {
          clearInterval(interval)
          setEntriesLoading(false)
        }, 60000)
        return
      }
    } catch {
      // error loading
    } finally {
      setEntriesLoading(false)
    }
  }, [])

  async function handleCreateEntry(data: CreateKnowledgeEntryPayload) {
    const created = await clientApi<KnowledgeEntry>('/api/company/knowledge', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    setEntries((prev) => [...prev, created])
    toast.success('Entrada adicionada')
  }

  async function handleUpdateEntry(id: string, data: Partial<CreateKnowledgeEntryPayload>) {
    const updated = await clientApi<KnowledgeEntry>(`/api/company/knowledge/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)))
    toast.success('Entrada atualizada')
  }

  async function handleDeleteEntry(id: string) {
    await clientApi<void>(`/api/company/knowledge/${id}`, { method: 'DELETE' })
    setEntries((prev) => prev.filter((e) => e.id !== id))
    toast.success('Entrada removida')
  }

  // Step 4: Readiness
  async function loadChecks() {
    setChecksLoading(true)
    try {
      const result = await clientApi<{ ready: boolean; checks: ReadinessCheck[] }>('/api/company/readiness')
      setChecks(result.checks)
    } catch {
      // error
    } finally {
      setChecksLoading(false)
    }
  }

  function handleStepChange(step: number) {
    setCurrentStep(step)
    if (step === 3) loadEntries()
    if (step === 4) loadChecks()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Logo width={120} height={30} />
        <span className="text-[12px] text-text-subtle">Passo {currentStep} de 4</span>
      </header>

      {/* Stepper */}
      <div className="px-6 py-4">
        <OnboardingStepper currentStep={currentStep} onStepClick={handleStepChange} />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: MOTION.duration.normal }}>
                <h2 className="font-title text-[22px] font-bold text-text-primary mb-2">Perfil da Empresa</h2>
                <p className="text-[14px] text-text-muted mb-8">Conte-nos sobre sua empresa para que os agentes de IA possam se comunicar adequadamente.</p>
                <div className="card-surface p-6 sm:p-8">
                  <CompanyProfileForm initialData={profile} onSubmit={handleProfileSubmit} submitLabel="Salvar e Continuar" />
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: MOTION.duration.normal }}>
                <h2 className="font-title text-[22px] font-bold text-text-primary mb-2">Produtos & Variantes</h2>
                <p className="text-[14px] text-text-muted mb-8">Cadastre seus produtos e planos. O knowledge base será gerado automaticamente.</p>

                {/* Existing products */}
                {products.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 mb-6">
                    {products.map((p, i) => (
                      <ProductCard key={p.id} product={p} onEdit={() => {}} onDelete={() => handleDeleteProduct(p.id)} index={i} />
                    ))}
                  </div>
                )}

                {/* Add product form or button */}
                {showProductForm ? (
                  <div className="card-surface p-6 sm:p-8">
                    <ProductForm onSubmit={handleCreateProduct} onCancel={() => setShowProductForm(false)} />
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setShowProductForm(true)} className="h-11 w-full rounded-xl border-dashed border-border-default text-[13px] text-text-muted hover:text-accent hover:border-accent/30">
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Produto
                  </Button>
                )}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: MOTION.duration.normal }}>
                <h2 className="font-title text-[22px] font-bold text-text-primary mb-2">Knowledge Base</h2>
                <p className="text-[14px] text-text-muted mb-8">Revise as perguntas e respostas geradas automaticamente. Edite ou adicione novas.</p>
                <KnowledgeEntryList
                  entries={entries}
                  onCreate={handleCreateEntry}
                  onUpdate={handleUpdateEntry}
                  onDelete={handleDeleteEntry}
                  isLoading={entriesLoading}
                />
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: MOTION.duration.normal }}>
                <h2 className="font-title text-[22px] font-bold text-text-primary mb-2">Checklist de Prontidão</h2>
                <p className="text-[14px] text-text-muted mb-8">Verifique se tudo está configurado para seus agentes começarem a operar.</p>
                <ReadinessChecklist
                  checks={checks}
                  isLoading={checksLoading}
                  onGoToDashboard={() => router.push('/dashboard')}
                  onGoToStep={handleStepChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer navigation */}
      <footer className="border-t border-border-default px-6 py-4 sm:px-10">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => handleStepChange(currentStep - 1)}
            disabled={currentStep === 1}
            className="h-10 rounded-xl text-[13px]"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Voltar
          </Button>
          {currentStep < 4 && currentStep !== 1 && (
            <Button
              onClick={() => {
                if (currentStep === 2) goToStep2Next()
                else handleStepChange(currentStep + 1)
              }}
              className="h-10 rounded-xl bg-accent px-6 text-[13px] font-semibold text-primary-foreground hover:brightness-110"
            >
              Próximo <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/onboarding/layout.tsx src/app/onboarding/page.tsx
git commit -m "feat: add onboarding wizard with fullscreen layout and 4-step flow"
```

---

## Task 11: Products Sidebar Page

**Files:**
- Create: `src/app/(authenticated)/produtos/page.tsx`

- [ ] **Step 1: Create products page**

```typescript
// src/app/(authenticated)/produtos/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Package, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/onboarding/product-card'
import { ProductForm } from '@/components/onboarding/product-form'
import { clientApi } from '@/lib/api/client-api'
import type { Product, CreateProductPayload } from '@/lib/types'

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    clientApi<Product[]>('/api/company/products')
      .then(setProducts)
      .catch(() => toast.error('Erro ao carregar produtos'))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(data: CreateProductPayload) {
    const created = await clientApi<Product>('/api/company/products', { method: 'POST', body: JSON.stringify(data) })
    setProducts((prev) => [...prev, created])
    setShowForm(false)
    toast.success('Produto criado! Knowledge base sendo atualizado...')
  }

  async function handleDelete(id: string) {
    await clientApi<void>(`/api/company/products/${id}`, { method: 'DELETE' })
    setProducts((prev) => prev.filter((p) => p.id !== id))
    toast.success('Produto removido')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5">
            <Package className="h-[18px] w-[18px] text-accent" />
          </div>
          <div>
            <h1 className="font-title text-[22px] font-bold text-text-primary">Produtos</h1>
            <p className="text-[13px] text-text-muted">{products.length} produto{products.length !== 1 && 's'} cadastrado{products.length !== 1 && 's'}</p>
          </div>
        </div>
        <Button
          onClick={() => { setEditingProduct(null); setShowForm(true) }}
          className="h-10 rounded-xl bg-accent px-5 text-[13px] font-semibold text-primary-foreground hover:brightness-110"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Novo Produto
        </Button>
      </div>

      {/* Create/Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card-surface p-6">
            <ProductForm
              initialData={editingProduct ?? undefined}
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products grid */}
      {products.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mb-4">
            <Package className="h-6 w-6 text-accent" />
          </div>
          <p className="text-[14px] font-medium text-text-primary">Nenhum produto cadastrado</p>
          <p className="mt-1 text-[12px] text-text-subtle">Adicione seu primeiro produto para começar</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => { setEditingProduct(product); setShowForm(true) }}
              onDelete={() => handleDelete(product.id)}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(authenticated\)/produtos/page.tsx
git commit -m "feat: add /produtos sidebar page with product CRUD"
```

---

## Task 12: Knowledge Base Sidebar Page

**Files:**
- Create: `src/app/(authenticated)/knowledge-base/page.tsx`

- [ ] **Step 1: Create knowledge base page**

```typescript
// src/app/(authenticated)/knowledge-base/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { KnowledgeEntryList } from '@/components/onboarding/knowledge-entry-list'
import { clientApi } from '@/lib/api/client-api'
import type { KnowledgeEntry, CreateKnowledgeEntryPayload } from '@/lib/types'

export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    clientApi<KnowledgeEntry[]>('/api/company/knowledge')
      .then(setEntries)
      .catch(() => toast.error('Erro ao carregar knowledge base'))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(data: CreateKnowledgeEntryPayload) {
    const created = await clientApi<KnowledgeEntry>('/api/company/knowledge', { method: 'POST', body: JSON.stringify(data) })
    setEntries((prev) => [...prev, created])
    toast.success('Entrada adicionada')
  }

  async function handleUpdate(id: string, data: Partial<CreateKnowledgeEntryPayload>) {
    const updated = await clientApi<KnowledgeEntry>(`/api/company/knowledge/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)))
    toast.success('Entrada atualizada')
  }

  async function handleDelete(id: string) {
    await clientApi<void>(`/api/company/knowledge/${id}`, { method: 'DELETE' })
    setEntries((prev) => prev.filter((e) => e.id !== id))
    toast.success('Entrada removida')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet/15 to-violet/5">
          <BookOpen className="h-[18px] w-[18px] text-violet" />
        </div>
        <div>
          <h1 className="font-title text-[22px] font-bold text-text-primary">Knowledge Base</h1>
          <p className="text-[13px] text-text-muted">{entries.length} entrada{entries.length !== 1 && 's'}</p>
        </div>
      </div>

      {/* Knowledge entries */}
      <KnowledgeEntryList
        entries={entries}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(authenticated\)/knowledge-base/page.tsx
git commit -m "feat: add /knowledge-base sidebar page"
```

---

## Task 13: Readiness Banner on Dashboard

**Files:**
- Create: `src/components/widgets/readiness-banner.tsx`
- Modify: `src/app/(authenticated)/dashboard/page.tsx`

- [ ] **Step 1: Create ReadinessBanner widget**

```typescript
// src/components/widgets/readiness-banner.tsx
import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'
import type { ReadinessResult } from '@/lib/types'

interface ReadinessBannerProps {
  readiness: ReadinessResult
}

export function ReadinessBanner({ readiness }: ReadinessBannerProps) {
  if (readiness.ready) return null

  // Determine which step to send user to
  const profileReady = readiness.checks.find((c) => c.name === 'company_profile')?.ready
  const step = !profileReady ? 1 : 2 // If profile missing, step 1, otherwise step 2+

  return (
    <div className="card-hero relative p-5 mb-8">
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-text-primary">Complete a configuração para ativar seus agentes</p>
            <p className="text-[12px] text-text-muted">Finalize o onboarding para que o sistema comece a operar</p>
          </div>
        </div>
        <Link
          href="/onboarding"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-accent px-5 text-[13px] font-semibold text-primary-foreground shadow-[0_0_24px_rgba(79,209,197,0.12)] transition-all hover:brightness-110 hover:shadow-[0_0_32px_rgba(79,209,197,0.18)]"
        >
          Continuar configuração
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Modify dashboard page to include readiness banner**

In `src/app/(authenticated)/dashboard/page.tsx`:

Add the import for `readinessService` (add to the existing import from `@/lib/services`):

```typescript
import { authService, campaignService, analyticsService, leadService, alertService, readinessService } from '@/lib/services'
```

Add the import for `ReadinessBanner`:

```typescript
import { ReadinessBanner } from '@/components/widgets/readiness-banner'
```

Add `readinessService.check()` to the `Promise.all` call. Change the destructuring line:

```typescript
const [roi, health, funnel, ltvCac, objections, hoursSaved, agents, alerts, readiness] = await Promise.all([
    campaignService.getTotalRoi(user.company_id),
    analyticsService.getHealthScore(user.company_id),
    leadService.getFunnelStats(user.company_id, '30d'),
    analyticsService.getLtvCac(user.company_id),
    leadService.getTopObjections(user.company_id),
    analyticsService.getHoursSaved(user.company_id),
    analyticsService.getAgentsActivity(user.company_id),
    alertService.getRecent(user.company_id),
    readinessService.check(),
  ])
```

Add the banner right after the opening `<div className="space-y-8">`, before the Greeting:

```tsx
<div className="space-y-8">
  {/* Readiness Banner */}
  <ReadinessBanner readiness={readiness} />

  {/* Greeting */}
  <DashboardGreeting userName={user.name} healthScore={health.score} />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/widgets/readiness-banner.tsx src/app/\(authenticated\)/dashboard/page.tsx
git commit -m "feat: add readiness banner to dashboard when onboarding is incomplete"
```

---

## Task 14: Build Verification

- [ ] **Step 1: Run TypeScript type checking**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 2: Run lint**

Run: `npx next lint`
Expected: No lint errors (or only pre-existing ones)

- [ ] **Step 3: Run build**

Run: `npx next build`
Expected: Build succeeds

- [ ] **Step 4: Fix any errors found and commit**

If errors found, fix them and commit:

```bash
git add -A
git commit -m "fix: resolve build errors from onboarding integration"
```
