import { useState } from 'react';
import { Heart, Search, Filter } from 'lucide-react';
import { MemoryCard } from './MemoryCard';
import { Database } from '../../lib/database.types';

type Memory = Database['public']['Tables']['memories']['Row'];

interface MemoryBookProps {
  memories: Memory[];
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onEdit: (memory: Memory) => void;
  onDelete: (id: string) => void;
}

export function MemoryBook({ memories, onToggleFavorite, onEdit, onDelete }: MemoryBookProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredMemories = memories.filter((memory) => {
    const matchesSearch = memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || memory.category === filterCategory;
    const matchesFavorite = !showFavoritesOnly || memory.is_favorite;

    return matchesSearch && matchesCategory && matchesFavorite;
  });

  const categories = ['all', 'date', 'gift', 'trip', 'milestone', 'moment', 'surprise', 'celebration'];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                showFavoritesOnly
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className={`w-5 h-5 ${showFavoritesOnly ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {filteredMemories.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No memories yet
          </h3>
          <p className="text-gray-500">
            Start creating beautiful memories together
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {showFavoritesOnly ? 'Favorite Memories' : 'All Memories'}
            </h2>
            <span className="text-gray-500">
              {filteredMemories.length} {filteredMemories.length === 1 ? 'memory' : 'memories'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMemories.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                onToggleFavorite={onToggleFavorite}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
