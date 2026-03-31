# Athenio.ai Frontend Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Athenio.ai dashboard from generic shadcn/ui into a premium SaaS experience with collapsible sidebar, bento grid dashboard, command palette, skeleton loaders, and dark/light theme support.

**Architecture:** Incremental redesign — update theme tokens first, then layout shell (sidebar/topbar), then dashboard widgets with bento grid, then secondary pages. Motion utilities are shared infrastructure used across all components. Each task builds on the previous but produces a working state.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, Recharts, motion (Framer Motion v11+), next-themes, lucide-react

**Spec:** `docs/superpowers/specs/2026-03-31-athenio-redesign-design.md`

---

### Task 1: Install motion dependency and extend RoiTotal type

**Files:**
- Modify: `package.json`
- Modify: `src/lib/types/campaign.ts:22-27`
- Modify: `src/lib/services/mock/data.ts` (add `historico_7d` to mock ROI data)

- [ ] **Step 1: Install motion**

```bash
npm install motion
```

- [ ] **Step 2: Extend RoiTotal type with historico_7d**

In `src/lib/types/campaign.ts`, update `RoiTotal`:

```typescript
export interface RoiTotal {
  investido: number
  retorno: number
  roas: number
  historico_7d: number[]
}
```

- [ ] **Step 3: Update mock data to include historico_7d**

In `src/lib/services/mock/data.ts`, find the mock ROI data and add:

```typescript
historico_7d: [2.8, 3.1, 2.9, 3.4, 3.2, 3.5, 3.55]
```

- [ ] **Step 4: Verify build passes**

```bash
npx tsc --noEmit
```

Expected: No errors (or only pre-existing ones)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/lib/types/campaign.ts src/lib/services/mock/data.ts
git commit -m "feat: add motion dependency and extend RoiTotal with historico_7d"
```

---

### Task 2: Update CSS theme tokens for new palette + light/dark

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/lib/constants/theme.ts`

- [ ] **Step 1: Rewrite globals.css with new design tokens**

Replace the entire `@theme inline` block and `:root` / `.dark` sections in `src/app/globals.css` with the new palette:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-title: 'Space Grotesk', sans-serif;
  --font-body: 'Sora', sans-serif;
  --font-sans: var(--font-body);

  /* Surface colors - resolved per theme */
  --color-bg-base: var(--bg-base);
  --color-surface-1: var(--surface-1);
  --color-surface-2: var(--surface-2);
  --color-bg-input: var(--input);

  /* Text */
  --color-text-primary: var(--foreground);
  --color-text-muted: var(--muted-foreground);
  --color-text-subtle: var(--text-subtle);

  /* Brand */
  --color-accent: var(--primary);
  --color-accent-light: var(--primary-hover);
  --color-amber: #FBBF24;
  --color-violet: #A78BFA;

  /* Borders */
  --color-border-default: var(--border);
  --color-border-hover: var(--border-hover);

  /* Status */
  --color-danger: #E07070;
  --color-danger-bg: rgba(224, 112, 112, 0.12);
  --color-warning: #FBBF24;
  --color-success: var(--primary);

  /* Shadcn mappings */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--surface-1);
  --color-card-foreground: var(--foreground);
  --color-popover: var(--surface-2);
  --color-popover-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--surface-2);
  --color-secondary-foreground: var(--foreground);
  --color-muted: var(--surface-1);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent-foreground: var(--primary-foreground);
  --color-destructive: #E07070;
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--primary);

  /* Charts */
  --color-chart-1: var(--primary);
  --color-chart-2: var(--primary-hover);
  --color-chart-3: #0F3D3E;
  --color-chart-4: #FBBF24;
  --color-chart-5: #A78BFA;

  /* Sidebar */
  --color-sidebar: var(--bg-base);
  --color-sidebar-foreground: var(--foreground);
  --color-sidebar-primary: var(--primary);
  --color-sidebar-primary-foreground: var(--primary-foreground);
  --color-sidebar-accent: var(--sidebar-item-active);
  --color-sidebar-accent-foreground: var(--primary);
  --color-sidebar-border: var(--border);
  --color-sidebar-ring: var(--primary);

  /* Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.625rem;
  --radius-xl: 0.875rem;
  --radius-2xl: 1rem;
  --radius-3xl: 1.375rem;
  --radius-4xl: 1.625rem;

  /* Motion tokens */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);
}

/* Dark theme (default) */
:root {
  --bg-base: #090F0F;
  --surface-1: #111919;
  --surface-2: #162020;
  --background: #090F0F;
  --foreground: #FFFFFF;
  --text-subtle: rgba(255, 255, 255, 0.4);
  --muted-foreground: rgba(255, 255, 255, 0.6);
  --primary: #4FD1C5;
  --primary-hover: #81E6D9;
  --primary-foreground: #090F0F;
  --border: rgba(79, 209, 197, 0.08);
  --border-hover: rgba(79, 209, 197, 0.20);
  --input: rgba(15, 61, 62, 0.22);
  --ring: #4FD1C5;
  --sidebar-item-active: rgba(79, 209, 197, 0.08);
  --radius: 0.625rem;
  --card-shadow: none;
}

/* Light theme */
.light, [data-theme="light"] {
  --bg-base: #FAFBFC;
  --surface-1: #FFFFFF;
  --surface-2: #F4F7F7;
  --background: #FAFBFC;
  --foreground: #111827;
  --text-subtle: #9CA3AF;
  --muted-foreground: #6B7280;
  --primary: #0D9488;
  --primary-hover: #0F766E;
  --primary-foreground: #FFFFFF;
  --border: rgba(0, 0, 0, 0.06);
  --border-hover: rgba(0, 0, 0, 0.12);
  --input: #F4F7F7;
  --ring: #0D9488;
  --sidebar-item-active: rgba(13, 148, 136, 0.08);
  --radius: 0.625rem;
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

/* Also support the .dark class for next-themes */
.dark {
  --bg-base: #090F0F;
  --surface-1: #111919;
  --surface-2: #162020;
  --background: #090F0F;
  --foreground: #FFFFFF;
  --text-subtle: rgba(255, 255, 255, 0.4);
  --muted-foreground: rgba(255, 255, 255, 0.6);
  --primary: #4FD1C5;
  --primary-hover: #81E6D9;
  --primary-foreground: #090F0F;
  --border: rgba(79, 209, 197, 0.08);
  --border-hover: rgba(79, 209, 197, 0.20);
  --input: rgba(15, 61, 62, 0.22);
  --ring: #4FD1C5;
  --sidebar-item-active: rgba(79, 209, 197, 0.08);
  --card-shadow: none;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    font-family: var(--font-body);
    background: var(--color-bg-base);
    color: var(--color-text-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  html {
    @apply font-sans;
    transition-property: color, background-color, border-color;
    transition-duration: var(--duration-normal);
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-title);
  }
}

/* Card with elevation */
.card-surface {
  background: var(--color-surface-1);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--card-shadow, none);
  transition: transform var(--duration-fast) var(--ease-out),
              border-color var(--duration-fast) var(--ease-out),
              box-shadow var(--duration-fast) var(--ease-out);
}

