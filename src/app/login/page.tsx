'use client'

import { useActionState } from 'react'
import { loginAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 bg-bg-base">
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(79,209,197,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(79,209,197,0.4) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Gradient orbs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-accent/5 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet/5 blur-[100px]" />

      <div className="card-surface relative z-10 w-full max-w-md p-10">
        {/* Logo */}
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
              className="border-border-default bg-surface-2 text-text-primary placeholder:text-text-subtle focus:border-accent focus:ring-1 focus:ring-accent/30"
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
              className="border-border-default bg-surface-2 text-text-primary placeholder:text-text-subtle focus:border-accent focus:ring-1 focus:ring-accent/30"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-danger">{state.error}</p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-accent py-3 font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
