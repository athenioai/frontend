export default function PlanosLoading() {
  return (
    <div className="px-6 py-8 lg:py-10">
      <div className="flex items-center justify-between">
        <div className="skeleton h-7 w-24 rounded-lg" />
        <div className="skeleton h-8 w-28 rounded-lg" />
      </div>
      <div className="skeleton mt-6 h-9 w-full rounded-lg" />
      <div className="mt-6 space-y-0">
        <div className="skeleton h-10 w-full rounded-t-xl" />
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="skeleton h-14 w-full" />
        ))}
        <div className="skeleton h-10 w-full rounded-b-xl" />
      </div>
    </div>
  )
}
