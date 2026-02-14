import { useState } from 'react';
import { Heart, Calendar, Edit, Save } from 'lucide-react';
import { CoupleService } from '../../services/CoupleService';
import { useAuth } from '../../contexts/AuthContext';
import { Database } from '../../lib/database.types';

type Couple = Database['public']['Tables']['couples']['Row'];

interface ProfileSettingsProps {
  couple: Couple;
  partner: any;
  onUpdate: () => void;
}

export function ProfileSettings({ couple, partner, onUpdate }: ProfileSettingsProps) {
  const { profile, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [coupleName, setCoupleName] = useState(couple.couple_name);
  const [anniversaryDate, setAnniversaryDate] = useState(couple.anniversary_date || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await Promise.all([
        CoupleService.updateCouple(couple.id, {
          couple_name: coupleName,
          anniversary_date: anniversaryDate || null,
        }),
        updateProfile({ full_name: fullName }),
      ]);
      setEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-800">
                <Heart className="w-5 h-5 text-rose-500" />
                <span className="text-lg font-medium">{coupleName}</span>
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
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Profile</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            {editing ? (
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800 text-lg">{profile?.full_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <p className="text-gray-800">{profile?.email}</p>
          </div>
        </div>
      </div>

      {partner && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Partner Info</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <p className="text-gray-800 text-lg">{partner.full_name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <p className="text-gray-800">{partner.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
