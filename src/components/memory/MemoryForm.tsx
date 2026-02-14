import { useState, useEffect } from 'react';
import { X, Calendar, Image, Type, AlignLeft } from 'lucide-react';
import { Database } from '../../lib/database.types';

type Memory = Database['public']['Tables']['memories']['Row'];
type MemoryInsert = Database['public']['Tables']['memories']['Insert'];

interface MemoryFormProps {
  coupleId: string;
  memory?: Memory | null;
  onSubmit: (memory: MemoryInsert) => Promise<void>;
  onClose: () => void;
}

const categories = [
  { value: 'date', label: 'Date', color: 'rose' },
  { value: 'gift', label: 'Gift', color: 'purple' },
  { value: 'trip', label: 'Trip', color: 'blue' },
  { value: 'milestone', label: 'Milestone', color: 'yellow' },
  { value: 'moment', label: 'Moment', color: 'red' },
  { value: 'surprise', label: 'Surprise', color: 'pink' },
  { value: 'celebration', label: 'Celebration', color: 'indigo' },
] as const;

export function MemoryForm({ coupleId, memory, onSubmit, onClose }: MemoryFormProps) {
  const [title, setTitle] = useState(memory?.title || '');
  const [description, setDescription] = useState(memory?.description || '');
  const [memoryDate, setMemoryDate] = useState(
    memory?.memory_date || new Date().toISOString().split('T')[0]
  );
  const [imageUrl, setImageUrl] = useState(memory?.image_url || '');
  const [category, setCategory] = useState<typeof categories[number]['value']>(
    memory?.category || 'moment'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit({
        couple_id: coupleId,
        title,
        description,
        memory_date: memoryDate,
        image_url: imageUrl || null,
        category,
        created_by: '',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save memory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {memory ? 'Edit Memory' : 'Create New Memory'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Type className="w-4 h-4 inline mr-1" />
              Memory Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="Our first date..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={memoryDate}
              onChange={(e) => setMemoryDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    category === cat.value
                      ? `border-${cat.color}-500 bg-${cat.color}-50 text-${cat.color}-700`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image className="w-4 h-4 inline mr-1" />
              Image URL (optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
            {imageUrl && (
              <div className="mt-3 relative h-48 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <AlignLeft className="w-4 h-4 inline mr-1" />
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
              placeholder="Tell the story of this special moment..."
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-medium hover:from-rose-600 hover:to-pink-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : memory ? 'Update Memory' : 'Create Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
