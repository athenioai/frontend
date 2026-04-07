export default function AgendaLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8 lg:py-10">
      <div className="skeleton h-7 w-24 rounded-lg" />
      <div className="skeleton mt-2 h-4 w-72 rounded-md" />
      <div className="mt-6 flex gap-4">
        <div className="skeleton h-9 w-56 rounded-lg" />
        <div className="skeleton ml-auto h-8 w-32 rounded-lg" />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="card-surface p-4 pl-5">
            <div className="skeleton h-5 w-24 rounded-full" />
            <div className="skeleton mt-3 h-4 w-32 rounded-md" />
            <div className="skeleton mt-1 h-3 w-20 rounded-md" />
            <div className="skeleton mt-2 h-3 w-28 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
