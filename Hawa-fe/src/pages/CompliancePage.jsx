import { useState, useMemo, useEffect } from 'react';
import UserSidebar from '../components/UserSidebar';
import ComplianceTracker from '../components/ComplianceTracker';
import { authService } from '../services/auth';
import { Menu } from 'lucide-react';

export default function CompliancePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = authService.getToken();
  const apiUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', []);
  const user = useMemo(() => authService.getCurrentUser(), []);
  const userLanguage = user?.language || 'id';

  useEffect(() => {
    // Redirect if not industry user
    if (user && user.role !== 'industry') {
      window.location.hash = '#dashboard';
    }
  }, [user]);

  if (!user || user.role !== 'industry') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 flex overflow-hidden">
      <UserSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <nav className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm h-14">
          <div className="px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden text-gray-700 hover:text-blue-600 transition-colors duration-300 p-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu size={20} />
                </button>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-black text-gray-900">Compliance Analytics</h1>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-black text-gray-900 mb-2">
                Compliance Analytics
              </h1>
              <p className="text-gray-600">
                Analisis kepatuhan emisi dari data heatmap real-time. Generate compliance records otomatis dari sensor IoT dan bandingkan dengan batas regulasi.
              </p>
            </div>

            {/* Compliance Tracker Component */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 min-h-[600px]">
              <ComplianceTracker
                apiUrl={apiUrl}
                token={token}
                language={userLanguage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
