export default function ChatDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="skeleton h-7 w-7 rounded-lg" />
        <div className="h-5 w-px bg-border-default" />
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-4 w-36 rounded-md" />
      </div>

      {/* Message skeletons */}
      <div className="space-y-3">
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
        <div className="flex justify-start">
          <div className="skeleton h-16 w-[50%] rounded-tl-sm rounded-tr-xl rounded-bl-xl rounded-br-xl" />
        </div>
      </div>
    </div>
  )
}
