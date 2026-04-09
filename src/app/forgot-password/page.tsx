'use client'

import { useState, useActionState } from 'react'
import { motion } from 'motion/react'
import { sendCodeAction, resetPasswordAction } from './actions'
import { ArrowLeft, Mail, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/ui/logo'
import { MOTION } from '@/lib/motion'
import Link from 'next/link'

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

type Step = 'email' | 'reset' | 'done'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [sendState, sendAction, sendPending] = useActionState(async (_prev: unknown, formData: FormData) => {
    const result = await sendCodeAction(_prev, formData)
    if (result.success && result.email) {
      setEmail(result.email)
      setStep('reset')
    }
    return result
  }, null)

  const [resetState, resetAction, resetPending] = useActionState(async (_prev: unknown, formData: FormData) => {
    formData.set('email', email)
    const result = await resetPasswordAction(_prev, formData)
    if (result.success) {
      setStep('done')
    }
    return result
  }, null)

  return (
    <div className="flex min-h-screen">
      {/* ─── Left panel: brand showcase ─── */}
      <div className="relative hidden w-[55%] flex-col items-center justify-center overflow-hidden lg:flex">
        <div className="absolute inset-0 bg-brand-green" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4820A]/[0.12] via-[#D4820A]/[0.03] to-[#4FD1C5]/[0.06]" />

        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-0 animate-[spin_25s_linear_infinite] rounded-full bg-gradient-conic from-[#D4820A]/15 via-transparent via-40% to-[#4FD1C5]/10 blur-[80px]" />
        </div>

        <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#D4820A]/[0.12] animate-[spin_40s_linear_infinite]" />
        <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#4FD1C5]/[0.08] animate-[spin_60s_linear_infinite_reverse]" />

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

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 flex flex-col items-center px-12 text-center"
        >
          <motion.div variants={fadeUp} transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}>
            <Logo width={200} height={50} />
          </motion.div>

          <motion.p
            variants={fadeUp}
            transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
            className="mt-6 max-w-[320px] text-[15px] leading-relaxed text-[rgba(240,237,232,0.7)]"
          >
            Seus agentes de IA trabalhando 24/7.
            <br />
            Acompanhe tudo em tempo real.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
            className="mt-12 flex items-center gap-0"
          >
            {[
              { value: '3', label: 'Agentes IA' },
              { value: '24/7', label: 'Operação' },
              { value: '3.5×', label: 'ROAS médio' },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center">
                {i > 0 && (
                  <div className="mx-8 h-8 w-[1px] bg-gradient-to-b from-transparent via-[rgba(240,237,232,0.12)] to-transparent" />
                )}
                <div className="text-center">
                  <p className="font-title text-[22px] font-bold text-text-primary">{stat.value}</p>
                  <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.1em] text-[rgba(240,237,232,0.4)]">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-brand-green to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#D4820A]/25 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-[60px] bg-gradient-to-l from-[#D4820A]/[0.03] to-transparent" />
      </div>

      {/* ─── Right panel ─── */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-12 lg:px-16">
        <div className="absolute inset-0 bg-bg-base" />

        <div className="pointer-events-none absolute -right-[10%] top-[5%] h-[450px] w-[450px] rounded-full bg-[#D4820A]/[0.05] blur-[100px] animate-[float-slow_20s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -left-[5%] bottom-[0%] h-[400px] w-[400px] rounded-full bg-[#4FD1C5]/[0.04] blur-[90px] animate-[float-slow_25s_ease-in-out_infinite_reverse]" />
        <div className="pointer-events-none absolute right-[15%] bottom-[15%] h-[250px] w-[250px] rounded-full bg-[#F0B84A]/[0.04] blur-[70px] animate-[float-slow_18s_ease-in-out_infinite_2s]" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(28,27,24,0.15) 0.5px, transparent 0.5px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#D4820A]/[0.03] via-transparent to-transparent" />

        <div className="relative z-10 mb-12 lg:hidden">
          <Logo width={160} height={40} />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 w-full max-w-[380px]"
        >
          {/* ── Step 1: E-mail ── */}
          {step === 'email' && (
            <>
              <motion.div
                variants={fadeUp}
                transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
                className="mb-8 text-center"
              >
                <h2 className="font-title text-[24px] font-bold text-text-primary">
                  Recuperar senha
                </h2>
                <p className="mt-1.5 text-[14px] text-text-muted">
                  Informe seu e-mail para receber o código de verificação
                </p>
              </motion.div>

              <form action={sendAction} className="space-y-5">
                <motion.div
                  variants={fadeUp}
                  transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
                  className="space-y-1.5"
                >
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
                    className="h-12 rounded-xl border-border-default bg-white text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/40 focus:bg-accent/5 focus:ring-2 focus:ring-accent/15"
                  />
                </motion.div>

                {sendState?.error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-danger/8 px-3 py-2.5"
                  >
                    <p className="text-[13px] text-danger">{sendState.error}</p>
                  </motion.div>
                )}

                <motion.div variants={fadeUp} transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}>
                  <Button
                    type="submit"
                    disabled={sendPending}
                    className="h-12 w-full rounded-xl bg-accent text-[15px] font-semibold text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_32px_rgba(212,130,10,0.12)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_48px_rgba(212,130,10,0.18)] active:scale-[0.99] disabled:opacity-50"
                  >
                    {sendPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                        Enviando...
                      </span>
                    ) : (
                      'Enviar código'
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.div
                variants={fadeUp}
                transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
                className="mt-8 flex justify-center"
              >
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-[13px] text-accent/70 transition-colors hover:text-accent"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para o login
                </Link>
              </motion.div>
            </>
          )}

          {/* ── Step 2: Código + Nova senha ── */}
          {step === 'reset' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
            >
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15">
                  <Mail className="h-6 w-6 text-accent" />
                </div>
                <h2 className="font-title text-[24px] font-bold text-text-primary">
                  Redefinir senha
                </h2>
                <p className="mt-1.5 text-[14px] text-text-muted">
                  Digite o código enviado para <span className="text-text-primary">{email}</span>
                </p>
              </div>

              <form action={resetAction} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="code" className="text-[13px] font-medium text-text-muted">
                    Código de verificação
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    required
                    autoComplete="one-time-code"
                    maxLength={6}
                    className="h-12 rounded-xl border-border-default bg-white text-center font-title text-[20px] tracking-[0.3em] text-text-primary placeholder:text-text-subtle placeholder:tracking-[0.3em] transition-all duration-200 focus:border-accent/40 focus:bg-accent/5 focus:ring-2 focus:ring-accent/15"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[13px] font-medium text-text-muted">
                    Nova senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="h-12 rounded-xl border-border-default bg-white pr-11 text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/40 focus:bg-accent/5 focus:ring-2 focus:ring-accent/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle transition-colors hover:text-text-muted"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-[13px] font-medium text-text-muted">
                    Confirmar senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repita a senha"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="h-12 rounded-xl border-border-default bg-white pr-11 text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/40 focus:bg-accent/5 focus:ring-2 focus:ring-accent/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle transition-colors hover:text-text-muted"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {resetState?.error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-danger/8 px-3 py-2.5"
                  >
                    <p className="text-[13px] text-danger">{resetState.error}</p>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={resetPending}
                  className="h-12 w-full rounded-xl bg-accent text-[15px] font-semibold text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_32px_rgba(212,130,10,0.12)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_48px_rgba(212,130,10,0.18)] active:scale-[0.99] disabled:opacity-50"
                >
                  {resetPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      Salvando...
                    </span>
                  ) : (
                    'Redefinir senha'
                  )}
                </Button>
              </form>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex items-center gap-2 text-[13px] text-accent/70 transition-colors hover:text-accent"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Usar outro e-mail
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Sucesso ── */}
          {step === 'done' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center gap-4 rounded-xl border border-accent/20 bg-accent/[0.06] px-6 py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15">
                  <CheckCircle className="h-6 w-6 text-accent" />
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-medium text-text-primary">
                    Senha redefinida
                  </p>
                  <p className="mt-1.5 text-[13px] text-text-muted">
                    Sua senha foi alterada com sucesso. Você já pode fazer login.
                  </p>
                </div>
              </div>

              <Link
                href="/login"
                className="flex h-12 w-full items-center justify-center rounded-xl bg-accent text-[15px] font-semibold text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_32px_rgba(212,130,10,0.12)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_48px_rgba(212,130,10,0.18)] active:scale-[0.99]"
              >
                Ir para o login
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
