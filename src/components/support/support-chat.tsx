'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Send, Plus, MessageCircle, CheckCircle2, Clock, Sparkles, ArrowLeft,
} from 'lucide-react'
import { COLORS } from '@/lib/constants/theme'
import { formatRelativeTime } from '@/lib/utils/format'
import { MOTION } from '@/lib/motion'
import type { SupportTicket, SupportMessage } from '@/lib/types'

interface SupportChatProps {
  tickets: SupportTicket[]
  messages: SupportMessage[]
}

export function SupportChat({ tickets: initialTickets, messages: initialMessages }: SupportChatProps) {
  const [tickets, setTickets] = useState(initialTickets)
  const [allMessages, setAllMessages] = useState(initialMessages)
  const [activeTicketId, setActiveTicketId] = useState<string | null>(
    initialTickets.find(t => t.status === 'aberto')?.id ?? initialTickets[0]?.id ?? null
  )
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showList, setShowList] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeTicket = tickets.find(t => t.id === activeTicketId) ?? null
  const activeMessages = allMessages.filter(m => m.ticket_id === activeTicketId)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages.length, isTyping])

  useEffect(() => {
    if (activeTicketId) inputRef.current?.focus()
  }, [activeTicketId])

  function selectTicket(id: string) {
    setActiveTicketId(id)
    setShowList(false)
  }

  function createNewTicket() {
    const id = `ticket-${String(tickets.length + 1).padStart(3, '0')}-new`
    const newTicket: SupportTicket = {
      id,
      empresa_id: 'emp-001',
      assunto: 'Novo chamado',
      status: 'aberto',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setTickets([newTicket, ...tickets])
    setActiveTicketId(id)
    setShowList(false)

    const welcomeMsg: SupportMessage = {
      id: `smsg-welcome-${id}`,
      ticket_id: id,
      sender: 'agent',
      text: 'Olá! Sou a IA de Suporte do Athenio. Como posso te ajudar hoje?',
      created_at: new Date().toISOString(),
    }
    setAllMessages(prev => [...prev, welcomeMsg])
  }

  function sendMessage() {
    if (!input.trim() || !activeTicketId) return

    const userMsg: SupportMessage = {
      id: `smsg-user-${Date.now()}`,
      ticket_id: activeTicketId,
      sender: 'user',
      text: input.trim(),
      created_at: new Date().toISOString(),
    }
    setAllMessages(prev => [...prev, userMsg])

    // Update ticket subject if it's the first user message on a new ticket
    const existingUserMsgs = allMessages.filter(m => m.ticket_id === activeTicketId && m.sender === 'user')
    if (existingUserMsgs.length === 0) {
      setTickets(prev => prev.map(t =>
        t.id === activeTicketId
          ? { ...t, assunto: input.trim().slice(0, 60) + (input.trim().length > 60 ? '...' : ''), updated_at: new Date().toISOString() }
          : t
      ))
    }

    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Entendi sua dúvida! Deixa eu verificar isso pra você.',
        'Boa pergunta! Vou te explicar como funciona.',
        'Certo, vou buscar essa informação no sistema.',
        'Posso te ajudar com isso! Aqui vai o que encontrei.',
      ]
      const agentMsg: SupportMessage = {
        id: `smsg-agent-${Date.now()}`,
        ticket_id: activeTicketId,
        sender: 'agent',
        text: responses[Math.floor(Math.random() * responses.length)],
        created_at: new Date().toISOString(),
      }
      setAllMessages(prev => [...prev, agentMsg])
      setIsTyping(false)
    }, 1200 + Math.random() * 800)
  }

  return (
    <div className="flex h-[calc(100dvh-8rem)] overflow-hidden rounded-2xl border border-border-default bg-bg-base">
      {/* Left panel — ticket list */}
      <div className={`${showList ? 'flex' : 'hidden'} w-full flex-col border-r border-border-default md:flex md:w-80 lg:w-96`}>
        {/* List header */}
        <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet/15 to-violet/5">
              <Sparkles className="h-4 w-4 text-violet" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-text-primary">Suporte IA</p>
              <p className="text-[11px] text-text-subtle">Seus chamados</p>
            </div>
          </div>
          <button
            onClick={createNewTicket}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent transition-all duration-200 hover:bg-accent/20 hover:scale-105 active:scale-95"
            title="Novo chamado"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Ticket list */}
        <div className="flex-1 overflow-y-auto">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <MessageCircle className="mb-3 h-8 w-8 text-text-subtle/30" />
              <p className="text-[13px] text-text-subtle">Nenhum chamado ainda</p>
              <p className="mt-1 text-[12px] text-text-subtle/60">Clique no + para abrir um novo</p>
            </div>
          ) : (
            <div className="p-2">
              {tickets.map((ticket, i) => {
                const isActive = ticket.id === activeTicketId
                const lastMsg = allMessages.filter(m => m.ticket_id === ticket.id).at(-1)
                const isResolved = ticket.status === 'resolvido'

                return (
                  <motion.button
                    key={ticket.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04, ease: MOTION.ease.out }}
                    onClick={() => selectTicket(ticket.id)}
                    className={`group relative mb-1 flex w-full flex-col gap-1.5 rounded-xl px-4 py-3.5 text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-accent/8'
                        : 'hover:bg-[rgba(255,255,255,0.03)]'
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.span
                        layoutId="ticket-active"
                        className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-r-full bg-accent shadow-[0_0_8px_rgba(79,209,197,0.4)]"
                        transition={{ duration: 0.2, ease: MOTION.ease.out }}
                      />
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <p className={`line-clamp-1 text-[13px] font-medium ${isActive ? 'text-accent' : 'text-text-primary'}`}>
                        {ticket.assunto}
                      </p>
                      {isResolved ? (
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" />
                      ) : (
                        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      {lastMsg && (
                        <p className="line-clamp-1 text-[11px] text-text-subtle">
                          {lastMsg.sender === 'agent' ? 'Suporte: ' : 'Você: '}{lastMsg.text}
                        </p>
                      )}
                      <p className="shrink-0 text-[10px] text-text-subtle/60 ml-2">
                        {formatRelativeTime(ticket.updated_at)}
                      </p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right panel — chat */}
      <div className={`${!showList ? 'flex' : 'hidden'} flex-1 flex-col md:flex`}>
        {activeTicket ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-border-default px-5 py-4">
              <button
                onClick={() => setShowList(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-text-primary md:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet/15 to-accent/10">
                <Sparkles className="h-[18px] w-[18px] text-violet" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-[14px] font-semibold text-text-primary">{activeTicket.assunto}</p>
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: activeTicket.status === 'aberto' ? COLORS.emerald : COLORS.textSubtle }}
                  />
                  <p className="text-[11px] text-text-subtle">
                    {activeTicket.status === 'aberto' ? 'Athenio IA · Online' : 'Chamado resolvido'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-6">
              <div className="mx-auto max-w-2xl space-y-4">
                <AnimatePresence mode="popLayout">
                  {activeMessages.map((msg, i) => {
                    const isAgent = msg.sender === 'agent'
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.25, ease: MOTION.ease.out }}
                        className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className="flex max-w-[92%] gap-2.5 sm:max-w-[85%]">
                          {isAgent && (
                            <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet/15 to-accent/10">
                              <Sparkles className="h-3.5 w-3.5 text-violet" />
                            </div>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-3 ${
                              isAgent
                                ? 'rounded-tl-md bg-surface-1 ring-1 ring-border-default'
                                : 'rounded-tr-md bg-accent/12 ring-1 ring-accent/10'
                            }`}
                          >
                            <p className={`text-[13px] leading-relaxed ${isAgent ? 'text-text-primary' : 'text-accent'}`}>
                              {msg.text}
                            </p>
                            <p className={`mt-1.5 text-[10px] ${isAgent ? 'text-text-subtle' : 'text-accent/50'}`}>
                              {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              {isAgent && <span className="ml-1">· Athenio IA</span>}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="flex justify-start"
                    >
                      <div className="flex gap-2.5">
                        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet/15 to-accent/10">
                          <Sparkles className="h-3.5 w-3.5 text-violet" />
                        </div>
                        <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-surface-1 px-4 py-3 ring-1 ring-border-default">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-subtle/40 [animation-delay:0ms]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-subtle/40 [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-subtle/40 [animation-delay:300ms]" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Input area */}
            <div className="border-t border-border-default px-3 py-3 sm:px-5 sm:py-4">
              <div className="mx-auto max-w-2xl">
                <div className="flex items-center gap-3 rounded-xl border border-border-default bg-surface-1/50 px-4 py-2.5 transition-colors focus-within:border-accent/30 focus-within:ring-1 focus-within:ring-accent/10">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-transparent text-[14px] text-text-primary placeholder:text-text-subtle/50 outline-none"
                    disabled={activeTicket.status === 'resolvido'}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || activeTicket.status === 'resolvido'}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent transition-all duration-200 hover:bg-accent/20 disabled:opacity-30 disabled:hover:bg-accent/10 hover:scale-105 active:scale-95"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                {activeTicket.status === 'resolvido' && (
                  <p className="mt-2 text-center text-[11px] text-text-subtle">
                    Este chamado foi resolvido. Abra um novo chamado para continuar.
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center text-center px-6">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet/15 to-accent/10">
              <Sparkles className="h-7 w-7 text-violet" />
            </div>
            <h3 className="font-title text-[18px] font-bold text-text-primary">Suporte Athenio</h3>
            <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-text-muted">
              Nossa IA de suporte está disponível 24/7 para te ajudar com dúvidas sobre a plataforma.
            </p>
            <button
              onClick={createNewTicket}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent/10 px-5 py-2.5 text-[13px] font-semibold text-accent transition-all duration-200 hover:bg-accent/15 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Abrir novo chamado
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
