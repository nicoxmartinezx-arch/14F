import { useEffect, useState } from 'react';
import { CoupleSetup } from './components/couple/CoupleSetup';
import { Dashboard } from './components/dashboard/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CoupleService } from './services/CoupleService';
import { Heart } from 'lucide-react';

function AppContent() {
  const { coupleId, loading, setCoupleId } = useAuth();
  const [hasCouple, setHasCouple] = useState<boolean | null>(null);

  useEffect(() => {
    checkCouple();
  }, []);

  const checkCouple = async () => {
    try {
      const couple = await CoupleService.getMyCouple();
      if (couple) {
        setCoupleId(couple.id);
        setHasCouple(true);
      } else {
        setHasCouple(false);
      }
    } catch (error) {
      console.error('Error checking couple:', error);
      setHasCouple(false);
    }
  };

  if (loading || hasCouple === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-rose-500 animate-pulse mx-auto mb-4 fill-rose-500" />
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasCouple || !coupleId) {
    return <CoupleSetup onCoupleCreated={() => checkCouple()} />;
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
