'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { loginAction } from './actions'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/ui/logo'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* ─── Left panel: brand showcase ─── */}
      <div className="relative hidden w-[55%] flex-col items-center justify-center overflow-hidden lg:flex">
        {/* Base */}
        <div className="absolute inset-0 bg-[#080A0E]" />

        {/* Strong teal gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4FD1C5]/[0.14] via-[#4FD1C5]/[0.04] to-[#A78BFA]/[0.08]" />

        {/* Animated gradient orb */}
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-0 animate-[spin_25s_linear_infinite] rounded-full bg-gradient-conic from-[#4FD1C5]/20 via-transparent via-40% to-[#A78BFA]/15 blur-[80px]" />
        </div>

        {/* Orbital rings */}
        <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#4FD1C5]/[0.15] animate-[spin_40s_linear_infinite]" />
        <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#A78BFA]/[0.10] animate-[spin_60s_linear_infinite_reverse]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(240,237,232,0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(240,237,232,0.4) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-12 text-center">
          <Logo width={200} height={50} />

          <p className="mt-6 max-w-[320px] text-[15px] leading-relaxed text-[rgba(240,237,232,0.7)]">
            Seus agentes de IA trabalhando 24/7.
            <br />
            Acompanhe tudo em tempo real.
          </p>

          {/* Stats */}
          <div className="mt-12 flex gap-10">
            {[
              { value: '3', label: 'Agentes IA' },
              { value: '24/7', label: 'Operação' },
              { value: '3.5×', label: 'ROAS médio' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-title text-[22px] font-bold text-text-primary">{stat.value}</p>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.1em] text-[rgba(240,237,232,0.4)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#080A0E] to-transparent" />

        {/* Right edge glow divider */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#4FD1C5]/30 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-[60px] bg-gradient-to-l from-[#4FD1C5]/[0.04] to-transparent" />
      </div>

      {/* ─── Right panel: login form — noticeably lighter ─── */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-12 lg:px-16">
        {/* Lighter background */}
        <div className="absolute inset-0 bg-[#141820]" />

        {/* Floating ambient orbs — visible, slow drift */}
        <div className="pointer-events-none absolute -right-[10%] top-[5%] h-[450px] w-[450px] rounded-full bg-[#4FD1C5]/[0.12] blur-[100px] animate-[float-slow_20s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -left-[5%] bottom-[0%] h-[400px] w-[400px] rounded-full bg-[#A78BFA]/[0.10] blur-[90px] animate-[float-slow_25s_ease-in-out_infinite_reverse]" />
        <div className="pointer-events-none absolute right-[15%] bottom-[15%] h-[250px] w-[250px] rounded-full bg-[#E8C872]/[0.07] blur-[70px] animate-[float-slow_18s_ease-in-out_infinite_2s]" />

        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(240,237,232,0.6) 0.5px, transparent 0.5px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Soft top glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4FD1C5]/[0.04] via-transparent to-transparent" />

        {/* Mobile logo */}
        <div className="relative z-10 mb-12 lg:hidden">
          <Logo width={160} height={40} />
        </div>

        <div className="relative z-10 w-full max-w-[380px]">
          <div className="mb-8 text-center">
            <h2 className="font-title text-[24px] font-bold text-text-primary">
              Bem-vindo de volta
            </h2>
            <p className="mt-1.5 text-[14px] text-text-muted">
              Acesse o painel da sua operação
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            <div className="space-y-1.5">
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
                className="h-12 rounded-xl border-[rgba(240,237,232,0.10)] bg-[rgba(240,237,232,0.06)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/40 focus:bg-[rgba(79,209,197,0.06)] focus:ring-2 focus:ring-accent/15"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[13px] font-medium text-text-muted">
                  Senha
                </Label>
                <button type="button" className="text-[12px] text-accent/70 transition-colors hover:text-accent">
                  Esqueceu?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="h-12 rounded-xl border-[rgba(240,237,232,0.10)] bg-[rgba(240,237,232,0.06)] pr-11 text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/40 focus:bg-[rgba(79,209,197,0.06)] focus:ring-2 focus:ring-accent/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle transition-colors hover:text-text-muted"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="remember"
                className="h-4 w-4 rounded border-[rgba(240,237,232,0.15)] bg-[rgba(240,237,232,0.06)] text-accent accent-accent focus:ring-accent/20"
              />
              <span className="text-[13px] text-text-muted">Lembrar-me</span>
            </label>

            {state?.error && (
              <div className="rounded-lg bg-danger/8 px-3 py-2.5">
                <p className="text-[13px] text-danger">{state.error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="h-12 w-full rounded-xl bg-accent text-[15px] font-semibold text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_32px_rgba(79,209,197,0.12)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_48px_rgba(79,209,197,0.18)] active:scale-[0.99] disabled:opacity-50"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Entrando...
                </span>
              ) : (
                'Acessar painel'
              )}
            </Button>
          </form>

          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-[13px] text-text-subtle">
              Ainda não é cliente?
            </p>
            <a
              href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20a%20Athenio.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#25D366]/30 bg-[#25D366]/8 px-5 text-[13px] font-semibold text-[#25D366] transition-all duration-200 hover:border-[#25D366]/50 hover:bg-[#25D366]/15"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Falar com a equipe
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