.card-surface-interactive:hover {
  transform: translateY(-2px);
  border-color: var(--color-border-hover);
}

.card-elevated {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--card-shadow, none);
}

.card-hero {
  background: linear-gradient(135deg, #132626 0%, var(--color-surface-1) 100%);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-xl);
}

.light .card-hero,
[data-theme="light"] .card-hero {
  background: linear-gradient(135deg, #ECFDF5 0%, var(--color-surface-1) 100%);
}

/* Skeleton pulse */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.skeleton {
  background: linear-gradient(90deg, var(--color-surface-1) 25%, var(--color-surface-2) 50%, var(--color-surface-1) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--color-border-default);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-hover);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Update theme constants**

Replace `src/lib/constants/theme.ts`:

```typescript
export const COLORS = {
  accent: '#4FD1C5',
  accentLight: '#81E6D9',
  amber: '#FBBF24',
  violet: '#A78BFA',
  bgBase: '#090F0F',
  surface1: '#111919',
  surface2: '#162020',
  danger: '#E07070',
  dangerBg: 'rgba(224, 112, 112, 0.12)',
  warning: '#FBBF24',
  success: '#4FD1C5',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  textSubtle: 'rgba(255, 255, 255, 0.4)',
  border: 'rgba(79, 209, 197, 0.08)',
  borderHover: 'rgba(79, 209, 197, 0.20)',
} as const

export const CHART_COLORS = {
  primary: '#4FD1C5',
  secondary: '#81E6D9',
  tertiary: '#0F3D3E',
  amber: '#FBBF24',
  violet: '#A78BFA',
  grid: 'rgba(255, 255, 255, 0.05)',
  tooltipBg: '#111919',
} as const

export const AGENT_COLORS = {
  hermes: '#4FD1C5',
  ares: '#FBBF24',
  athena: '#A78BFA',
} as const

export const TEMPERATURA_COLORS = {
  frio: '#60A5FA',
  morno: '#F6E05E',
  quente: '#E07070',
} as const

export const HEALTH_SCORE_COLORS = {
  good: '#4FD1C5',
  warning: '#F6E05E',
  danger: '#E07070',
} as const

export function getHealthScoreColor(score: number): string {
  if (score > 80) return HEALTH_SCORE_COLORS.good
  if (score >= 60) return HEALTH_SCORE_COLORS.warning
  return HEALTH_SCORE_COLORS.danger
}
```

- [ ] **Step 3: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/lib/constants/theme.ts
git commit -m "feat: redesign theme tokens — new palette, surfaces, light/dark support, motion tokens"
```

---

### Task 3: Update root layout with next-themes ThemeProvider

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Space_Grotesk, Sora } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-title',
  weight: ['400', '500', '600', '700'],
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Athenio.ai — Dashboard',
  description: 'Painel de controle da sua operação com IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} ${sora.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-bg-base text-text-primary antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add ThemeProvider for dark/light toggle support"
```

---

### Task 4: Create motion utilities — animation hooks and count-up component

**Files:**
- Create: `src/lib/motion.ts`
- Create: `src/components/ui/count-up.tsx`
- Create: `src/components/ui/animate-in.tsx`

- [ ] **Step 1: Create motion utilities**

Create `src/lib/motion.ts`:

```typescript
// Shared motion variants and config
export const MOTION = {
  duration: { fast: 0.15, normal: 0.25, slow: 0.4 },
  ease: {
    out: [0.16, 1, 0.3, 1] as const,
    inOut: [0.45, 0, 0.55, 1] as const,
  },
} as const

export const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
} as const

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
} as const
```

- [ ] **Step 2: Create CountUp component**

Create `src/components/ui/count-up.tsx`:

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function CountUp({
  value,
  duration = 400,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: CountUpProps) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) {
      setDisplay(value)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const start = performance.now()

          function animate(now: number) {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(eased * value)
            if (progress < 1) requestAnimationFrame(animate)
          }

          requestAnimationFrame(animate)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  )
}
```

- [ ] **Step 3: Create AnimateIn component**

Create `src/components/ui/animate-in.tsx`:

```tsx
'use client'

import { motion } from 'motion/react'
import { fadeInUp, MOTION } from '@/lib/motion'

interface AnimateInProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimateIn({ children, className, delay = 0 }: AnimateInProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeInUp}
      transition={{
        duration: MOTION.duration.slow,
        ease: MOTION.ease.out,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 4: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/motion.ts src/components/ui/count-up.tsx src/components/ui/animate-in.tsx
git commit -m "feat: add motion utilities — CountUp, AnimateIn, shared motion tokens"
```

---

### Task 5: Create skeleton loader components

**Files:**
- Create: `src/components/ui/skeleton-block.tsx`
- Create: `src/components/skeletons/dashboard-skeleton.tsx`

- [ ] **Step 1: Create SkeletonBlock primitive**

Create `src/components/ui/skeleton-block.tsx`:

```tsx
interface SkeletonBlockProps {
  className?: string
}

export function SkeletonBlock({ className = '' }: SkeletonBlockProps) {
  return <div className={`skeleton ${className}`} />
}
```

- [ ] **Step 2: Create DashboardSkeleton**

Create `src/components/skeletons/dashboard-skeleton.tsx`:

```tsx
import { SkeletonBlock } from '@/components/ui/skeleton-block'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Row 1: Hero + Health */}
      <div className="grid gap-6 grid-cols-12">
        <div className="col-span-12 lg:col-span-8 card-surface p-8">
          <SkeletonBlock className="mx-auto mb-4 h-4 w-48" />
          <SkeletonBlock className="mx-auto mb-4 h-14 w-32" />
          <SkeletonBlock className="mx-auto h-4 w-64" />
        </div>
        <div className="col-span-12 lg:col-span-4 card-elevated p-6">
          <SkeletonBlock className="mx-auto mb-4 h-4 w-32" />
          <SkeletonBlock className="mx-auto mb-4 h-24 w-24 !rounded-full" />
          <div className="grid grid-cols-3 gap-3">
            <SkeletonBlock className="h-12" />
            <SkeletonBlock className="h-12" />
            <SkeletonBlock className="h-12" />
          </div>
        </div>
      </div>

      {/* Row 2: KPI Strip */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-surface p-5">
            <SkeletonBlock className="mb-3 h-3 w-20" />
            <SkeletonBlock className="mb-2 h-8 w-24" />
            <SkeletonBlock className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Row 3: Funil + Objecoes */}
      <div className="grid gap-6 grid-cols-12">
        <div className="col-span-12 lg:col-span-8 card-surface p-6">
          <SkeletonBlock className="mb-4 h-4 w-36" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-10" />
            ))}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 card-surface p-6">
          <SkeletonBlock className="mb-4 h-4 w-40" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-6" />
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Agents */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card-surface p-5">
            <SkeletonBlock className="mb-4 h-5 w-32" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <SkeletonBlock key={j} className="h-4" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Row 5: Alertas */}
      <div className="card-surface p-6">
        <SkeletonBlock className="mb-4 h-4 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonBlock className="h-7 w-7 !rounded-full shrink-0" />
              <SkeletonBlock className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/skeleton-block.tsx src/components/skeletons/dashboard-skeleton.tsx
