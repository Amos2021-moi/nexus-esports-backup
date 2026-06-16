export function SkeletonCard() {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-32 bg-gray-700 rounded"></div>
        <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-gray-700 rounded"></div>
        <div className="h-4 w-3/4 bg-gray-700 rounded"></div>
      </div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden animate-pulse">
      <div className="h-12 bg-gray-700"></div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 border-t border-gray-700">
          <div className="flex items-center h-full px-6 gap-4">
            <div className="h-4 w-24 bg-gray-700 rounded"></div>
            <div className="h-4 w-32 bg-gray-700 rounded"></div>
            <div className="h-4 w-20 bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )
}