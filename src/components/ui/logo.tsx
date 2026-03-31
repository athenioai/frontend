'use client'

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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Athenio.ai"
      width={width}
      height={height}
      className={`object-contain ${className}`}
    />
  )
}

export function LogoMark({ className = '', size = 28 }: { className?: string; size?: number }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const src = !mounted || resolvedTheme === 'dark'
    ? '/logo/athenio-dark.svg'
    : '/logo/athenio-light.svg'

  return (
    <div className={`overflow-hidden ${className}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Athenio.ai"
        className="h-full w-auto max-w-none object-cover object-left"
      />
    </div>
  )
}
