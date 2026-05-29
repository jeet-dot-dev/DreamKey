export default function FavoritesPage() {
  const favorites = [
    { id: 1, name: "Premium Downtown Property", price: "$2.5M", added: "1 week ago" },
    { id: 2, name: "Luxury Beachfront", price: "$3.8M", added: "5 days ago" },
    { id: 3, name: "Modern Penthouse", price: "$1.9M", added: "2 weeks ago" },
    { id: 4, name: "Historic Estate", price: "$4.2M", added: "3 weeks ago" },
  ];

  return (
    <div className="h-full">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Favorites</h1>
          <p className="text-neutral-400">Your favorite stocks and properties</p>
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((item) => (
            <div
              key={item.id}
              className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden hover:border-yellow-400/50 transition-all hover:shadow-lg hover:shadow-yellow-400/10"
            >
              <div className="bg-neutral-800 h-40 flex items-center justify-center relative">
                <div className="text-neutral-600 text-xl">🏠</div>
                <button className="absolute top-2 right-2 text-yellow-400 hover:text-yellow-500 cursor-pointer">
                  ★
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2">{item.name}</h3>
                <p className="text-yellow-400 font-bold mb-3">{item.price}</p>
                <p className="text-neutral-500 text-sm mb-3">Added {item.added}</p>
                <button className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white py-2 px-4 rounded-lg transition-all text-sm cursor-pointer">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state option */}
        {favorites.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl text-neutral-700 mb-3">⭐</div>
            <h3 className="text-lg font-semibold text-white mb-2">No Favorites Yet</h3>
            <p className="text-neutral-400">Add stocks to your favorites for quick access</p>
          </div>
        )}
      </div>
    </div>
  );
}
