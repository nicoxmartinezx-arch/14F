import { useState, useEffect } from 'react';
import { Heart, Plus, Calendar as CalendarIcon, Book, Settings } from 'lucide-react';
import { CoupleService } from '../../services/CoupleService';
import { MemoryService } from '../../services/MemoryService';
import { MemoryBook } from '../memory/MemoryBook';
import { MemoryCalendar } from '../memory/MemoryCalendar';
import { MemoryForm } from '../memory/MemoryForm';
import { ProfileSettings } from '../profile/ProfileSettings';
import { Database } from '../../lib/database.types';

type Couple = Database['public']['Tables']['couples']['Row'];
type Memory = Database['public']['Tables']['memories']['Row'];

export function Dashboard() {
  const [couple, setCouple] = useState<Couple | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [view, setView] = useState<'book' | 'calendar' | 'profile'>('book');
  const [showMemoryForm, setShowMemoryForm] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const coupleData = await CoupleService.getMyCouple();
      if (coupleData) {
        setCouple(coupleData);
        const memoriesData = await MemoryService.getMemories(coupleData.id);
        setMemories(memoriesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMemory = async (memory: any) => {
    if (!couple) return;
    await MemoryService.createMemory(memory);
    await loadData();
  };

  const handleUpdateMemory = async (memory: any) => {
    if (!editingMemory) return;
    await MemoryService.updateMemory(editingMemory.id, memory);
    setEditingMemory(null);
    await loadData();
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (confirm('Are you sure you want to delete this memory?')) {
      await MemoryService.deleteMemory(memoryId);
      await loadData();
    }
  };

  const handleToggleFavorite = async (memoryId: string, isFavorite: boolean) => {
    await MemoryService.toggleFavorite(memoryId, isFavorite);
    setMemories(memories.map(m =>
      m.id === memoryId ? { ...m, is_favorite: isFavorite } : m
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-rose-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading your memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {couple?.couple_name || 'Our Memory Book'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('book')}
                className={`p-2 rounded-lg transition-colors ${
                  view === 'book'
                    ? 'bg-rose-100 text-rose-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Book className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`p-2 rounded-lg transition-colors ${
                  view === 'calendar'
                    ? 'bg-rose-100 text-rose-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <CalendarIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('profile')}
                className={`p-2 rounded-lg transition-colors ${
                  view === 'profile'
                    ? 'bg-rose-100 text-rose-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'book' && (
          <MemoryBook
            memories={memories}
            onToggleFavorite={handleToggleFavorite}
            onEdit={setEditingMemory}
            onDelete={handleDeleteMemory}
          />
        )}

        {view === 'calendar' && couple && (
          <MemoryCalendar
            coupleId={couple.id}
            memories={memories}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {view === 'profile' && couple && (
          <ProfileSettings
            couple={couple}
            onUpdate={loadData}
          />
        )}
      </main>

      <button
        onClick={() => setShowMemoryForm(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all flex items-center justify-center group"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform" />
      </button>

      {(showMemoryForm || editingMemory) && couple && (
        <MemoryForm
          coupleId={couple.id}
          memory={editingMemory}
          onSubmit={editingMemory ? handleUpdateMemory : handleCreateMemory}
          onClose={() => {
            setShowMemoryForm(false);
            setEditingMemory(null);
          }}
        />
      )}
    </div>
  );
}
