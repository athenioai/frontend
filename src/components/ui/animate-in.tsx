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
