import { useState } from 'react';
import { Heart, Calendar, Edit, Save } from 'lucide-react';
import { CoupleService } from '../../services/CoupleService';
import { Database } from '../../lib/database.types';

type Couple = Database['public']['Tables']['couples']['Row'];

interface ProfileSettingsProps {
  couple: Couple;
  onUpdate: () => void;
}

export function ProfileSettings({ couple, onUpdate }: ProfileSettingsProps) {
  const [editing, setEditing] = useState(false);
  const [coupleName, setCoupleName] = useState(couple.couple_name || '');
  const [anniversaryDate, setAnniversaryDate] = useState(couple.anniversary_date || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await CoupleService.updateCouple(couple.id, {
        couple_name: coupleName || undefined,
        anniversary_date: anniversaryDate || null,
      });
      setEditing(false);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Couple Settings</h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couple Name
            </label>
            {editing ? (
              <input
                type="text"
                value={coupleName}
                onChange={(e) => setCoupleName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Our couple name"
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-800">
                <Heart className="w-5 h-5 text-rose-500" />
                <span className="text-lg font-medium">{coupleName || 'Not set'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anniversary Date
            </label>
            {editing ? (
              <input
                type="date"
                value={anniversaryDate}
                onChange={(e) => setAnniversaryDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-800">
                <Calendar className="w-5 h-5 text-rose-500" />
                <span>
                  {anniversaryDate
                    ? new Date(anniversaryDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Not set'}
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}
