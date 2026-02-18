import { useState } from 'react';
import { Heart, LogIn, AlertCircle, Copy, Check } from 'lucide-react';
import { CoupleService } from '../../services/CoupleService';

interface PINLoginProps {
  onLoginSuccess: () => void;
}

export function PINLogin({ onLoginSuccess }: PINLoginProps) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { couple } = await CoupleService.acceptPairingPin(pin);
      setSuccess('Connected successfully! Redirecting...');
      setTimeout(() => {
        onLoginSuccess();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to connect with PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full mb-4 shadow-lg">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Memory Book
          </h1>
          <p className="text-gray-600">
            Welcome back! Enter your PIN to continue
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Pairing PIN
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value.slice(0, 8))}
                maxLength={8}
                placeholder="00000000"
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent font-mono text-3xl text-center tracking-widest transition-all"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                8 digits • Case sensitive
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-lg">
                <Check className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || pin.length !== 8}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-lg font-medium hover:from-rose-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">
              Don't have a PIN? Ask your partner to generate one.
            </p>
            <p className="text-xs text-gray-400 text-center">
              Your PIN is permanent and safe to save
            </p>
          </div>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          Made with love for couples everywhere
        </p>
      </div>
    </div>
  );
}
