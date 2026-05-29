export default function OverviewPage() {
  return (
    <div className="h-full">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
          <p className="text-neutral-400">View your stock overview and analytics</p>
        </div>

        {/* Placeholder content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition-colors">
            <div className="text-neutral-400 text-sm mb-2">Total Stocks</div>
            <div className="text-3xl font-bold text-white">24</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition-colors">
            <div className="text-neutral-400 text-sm mb-2">Active Listings</div>
            <div className="text-3xl font-bold text-yellow-400">12</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition-colors">
            <div className="text-neutral-400 text-sm mb-2">Archived</div>
            <div className="text-3xl font-bold text-white">8</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition-colors">
            <div className="text-neutral-400 text-sm mb-2">Favorites</div>
            <div className="text-3xl font-bold text-white">4</div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-neutral-800">
              <span className="text-neutral-300">Stock item added</span>
              <span className="text-neutral-500 text-sm">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-neutral-800">
              <span className="text-neutral-300">Item archived</span>
              <span className="text-neutral-500 text-sm">5 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-neutral-300">New favorite added</span>
              <span className="text-neutral-500 text-sm">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
