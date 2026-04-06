interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className = '', width = 140, height = 35 }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo/athenio-dark.svg"
      alt="Athenio.ai"
      width={width}
      height={height}
      className={`object-contain ${className}`}
    />
  )
}

export function LogoMark({ className = '', size = 28 }: { className?: string; size?: number }) {
  return (
    <div className={`overflow-hidden ${className}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo/athenio-dark.svg"
        alt="Athenio.ai"
        className="h-full w-auto max-w-none object-cover object-left"
      />
    </div>
  )
}
