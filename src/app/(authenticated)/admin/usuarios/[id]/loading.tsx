export default function UserDetailLoading() {
  return (
    <div className="px-6 py-8 lg:py-10">
      <div className="skeleton h-7 w-20 rounded-lg" />
      <div className="mt-4 card-hero p-6">
        <div className="flex items-center gap-5">
          <div className="skeleton h-16 w-16 rounded-2xl" />
          <div>
            <div className="skeleton h-6 w-40 rounded-lg" />
            <div className="skeleton mt-1 h-4 w-56 rounded-md" />
            <div className="skeleton mt-2 h-3 w-36 rounded-md" />
          </div>
        </div>
      </div>
      <div className="mt-6 flex gap-4 border-b border-border-default pb-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton h-5 w-24 rounded-md" />
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="card-surface p-5">
            <div className="skeleton h-4 w-20 rounded-md" />
            <div className="skeleton mt-3 h-8 w-16 rounded-lg" />
            <div className="skeleton mt-2 h-3 w-28 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
