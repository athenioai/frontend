'use client'

import { useActionState } from 'react'
import { loginAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Deep atmospheric gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0a0f12] via-[#08090A] to-[#0d0a12]" />

      {/* Large ambient glow — teal top-left */}
      <div className="pointer-events-none absolute -left-[20%] -top-[30%] h-[70vh] w-[70vh] rounded-full bg-[#4FD1C5]/[0.04] blur-[150px]" />
      {/* Violet bottom-right */}
      <div className="pointer-events-none absolute -bottom-[20%] -right-[15%] h-[60vh] w-[60vh] rounded-full bg-[#A78BFA]/[0.03] blur-[130px]" />
      {/* Warm center glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[40vh] w-[40vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E8C872]/[0.02] blur-[120px]" />

      {/* Fine dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(240,237,232,0.6) 0.5px, transparent 0.5px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="card-glass relative z-10 w-full max-w-[420px] p-12">
        {/* Logo */}
        <div className="mb-10 text-center">
          <h1 className="text-[28px] tracking-tight text-text-primary">
            <span className="font-title text-[34px] font-bold text-accent">Athenio</span>
            <span className="ml-0.5 text-text-subtle">.ai</span>
          </h1>
          <p className="mt-2 text-[13px] text-text-subtle">
            Painel de controle inteligente
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[13px] font-medium text-text-muted">
              E-mail
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@empresa.com"
              required
              autoComplete="email"
              className="h-11 rounded-xl border-border-default bg-[rgba(255,255,255,0.03)] text-text-primary placeholder:text-text-subtle/60 transition-all focus:border-accent/40 focus:bg-[rgba(79,209,197,0.03)] focus:ring-1 focus:ring-accent/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[13px] font-medium text-text-muted">
              Senha
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="h-11 rounded-xl border-border-default bg-[rgba(255,255,255,0.03)] text-text-primary placeholder:text-text-subtle/60 transition-all focus:border-accent/40 focus:bg-[rgba(79,209,197,0.03)] focus:ring-1 focus:ring-accent/20"
            />
          </div>

          {state?.error && (
            <p className="text-[13px] text-danger">{state.error}</p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="h-11 w-full rounded-xl bg-accent font-semibold text-primary-foreground shadow-[0_0_24px_rgba(79,209,197,0.15)] transition-all hover:brightness-110 hover:shadow-[0_0_32px_rgba(79,209,197,0.25)] disabled:opacity-50"
          >
            {isPending ? 'Entrando...' : 'Acessar painel'}
          </Button>
        </form>

        <p className="mt-8 text-center text-[11px] text-text-subtle/50">
          Acesso restrito a clientes Athenio.ai
        </p>
      </div>
    </div>
  )
}
