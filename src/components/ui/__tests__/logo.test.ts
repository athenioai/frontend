import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Logo — Performance Optimization Tests
 *
 * Validates that the Logo and LogoMark components use next/image
 * (Image) instead of raw <img> tags for automatic optimization
 * (lazy loading, WebP/AVIF, srcset, etc.).
 *
 * File-content analysis approach: reads the component source as text
 * and verifies the import and usage of next/image.
 */

const COMPONENT_PATH = resolve(__dirname, '../logo.tsx')
const source = readFileSync(COMPONENT_PATH, 'utf-8')

describe('Logo — next/image migration', () => {
  describe('import validation', () => {
    it('deve importar Image de next/image', () => {
      expect(source).toContain("import Image from 'next/image'")
    })

    it('nao deve importar ou usar tag <img nativa', () => {
      // Check there's no raw <img in the JSX
      // Image (capital I) is the Next.js component, <img (lowercase) would be raw HTML
      const imgTagMatch = source.match(/<img\s/)
      expect(imgTagMatch).toBeNull()
    })
  })

  describe('Logo component', () => {
    it('deve exportar funcao Logo', () => {
      expect(source).toContain('export function Logo(')
    })

    it('deve usar Image component no Logo', () => {
      // Extract the Logo function body
      const logoMatch = source.match(/export function Logo\([^)]*\)\s*\{([\s\S]*?)\n\}/)
      expect(logoMatch).not.toBeNull()
      const logoBody = logoMatch![1]
      expect(logoBody).toContain('<Image')
    })

    it('deve definir src como /logo/athenio-dark.svg', () => {
      expect(source).toContain('src="/logo/athenio-dark.svg"')
    })

    it('deve definir alt como Athenio.ai', () => {
      expect(source).toContain('alt="Athenio.ai"')
    })

    it('deve ter propriedade width com default 140', () => {
      expect(source).toContain('width = 140')
    })

    it('deve ter propriedade height com default 35', () => {
      expect(source).toContain('height = 35')
    })

    it('deve ter priority flag para Logo principal', () => {
      // Logo principal deve carregar com prioridade (acima da dobra)
      expect(source).toContain('priority')
    })

    it('deve aceitar className opcional', () => {
      expect(source).toContain("className?: string")
      expect(source).toContain("className = ''")
    })
  })

  describe('LogoMark component', () => {
    it('deve exportar funcao LogoMark', () => {
      expect(source).toContain('export function LogoMark(')
    })

    it('deve usar Image component no LogoMark', () => {
      const logoMarkMatch = source.match(/export function LogoMark\([^)]*\)\s*\{([\s\S]*?)\n\}/)
      expect(logoMarkMatch).not.toBeNull()
      const logoMarkBody = logoMarkMatch![1]
      expect(logoMarkBody).toContain('<Image')
    })

    it('deve ter size prop com default 28', () => {
      expect(source).toContain('size = 28')
    })
  })

  describe('interface validation', () => {
    it('deve definir LogoProps com className, width e height opcionais', () => {
      expect(source).toContain('interface LogoProps')
      expect(source).toContain('className?: string')
      expect(source).toContain('width?: number')
      expect(source).toContain('height?: number')
    })
  })

  describe('nenhum uso de <img> nativo em nenhum lugar do arquivo', () => {
    it('deve conter exatamente zero ocorrencias de <img', () => {
      const matches = source.match(/<img[\s>]/g)
      expect(matches).toBeNull()
    })

    it('deve conter pelo menos duas ocorrencias de <Image (Logo + LogoMark)', () => {
      const matches = source.match(/<Image\s/g)
      expect(matches).not.toBeNull()
      expect(matches!.length).toBeGreaterThanOrEqual(2)
    })
  })
})
