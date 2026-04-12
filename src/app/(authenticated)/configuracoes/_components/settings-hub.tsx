'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  CalendarDays,
  MessageCircle,
  Save,
  Check,
  Plug,
  Unplug,
  Loader2,
  X,
  KeyRound,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Copy,
  CircleDot,
  Bot,
  ClipboardPaste,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOTION } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { updateCalendarConfig, connectChannel, disconnectChannel } from '../actions'
import { Dialog } from '@base-ui/react/dialog'
import type {
  CalendarConfig,
  BusinessHour,
} from '@/lib/services/interfaces/calendar-config-service'
import type {
  ChannelAccount,
  SupportedChannel,
} from '@/lib/services/interfaces/channel-account-service'

// ── Channel config ──

interface WizardStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  content: 'instructions' | 'token' | 'embedded-signup' | 'info'
  instructions?: { text: string; command?: string }[]
  deepLink?: { url: string; label: string }
  infoBullets?: { emoji: string; title: string; text: string }[]
}

interface ChannelConfig {
  label: string
  color: string
  bgClass: string
  textClass: string
  borderClass: string
  hoverClass: string
  icon: React.ReactNode
  tokenPlaceholder: string
  wizardSteps: WizardStep[]
}

const CHANNEL_META: Record<SupportedChannel, ChannelConfig> = {
  telegram: {
    label: 'Telegram',
    color: '#2AABEE',
    bgClass: 'bg-[#2AABEE]/10',
    textClass: 'text-[#2AABEE]',
    borderClass: 'border-[#2AABEE]/30',
    hoverClass: 'hover:border-[#2AABEE]/50 hover:bg-[#2AABEE]/15',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[#2AABEE]">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    tokenPlaceholder: '7123456789:AAHx9k...',
    wizardSteps: [
      {
        id: 'open-botfather',
        title: 'Abrir o BotFather',
        description: 'O BotFather é o assistente oficial do Telegram para criar bots.',
        icon: <Bot className="h-5 w-5" />,
        content: 'instructions',
        instructions: [
          { text: 'Clique no botão abaixo para abrir o BotFather no Telegram' },
          { text: 'Se não tiver o Telegram instalado, baixe primeiro em telegram.org' },
        ],
        deepLink: { url: 'https://t.me/BotFather', label: 'Abrir BotFather' },
      },
      {
        id: 'create-bot',
        title: 'Criar o bot',
        description: 'Envie os comandos abaixo no chat com o BotFather.',
        icon: <CircleDot className="h-5 w-5" />,
        content: 'instructions',
        instructions: [
          { text: 'Envie o comando:', command: '/newbot' },
          { text: 'Escolha um nome para o bot (ex: "Minha Empresa")' },
          { text: 'Escolha um username (deve terminar com "bot", ex: minhaempresa_bot)' },
          { text: 'O BotFather vai gerar um token — copie ele' },
        ],
      },
      {
        id: 'paste-token',
        title: 'Colar o token',
        description: 'Cole o token que o BotFather gerou para conectar seu bot.',
        icon: <ClipboardPaste className="h-5 w-5" />,
        content: 'token',
      },
    ],
  },
  whatsapp: {
    label: 'WhatsApp',
    color: '#25D366',
    bgClass: 'bg-[#25D366]/10',
    textClass: 'text-[#25D366]',
    borderClass: 'border-[#25D366]/30',
    hoverClass: 'hover:border-[#25D366]/50 hover:bg-[#25D366]/15',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[#25D366]">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    tokenPlaceholder: 'Token de acesso do WhatsApp Business',
    wizardSteps: [
      {
        id: 'pricing-info',
        title: 'Como funciona o custo',
        description: 'Antes de conectar, entenda como o WhatsApp Business funciona:',
        icon: <MessageCircle className="h-5 w-5" />,
        content: 'info',
        infoBullets: [
          {
            emoji: '✓',
            title: 'Atendimento é gratuito',
            text: 'Quando o cliente manda mensagem e você responde em 24h, não paga nada. A janela reinicia a cada resposta do cliente — gratuito enquanto ele responder.',
          },
          {
            emoji: '~',
            title: 'Só cobra se você iniciar',
            text: 'O único custo é contactar um lead em silêncio há mais de 24h (~R$0,35 por conversa). Atendimento reativo é sempre grátis.',
          },
          {
            emoji: '!',
            title: 'A Meta pede um cartão no cadastro',
            text: 'É como o cartão na Netflix: pede no cadastro, mas só cobra se você usar algo além do que já está incluso.',
          },
        ],
      },
      {
        id: 'embedded-signup',
        title: 'Conectar via Meta',
        description: 'Conecte sua conta WhatsApp Business diretamente pela Meta. O processo leva poucos minutos.',
        icon: <Plug className="h-5 w-5" />,
        content: 'embedded-signup',
        instructions: [
          { text: 'Faça login com sua conta Meta (Facebook/Instagram)' },
          { text: 'Crie ou selecione uma conta WhatsApp Business' },
          { text: 'Registre o número de telefone desejado' },
          { text: 'Pronto — a conexão é automática' },
        ],
      },
      {
        id: 'paste-token',
        title: 'Token manual',
        description: 'Se preferir, cole o token de acesso da sua conta WhatsApp Business API.',
        icon: <KeyRound className="h-5 w-5" />,
        content: 'token',
      },
    ],
  },
}

const ALL_CHANNELS: SupportedChannel[] = ['whatsapp', 'telegram']

const COMING_SOON_CHANNELS: { id: string; label: string; bgClass: string; icon: React.ReactNode }[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    bgClass: 'bg-[#E4405F]/10',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[#E4405F]">
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z" />
      </svg>
    ),
  },
  {
    id: 'sms',
    label: 'SMS',
    bgClass: 'bg-accent/10',
    icon: <MessageCircle className="h-6 w-6 text-accent" />,
  },
]

// ── Navigation ──

const SECTIONS = [
  {
    id: 'agenda',
    label: 'Agenda',
    description: 'Horários e regras',
    icon: CalendarDays,
  },
  {
    id: 'canais',
    label: 'Canais',
    description: 'Apps de conversa',
    icon: MessageCircle,
  },
]

// ── Calendar constants ──

const DAYS = [
  'Domingo',
  'Segunda',
  'Terca',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sabado',
]

const DEFAULT_HOURS: BusinessHour[] = [
  { dia: 'Domingo', horario: 'Fechado' },
  { dia: 'Segunda', horario: '09:00 as 18:00' },
  { dia: 'Terca', horario: '09:00 as 18:00' },
  { dia: 'Quarta', horario: '09:00 as 18:00' },
  { dia: 'Quinta', horario: '09:00 as 18:00' },
  { dia: 'Sexta', horario: '09:00 as 18:00' },
  { dia: 'Sabado', horario: '09:00 as 12:00' },
]

interface DayState {
  open: boolean
  start: string
  end: string
}

function parseHorario(horario: string): DayState {
  if (horario === 'Fechado')
    return { open: false, start: '09:00', end: '18:00' }
  const parts = horario.split(' as ')
  return { open: true, start: parts[0] ?? '09:00', end: parts[1] ?? '18:00' }
}

function serializeHorario(state: DayState): string {
  return state.open ? `${state.start} as ${state.end}` : 'Fechado'
}

// ── Main Component ──

interface SettingsHubProps {
  activeTab: string
  calendarConfig: CalendarConfig | null
  channelAccounts: ChannelAccount[]
}

export function SettingsHub({
  activeTab,
  calendarConfig,
  channelAccounts,
}: SettingsHubProps) {
  const router = useRouter()

  function changeTab(id: string) {
    const params = new URLSearchParams()
    if (id !== 'agenda') params.set('tab', id)
    const qs = params.toString()
    router.push(`/configuracoes${qs ? `?${qs}` : ''}`)
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
      >
        <h1 className="font-title text-2xl font-bold text-text-primary">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Gerencie as configurações da sua operação
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08, duration: MOTION.duration.slow }}
        className="mt-8 flex flex-col gap-6 lg:flex-row lg:h-[calc(100vh-180px)]"
      >
        <nav className="flex shrink-0 gap-2 lg:w-56 lg:flex-col">
          {SECTIONS.map((section) => {
            const active = activeTab === section.id
            return (
              <button
                key={section.id}
                onClick={() => changeTab(section.id)}
                className={cn(
                  'group relative flex flex-1 items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 lg:flex-initial',
                  active
                    ? 'bg-accent/[0.08] ring-1 ring-accent/20'
                    : 'hover:bg-[rgba(255,255,255,0.03)]',
                )}
              >
                {active && (
                  <motion.div
                    layoutId="settings-nav-glow"
                    className="absolute inset-0 rounded-xl bg-accent/[0.06]"
                    style={{ boxShadow: '0 0 24px rgba(212,130,10,0.06)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  />
                )}
                <div
                  className={cn(
                    'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                    active
                      ? 'bg-accent/15 text-accent'
                      : 'bg-surface-2 text-text-subtle group-hover:text-text-muted',
                  )}
                >
                  <section.icon className="h-4 w-4" />
                </div>
                <div className="relative hidden min-w-0 lg:block">
                  <p
                    className={cn(
                      'text-[13px] font-semibold transition-colors',
                      active ? 'text-accent' : 'text-text-primary',
                    )}
                  >
                    {section.label}
                  </p>
                  <p className="text-[11px] text-text-subtle">
                    {section.description}
                  </p>
                </div>
              </button>
            )
          })}
        </nav>

        <div className="min-w-0 flex-1 lg:overflow-y-auto lg:pr-1">
          <AnimatePresence mode="wait">
            {activeTab === 'agenda' && (
              <motion.div
                key="agenda"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                <AgendaTab config={calendarConfig} />
              </motion.div>
            )}
            {activeTab === 'canais' && (
              <motion.div
                key="canais"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                <CanaisTab channelAccounts={channelAccounts} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

// ── Canais Tab ──

function CanaisTab({ channelAccounts }: { channelAccounts: ChannelAccount[] }) {
  const connectedMap = new Map(channelAccounts.map((a) => [a.channel, a]))

  return (
    <div className="space-y-4">
      {ALL_CHANNELS.map((channel, i) => (
        <motion.div
          key={channel}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.25 }}
        >
          <ChannelCard channel={channel} account={connectedMap.get(channel) ?? null} />
        </motion.div>
      ))}

      {COMING_SOON_CHANNELS.map((ch, i) => (
        <motion.div
          key={ch.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (ALL_CHANNELS.length + i) * 0.06, duration: 0.25 }}
        >
          <div className="overflow-hidden rounded-2xl border border-border-default/50 bg-surface-1/50 p-5 opacity-60">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', ch.bgClass)}>
                  {ch.icon}
                </div>
                <div>
                  <h3 className="font-title text-base font-semibold text-text-primary">
                    {ch.label}
                  </h3>
                  <p className="mt-0.5 text-xs text-text-subtle">
                    Em breve
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-surface-2 px-3 py-1 text-[11px] font-semibold text-text-subtle">
                Em breve
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ── Channel Card ──

function ChannelCard({
  channel,
  account,
}: {
  channel: SupportedChannel
  account: ChannelAccount | null
}) {
  const meta = CHANNEL_META[channel]
  const router = useRouter()
  const [isDisconnecting, startDisconnect] = useTransition()
  const [wizardOpen, setWizardOpen] = useState(false)

  const isConnected = account?.status === 'active'

  function handleDisconnect() {
    startDisconnect(async () => {
      await disconnectChannel(channel)
      router.refresh()
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border-default bg-surface-1">
      <div className="flex items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
              meta.bgClass,
            )}
          >
            {meta.icon}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-title text-base font-semibold text-text-primary">
                {meta.label}
              </h3>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                  isConnected
                    ? 'bg-emerald/10 text-emerald'
                    : 'bg-surface-2 text-text-subtle',
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    isConnected ? 'bg-emerald' : 'bg-text-subtle',
                  )}
                />
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            {isConnected ? (
              <div className="mt-1 flex items-center gap-3 text-sm text-text-muted">
                {account?.maskedToken && (
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-text-subtle">
                    <KeyRound className="h-3 w-3" />
                    {account.maskedToken}
                  </span>
                )}
                {account?.connectedAt && (
                  <span className="text-xs text-text-subtle">
                    {new Date(account.connectedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            ) : (
              <p className="mt-1 text-sm text-text-subtle">
                Conecte seu bot para receber mensagens
              </p>
            )}
          </div>
        </div>

        {isConnected ? (
          <Button
            variant="ghost"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="h-9 gap-2 rounded-xl px-4 text-sm text-text-muted hover:bg-danger/10 hover:text-danger"
          >
            {isDisconnecting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Unplug className="h-3.5 w-3.5" />
            )}
            Desconectar
          </Button>
        ) : (
          <Button
            onClick={() => setWizardOpen(true)}
            className={cn(
              'h-9 gap-2 rounded-xl border px-4 text-sm font-semibold transition-all duration-200',
              meta.borderClass,
              `bg-[${meta.color}]/8`,
              meta.textClass,
              meta.hoverClass,
            )}
          >
            <Plug className="h-3.5 w-3.5" />
            Conectar
          </Button>
        )}
      </div>

      <ConnectWizard
        channel={channel}
        open={wizardOpen}
        onOpenChange={setWizardOpen}
      />
    </div>
  )
}

// ── Facebook SDK loader ──

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID ?? ''
const META_CONFIG_ID = process.env.NEXT_PUBLIC_META_CONFIG_ID ?? ''

declare global {
  interface Window {
    fbAsyncInit?: () => void
    FB?: {
      init: (params: Record<string, unknown>) => void
      login: (
        callback: (response: { authResponse?: { code?: string; accessToken?: string } }) => void,
        options: Record<string, unknown>,
      ) => void
    }
  }
}

function loadFacebookSDK(): Promise<void> {
  return new Promise((resolve) => {
    if (window.FB) {
      resolve()
      return
    }

    window.fbAsyncInit = () => {
      window.FB!.init({
        appId: META_APP_ID,
        cookie: true,
        xfbml: false,
        version: 'v22.0',
      })
      resolve()
    }

    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    document.body.appendChild(script)
  })
}

function launchEmbeddedSignup(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject(new Error('Facebook SDK not loaded'))
      return
    }

    window.FB.login(
      (response) => {
        if (response.authResponse?.code) {
          resolve(response.authResponse.code)
        } else {
          reject(new Error('CANCELLED'))
        }
      },
      {
        config_id: META_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          featureType: '',
          sessionInfoVersion: '3',
        },
      },
    )
  })
}

// ── Connect Wizard ──

function ConnectWizard({
  channel,
  open,
  onOpenChange,
}: {
  channel: SupportedChannel
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const meta = CHANNEL_META[channel]
  const steps = meta.wizardSteps
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(0)
  const [tokenInput, setTokenInput] = useState('')
  const [connectError, setConnectError] = useState<string | null>(null)
  const [isConnecting, startConnect] = useTransition()
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)
  const [isLoadingSDK, setIsLoadingSDK] = useState(false)
  const [connected, setConnected] = useState(false)
  const [maskedToken, setMaskedToken] = useState('')

  const step = connected ? null : steps[currentStep]
  const isFirstStep = currentStep === 0
  const totalSteps = steps.length

  function maskToken(token: string): string {
    if (token.length <= 8) return token.slice(0, 4) + '...'
    return token.slice(0, 4) + '...' + token.slice(-4)
  }

  function reset() {
    setCurrentStep(0)
    setTokenInput('')
    setConnectError(null)
    setCopiedCommand(null)
    setIsLoadingSDK(false)
    setConnected(false)
    setMaskedToken('')
  }

  function doConnect(token: string) {
    setConnectError(null)
    startConnect(async () => {
      const result = await connectChannel(channel, token)
      if (result.success) {
        setMaskedToken(maskToken(token))
        setConnected(true)
        router.refresh()
      } else {
        setConnectError(result.error ?? 'Erro ao conectar.')
      }
    })
  }

  function handleConnect() {
    const token = tokenInput.trim()
    if (!token) {
      setConnectError('Token de acesso é obrigatório.')
      return
    }
    if (token.length > 500) {
      setConnectError('Token muito longo (máximo 500 caracteres).')
      return
    }
    doConnect(token)
  }

  async function handleEmbeddedSignup() {
    setConnectError(null)
    setIsLoadingSDK(true)

    try {
      await loadFacebookSDK()
      const code = await launchEmbeddedSignup()
      setIsLoadingSDK(false)
      doConnect(code)
    } catch (err) {
      setIsLoadingSDK(false)
      if (err instanceof Error && err.message === 'CANCELLED') {
        setConnectError('Cadastro cancelado. Tente novamente ou use o token manual.')
      } else {
        setConnectError('Erro ao iniciar cadastro. Tente novamente.')
      }
    }
  }

  function copyCommand(command: string) {
    navigator.clipboard.writeText(command)
    setCopiedCommand(command)
    setTimeout(() => setCopiedCommand(null), 2000)
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isConnecting && !isLoadingSDK) {
          onOpenChange(false)
          reset()
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="card-glass w-full max-w-[28rem] p-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-default/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', meta.bgClass)}>
                  {meta.icon}
                </div>
                <Dialog.Title className="font-title text-base font-semibold text-text-primary">
                  Conectar {meta.label}
                </Dialog.Title>
              </div>
              <Dialog.Close
                disabled={isConnecting || isLoadingSDK}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-text-subtle transition-colors hover:bg-surface-2 hover:text-text-primary disabled:pointer-events-none"
              >
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            {/* Step indicator */}
            {totalSteps > 1 && !connected && (
              <div className="flex items-center justify-center gap-3 px-6 pt-4">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300',
                        i < currentStep
                          ? `${meta.bgClass} ${meta.textClass}`
                          : i === currentStep
                            ? `${meta.bgClass} ${meta.textClass} ring-2 ring-[${meta.color}]/30`
                            : 'bg-surface-2 text-text-subtle',
                      )}
                    >
                      {i < currentStep ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    {i < totalSteps - 1 && (
                      <div
                        className={cn(
                          'h-px w-8 transition-colors duration-300',
                          i < currentStep ? meta.bgClass : 'bg-border-default/50',
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Step content */}
            <div className="px-6 py-5 min-h-[14rem] max-h-[50vh] overflow-y-auto flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {connected ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center py-4 text-center"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald/15">
                      <Check className="h-7 w-7 text-emerald" />
                    </div>
                    <h4 className="mt-4 font-title text-lg font-semibold text-text-primary">
                      {meta.label} conectado!
                    </h4>
                    <p className="mt-1.5 text-sm text-text-muted">
                      Seu bot está ativo e pronto para receber mensagens.
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2">
                      <KeyRound className="h-3.5 w-3.5 text-text-subtle" />
                      <code className="font-mono text-sm text-text-muted">{maskedToken}</code>
                    </div>
                  </motion.div>
                ) : step ? (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="flex items-center gap-2 text-text-muted">
                    {step.icon}
                    <h4 className="text-sm font-semibold">{step.title}</h4>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-text-subtle">
                    {step.description}
                  </p>

                  {/* Instructions */}
                  {step.content === 'instructions' && step.instructions && (
                    <div className="mt-4 space-y-2.5">
                      {step.instructions.map((instruction, i) => (
                        <div key={i} className="flex gap-2.5">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[10px] font-bold text-text-subtle">
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-text-primary">
                              {instruction.text}
                            </p>
                            {instruction.command && (
                              <button
                                type="button"
                                onClick={() => copyCommand(instruction.command!)}
                                className="mt-1.5 inline-flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-1.5 font-mono text-sm text-accent transition-colors hover:bg-surface-2/80"
                              >
                                <code>{instruction.command}</code>
                                {copiedCommand === instruction.command ? (
                                  <Check className="h-3 w-3 text-emerald" />
                                ) : (
                                  <Copy className="h-3 w-3 text-text-subtle" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {step.deepLink && (
                        <div className="mt-3 flex justify-center">
                          <a
                            href={step.deepLink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              'inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                              meta.borderClass,
                              meta.textClass,
                              meta.hoverClass,
                            )}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {step.deepLink.label}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Info bullets */}
                  {step.content === 'info' && step.infoBullets && (
                    <div className="mt-4 space-y-3">
                      {step.infoBullets.map((bullet, i) => (
                        <div
                          key={i}
                          className="flex gap-3 rounded-xl bg-surface-2/50 px-4 py-3"
                        >
                          <span
                            className={cn(
                              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                              bullet.emoji === '✓'
                                ? 'bg-emerald/15 text-emerald'
                                : bullet.emoji === '!'
                                  ? 'bg-accent/15 text-accent'
                                  : 'bg-surface-2 text-text-subtle',
                            )}
                          >
                            {bullet.emoji}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-text-primary">
                              {bullet.title}
                            </p>
                            <p className="mt-0.5 text-[12px] leading-relaxed text-text-subtle">
                              {bullet.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Embedded Signup */}
                  {step.content === 'embedded-signup' && (
                    <div className="mt-4 space-y-3">
                      {step.instructions && (
                        <div className="space-y-2">
                          {step.instructions.map((instruction, i) => (
                            <div key={i} className="flex gap-2.5">
                              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[10px] font-bold text-text-subtle">
                                {i + 1}
                              </span>
                              <p className="text-sm text-text-primary">
                                {instruction.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button
                        onClick={handleEmbeddedSignup}
                        disabled={isLoadingSDK || isConnecting}
                        className="h-11 w-full gap-2.5 rounded-xl border border-[#25D366]/30 bg-[#25D366]/8 text-sm font-semibold text-[#25D366] transition-all duration-200 hover:border-[#25D366]/50 hover:bg-[#25D366]/15 disabled:opacity-50"
                      >
                        {isLoadingSDK || isConnecting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {isConnecting ? 'Conectando...' : 'Carregando...'}
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Iniciar cadastro Meta
                          </>
                        )}
                      </Button>

                      <button
                        type="button"
                        onClick={() => setCurrentStep(totalSteps - 1)}
                        className="block w-full text-center text-xs text-text-subtle transition-colors hover:text-text-muted"
                      >
                        Já tenho um token →
                      </button>
                    </div>
                  )}

                  {/* Token input */}
                  {step.content === 'token' && (
                    <div className="mt-4 space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                        <KeyRound className="h-3 w-3" />
                        Token de acesso
                      </label>
                      <input
                        type="text"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder={meta.tokenPlaceholder}
                        autoFocus
                        className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 font-mono text-sm text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                      />
                    </div>
                  )}

                  {connectError && (
                    <div className="mt-4 rounded-lg bg-danger/8 px-3 py-2.5">
                      <p className="text-sm text-danger">{connectError}</p>
                    </div>
                  )}
                </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border-default/50 px-6 py-4">
              {connected ? (
                <div className="flex w-full justify-end">
                  <Button
                    onClick={() => {
                      onOpenChange(false)
                      reset()
                    }}
                    className="h-9 gap-2 rounded-xl bg-emerald/10 px-5 text-sm font-semibold text-emerald transition-colors hover:bg-emerald/20"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Fechar
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    {!isFirstStep && (
                      <button
                        type="button"
                        onClick={() => {
                          setConnectError(null)
                          setCurrentStep((s) => s - 1)
                        }}
                        disabled={isConnecting || isLoadingSDK}
                        className="inline-flex items-center gap-1 text-sm font-medium text-text-muted transition-colors hover:text-text-primary disabled:opacity-50"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Voltar
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {step?.content === 'token' ? (
                      <Button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className={cn(
                          'h-9 gap-2 rounded-xl border px-5 text-sm font-semibold transition-all duration-200 disabled:opacity-50',
                          meta.borderClass,
                          `bg-[${meta.color}]/8`,
                          meta.textClass,
                          meta.hoverClass,
                        )}
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Conectando...
                          </>
                        ) : (
                          <>
                            <Plug className="h-3.5 w-3.5" />
                            Conectar
                          </>
                        )}
                      </Button>
                    ) : step?.content === 'instructions' || step?.content === 'info' ? (
                      <Button
                        onClick={() => setCurrentStep((s) => s + 1)}
                        className="h-9 gap-1.5 rounded-xl bg-surface-2 px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-2/80"
                      >
                        Próximo
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ── Agenda Tab ──

function AgendaTab({ config }: { config: CalendarConfig | null }) {
  const hours = config?.business_hours ?? DEFAULT_HOURS

  const [days, setDays] = useState<DayState[]>(
    DAYS.map((dia) => {
      const found = hours.find((h) => h.dia === dia)
      return parseHorario(found?.horario ?? 'Fechado')
    }),
  )
  const [slotDuration, setSlotDuration] = useState(config?.slot_duration_minutes ?? 30)
  const [minAdvance, setMinAdvance] = useState(config?.min_advance_hours ?? 1)
  const [minCancelAdvance, setMinCancelAdvance] = useState(config?.min_cancel_advance_hours ?? 2)
  const [isSaving, startSave] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateDay(index: number, patch: Partial<DayState>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)

    const businessHours: BusinessHour[] = DAYS.map((dia, i) => ({
      dia,
      horario: serializeHorario(days[i]),
    }))

    startSave(async () => {
      const result = await updateCalendarConfig({
        business_hours: businessHours,
        slot_duration_minutes: slotDuration,
        min_advance_hours: minAdvance,
        min_cancel_advance_hours: minCancelAdvance,
      })

      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(result.error ?? 'Erro ao salvar')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-border-default bg-surface-1 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
          Horários de funcionamento
        </h3>

        <div className="mt-4 space-y-1">
          {DAYS.map((dia, i) => (
            <div
              key={dia}
              className="flex items-center gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-[rgba(255,255,255,0.02)]"
            >
              <span className="w-20 shrink-0 text-sm font-medium text-text-primary">
                {dia}
              </span>

              <button
                type="button"
                onClick={() => updateDay(i, { open: !days[i].open })}
                className={cn(
                  'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200',
                  days[i].open ? 'bg-accent' : 'bg-surface-2',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                    days[i].open && 'translate-x-4',
                  )}
                />
              </button>

              {days[i].open ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={days[i].start}
                    onChange={(e) => updateDay(i, { start: e.target.value })}
                    className="h-8 rounded-lg border border-border-default bg-surface-2 px-2.5 text-xs text-text-primary outline-none transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                  />
                  <span className="text-[11px] text-text-subtle">às</span>
                  <input
                    type="time"
                    value={days[i].end}
                    onChange={(e) => updateDay(i, { end: e.target.value })}
                    className="h-8 rounded-lg border border-border-default bg-surface-2 px-2.5 text-xs text-text-primary outline-none transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                  />
                </div>
              ) : (
                <span className="text-xs text-text-subtle">Fechado</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border-default bg-surface-1 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
          Regras de agendamento
        </h3>

        <div className="mt-4 space-y-1">
          <SettingRow
            label="Duração do slot"
            hint="10 a 120 minutos"
            value={slotDuration}
            onChange={setSlotDuration}
            min={10}
            max={120}
            unit="min"
          />
          <SettingRow
            label="Antecedência para agendar"
            hint="0 a 72 horas"
            value={minAdvance}
            onChange={setMinAdvance}
            min={0}
            max={72}
            unit="h"
          />
          <SettingRow
            label="Antecedência para cancelar"
            hint="0 a 72 horas"
            value={minCancelAdvance}
            onChange={setMinCancelAdvance}
            min={0}
            max={72}
            unit="h"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-danger/8 px-3 py-2.5">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSaving}
          className="h-9 gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-primary-foreground shadow-[0_0_16px_rgba(212,130,10,0.12)] transition-all hover:brightness-110 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Salvando...
            </>
          ) : saved ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Salvo
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              Salvar configuração
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

function SettingRow({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  unit,
}: {
  label: string
  hint: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  unit: string
}) {
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-[rgba(255,255,255,0.02)]">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-[11px] text-text-subtle">{hint}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-8 w-16 rounded-lg border border-border-default bg-surface-2 text-center text-xs text-text-primary outline-none transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
        />
        <span className="text-xs text-text-subtle">{unit}</span>
      </div>
    </div>
  )
}
