import Image from 'next/image'

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className = '', width = 140, height = 35 }: LogoProps) {
  return (
    <Image
      src="/logo/athenio-dark.svg"
      alt="Athenio.ai"
      width={width}
      height={height}
      priority
      className={`object-contain ${className}`}
    />
  )
}

export function LogoMark({ className = '', size = 28 }: { className?: string; size?: number }) {
  return (
    <div className={`overflow-hidden ${className}`} style={{ width: size, height: size }}>
      <Image
        src="/logo/athenio-dark.svg"
        alt="Athenio.ai"
        width={size}
        height={size}
        className="h-full w-auto max-w-none object-cover object-left"
      />
    </div>
  )
}
