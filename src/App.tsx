import { useEffect, useState } from 'react';
import { AuthForm } from './components/auth/AuthForm';
import { CoupleSetup } from './components/couple/CoupleSetup';
import { Dashboard } from './components/dashboard/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CoupleService } from './services/CoupleService';
import { Heart } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [hasCouple, setHasCouple] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      checkCouple();
    }
  }, [user]);

  const checkCouple = async () => {
    try {
      const couple = await CoupleService.getMyCouple();
      setHasCouple(couple !== null);
    } catch (error) {
      console.error('Error checking couple:', error);
      setHasCouple(false);
    }
  };

  if (loading || (user && hasCouple === null)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-rose-500 animate-pulse mx-auto mb-4 fill-rose-500" />
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (!hasCouple) {
    return <CoupleSetup onCoupleCreated={() => setHasCouple(true)} />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
