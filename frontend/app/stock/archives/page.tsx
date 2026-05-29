export default function ArchivesPage() {
  const archived = [
    { id: 1, name: "Old Commercial Property", archived: "2 months ago" },
    { id: 2, name: "Discontinued Listing", archived: "6 weeks ago" },
    { id: 3, name: "Sold Property", archived: "3 months ago" },
    { id: 4, name: "Inactive Stock", archived: "1 month ago" },
  ];

  return (
    <div className="h-full">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Archives</h1>
          <p className="text-neutral-400">View and manage your archived stocks</p>
        </div>

        {/* Archived Items */}
        <div className="space-y-3">
          {archived.map((item) => (
            <div
              key={item.id}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">{item.name}</h3>
                  <p className="text-neutral-500 text-sm">Archived {item.archived}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg text-sm transition-all cursor-pointer">
                    Restore
                  </button>
                  <button className="px-3 py-2 bg-neutral-800/50 hover:bg-red-900/30 text-neutral-300 hover:text-red-400 rounded-lg text-sm transition-all cursor-pointer">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state option */}
        {archived.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl text-neutral-700 mb-3">📦</div>
            <h3 className="text-lg font-semibold text-white mb-2">No Archived Items</h3>
            <p className="text-neutral-400">Your archived stocks will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
