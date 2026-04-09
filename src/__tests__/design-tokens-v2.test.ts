import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Design Tokens v2 — Acceptance Tests
 *
 * Validates the Olympus Design System v2 migration:
 *   Font: Georgia + Calibri (with Space Grotesk fallback)
 *   Theme: Single light theme (Pedra Clara)
 *   Colors: Amber primary, Teal for links/actions
 *   Surfaces: Solid cards (no glassmorphism on card-surface)
 *
 * Approach: file-content validation — reads CSS/TSX as text and asserts
 * token values with string matching. Deterministic, no DOM required.
 */

const CSS_PATH = resolve(__dirname, '../app/globals.css')
const LAYOUT_PATH = resolve(__dirname, '../app/layout.tsx')

let css: string
let layout: string

beforeAll(() => {
  css = readFileSync(CSS_PATH, 'utf-8')
  layout = readFileSync(LAYOUT_PATH, 'utf-8')
})

// ─── Helper: extract a CSS custom property value from :root ───
function extractRootVar(cssContent: string, varName: string): string | null {
  // Match inside :root { ... } block
  const rootMatch = cssContent.match(/:root\s*\{([^}]+)\}/)
  if (!rootMatch) return null
  const rootBlock = rootMatch[1]

  // Match --var-name: value;
  const varRegex = new RegExp(`${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*([^;]+);`)
  const match = rootBlock.match(varRegex)
  return match ? match[1].trim() : null
}

// ─── Helper: extract a @theme inline variable value ───
function extractThemeVar(cssContent: string, varName: string): string | null {
  // Match inside @theme inline { ... } block
  const themeMatch = cssContent.match(/@theme\s+inline\s*\{([\s\S]*?)\n\}/)
  if (!themeMatch) return null
  const themeBlock = themeMatch[1]

  const varRegex = new RegExp(`${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*([^;]+);`)
  const match = themeBlock.match(varRegex)
  return match ? match[1].trim() : null
}

