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

                {products.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 mb-6">
                    {products.map((p, i) => (
                      <ProductCard key={p.id} product={p} onEdit={() => {}} onDelete={() => handleDeleteProduct(p.id)} index={i} />
                    ))}
                  </div>
                )}

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
