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
