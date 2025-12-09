import AdminLayout from '../components/AdminLayout';
import { Database } from 'lucide-react';

export default function AdminDashboard() {

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-md">
              <Database className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Dashboard untuk analytical dan monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Analytical Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Card 1 - Kosongan untuk Analytical */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
            <div className="h-64"></div>
          </div>

          {/* Card 2 - Kosongan untuk Analytical */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
            <div className="h-64"></div>
          </div>

          {/* Card 3 - Kosongan untuk Analytical */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
            <div className="h-64"></div>
          </div>
        </div>

        {/* Large Analytical Card - Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Large Card 1 */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
            <div className="h-80"></div>
          </div>

          {/* Large Card 2 */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
            <div className="h-80"></div>
          </div>
        </div>

        {/* Extra Wide Analytical Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
          <div className="h-96"></div>
        </div>
      </div>
    </AdminLayout>
  );
}