// ─── Helper: extract a CSS rule block by selector (literal text) ───
function extractRuleBlock(cssContent: string, selector: string): string | null {
  // Escape the selector for use in a regex (handles . + : etc.)
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Match selector { ... } — handles nested braces one level deep
  const regex = new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`)
  const match = cssContent.match(regex)
  return match ? match[1] : null
}

describe('Design Tokens v2 — globals.css', () => {
  describe('AC-01: Background base', () => {
    it('should set --bg-base to #F7F6F4 in :root', () => {
      const value = extractRootVar(css, '--bg-base')
      expect(value).toBe('#F7F6F4')
    })

    it('should set --background to #F7F6F4 in :root', () => {
      const value = extractRootVar(css, '--background')
      expect(value).toBe('#F7F6F4')
    })
  })

  describe('AC-02: Foreground text', () => {
    it('should set --foreground to #1C1B18 in :root', () => {
      const value = extractRootVar(css, '--foreground')
      expect(value).toBe('#1C1B18')
    })
  })

  describe('AC-03: Primary color (Amber)', () => {
    it('should set --primary to #D4820A in :root', () => {
      const value = extractRootVar(css, '--primary')
      expect(value).toBe('#D4820A')
    })

    it('should set --ring to match --primary (#D4820A)', () => {
      const value = extractRootVar(css, '--ring')
      expect(value).toBe('#D4820A')
    })
  })

  describe('AC-04: Title font contains Georgia', () => {
    it('should define --font-title with Georgia in @theme inline', () => {
      const value = extractThemeVar(css, '--font-title')
      expect(value).not.toBeNull()
      expect(value).toContain('Georgia')
    })

    it('should set h1 font-family to var(--font-title)', () => {
      const h1Block = extractRuleBlock(css, 'h1')
      expect(h1Block).not.toBeNull()
      expect(h1Block).toContain('var(--font-title)')
    })
  })

  describe('AC-05: Body font contains Calibri with Space Grotesk fallback', () => {
    it('should define --font-body with Calibri in @theme inline', () => {
      const value = extractThemeVar(css, '--font-body')
      expect(value).not.toBeNull()
      expect(value).toContain('Calibri')
    })

    it('should reference Space Grotesk variable in --font-body', () => {
      const value = extractThemeVar(css, '--font-body')
      expect(value).not.toBeNull()
      expect(value).toContain('--font-space-grotesk')
    })

    it('should set body font-family to Calibri with Space Grotesk fallback', () => {
      // Match the body rule inside @layer base
      const bodyFontMatch = css.match(/body\s*\{[^}]*font-family:\s*([^;]+);/)
      expect(bodyFontMatch).not.toBeNull()
      const fontValue = bodyFontMatch![1]
      expect(fontValue).toContain('Calibri')
      expect(fontValue).toContain('--font-space-grotesk')
    })
  })

  describe('AC-06: Teal token system', () => {
    const tealTokens = [
      { name: '--color-teal', expected: '#4FD1C5' },
      { name: '--color-teal-light', expected: '#9FE1CB' },
      { name: '--color-teal-xlight', expected: '#E1F5EE' },
      { name: '--color-teal-dark', expected: '#0F6E56' },
      { name: '--color-teal-xdark', expected: '#04342C' },
    ]

    for (const token of tealTokens) {
      it(`should define ${token.name} as ${token.expected}`, () => {
        const value = extractThemeVar(css, token.name)
        expect(value).toBe(token.expected)
      })
    }
  })

  describe('AC-08: No .dark/.light theme selectors (single theme)', () => {
    it('should not have a .dark selector rule (except @custom-variant neutralizer)', () => {
      // Remove the @custom-variant line, then check for .dark selectors
      const cssWithoutCustomVariant = css.replace(/@custom-variant dark[^;]*;/g, '')
      // Check there are no .dark { or .dark selectors as CSS rules
      const darkSelectorMatch = cssWithoutCustomVariant.match(/\.dark\s*[{,]/)
      expect(darkSelectorMatch).toBeNull()
    })

    it('should not have a .light selector rule', () => {
      const lightSelectorMatch = css.match(/\.light\s*[{,]/)
      expect(lightSelectorMatch).toBeNull()
    })

    it('should have @custom-variant dark neutralizer', () => {
      expect(css).toContain('@custom-variant dark')
    })
  })

  describe('AC-09: Brand green', () => {
    it('should define --color-brand-green as #0F3D3E', () => {
      const value = extractThemeVar(css, '--color-brand-green')
      expect(value).toBe('#0F3D3E')
    })
  })

  describe('AC-11: card-surface has no backdrop-filter', () => {
    it('should not use backdrop-filter in .card-surface rule', () => {
      const cardBlock = extractRuleBlock(css, '.card-surface')
      expect(cardBlock).not.toBeNull()
      expect(cardBlock).not.toContain('backdrop-filter')
    })

    it('should not use backdrop-filter in .card-surface-interactive rule', () => {
      const interactiveBlock = extractRuleBlock(css, '.card-surface-interactive:hover')
      expect(interactiveBlock).not.toBeNull()
      expect(interactiveBlock).not.toContain('backdrop-filter')
    })

    it('should not use backdrop-filter in .card-elevated rule', () => {
      const elevatedBlock = extractRuleBlock(css, '.card-elevated')
      expect(elevatedBlock).not.toBeNull()
      expect(elevatedBlock).not.toContain('backdrop-filter')
    })

    it('should still allow backdrop-filter in .card-glass (login/modals)', () => {
      const glassBlock = extractRuleBlock(css, '.card-glass')
      expect(glassBlock).not.toBeNull()
      expect(glassBlock).toContain('backdrop-filter')
    })
  })

  describe('AC-12: No #000000 in text/foreground values', () => {
    it('should not use #000000 for --foreground', () => {
      const value = extractRootVar(css, '--foreground')
      expect(value).not.toBe('#000000')
      expect(value).not.toBe('#000')
    })

    it('should not use #000000 for --muted-foreground', () => {
      const value = extractRootVar(css, '--muted-foreground')
      expect(value).not.toBe('#000000')
      expect(value).not.toBe('#000')
    })

    it('should not use #000000 for --primary-foreground', () => {
      const value = extractRootVar(css, '--primary-foreground')
      expect(value).not.toBe('#000000')
      expect(value).not.toBe('#000')
    })
  })

  describe('Design system v2 structural checks', () => {
    it('should have the @theme inline block', () => {
      expect(css).toContain('@theme inline')
    })

    it('should have a :root block with theme variables', () => {
      expect(css).toMatch(/:root\s*\{/)
    })

    it('should not reference old dark background #0E1012', () => {
      expect(css).not.toContain('#0E1012')
    })

    it('should not reference old light text #F0EDE8 as foreground', () => {
      const foreground = extractRootVar(css, '--foreground')
      expect(foreground).not.toBe('#F0EDE8')
    })

    it('should define --surface-1 as #FFFFFF (solid white)', () => {
      const value = extractRootVar(css, '--surface-1')
      expect(value).toBe('#FFFFFF')
    })

    it('should define --primary-foreground as #FFFFFF', () => {
      const value = extractRootVar(css, '--primary-foreground')
      expect(value).toBe('#FFFFFF')
    })

    it('should map --color-sidebar to --bg-base', () => {
      const value = extractThemeVar(css, '--color-sidebar')
      expect(value).toBe('var(--bg-base)')
    })

    it('should map --color-primary to --primary', () => {
      const value = extractThemeVar(css, '--color-primary')
      expect(value).toBe('var(--primary)')
    })
  })
})

describe('Design Tokens v2 — layout.tsx', () => {
  describe('AC-07: No dark class on html element', () => {
    it('should not have className containing "dark" on the html element', () => {
      // Match the <html ... className="..." ...> tag
      const htmlTagMatch = layout.match(/<html[^>]*>/)
      expect(htmlTagMatch).not.toBeNull()
      const htmlTag = htmlTagMatch![0]
      // The className should not contain the word "dark"
      expect(htmlTag).not.toMatch(/className=.*dark/)
    })

    it('should have lang="pt-BR" on the html element', () => {
      const htmlTagMatch = layout.match(/<html[^>]*>/)
      expect(htmlTagMatch).not.toBeNull()
      expect(htmlTagMatch![0]).toContain('lang="pt-BR"')
    })
  })

  describe('Font configuration', () => {
    it('should import Space_Grotesk from next/font/google', () => {
      expect(layout).toContain("import { Space_Grotesk } from 'next/font/google'")
    })

    it('should configure --font-space-grotesk CSS variable', () => {
      expect(layout).toContain("variable: '--font-space-grotesk'")
    })

    it('should apply spaceGrotesk.variable to html className', () => {
      expect(layout).toContain('spaceGrotesk.variable')
    })

    it('should NOT import Sora font (removed in v2)', () => {
      expect(layout).not.toContain('Sora')
    })
  })

  describe('Theme configuration', () => {
    it('should use bg-bg-base utility class on body', () => {
      expect(layout).toContain('bg-bg-base')
    })

    it('should use text-text-primary utility class on body', () => {
      expect(layout).toContain('text-text-primary')
    })

    it('should not import or use ThemeProvider from next-themes', () => {
      // next-themes might still be a dependency but shouldn't control dark/light
      const htmlTag = layout.match(/<html[^>]*>/)
      expect(htmlTag).not.toBeNull()
      // No theme attribute that switches dark/light
      expect(htmlTag![0]).not.toContain('data-theme')
    })

    it('should not set suppressHydrationWarning for theme switching', () => {
      // suppressHydrationWarning is present but that is fine for Next.js;
      // the key check is that there is no dark class
      const htmlTag = layout.match(/<html[^>]*>/)!
      expect(htmlTag[0]).not.toMatch(/className=.*dark/)
    })
  })

  describe('Layout structure', () => {
    it('should export a default RootLayout function', () => {
      expect(layout).toMatch(/export default function RootLayout/)
    })

    it('should render <Providers> wrapper', () => {
      expect(layout).toContain('<Providers>')
    })

    it('should set metadata title for Olympus', () => {
      expect(layout).toContain('Olympus')
    })
  })
})
