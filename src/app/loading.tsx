export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero section skeleton */}
      <div className="space-y-3 py-4">
        <div className="h-8 bg-gray-800 rounded-lg w-1/2 mx-auto" />
        <div className="h-4 bg-gray-800 rounded w-1/3 mx-auto" />
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3"
          >
            <div className="h-5 bg-gray-800 rounded w-3/4" />
            <div className="h-4 bg-gray-800 rounded w-full" />
            <div className="h-4 bg-gray-800 rounded w-2/3" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 bg-gray-800 rounded-full w-16" />
              <div className="h-6 bg-gray-800 rounded-full w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
