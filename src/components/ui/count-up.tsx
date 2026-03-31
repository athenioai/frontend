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
