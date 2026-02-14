import { Heart, Calendar, MapPin, Gift, Plane, Star, Sparkles, PartyPopper, Edit, Trash2 } from 'lucide-react';
import { Database } from '../../lib/database.types';
import { useState } from 'react';

type Memory = Database['public']['Tables']['memories']['Row'];

const categoryIcons = {
  date: MapPin,
  gift: Gift,
  trip: Plane,
  milestone: Star,
  moment: Heart,
  surprise: Sparkles,
  celebration: PartyPopper,
};

const categoryColors = {
  date: 'from-rose-500 to-pink-500',
  gift: 'from-purple-500 to-pink-500',
  trip: 'from-blue-500 to-cyan-500',
  milestone: 'from-yellow-500 to-orange-500',
  moment: 'from-red-500 to-rose-500',
  surprise: 'from-pink-500 to-fuchsia-500',
  celebration: 'from-indigo-500 to-purple-500',
};

interface MemoryCardProps {
  memory: Memory;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onEdit?: (memory: Memory) => void;
  onDelete?: (id: string) => void;
}

export function MemoryCard({ memory, onToggleFavorite, onEdit, onDelete }: MemoryCardProps) {
  const [showActions, setShowActions] = useState(false);
  const Icon = categoryIcons[memory.category];
  const colorClass = categoryColors[memory.category];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {memory.image_url && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={memory.image_url}
            alt={memory.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${colorClass} opacity-20`}></div>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClass}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {memory.title}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(memory.memory_date)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onToggleFavorite(memory.id, !memory.is_favorite)}
            className="p-2 hover:bg-rose-50 rounded-full transition-colors"
          >
            <Heart
              className={`w-6 h-6 transition-all ${
                memory.is_favorite
                  ? 'fill-rose-500 text-rose-500'
                  : 'text-gray-400 hover:text-rose-500'
              }`}
            />
          </button>
        </div>

        {memory.description && (
          <p className="text-gray-600 leading-relaxed">
            {memory.description}
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${colorClass} text-white`}>
            {memory.category}
          </span>
        </div>

        {showActions && (onEdit || onDelete) && (
          <div className="absolute top-4 right-4 flex gap-2 animate-fadeIn">
            {onEdit && (
              <button
                onClick={() => onEdit(memory)}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-colors"
              >
                <Edit className="w-4 h-4 text-blue-600" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(memory.id)}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
