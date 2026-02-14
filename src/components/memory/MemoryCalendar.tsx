import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { MemoryService } from '../../services/MemoryService';
import { Database } from '../../lib/database.types';

type Memory = Database['public']['Tables']['memories']['Row'];

interface MemoryCalendarProps {
  coupleId: string;
  memories: Memory[];
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

export function MemoryCalendar({ coupleId, memories, onToggleFavorite }: MemoryCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthMemories, setMonthMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  useEffect(() => {
    loadMonthMemories();
  }, [currentDate, coupleId]);

  const loadMonthMemories = async () => {
    try {
      const data = await MemoryService.getMemoriesByDate(
        coupleId,
        currentDate.getFullYear(),
        currentDate.getMonth()
      );
      setMonthMemories(data);
    } catch (error) {
      console.error('Error loading month memories:', error);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getMemoriesForDay = (day: number) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toISOString().split('T')[0];

    return monthMemories.filter((memory) => memory.memory_date === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">{monthName}</h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dayMemories = getMemoriesForDay(day);
            const hasMemories = dayMemories.length > 0;

            return (
              <button
                key={day}
                onClick={() => hasMemories && setSelectedMemory(dayMemories[0])}
                className={`aspect-square p-2 rounded-lg border-2 transition-all relative ${
                  hasMemories
                    ? 'border-rose-500 bg-rose-50 hover:bg-rose-100 cursor-pointer'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium text-gray-700">{day}</span>
                {hasMemories && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                    {dayMemories.slice(0, 3).map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-rose-500"
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedMemory && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedMemory.title}
              </h3>
              <p className="text-gray-600">
                {new Date(selectedMemory.memory_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <button
              onClick={() =>
                onToggleFavorite(selectedMemory.id, !selectedMemory.is_favorite)
              }
              className="p-2 hover:bg-rose-50 rounded-full transition-colors"
            >
              <Heart
                className={`w-6 h-6 ${
                  selectedMemory.is_favorite
                    ? 'fill-rose-500 text-rose-500'
                    : 'text-gray-400'
                }`}
              />
            </button>
          </div>

          {selectedMemory.image_url && (
            <img
              src={selectedMemory.image_url}
              alt={selectedMemory.title}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          )}

          {selectedMemory.description && (
            <p className="text-gray-700 leading-relaxed">
              {selectedMemory.description}
            </p>
          )}

          <div className="mt-4">
            <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-medium">
              {selectedMemory.category}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
