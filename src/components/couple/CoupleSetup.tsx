import { useState, useEffect } from 'react';
import { Heart, Mail, Send, UserPlus, Check, Clock } from 'lucide-react';
import { CoupleService } from '../../services/CoupleService';
import { useAuth } from '../../contexts/AuthContext';

interface Invitation {
  id: string;
  sender_id: string;
  recipient_email: string;
  status: string;
  invitation_code: string;
  created_at: string;
}

export function CoupleSetup({ onCoupleCreated }: { onCoupleCreated: () => void }) {
  const [step, setStep] = useState<'choice' | 'send' | 'accept' | 'pending'>('choice');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const { profile } = useAuth();

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const data = await CoupleService.getMyInvitations();
      setInvitations(data);
      if (data.length > 0 && data.some(inv => inv.recipient_email === profile?.email)) {
        setStep('pending');
      }
    } catch (err) {
      console.error('Error loading invitations:', err);
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const invitation = await CoupleService.createInvitation(email);
      setSuccess(`Invitation sent! Share this code: ${invitation.invitation_code}`);
      setEmail('');
      loadInvitations();
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await CoupleService.acceptInvitation(code);
      onCoupleCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };

  const receivedInvitations = invitations.filter(inv => inv.recipient_email === profile?.email);
  const sentInvitations = invitations.filter(inv => inv.sender_id === profile?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full mb-4 shadow-lg">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Connect with Your Partner
          </h1>
          <p className="text-gray-600">
            Start building your memory book together
          </p>
        </div>

        {step === 'choice' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              How would you like to connect?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => setStep('send')}
                className="group p-8 border-2 border-gray-200 rounded-xl hover:border-rose-500 hover:bg-rose-50 transition-all"
              >
                <Send className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Invite Partner
                </h3>
                <p className="text-gray-600 text-sm">
                  Send an invitation to your partner's email
                </p>
              </button>

              <button
                onClick={() => setStep('accept')}
                className="group p-8 border-2 border-gray-200 rounded-xl hover:border-rose-500 hover:bg-rose-50 transition-all"
              >
                <UserPlus className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Accept Invitation
                </h3>
                <p className="text-gray-600 text-sm">
                  Enter the code your partner shared with you
                </p>
              </button>
            </div>
          </div>
        )}

        {step === 'send' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <button
              onClick={() => setStep('choice')}
              className="text-gray-600 hover:text-gray-800 mb-4"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Invite Your Partner
            </h2>
            <form onSubmit={handleSendInvitation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Partner's Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="partner@email.com"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5" />
                    <span className="font-semibold">Invitation Sent!</span>
                  </div>
                  <p className="text-sm">{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-rose-600 hover:to-pink-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </button>
            </form>

            {sentInvitations.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Pending Invitations</h3>
                {sentInvitations.map(inv => (
                  <div key={inv.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{inv.recipient_email}</p>
                      <p className="text-xs text-gray-500">Code: {inv.invitation_code}</p>
                    </div>
                  </div>
                ))}
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
              Accept Invitation
            </h2>
            <form onSubmit={handleAcceptInvitation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invitation Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent font-mono"
                  placeholder="Enter invitation code"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-rose-600 hover:to-pink-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Accepting...' : 'Accept & Connect'}
              </button>
            </form>
          </div>
        )}

        {step === 'pending' && receivedInvitations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Pending Invitations
            </h2>
            <div className="space-y-4">
              {receivedInvitations.map(inv => (
                <div key={inv.id} className="p-4 border-2 border-rose-200 rounded-lg">
                  <p className="text-gray-600 mb-4">
                    You have an invitation! Use this code to connect:
                  </p>
                  <p className="text-2xl font-mono font-bold text-rose-600 mb-4 text-center">
                    {inv.invitation_code}
                  </p>
                  <button
                    onClick={() => {
                      setCode(inv.invitation_code);
                      setStep('accept');
                    }}
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-rose-600 hover:to-pink-700 transition-all"
                  >
                    Accept Invitation
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
