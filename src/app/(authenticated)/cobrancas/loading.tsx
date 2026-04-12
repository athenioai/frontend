export default function CobrancasLoading() {
  return (
    <div className="px-6 py-8 lg:py-10">
      <div className="flex items-center justify-between">
        <div className="skeleton h-7 w-32 rounded-lg" />
        <div className="skeleton h-8 w-36 rounded-lg" />
      </div>
      <div className="mt-6 flex gap-3">
        <div className="skeleton h-9 w-44 rounded-lg" />
        <div className="skeleton h-9 w-44 rounded-lg" />
      </div>
      <div className="mt-4 space-y-0">
        <div className="skeleton h-10 w-full rounded-t-xl" />
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="skeleton h-14 w-full" />
        ))}
        <div className="skeleton h-10 w-full rounded-b-xl" />
      </div>
    </div>
  )
}
