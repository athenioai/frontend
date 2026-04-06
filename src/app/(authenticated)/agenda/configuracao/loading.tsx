export default function ConfigLoading() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-8 lg:py-10">
      <div className="flex items-center gap-3">
        <div className="skeleton h-7 w-7 rounded-lg" />
        <div>
          <div className="skeleton h-6 w-52 rounded-lg" />
          <div className="skeleton mt-1 h-4 w-80 rounded-md" />
        </div>
      </div>
      <div className="skeleton mt-8 h-4 w-44 rounded-md" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="card-surface flex items-center gap-4 px-4 py-3">
            <div className="skeleton h-4 w-20 rounded-md" />
            <div className="skeleton h-6 w-11 rounded-full" />
            <div className="skeleton h-4 w-32 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
