export default function ConversasLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="skeleton h-7 w-32 rounded-lg" />
        <div className="skeleton mt-2 h-4 w-64 rounded-md" />
        <div className="skeleton mt-5 h-8 w-44 rounded-lg" />
      </div>

      {/* Card skeletons */}
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="card-surface p-4 pl-5">
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton mt-2.5 h-4 w-full rounded-md" />
            <div className="skeleton mt-2 h-3 w-44 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