git commit -m "feat: add skeleton loader components for dashboard"
```

---

### Task 6: Redesign sidebar — collapsible with Framer Motion

**Files:**
- Modify: `src/components/layout/sidebar.tsx`

- [ ] **Step 1: Rewrite sidebar component**

Replace `src/components/layout/sidebar.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import {
  LayoutDashboard,
  GitBranch,
  Users,
  Megaphone,
  FileText,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { MOTION } from '@/lib/motion'

const NAV_MAIN = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/funil', label: 'Funil', icon: GitBranch },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/campanhas', label: 'Campanhas', icon: Megaphone },
]

const NAV_SECONDARY = [
  { href: '/relatorios', label: 'Relatórios', icon: FileText },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface SidebarProps {
  isAdmin: boolean
  userName: string
}

export function Sidebar({ isAdmin, userName }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed))
  }, [collapsed])

  function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: typeof LayoutDashboard }) {
    const isActive = pathname === href || pathname.startsWith(href + '/')
    return (
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-accent/8 text-accent'
            : 'text-text-muted hover:bg-[var(--sidebar-item-active)] hover:text-text-primary'
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-accent" />
        )}
        <Icon className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && <span>{label}</span>}
        {collapsed && (
          <span className="pointer-events-none absolute left-full ml-2 rounded-md bg-surface-2 px-2 py-1 text-xs text-text-primary opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            {label}
          </span>
        )}
      </Link>
    )
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: MOTION.duration.normal, ease: MOTION.ease.inOut }}
      className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border-default bg-bg-base lg:flex"
    >
      {/* Logo */}
      <div className="flex h-14 items-center px-4">
        <span className="font-title text-lg font-bold text-accent">
          {collapsed ? 'A' : 'Athenio.ai'}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-0.5">
          {NAV_MAIN.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>

        <div className="my-3 mx-2 border-t border-border-default" />

        <div className="space-y-0.5">
          {NAV_SECONDARY.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>

        {isAdmin && (
          <>
            <div className="my-3 mx-2 border-t border-border-default" />
            <NavItem href="/admin" label="Admin" icon={Shield} />
          </>
        )}
      </nav>

      {/* Footer: avatar + collapse toggle */}
      <div className="border-t border-border-default p-2">
        {!collapsed && (
          <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
              {getInitials(userName)}
            </div>
            <span className="truncate text-sm text-text-muted">{userName}</span>
          </div>
        )}
        {collapsed && (
          <div className="mb-2 flex justify-center py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
              {getInitials(userName)}
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-text-subtle hover:bg-[var(--sidebar-item-active)] hover:text-text-primary transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </motion.aside>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/sidebar.tsx
git commit -m "feat: redesign sidebar — collapsible with motion animation, tooltips, avatar"
```

---

### Task 7: Redesign topbar — breadcrumb, theme toggle, notifications, search trigger

**Files:**
- Modify: `src/components/layout/topbar.tsx`
- Create: `src/components/layout/theme-toggle.tsx`

- [ ] **Step 1: Create ThemeToggle component**

Create `src/components/layout/theme-toggle.tsx`:

```tsx
'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="h-9 w-9" />
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
      aria-label="Alternar tema"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
```

- [ ] **Step 2: Rewrite topbar component**

Replace `src/components/layout/topbar.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, LogOut, Search, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from './sidebar'
import { ThemeToggle } from './theme-toggle'

const BREADCRUMB_MAP: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/funil': 'Funil de Vendas',
  '/leads': 'Leads',
  '/campanhas': 'Campanhas',
  '/relatorios': 'Relatórios',
  '/configuracoes': 'Configurações',
  '/admin': 'Admin',
}

interface TopbarProps {
  userName: string
  isAdmin: boolean
  alertCount: number
  onOpenCommandPalette: () => void
}

export function Topbar({ userName, isAdmin, alertCount, onOpenCommandPalette }: TopbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const breadcrumb = BREADCRUMB_MAP[pathname] || pathname.split('/').filter(Boolean).pop() || 'Dashboard'

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-default bg-surface-1/80 px-4 backdrop-blur-xl">
      {/* Mobile menu */}
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="lg:hidden text-text-muted hover:text-text-primary p-2">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-border-default bg-bg-base p-0">
            <Sidebar isAdmin={isAdmin} userName={userName} />
          </SheetContent>
        </Sheet>

        {/* Logo for mobile */}
        <span className="font-title text-lg font-bold text-accent lg:hidden">Athenio.ai</span>

        {/* Breadcrumb for desktop */}
        <span className="hidden text-sm font-medium text-text-muted lg:block">{breadcrumb}</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Search trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden items-center gap-2 rounded-lg border border-border-default bg-transparent px-3 py-1.5 text-sm text-text-subtle transition-colors hover:border-border-hover hover:text-text-muted sm:flex"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Buscar...</span>
          <kbd className="ml-2 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-text-subtle">
            ⌘K
          </kbd>
        </button>

        {/* Mobile search */}
        <button
          onClick={onOpenCommandPalette}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary sm:hidden"
        >
          <Search className="h-4 w-4" />
        </button>

        <ThemeToggle />

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary">
          <Bell className="h-4 w-4" />
          {alertCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

        {/* User dropdown */}
        <div className="ml-1 flex items-center gap-2">
          <span className="hidden text-sm text-text-muted lg:block">{userName}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-9 w-9 text-text-muted hover:text-danger"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/topbar.tsx src/components/layout/theme-toggle.tsx
git commit -m "feat: redesign topbar — breadcrumb, search trigger, theme toggle, notifications badge"
```

---

### Task 8: Create Command Palette component

**Files:**
- Create: `src/components/layout/command-palette.tsx`

- [ ] **Step 1: Create command palette**

Create `src/components/layout/command-palette.tsx`:

```tsx
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, GitBranch, Users, Megaphone, FileText,
  Settings, Shield, Search, FileDown
} from 'lucide-react'
import { MOTION } from '@/lib/motion'

interface CommandItem {
  id: string
  label: string
  icon: typeof LayoutDashboard
  action: () => void
  group: 'Navegação' | 'Ações'
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  isAdmin: boolean
}

export function CommandPalette({ open, onClose, isAdmin }: CommandPaletteProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const navigate = useCallback((path: string) => {
    onClose()
    router.push(path)
  }, [onClose, router])

  const items: CommandItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard'), group: 'Navegação' },
    { id: 'funil', label: 'Funil de Vendas', icon: GitBranch, action: () => navigate('/funil'), group: 'Navegação' },
    { id: 'leads', label: 'Leads', icon: Users, action: () => navigate('/leads'), group: 'Navegação' },
    { id: 'campanhas', label: 'Campanhas', icon: Megaphone, action: () => navigate('/campanhas'), group: 'Navegação' },
    { id: 'relatorios', label: 'Relatórios', icon: FileText, action: () => navigate('/relatorios'), group: 'Navegação' },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, action: () => navigate('/configuracoes'), group: 'Navegação' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Shield, action: () => navigate('/admin'), group: 'Navegação' as const }] : []),
    { id: 'export-pdf', label: 'Exportar relatório PDF', icon: FileDown, action: () => navigate('/relatorios'), group: 'Ações' },
    { id: 'settings', label: 'Abrir configurações', icon: Settings, action: () => navigate('/configuracoes'), group: 'Ações' },
  ]

  const filtered = query
    ? items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : items

  const groups = Array.from(new Set(filtered.map((i) => i.group)))

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (open) onClose()
        else onClose() // toggle handled by parent
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => (i + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault()
      filtered[selectedIndex].action()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION.duration.fast }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: MOTION.duration.fast, ease: MOTION.ease.out }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border-default bg-surface-1 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Buscar"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border-default px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-text-subtle" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar páginas, ações..."
                className="flex-1 bg-transparent text-lg text-text-primary placeholder:text-text-subtle outline-none"
              />
              <kbd className="rounded bg-surface-2 px-2 py-0.5 text-xs text-text-subtle">Esc</kbd>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-text-subtle">
                  Nenhum resultado encontrado
                </p>
              )}
              {groups.map((group) => (
                <div key={group}>
                  <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-text-subtle">
                    {group}
                  </p>
                  {filtered
                    .filter((item) => item.group === group)
                    .map((item) => {
                      const index = filtered.indexOf(item)
                      return (
                        <button
                          key={item.id}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                            index === selectedIndex
                              ? 'bg-accent/8 text-accent'
                              : 'text-text-muted hover:text-text-primary'
                          }`}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/command-palette.tsx
git commit -m "feat: add command palette (⌘K) — search pages and actions, keyboard navigation"
```

---

### Task 9: Redesign authenticated layout — wire up sidebar, topbar, command palette

**Files:**
- Modify: `src/app/(authenticated)/layout.tsx`
- Modify: `src/components/layout/health-banner.tsx`

- [ ] **Step 1: Update health banner to use new card styles**

Replace `src/components/layout/health-banner.tsx`:

```tsx
import { AlertTriangle } from 'lucide-react'

interface HealthBannerProps {
  score: number
  motivo?: string
  acao?: string
}

export function HealthBanner({ score, motivo, acao }: HealthBannerProps) {
  if (score >= 60) return null

  return (
    <div className="border-b border-danger/20 bg-danger-bg px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
        <div>
          <p className="text-sm font-semibold text-danger">
            Health Score em {score} — sua operação precisa de atenção
          </p>
          {motivo && <p className="mt-1 text-xs text-text-muted">{motivo}</p>}
          {acao && <p className="mt-0.5 text-xs text-accent">{acao}</p>}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite authenticated layout**

Replace `src/app/(authenticated)/layout.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { authService, analyticsService, alertService } from '@/lib/services'
import { AuthShell } from '@/components/layout/auth-shell'
import { HealthBanner } from '@/components/layout/health-banner'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const [health, alerts] = await Promise.all([
    analyticsService.getHealthScore(user.empresa_id),
    alertService.getRecentes(user.empresa_id),
  ])

  return (
    <AuthShell
      isAdmin={user.role === 'admin'}
      userName={user.nome}
      alertCount={alerts.length}
    >
      <HealthBanner
        score={health.score}
        motivo={health.motivo_alerta}
        acao={health.acao_recomendada}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </AuthShell>
  )
}
```

- [ ] **Step 3: Create AuthShell client component**

Create `src/components/layout/auth-shell.tsx`:

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { CommandPalette } from './command-palette'

interface AuthShellProps {
  children: React.ReactNode
  isAdmin: boolean
  userName: string
  alertCount: number
}

export function AuthShell({ children, isAdmin, userName, alertCount }: AuthShellProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    setSidebarCollapsed(localStorage.getItem('sidebar-collapsed') === 'true')

    function handleStorage() {
      setSidebarCollapsed(localStorage.getItem('sidebar-collapsed') === 'true')
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Listen for sidebar collapse changes via a custom event
  useEffect(() => {
    function handleCollapse() {
      setSidebarCollapsed(localStorage.getItem('sidebar-collapsed') === 'true')
    }
    window.addEventListener('sidebar-collapse', handleCollapse)
    return () => window.removeEventListener('sidebar-collapse', handleCollapse)
  }, [])

  const toggleCommandPalette = useCallback(() => {
    setCommandPaletteOpen((prev) => !prev)
  }, [])

  // Global ⌘K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggleCommandPalette()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleCommandPalette])

  return (
    <div className="min-h-screen">
      <Sidebar isAdmin={isAdmin} userName={userName} />
      <div
        className="transition-[padding-left] duration-[250ms]"
        style={{ paddingLeft: sidebarCollapsed ? 64 : 256 }}
      >
        <div className="lg:block hidden">
          {/* Desktop gets sidebar spacing */}
        </div>
        <Topbar
          userName={userName}
          isAdmin={isAdmin}
          alertCount={alertCount}
          onOpenCommandPalette={toggleCommandPalette}
        />
        {children}
      </div>
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        isAdmin={isAdmin}
      />
    </div>
  )
}
```

- [ ] **Step 4: Update sidebar to dispatch custom event on collapse toggle**

In `src/components/layout/sidebar.tsx`, update the `useEffect` for persisting collapse state:

```typescript
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed))
    window.dispatchEvent(new Event('sidebar-collapse'))
  }, [collapsed])
```

- [ ] **Step 5: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/app/(authenticated)/layout.tsx src/components/layout/auth-shell.tsx src/components/layout/health-banner.tsx src/components/layout/sidebar.tsx
git commit -m "feat: redesign layout shell — auth shell with command palette, responsive sidebar padding"
```

---

### Task 10: Redesign ROI hero card widget

**Files:**
- Modify: `src/components/widgets/roi-card.tsx`

- [ ] **Step 1: Rewrite ROI card**

Replace `src/components/widgets/roi-card.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils/format'
import { CountUp } from '@/components/ui/count-up'
import { AnimateIn } from '@/components/ui/animate-in'
import type { RoiTotal } from '@/lib/types'

export function RoiCard({ initial }: { initial: RoiTotal }) {
  const [roi, setRoi] = useState(initial)

  useEffect(() => {
    const interval = setInterval(() => {
      setRoi((prev) => ({
        ...prev,
        retorno: prev.retorno + Math.random() * 50,
        roas: (prev.retorno + Math.random() * 50) / prev.investido,
      }))
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const sparkData = roi.historico_7d.map((v, i) => ({ day: i, value: v }))

  return (
    <AnimateIn>
      <div className="card-hero relative overflow-hidden p-8">
        <div className="relative flex items-start justify-between">
          <div className="flex-1 text-center lg:text-left">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-text-muted">
              Retorno sobre investimento
            </p>
            <p className="font-title text-[clamp(36px,5vw,56px)] font-bold leading-none text-accent">
              <CountUp value={roi.roas} decimals={1} suffix="x" />
            </p>
            <p className="mt-4 text-base text-text-muted">
              Para cada{' '}
              <span className="font-semibold text-text-primary">R$ 1,00</span>{' '}
              investido em anúncio, a Athenio retornou{' '}
              <span className="font-semibold text-amber">{formatCurrency(roi.roas)}</span>{' '}
              em vendas
            </p>
            <div className="mt-4 flex justify-center gap-8 text-sm text-text-subtle lg:justify-start">
              <span>Investido: {formatCurrency(roi.investido)}</span>
              <span>Retorno: <span className="text-amber">{formatCurrency(roi.retorno)}</span></span>
            </div>
          </div>

          {/* Sparkline */}
          <div className="hidden w-32 lg:block">
            <p className="mb-1 text-right text-[10px] font-medium uppercase text-text-subtle">7 dias</p>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={sparkData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4FD1C5"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AnimateIn>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/widgets/roi-card.tsx
git commit -m "feat: redesign ROI hero card — gradient bg, count-up, sparkline, amber accents"
```

---

### Task 11: Redesign Health Score, KPI strip, and remaining widgets

**Files:**
- Modify: `src/components/widgets/health-score.tsx`
- Create: `src/components/widgets/kpi-card.tsx`
- Modify: `src/components/widgets/funil-widget.tsx`
- Modify: `src/components/widgets/top-objecoes.tsx`
- Modify: `src/components/widgets/atividade-agentes.tsx`
- Modify: `src/components/widgets/feed-alertas.tsx`
- Modify: `src/components/widgets/economia-tempo.tsx`
- Modify: `src/components/widgets/ltv-cac.tsx`

- [ ] **Step 1: Rewrite Health Score widget**

Replace `src/components/widgets/health-score.tsx`:

```tsx
'use client'

import { GaugeChart } from '@/components/charts/gauge-chart'
import { Activity, TrendingUp, Zap } from 'lucide-react'
import { formatPercent } from '@/lib/utils/format'
import { CountUp } from '@/components/ui/count-up'
import { AnimateIn } from '@/components/ui/animate-in'
import type { HealthScoreData } from '@/lib/types'

export function HealthScoreWidget({ data }: { data: HealthScoreData }) {
  const indicators = [
    {
      icon: Activity,
      label: 'Volume msgs',
      value: `${data.volume_mensagens.atual}`,
      change: `${data.volume_mensagens.variacao_percent > 0 ? '+' : ''}${data.volume_mensagens.variacao_percent.toFixed(1)}%`,
      positive: data.volume_mensagens.variacao_percent > 0,
    },
    {
      icon: TrendingUp,
      label: 'Conversão',
      value: formatPercent(data.taxa_conversao),
      change: null,
      positive: true,
    },
    {
      icon: Zap,
      label: 'Latência',
      value: `${(data.latencia_media_ms / 1000).toFixed(1)}s`,
      change: null,
      positive: data.latencia_media_ms < 2000,
    },
  ]

  return (
    <AnimateIn>
      <div className="card-elevated flex h-full flex-col items-center p-6">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-text-muted">
          Health Score
        </p>
        <GaugeChart value={data.score} />
        <div className="mt-4 grid w-full grid-cols-3 gap-3">
          {indicators.map(({ icon: Icon, label, value, change, positive }) => (
            <div key={label} className="rounded-lg bg-surface-2 p-2 text-center">
              <Icon className="mx-auto mb-1 h-3.5 w-3.5 text-text-subtle" />
              <p className="text-[10px] uppercase text-text-subtle">{label}</p>
              <p className="font-title text-sm font-bold text-text-primary">{value}</p>
              {change && (
                <p className={`text-[10px] font-medium ${positive ? 'text-success' : 'text-danger'}`}>{change}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </AnimateIn>
  )
}
```

- [ ] **Step 2: Create KPI card component**

Create `src/components/widgets/kpi-card.tsx`:

```tsx
'use client'

import { type LucideIcon } from 'lucide-react'
import { CountUp } from '@/components/ui/count-up'
import { AnimateIn } from '@/components/ui/animate-in'

interface KpiCardProps {
  label: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  change?: number
  icon: LucideIcon
  accentColor?: string
  delay?: number
}

export function KpiCard({
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  change,
  icon: Icon,
  accentColor = 'var(--color-accent)',
  delay = 0,
}: KpiCardProps) {
  return (
    <AnimateIn delay={delay}>
      <div className="card-surface card-surface-interactive p-5">
        <div className="mb-2 flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)` }}
          >
            <Icon className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <span className="text-xs font-medium uppercase tracking-[0.05em] text-text-subtle">{label}</span>
        </div>
        <p className="font-title text-2xl font-bold text-text-primary">
          <CountUp value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
        </p>
        {change !== undefined && (
          <p className={`mt-1 text-xs font-medium ${change >= 0 ? 'text-success' : 'text-danger'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
          </p>
        )}
      </div>
    </AnimateIn>
  )
}
```

- [ ] **Step 3: Update funil widget**

Replace `src/components/widgets/funil-widget.tsx`:

```tsx
import { FunilChart } from '@/components/charts/funil-chart'
import { AnimateIn } from '@/components/ui/animate-in'
import type { FunilStats } from '@/lib/types'

export function FunilWidget({ stats }: { stats: FunilStats }) {
  return (
    <AnimateIn>
      <div className="card-surface h-full p-6">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.05em] text-text-muted">
          Funil de Vendas
        </p>
        <FunilChart stats={stats} compact />
      </div>
    </AnimateIn>
  )
}
```

- [ ] **Step 4: Update top objecoes widget**

Replace `src/components/widgets/top-objecoes.tsx`:

```tsx
import { BarChartHorizontal } from '@/components/charts/bar-chart-horizontal'
import { AnimateIn } from '@/components/ui/animate-in'
import type { ObjecaoCount } from '@/lib/types'

export function TopObjecoesWidget({ data }: { data: ObjecaoCount[] }) {
  const chartData = data.map((d) => ({ label: d.objecao, value: d.count }))

  return (
    <AnimateIn>
      <div className="card-surface h-full p-6">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.05em] text-text-muted">
          Top Objeções dos Leads
        </p>
        <BarChartHorizontal data={chartData} height={200} />
      </div>
    </AnimateIn>
  )
}
```

- [ ] **Step 5: Update atividade agentes widget**

Replace `src/components/widgets/atividade-agentes.tsx`:

```tsx
import { Megaphone, MessageSquare, Brain } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import { AnimateIn } from '@/components/ui/animate-in'
import { AGENT_COLORS } from '@/lib/constants/theme'
import type { AgentesAtividade } from '@/lib/types'

export function AtividadeAgentesWidget({ data }: { data: AgentesAtividade }) {
  const agents = [
    {
      nome: 'Hermes',
      subtitulo: 'Marketing',
      icon: Megaphone,
      color: AGENT_COLORS.hermes,
      metricas: [
        { label: 'Campanhas ativas', value: data.hermes.campanhas_ativas },
        { label: 'Leads em nutrição', value: data.hermes.leads_nutricao },
        { label: 'Último criativo', value: data.hermes.ultimo_criativo },
        { label: 'Próximo ciclo', value: data.hermes.proximo_ciclo },
      ],
    },
    {
      nome: 'Ares',
      subtitulo: 'Comercial',
      icon: MessageSquare,
      color: AGENT_COLORS.ares,
      metricas: [
        { label: 'Conversas ativas', value: data.ares.conversas_ativas },
        { label: 'Vendas hoje', value: data.ares.vendas_hoje },
        { label: 'Follow-ups agendados', value: data.ares.followups_agendados },
        { label: 'Aguardando resposta', value: data.ares.leads_aguardando },
      ],
    },
    {
      nome: 'Athena',
      subtitulo: 'Orquestrador',
      icon: Brain,
      color: AGENT_COLORS.athena,
      metricas: [
        { label: 'Último ciclo', value: formatRelativeTime(data.athena.ultimo_ciclo) },
        { label: 'Resumo', value: data.athena.ultimo_ciclo_resumo },
        { label: 'Última decisão', value: data.athena.ultima_decisao },
        { label: 'Alertas disparados', value: data.athena.alertas_disparados },
      ],
    },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {agents.map((agent, i) => (
        <AnimateIn key={agent.nome} delay={i * 0.06}>
          <div
            className="card-surface p-5"
            style={{ borderLeft: `3px solid ${agent.color}` }}
          >
            <div className="mb-3 flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{ backgroundColor: `color-mix(in srgb, ${agent.color} 15%, transparent)` }}
              >
                <agent.icon className="h-3.5 w-3.5" style={{ color: agent.color }} />
              </div>
              <span className="font-title text-sm font-bold">{agent.nome}</span>
              <span className="text-xs text-text-subtle">({agent.subtitulo})</span>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `color-mix(in srgb, ${agent.color} 10%, transparent)`,
                  color: agent.color,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: agent.color }} />
                ativo
              </span>
            </div>
            <div className="space-y-2">
              {agent.metricas.map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-xs text-text-subtle">{label}</span>
                  <span className="text-right text-xs font-medium text-text-primary">
                    {typeof value === 'string' && value.length > 35
                      ? value.slice(0, 35) + '...'
                      : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AnimateIn>
      ))}
    </div>
  )
}
```

- [ ] **Step 6: Update feed alertas widget**

Replace `src/components/widgets/feed-alertas.tsx`:

```tsx
import { DollarSign, Pause, TrendingUp, Star, User, Shield } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import { AnimateIn } from '@/components/ui/animate-in'
import type { Alert, AlertTipo } from '@/lib/types'

const ALERT_ICON_MAP: Record<AlertTipo, typeof DollarSign> = {
  venda: DollarSign,
  campanha_pausada: Pause,
  campanha_escalada: TrendingUp,
  baleia: Star,
  humano_solicitado: User,
  anomalia: Shield,
}

const ALERT_COLOR_MAP: Record<AlertTipo, string> = {
  venda: '#4FD1C5',
  campanha_pausada: '#FBBF24',
  campanha_escalada: '#4FD1C5',
  baleia: '#A78BFA',
  humano_solicitado: '#FBBF24',
  anomalia: '#E07070',
}

export function FeedAlertasWidget({ alerts }: { alerts: Alert[] }) {
  return (
    <AnimateIn>
      <div className="card-surface p-6">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.05em] text-text-muted">
          Feed de Alertas
        </p>
        <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
          {alerts.map((alert) => {
            const Icon = ALERT_ICON_MAP[alert.tipo] ?? Shield
            const color = ALERT_COLOR_MAP[alert.tipo] ?? '#4FD1C5'
            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-surface-2"
              >
                <div
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-primary">{alert.descricao}</p>
                  <p className="text-xs text-text-subtle">
                    {formatRelativeTime(alert.created_at)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AnimateIn>
  )
}
```

- [ ] **Step 7: Delete economia-tempo and ltv-cac widgets (replaced by KPI cards)**

These widgets are no longer standalone — they become KPI cards in the dashboard. Delete:
- `src/components/widgets/economia-tempo.tsx`
- `src/components/widgets/ltv-cac.tsx`

```bash
rm src/components/widgets/economia-tempo.tsx src/components/widgets/ltv-cac.tsx
```

- [ ] **Step 8: Verify build**

```bash
npx tsc --noEmit
```

Expected: May show errors in dashboard page due to missing imports — that's fine, Task 12 fixes it.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: redesign all widgets — AnimateIn, CountUp, colored accents per agent, KPI card"
```

---

### Task 12: Redesign dashboard page with bento grid layout

**Files:**
- Modify: `src/app/(authenticated)/dashboard/page.tsx`

- [ ] **Step 1: Rewrite dashboard with bento grid**

Replace `src/app/(authenticated)/dashboard/page.tsx`:

```tsx
import { authService, campaignService, analyticsService, leadService, alertService } from '@/lib/services'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { DollarSign, TrendingUp, BarChart3, Clock } from 'lucide-react'
import { RoiCard } from '@/components/widgets/roi-card'
import { HealthScoreWidget } from '@/components/widgets/health-score'
import { KpiCard } from '@/components/widgets/kpi-card'
import { FunilWidget } from '@/components/widgets/funil-widget'
import { TopObjecoesWidget } from '@/components/widgets/top-objecoes'
import { AtividadeAgentesWidget } from '@/components/widgets/atividade-agentes'
import { FeedAlertasWidget } from '@/components/widgets/feed-alertas'
import { DashboardSkeleton } from '@/components/skeletons/dashboard-skeleton'

export default async function DashboardPage() {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const [roi, health, funil, ltvCac, objecoes, economia, agentes, alerts] = await Promise.all([
    campaignService.getRoiTotal(user.empresa_id),
    analyticsService.getHealthScore(user.empresa_id),
    leadService.getFunilStats(user.empresa_id, '30d'),
    analyticsService.getLtvCac(user.empresa_id),
    leadService.getTopObjecoes(user.empresa_id),
    analyticsService.getEconomiaHoras(user.empresa_id),
    analyticsService.getAtividadeAgentes(user.empresa_id),
    alertService.getRecentes(user.empresa_id),
  ])

  return (
    <div className="space-y-6">
      {/* Row 1: Hero Zone */}
      <div className="grid gap-6 grid-cols-12">
        <div className="col-span-12 lg:col-span-8">
          <RoiCard initial={roi} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <HealthScoreWidget data={health} />
        </div>
      </div>

      {/* Row 2: KPI Strip */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Revenue"
          value={roi.retorno}
          prefix="R$ "
          decimals={0}
          icon={DollarSign}
          accentColor="#FBBF24"
          delay={0}
        />
        <KpiCard
          label="Conversão"
          value={health.taxa_conversao * 100}
          suffix="%"
          decimals={1}
          icon={TrendingUp}
          accentColor="#4FD1C5"
          delay={0.06}
        />
        <KpiCard
          label="LTV / CAC"
          value={ltvCac.ltv / ltvCac.cac}
          suffix="x"
          decimals={1}
          icon={BarChart3}
          accentColor="#A78BFA"
          delay={0.12}
        />
        <KpiCard
          label="Horas Salvas"
          value={economia.horas}
          suffix="h"
          decimals={0}
          icon={Clock}
          accentColor="#4FD1C5"
          delay={0.18}
        />
      </div>

      {/* Row 3: Análise */}
      <div className="grid gap-6 grid-cols-12">
        <div className="col-span-12 lg:col-span-8">
          <FunilWidget stats={funil} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <TopObjecoesWidget data={objecoes} />
        </div>
      </div>

      {/* Row 4: Agentes */}
      <AtividadeAgentesWidget data={agentes} />

      {/* Row 5: Alertas */}
      <FeedAlertasWidget alerts={alerts} />
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(authenticated)/dashboard/page.tsx
git commit -m "feat: redesign dashboard — bento grid layout with KPI strip"
```

---

### Task 13: Redesign login page

**Files:**
- Modify: `src/app/login/page.tsx`

- [ ] **Step 1: Rewrite login page**

Replace `src/app/login/page.tsx`:

```tsx
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
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/login/page.tsx
git commit -m "feat: redesign login page — cleaner card, subtle gradients, violet orb"
```

---

### Task 14: Redesign secondary pages — Funil, Leads, Campanhas

**Files:**
- Modify: `src/app/(authenticated)/funil/page.tsx`
- Modify: `src/app/(authenticated)/leads/page.tsx`
- Modify: `src/app/(authenticated)/leads/leads-table.tsx`
- Modify: `src/app/(authenticated)/campanhas/page.tsx`
- Modify: `src/app/(authenticated)/campanhas/campaign-grid.tsx`

- [ ] **Step 1: Update Funil page**

In `src/app/(authenticated)/funil/page.tsx`, replace all `glass-card` with `card-surface` and update the period toggle:

Replace the period toggle `<div className="flex gap-1 rounded-lg border border-border-default p-1">` block with:

```tsx
<div className="flex gap-1 rounded-xl bg-surface-2 p-1">
  {(['1d', '7d', '30d'] as Periodo[]).map((p) => (
    <button
      key={p}
      onClick={() => setPeriodo(p)}
      className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
        periodo === p
          ? 'bg-accent text-primary-foreground shadow-sm'
          : 'text-text-muted hover:text-text-primary'
      }`}
    >
      {p === '1d' ? 'Hoje' : p === '7d' ? '7 dias' : '30 dias'}
    </button>
  ))}
</div>
```

And replace every `glass-card` occurrence with `card-surface p-6`.

Replace the loading state `<div className="text-text-muted">Carregando funil...</div>` with a skeleton or spinner:

```tsx
if (!stats) return (
  <div className="flex items-center justify-center py-20 text-text-muted">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
  </div>
)
```

- [ ] **Step 2: Update Leads page header**

In `src/app/(authenticated)/leads/page.tsx`, update the header to include the search and "Novo Lead" button:

```tsx
import { redirect } from 'next/navigation'
import { authService, leadService } from '@/lib/services'
import { LeadsTable } from './leads-table'

export default async function LeadsPage() {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const leads = await leadService.getAll(user.empresa_id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-title text-2xl font-bold">Leads</h1>
      </div>
      <LeadsTable leads={leads} />
    </div>
  )
}
```

- [ ] **Step 3: Update LeadsTable styles**

In `src/app/(authenticated)/leads/leads-table.tsx`, replace every `glass-card` with `card-surface`, every `border-border-default` with `border-border-default`, and every `bg-bg-input` with `bg-surface-2`. Update badge styles for temperatura to use the color tokens.

- [ ] **Step 4: Update Campanhas page header**

In `src/app/(authenticated)/campanhas/page.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { authService, campaignService } from '@/lib/services'
import { CampaignGrid } from './campaign-grid'

export default async function CampanhasPage() {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const campaigns = await campaignService.getAll(user.empresa_id)

  return (
    <div className="space-y-6">
      <h1 className="font-title text-2xl font-bold">Campanhas</h1>
      <CampaignGrid campaigns={campaigns} />
    </div>
  )
}
```

- [ ] **Step 5: Update CampaignGrid styles**

In `src/app/(authenticated)/campanhas/campaign-grid.tsx`, replace all `glass-card` with `card-surface card-surface-interactive` and `border-border-default` with `border-border-default`.

- [ ] **Step 6: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add src/app/(authenticated)/funil/page.tsx src/app/(authenticated)/leads/page.tsx src/app/(authenticated)/leads/leads-table.tsx src/app/(authenticated)/campanhas/page.tsx src/app/(authenticated)/campanhas/campaign-grid.tsx
git commit -m "feat: redesign funil, leads, campanhas pages — new card styles, toggle group, filter chips"
```

---

### Task 15: Redesign secondary pages — Relatórios, Configurações, Admin

**Files:**
- Modify: `src/app/(authenticated)/relatorios/page.tsx`
- Modify: `src/app/(authenticated)/configuracoes/page.tsx`
- Modify: `src/app/admin/page.tsx`
- Modify: `src/app/admin/[empresaId]/page.tsx`
- Modify: `src/app/admin/layout.tsx`

- [ ] **Step 1: Update Relatórios page**

In `src/app/(authenticated)/relatorios/page.tsx`, replace all `glass-card` with `card-surface p-5`, replace `bg-bg-input` with `bg-surface-2`, replace `bg-[#0C1818]` with `bg-surface-2`, and update button styling:

Replace the download button class:
```
className="rounded-full bg-accent px-6 font-semibold text-[#070C0C] shadow-[0_0_40px_rgba(79,209,197,0.3)] hover:bg-accent-light"
```
with:
```
className="rounded-xl bg-accent px-6 font-semibold text-primary-foreground transition-all hover:brightness-110"
```

Update preview section: replace `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` wrapper `<div>` with a card-elevated background to simulate paper:

```tsx
<div className="card-elevated p-6">
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {previewSections.map((s) => (
      <div key={s.title} className="rounded-lg bg-surface-2 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-accent">{s.title}</p>
        <p className="whitespace-pre-line text-sm text-text-muted">{s.content}</p>
      </div>
    ))}
  </div>
</div>
```

- [ ] **Step 2: Update Configurações page**

In `src/app/(authenticated)/configuracoes/page.tsx`, replace all `glass-card` with `card-surface p-6`, all `bg-bg-input` with `bg-surface-2`, and update the save button:

Replace:
```
className="rounded-full bg-accent px-8 font-semibold text-[#070C0C] shadow-[0_0_40px_rgba(79,209,197,0.3)] hover:bg-accent-light"
```
with:
```
className="rounded-xl bg-accent px-8 font-semibold text-primary-foreground transition-all hover:brightness-110"
```

- [ ] **Step 3: Update Admin layout and pages**

In `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, and `src/app/admin/[empresaId]/page.tsx`, replace all `glass-card` with `card-surface`, all `bg-bg-input` with `bg-surface-2`, all `border-border-default` references are fine (token name unchanged), and update any hardcoded colors like `bg-[#0C1818]` to `bg-surface-2`.

- [ ] **Step 4: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Run tests**

```bash
npx vitest run
```

- [ ] **Step 6: Commit**

```bash
git add src/app/(authenticated)/relatorios/page.tsx src/app/(authenticated)/configuracoes/page.tsx src/app/admin/
git commit -m "feat: redesign relatórios, configurações, admin — new card system, consistent styling"
```

---

### Task 16: Final polish — verify build, run tests, visual review

**Files:**
- Potentially fix any remaining `glass-card` references or old color tokens across the codebase

- [ ] **Step 1: Search for any remaining old design references**

```bash
grep -r "glass-card\|bg-bg-elevated\|bg-bg-input\|border-border-strong\|color-border-strong\|bg-\[#0C1818\]\|text-\[#070C0C\]\|shadow-\[0_0_40px" src/ --include="*.tsx" --include="*.ts" --include="*.css" -l
```

Fix any remaining occurrences:
- `glass-card` → `card-surface`
- `bg-bg-elevated` → `bg-surface-2`
- `bg-bg-input` → `bg-surface-2`
- `border-border-strong` → `border-border-hover`
- `bg-[#0C1818]` → `bg-surface-2`
- `text-[#070C0C]` → `text-primary-foreground`
- `shadow-[0_0_40px...]` → remove (no more glow shadows)

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Run all tests**

```bash
npx vitest run
```

- [ ] **Step 4: Run build**

```bash
npm run build
```

- [ ] **Step 5: Fix any build errors**

Iterate until build passes clean.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: final polish — clean up old design tokens, ensure build passes"
```

---

## Summary

| Task | Description | Key Changes |
|------|-------------|-------------|
| 1 | Install motion + extend types | Add `motion`, `historico_7d` on `RoiTotal` |
| 2 | Theme tokens | New palette, surfaces, light/dark CSS vars, motion tokens |
| 3 | Root layout | `ThemeProvider` from next-themes |
| 4 | Motion utilities | `CountUp`, `AnimateIn`, shared motion config |
| 5 | Skeleton loaders | `SkeletonBlock`, `DashboardSkeleton` |
| 6 | Sidebar | Collapsible, tooltips, avatar, sections |
| 7 | Topbar | Breadcrumb, search trigger, theme toggle, notifications |
| 8 | Command Palette | ⌘K modal with search, keyboard nav |
| 9 | Auth layout | Wire sidebar + topbar + command palette |
| 10 | ROI hero | Gradient card, count-up, sparkline |
| 11 | All widgets | AnimateIn, KPI card, colored agents, alerts |
| 12 | Dashboard page | Bento grid 12-col layout |
| 13 | Login page | Cleaner card, gradient orbs |
| 14 | Funil/Leads/Campanhas | New card styles, toggle groups |
| 15 | Relatórios/Config/Admin | Consistent new design |
| 16 | Final polish | Clean up old tokens, verify build |
