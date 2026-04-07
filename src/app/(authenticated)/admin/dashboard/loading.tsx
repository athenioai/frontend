export default function AdminDashboardLoading() {
  return (
    <div className="px-6 py-8 lg:py-10">
      <div className="skeleton h-7 w-48 rounded-lg" />
      <div className="skeleton mt-2 h-4 w-72 rounded-md" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="card-surface p-5">
            <div className="skeleton h-4 w-20 rounded-md" />
            <div className="skeleton mt-3 h-8 w-24 rounded-lg" />
            <div className="skeleton mt-2 h-3 w-32 rounded-md" />
          </div>
        ))}
      </div>
      <div className="mt-8 card-surface p-6">
        <div className="skeleton h-4 w-44 rounded-md" />
        <div className="skeleton mx-auto mt-6 h-48 w-48 rounded-full" />
      </div>
    </div>
  )
}
