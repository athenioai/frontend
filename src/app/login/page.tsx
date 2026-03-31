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
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(79,209,197,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(79,209,197,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating orbs */}
      <div className="animate-float pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
      <div className="animate-float pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-accent/5 blur-3xl" style={{ animationDelay: '11s' }} />

      <div className="glass-card relative z-10 w-full max-w-md p-10">
        {/* Logo text */}
        <div className="mb-8 flex justify-center">
          <span className="font-title text-3xl font-bold text-accent">Athenio.ai</span>
        </div>

        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-text-muted">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              className="border-border-default bg-bg-input text-text-primary placeholder:text-text-subtle focus:border-accent focus:bg-[rgba(79,209,197,0.05)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-text-muted">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="border-border-default bg-bg-input text-text-primary placeholder:text-text-subtle focus:border-accent focus:bg-[rgba(79,209,197,0.05)]"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-danger">{state.error}</p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-accent py-3 font-semibold text-[#070C0C] shadow-[0_0_40px_rgba(79,209,197,0.3)] transition-transform hover:-translate-y-0.5 hover:bg-accent-light disabled:opacity-50"
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
