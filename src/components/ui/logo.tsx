'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className = '', width = 140, height = 35 }: LogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const src = !mounted || resolvedTheme === 'dark'
    ? '/logo/athenio-dark.svg'
    : '/logo/athenio-light.svg'

  return (
    <Image
      src={src}
      alt="Athenio.ai"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}

/** Compact version — just the icon mark, no text */
export function LogoMark({ className = '', size = 28 }: { className?: string; size?: number }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // The SVG has the icon on the left portion — we crop via object-position
  const src = !mounted || resolvedTheme === 'dark'
    ? '/logo/athenio-dark.svg'
    : '/logo/athenio-light.svg'

  return (
    <div className={`overflow-hidden ${className}`} style={{ width: size, height: size }}>
      <Image
        src={src}
        alt="Athenio.ai"
        width={size * 4}
        height={size}
        className="h-full w-auto max-w-none object-cover object-left"
        priority
      />
    </div>
  )
}
