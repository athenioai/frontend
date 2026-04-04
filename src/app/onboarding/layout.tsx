import { redirect } from 'next/navigation'
import { authService } from '@/lib/services'

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  return (
    <div className="relative min-h-screen bg-bg-base">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(79,209,197,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(79,209,197,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
