import { useState, useEffect } from 'react';
import { Heart, Send, UserPlus, Check, Clock, Copy, Zap } from 'lucide-react';
import { CoupleService } from '../../services/CoupleService';

export function CoupleSetup({ onCoupleCreated }: { onCoupleCreated: () => void }) {
  const [step, setStep] = useState<'choice' | 'generate' | 'accept'>('choice');
  const [pin, setPin] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!pin || !timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev > 1) {
          return prev - 1;
        } else {
          setPin('');
          return null;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pin, timeLeft]);

  const handleGeneratePin = async () => {
    setError('');
    setLoading(true);

    try {
      const { pin: newPin, expiresAt } = await CoupleService.generatePairingPin();
      setPin(newPin);
      const expiresTime = new Date(expiresAt).getTime();
      setTimeLeft(Math.ceil((expiresTime - Date.now()) / 1000));
      setSuccess('PIN generated! Share this with your partner');
    } catch (err: any) {
      setError(err.message || 'Failed to generate PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await CoupleService.acceptPairingPin(inputPin);
      onCoupleCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to accept PIN');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full mb-4 shadow-lg">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Memory Book
          </h1>
          <p className="text-gray-600">
            Connect with your partner to start saving memories
          </p>
        </div>

        {step === 'choice' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              How would you like to connect?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => setStep('generate')}
                className="group p-8 border-2 border-gray-200 rounded-xl hover:border-rose-500 hover:bg-rose-50 transition-all"
              >
                <Zap className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Generate PIN
                </h3>
                <p className="text-gray-600 text-sm">
                  Create a unique 8-digit PIN to share with your partner
                </p>
              </button>

              <button
                onClick={() => setStep('accept')}
                className="group p-8 border-2 border-gray-200 rounded-xl hover:border-rose-500 hover:bg-rose-50 transition-all"
              >
                <UserPlus className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Enter PIN
                </h3>
                <p className="text-gray-600 text-sm">
                  Enter the PIN your partner shared with you
                </p>
              </button>
            </div>
          </div>
        )}

        {step === 'generate' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <button
              onClick={() => setStep('choice')}
              className="text-gray-600 hover:text-gray-800 mb-4"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Generate Pairing PIN
            </h2>

            {!pin ? (
              <button
                onClick={handleGeneratePin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-lg font-medium hover:from-rose-600 hover:to-pink-700 transition-all disabled:opacity-50 text-lg"
              >
                {loading ? 'Generating...' : 'Generate PIN'}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border-2 border-rose-200">
                  <p className="text-sm text-gray-600 text-center mb-3">
                    Share this PIN with your partner
                  </p>
                  <p className="text-5xl font-mono font-bold text-rose-600 text-center mb-4 tracking-widest">
                    {pin}
                  </p>
                  <p className="text-xs text-gray-500 text-center mb-4">
                    Expires in {timeLeft || 0} seconds
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-rose-500 h-2 rounded-full transition-all"
                      style={{
                        width: timeLeft ? `${(timeLeft / 300) * 100}%` : '0%'
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition-all"
                >
                  <Copy className="w-5 h-5" />
                  {copied ? 'Copied!' : 'Copy PIN'}
                </button>

                {timeLeft && timeLeft < 60 && (
                  <button
                    onClick={handleGeneratePin}
                    disabled={loading}
                    className="w-full text-rose-600 hover:text-rose-700 py-2 font-medium transition-all"
                  >
                    Generate New PIN
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </div>
            )}
          </div>
        )}

        {step === 'accept' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <button
              onClick={() => setStep('choice')}
              className="text-gray-600 hover:text-gray-800 mb-4"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Enter Partner's PIN
            </h2>
            <form onSubmit={handleAcceptPin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  8-Digit PIN
                </label>
                <input
                  type="text"
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value.slice(0, 8))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent font-mono text-2xl text-center tracking-widest"
                  placeholder="00000000"
                  maxLength={8}
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                  <span className="font-medium">Error:</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || inputPin.length !== 8}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-rose-600 hover:to-pink-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
