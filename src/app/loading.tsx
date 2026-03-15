export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="text-center py-12">
        <div className="h-4 w-48 bg-gray-800 rounded-full mx-auto mb-6" />
        <div className="h-10 w-80 bg-gray-800 rounded-lg mx-auto mb-4" />
        <div className="h-5 w-96 bg-gray-800/50 rounded-lg mx-auto" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <div className="h-5 w-32 bg-gray-800 rounded mb-3" />
            <div className="h-8 w-24 bg-gray-800/50 rounded mb-2" />
            <div className="h-3 w-16 bg-gray-800/30 rounded" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 h-64" />
        <div className="md:col-span-2 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <div className="h-5 w-40 bg-gray-800 rounded mb-3" />
              <div className="h-3 w-full bg-gray-800/30 rounded mb-2" />
              <div className="h-3 w-2/3 bg-gray-800/20 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
