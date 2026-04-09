import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * MessageThread — Performance Optimization Tests
 *
 * Validates that handleLoadMore and handleTextareaInput are wrapped
 * in useCallback, and tests the guard logic of handleLoadMore
 * (the behavior) rather than the memoization mechanism.
 *
 * File-content analysis approach: reads the component source as text
 * and asserts the useCallback wrapping and dependency arrays.
 */

const COMPONENT_PATH = resolve(__dirname, '../message-thread.tsx')
const source = readFileSync(COMPONENT_PATH, 'utf-8')

// ── Pure Logic: handleLoadMore guard ──
// The handleLoadMore function has a guard: if prevPage < 1, return early.
// We test this logic in isolation.

function shouldLoadMore(currentPage: number): { shouldLoad: boolean; prevPage: number } {
  const prevPage = currentPage - 1
  if (prevPage < 1) return { shouldLoad: false, prevPage }
  return { shouldLoad: true, prevPage }
}

// ── Pure Logic: textarea auto-resize height calculation ──
// handleTextareaInput calculates: Math.min(scrollHeight, 120)

function calculateTextareaHeight(scrollHeight: number): number {
  return Math.min(scrollHeight, 120)
}

// ── Tests ──

describe('MessageThread — handleLoadMore guard logic', () => {
  it('deve permitir load more quando currentPage > 1', () => {
    expect(shouldLoadMore(5)).toEqual({ shouldLoad: true, prevPage: 4 })
    expect(shouldLoadMore(2)).toEqual({ shouldLoad: true, prevPage: 1 })
  })

  it('nao deve permitir load more quando currentPage === 1 (prevPage seria 0)', () => {
    expect(shouldLoadMore(1)).toEqual({ shouldLoad: false, prevPage: 0 })
  })

  it('nao deve permitir load more quando currentPage < 1', () => {
    expect(shouldLoadMore(0)).toEqual({ shouldLoad: false, prevPage: -1 })
    expect(shouldLoadMore(-1)).toEqual({ shouldLoad: false, prevPage: -2 })
  })

  it('hasMore deve ser true quando currentPage > 1', () => {
    // Replicates: const hasMore = currentPage > 1
    const hasMore = (page: number) => page > 1
    expect(hasMore(1)).toBe(false)
    expect(hasMore(2)).toBe(true)
    expect(hasMore(10)).toBe(true)
  })
})

describe('MessageThread — textarea auto-resize logic', () => {
  it('deve limitar altura a 120px quando scrollHeight excede', () => {
    expect(calculateTextareaHeight(200)).toBe(120)
    expect(calculateTextareaHeight(500)).toBe(120)
    expect(calculateTextareaHeight(121)).toBe(120)
  })

  it('deve usar scrollHeight quando menor que 120px', () => {
    expect(calculateTextareaHeight(40)).toBe(40)
    expect(calculateTextareaHeight(80)).toBe(80)
    expect(calculateTextareaHeight(119)).toBe(119)
  })

  it('deve retornar exatamente 120 quando scrollHeight === 120', () => {
    expect(calculateTextareaHeight(120)).toBe(120)
  })

  it('deve lidar com scrollHeight 0', () => {
    expect(calculateTextareaHeight(0)).toBe(0)
  })
})

describe('MessageThread — handleSend guard logic', () => {
  // Replicates: const content = inputValue.trim(); if (!content) return
  function shouldSend(inputValue: string): boolean {
    return inputValue.trim().length > 0
  }

  it('deve permitir envio quando ha texto valido', () => {
    expect(shouldSend('Hello')).toBe(true)
    expect(shouldSend('  Hello  ')).toBe(true)
  })

  it('nao deve permitir envio quando input esta vazio', () => {
    expect(shouldSend('')).toBe(false)
  })

  it('nao deve permitir envio quando input contem apenas espacos', () => {
    expect(shouldSend('   ')).toBe(false)
    expect(shouldSend('\t')).toBe(false)
    expect(shouldSend('\n')).toBe(false)
  })
})

describe('MessageThread — file-content validation', () => {
  it('deve usar useCallback para handleLoadMore', () => {
    expect(source).toContain('const handleLoadMore = useCallback(')
  })

  it('deve usar useCallback para handleTextareaInput', () => {
    expect(source).toContain('const handleTextareaInput = useCallback(')
  })

  it('deve importar useCallback de react', () => {
    expect(source).toMatch(/import\s*\{[^}]*useCallback[^}]*\}\s*from\s*'react'/)
  })

  it('handleLoadMore deve depender de [currentPage, sessionId]', () => {
    expect(source).toContain('[currentPage, sessionId]')
  })

  it('handleTextareaInput deve ter dependency array vazio []', () => {
    // The useCallback for handleTextareaInput ends with }, [])
    // It sets inputValue and resizes — both using event target, no external deps
    const match = source.match(/handleTextareaInput\s*=\s*useCallback\([^]*?\},\s*\[\]\)/)
    expect(match).not.toBeNull()
  })

  it('handleLoadMore deve conter guard prevPage < 1', () => {
    expect(source).toContain('if (prevPage < 1) return')
  })

  it('handleTextareaInput deve calcular altura com Math.min(scrollHeight, 120)', () => {
    expect(source).toContain('Math.min(el.scrollHeight, 120)')
  })

  it('deve importar tipo ChatMessage', () => {
    expect(source).toMatch(/import\s+type\s*\{[^}]*ChatMessage[^}]*\}/)
  })

  it('deve importar tipo Pagination', () => {
    expect(source).toMatch(/import\s+type\s*\{[^}]*Pagination[^}]*\}/)
  })
})
