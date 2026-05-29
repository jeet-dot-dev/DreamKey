export default function ListsPage() {
  const lists = [
    { id: 1, name: "Premium Properties", count: 8, created: "2 weeks ago" },
    { id: 2, name: "Commercial", count: 5, created: "1 month ago" },
    { id: 3, name: "Residential", count: 7, created: "3 weeks ago" },
    { id: 4, name: "New Constructions", count: 4, created: "5 days ago" },
  ];

  return (
    <div className="h-full">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Lists</h1>
          <p className="text-neutral-400">Manage and organize your stock lists</p>
        </div>

        {/* Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lists.map((list) => (
            <div
              key={list.id}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{list.name}</h3>
                  <p className="text-neutral-500 text-sm">Created {list.created}</p>
                </div>
                <span className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                  {list.count} items
                </span>
              </div>
              <button className="w-full bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white py-2 px-4 rounded-lg transition-all text-sm cursor-pointer">
                View List
              </button>
            </div>
          ))}
        </div>

        {/* Create new list */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-yellow-400/50 transition-colors">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-4xl text-neutral-700 mb-3">+</div>
            <h3 className="text-lg font-semibold text-white mb-2">Create New List</h3>
            <p className="text-neutral-400 text-sm mb-4">Organize your stocks into custom lists</p>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-6 rounded-lg transition-all cursor-pointer">
              Create List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
