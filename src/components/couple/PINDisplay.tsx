import { useState, useEffect } from 'react';
import { Heart, Copy, Check, AlertCircle } from 'lucide-react';

interface PINDisplayProps {
  pin: string;
  expiresAt: string;
  onContinue: () => void;
}

export function PINDisplay({ pin, expiresAt, onContinue }: PINDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const expiresTime = new Date(expiresAt).getTime();
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.ceil((expiresTime - now) / 1000);
      setTimeLeft(Math.max(0, remaining));
      setShowWarning(remaining < 60);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full mb-4 shadow-lg">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Your Pairing PIN
          </h1>
          <p className="text-gray-600">
            Share this PIN with your partner to connect
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">Your unique code:</p>
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-8 border-3 border-rose-200">
              <p className="text-7xl font-mono font-bold text-rose-600 tracking-widest mb-4">
                {pin}
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-700 font-medium">
                  Expires in {formatTime(timeLeft)}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      showWarning
                        ? 'bg-orange-500'
                        : 'bg-gradient-to-r from-rose-500 to-pink-600'
                    }`}
                    style={{
                      width: `${(timeLeft / 300) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {showWarning && (
            <div className="flex items-center gap-3 p-4 bg-orange-50 text-orange-700 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">PIN expires soon! Have your partner enter it quickly.</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 rounded-lg font-medium transition-all text-lg"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied to clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy PIN to Clipboard
                </>
              )}
            </button>

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">IMPORTANT - Save Your PIN</p>
              <p className="text-sm text-blue-700 mb-3">
                Write down this PIN in a safe place. You can use it to reconnect anytime, even after clearing your browser history.
              </p>
              <p className="text-xs text-blue-600">
                Example: Write it in a note, text it to yourself, or save it in your phone notes.
              </p>
            </div>
          </div>

          <button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-lg font-medium hover:from-rose-600 hover:to-pink-700 transition-all text-lg"
          >
            I've Saved My PIN - Continue
          </button>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          Made with love for couples everywhere
        </p>
      </div>
    </div>
  );
}
