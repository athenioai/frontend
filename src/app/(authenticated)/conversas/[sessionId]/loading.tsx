export default function ChatDetailLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Header skeleton */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border-default bg-surface-1 px-4 py-3">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-4 w-36 rounded-md" />
      </div>

      {/* Messages skeleton */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-3 px-4 py-6 lg:px-6">
          <div className="flex justify-start">
            <div className="skeleton h-20 w-[60%] rounded-tl-sm rounded-tr-xl rounded-bl-xl rounded-br-xl" />
          </div>
          <div className="flex justify-end">
            <div className="skeleton h-16 w-[55%] rounded-tl-xl rounded-tr-sm rounded-bl-xl rounded-br-xl" />
          </div>
          <div className="flex justify-start">
            <div className="skeleton h-14 w-[45%] rounded-tl-sm rounded-tr-xl rounded-bl-xl rounded-br-xl" />
          </div>
          <div className="flex justify-end">
            <div className="skeleton h-24 w-[65%] rounded-tl-xl rounded-tr-sm rounded-bl-xl rounded-br-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
