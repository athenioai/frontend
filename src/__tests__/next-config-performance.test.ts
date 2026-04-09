import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * next.config.ts — Performance Optimization Tests
 *
 * Validates that the Next.js configuration includes performance
 * optimizations: optimizePackageImports and security headers.
 *
 * File-content analysis approach: reads the config source as text
 * and asserts the presence and values of optimization settings.
 */

const CONFIG_PATH = resolve(__dirname, '../../next.config.ts')
const source = readFileSync(CONFIG_PATH, 'utf-8')

describe('next.config.ts — optimizePackageImports', () => {
  it('deve ter bloco experimental', () => {
    expect(source).toContain('experimental')
  })

  it('deve ter optimizePackageImports configurado', () => {
    expect(source).toContain('optimizePackageImports')
  })

  it('deve incluir motion no optimizePackageImports', () => {
    // The config has: optimizePackageImports: ['motion']
    expect(source).toMatch(/optimizePackageImports\s*:\s*\[.*'motion'.*\]/)
  })

  it('deve exportar config como default export', () => {
    expect(source).toContain('export default nextConfig')
  })

  it('deve tipar config como NextConfig', () => {
    expect(source).toContain('const nextConfig: NextConfig')
    expect(source).toContain("import type { NextConfig } from")
  })
})

describe('next.config.ts — security headers', () => {
  it('deve configurar X-Frame-Options como DENY', () => {
    expect(source).toContain("key: 'X-Frame-Options'")
    expect(source).toContain("value: 'DENY'")
  })

  it('deve configurar X-Content-Type-Options como nosniff', () => {
    expect(source).toContain("key: 'X-Content-Type-Options'")
    expect(source).toContain("value: 'nosniff'")
  })

  it('deve configurar Referrer-Policy', () => {
    expect(source).toContain("key: 'Referrer-Policy'")
    expect(source).toContain("value: 'strict-origin-when-cross-origin'")
  })

  it('deve configurar Permissions-Policy restritiva', () => {
    expect(source).toContain("key: 'Permissions-Policy'")
    expect(source).toContain('camera=()')
    expect(source).toContain('microphone=()')
    expect(source).toContain('geolocation=()')
  })

  it('deve configurar Strict-Transport-Security', () => {
    expect(source).toContain("key: 'Strict-Transport-Security'")
    expect(source).toContain('max-age=31536000')
    expect(source).toContain('includeSubDomains')
  })

  it('deve aplicar headers para todas as rotas (source: /(.*) )', () => {
    expect(source).toContain("source: '/(.*)'")
  })
})

describe('next.config.ts — structural validation', () => {
  it('nao deve ter output: standalone (nao necessario)', () => {
    // standalone output adds complexity; should only be added when deploying to Docker
    expect(source).not.toContain("output: 'standalone'")
  })

  it('deve usar async headers function', () => {
    expect(source).toContain('headers: async ()')
  })

  it('nao deve ter rewrites ou redirects desnecessarios', () => {
    expect(source).not.toContain('rewrites')
    expect(source).not.toContain('redirects')
  })
})
