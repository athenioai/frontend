export default function UsuariosLoading() {
  return (
    <div className="px-6 py-8 lg:py-10">
      <div className="flex items-center justify-between">
        <div className="skeleton h-7 w-28 rounded-lg" />
        <div className="skeleton h-8 w-32 rounded-lg" />
      </div>
      <div className="mt-6 flex gap-4">
        <div className="skeleton h-10 w-full max-w-sm rounded-xl" />
        <div className="skeleton h-9 w-48 rounded-lg" />
      </div>
      <div className="mt-6 space-y-0">
        <div className="skeleton h-10 w-full rounded-t-xl" />
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="skeleton h-14 w-full" />
        ))}
      </div>
    </div>
  )
}
