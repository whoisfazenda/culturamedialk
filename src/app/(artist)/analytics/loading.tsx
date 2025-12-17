export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto pb-20 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div className="h-10 w-48 bg-surfaceHover rounded-xl"></div>
        <div className="h-10 w-32 bg-surfaceHover rounded-xl"></div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface p-6 rounded-3xl border border-border h-32"></div>
          <div className="bg-surface p-6 rounded-3xl border border-border h-32"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface p-6 rounded-3xl border border-border h-64"></div>
          <div className="bg-surface p-6 rounded-3xl border border-border h-64"></div>
        </div>

        <div className="bg-surface p-8 rounded-3xl border border-border h-96"></div>
      </div>
    </div>
  );
}