export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div className="h-10 w-48 bg-surfaceHover rounded-xl"></div>
        <div className="h-10 w-32 bg-surfaceHover rounded-xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface rounded-3xl border border-border overflow-hidden h-72">
            <div className="h-48 bg-surfaceHover"></div>
            <div className="p-4 space-y-3">
              <div className="h-6 w-3/4 bg-surfaceHover rounded"></div>
              <div className="h-4 w-1/2 bg-surfaceHover rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}