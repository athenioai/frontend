export default function ConfiguracoesLoading() {
  return (
    <div className="px-6 py-8 lg:py-10">
      <div className="skeleton h-7 w-40 rounded-lg" />
      <div className="skeleton mt-2 h-4 w-64 rounded-md" />
      <div className="mt-8 card-surface p-5">
        <div className="flex items-center gap-3">
          <div className="skeleton h-9 w-9 rounded-xl" />
          <div>
            <div className="skeleton h-4 w-20 rounded-md" />
            <div className="skeleton mt-1 h-3 w-52 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
