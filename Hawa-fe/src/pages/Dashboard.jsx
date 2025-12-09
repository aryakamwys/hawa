/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Wind, Thermometer, Droplets, Gauge, MapPin, Activity, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Info, Brain, Bell, Menu, LayoutDashboard, Map, BarChart3, Settings, Cloud, Shield, Zap, Eye, Clock, RefreshCw, Sparkles, Leaf, Sun, Moon, Star, Heart, Target, Award, TrendingDown as TrendDown, BarChart, PieChart, LineChart, Globe } from 'lucide-react';
import UserSidebar from '../components/UserSidebar';

export default function Dashboard() {
  const containerRef = useRef(null);
  const [language, setLanguage] = useState('id');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [selectedDevice, setSelectedDevice] = useState('device-001');

  // Mock data - nanti bisa diganti dengan API call
  const [sensorData, setSensorData] = useState({
    timestamp: new Date().toLocaleString('id-ID'),
    pm1_0_raw: 45,
    pm2_5_raw: 78,
    pm10_raw: 120,
    pm2_5_density: 65,
    pm10_density: 95,
    airQualityLevel: 'Moderate',
    temperature: 28.5,
    humidity: 72,
    pressure: 1013.25,
    altitude: 750,
    deviceId: 'device-001'
  });


  const translations = {
    id: {
      back: 'Kembali',
      title: 'Dashboard',
      subtitle: 'Monitor kualitas udara real-time',
      airQuality: 'Kualitas Udara',
      currentStatus: 'Status Saat Ini',
      sensorData: 'Data Sensor',
      aiRecommendation: 'Rekomendasi AI',
      recommendations: 'Rekomendasi',
      device: 'Perangkat',
      lastUpdate: 'Update Terakhir',
      pm1_0: 'PM1.0',
      pm2_5: 'PM2.5',
      pm10: 'PM10',
      temperature: 'Suhu',
      humidity: 'Kelembaban',
      pressure: 'Tekanan',
      altitude: 'Ketinggian',
      celsius: '°C',
      percent: '%',
      hpa: 'hPa',
      meter: 'm',
      raw: 'Raw',
      density: 'Density',
      levels: {
        good: 'Baik',
        moderate: 'Sedang',
        unhealthy: 'Tidak Sehat',
        veryUnhealthy: 'Sangat Tidak Sehat',
        hazardous: 'Berbahaya'
      },
      aiTitle: 'Rekomendasi AI untuk Anda',
      aiSubtitle: 'Berdasarkan kondisi udara saat ini',
      viewDetails: 'Lihat Detail',
      refresh: 'Refresh Data',
      welcome: 'Selamat Datang',
      logout: 'Keluar',
      menu: {
        dashboard: 'Dashboard',
        map: 'Peta Real-time',
        analytics: 'Analisis',
        devices: 'Perangkat',
        settings: 'Pengaturan'
      }
    },
    en: {
      back: 'Back',
      title: 'Dashboard',
      subtitle: 'Real-time air quality monitoring',
      airQuality: 'Air Quality',
      currentStatus: 'Current Status',
      sensorData: 'Sensor Data',
      aiRecommendation: 'AI Recommendation',
      recommendations: 'Recommendations',
      device: 'Device',
      lastUpdate: 'Last Update',
      pm1_0: 'PM1.0',
      pm2_5: 'PM2.5',
      pm10: 'PM10',
      temperature: 'Temperature',
      humidity: 'Humidity',
      pressure: 'Pressure',
      altitude: 'Altitude',
      celsius: '°C',
      percent: '%',
      hpa: 'hPa',
      meter: 'm',
      raw: 'Raw',
      density: 'Density',
      levels: {
        good: 'Good',
        moderate: 'Moderate',
        unhealthy: 'Unhealthy',
        veryUnhealthy: 'Very Unhealthy',
        hazardous: 'Hazardous'
      },
      aiTitle: 'AI Recommendations for You',
      aiSubtitle: 'Based on current air conditions',
      viewDetails: 'View Details',
      refresh: 'Refresh Data',
      welcome: 'Welcome',
      logout: 'Logout',
      menu: {
        dashboard: 'Dashboard',
        map: 'Real-time Map',
        analytics: 'Analytics',
        devices: 'Devices',
        settings: 'Settings'
      }
    },
    su: {
      back: 'Balik',
      title: 'Dashboard',
      subtitle: 'Monitor kualitas hawa real-time',
      airQuality: 'Kualitas Hawa',
      currentStatus: 'Status Ayeuna',
      sensorData: 'Data Sensor',
      aiRecommendation: 'Rekomendasi AI',
      recommendations: 'Rekomendasi',
      device: 'Parabot',
      lastUpdate: 'Update Terakhir',
      pm1_0: 'PM1.0',
      pm2_5: 'PM2.5',
      pm10: 'PM10',
      temperature: 'Suhu',
      humidity: 'Kalembaban',
      pressure: 'Tekanan',
      altitude: 'Jangkungna',
      celsius: '°C',
      percent: '%',
      hpa: 'hPa',
      meter: 'm',
      raw: 'Raw',
      density: 'Density',
      levels: {
        good: 'Alus',
        moderate: 'Sedeng',
        unhealthy: 'Teu Sehat',
        veryUnhealthy: 'Pisan Teu Sehat',
        hazardous: 'Bahaya'
      },
      aiTitle: 'Rekomendasi AI pikeun Anjeun',
      aiSubtitle: 'Dumasar kana kaayaan hawa ayeuna',
      viewDetails: 'Tingali Detail',
      refresh: 'Refresh Data',
      welcome: 'Wilujeng Sumping',
      logout: 'Kaluar',
      menu: {
        dashboard: 'Dashboard',
        map: 'Peta Real-time',
        analytics: 'Analisis',
        devices: 'Parabot',
        settings: 'Setelan'
      }
    }
  };

  const t = translations[language];

  // Get air quality level translation
  const getAirQualityLevel = (level) => {
    const levelMap = {
      'Good': t.levels.good,
      'Moderate': t.levels.moderate,
      'Unhealthy': t.levels.unhealthy,
      'Very Unhealthy': t.levels.veryUnhealthy,
      'Hazardous': t.levels.hazardous
    };
    return levelMap[level] || level;
  };

  // Get air quality color
  const getAirQualityColor = (level) => {
    const colorMap = {
      'Good': 'bg-green-500',
      'Moderate': 'bg-yellow-500',
      'Unhealthy': 'bg-orange-500',
      'Very Unhealthy': 'bg-red-500',
      'Hazardous': 'bg-purple-500'
    };
    return colorMap[level] || 'bg-gray-500';
  };

  // Mock AI recommendations
  const getAIRecommendations = () => {
    const level = sensorData.airQualityLevel;
    if (level === 'Good') {
      return [
        { icon: CheckCircle, text: language === 'id' ? 'Udara saat ini aman untuk aktivitas luar ruangan' : language === 'en' ? 'Air is currently safe for outdoor activities' : 'Hawa ayeuna aman pikeun kagiatan luar rohangan', color: 'text-green-600' },
        { icon: Wind, text: language === 'id' ? 'Buka jendela untuk sirkulasi udara yang lebih baik' : language === 'en' ? 'Open windows for better air circulation' : 'Buka jandela pikeun sirkulasi hawa nu leuwih alus', color: 'text-blue-600' }
      ];
    } else if (level === 'Moderate') {
      return [
        { icon: AlertCircle, text: language === 'id' ? 'Batasi aktivitas luar ruangan, terutama untuk kelompok sensitif' : language === 'en' ? 'Limit outdoor activities, especially for sensitive groups' : 'Watesan kagiatan luar rohangan, utamana pikeun kelompok sensitif', color: 'text-yellow-600' },
        { icon: Droplets, text: language === 'id' ? 'Gunakan air purifier di dalam ruangan' : language === 'en' ? 'Use air purifier indoors' : 'Anggo air purifier di jero rohangan', color: 'text-blue-600' },
        { icon: Activity, text: language === 'id' ? 'Monitor kondisi udara secara berkala' : language === 'en' ? 'Monitor air conditions regularly' : 'Monitor kaayaan hawa sacara rutin', color: 'text-purple-600' }
      ];
    } else {
      return [
        { icon: AlertCircle, text: language === 'id' ? 'Hindari aktivitas luar ruangan jika memungkinkan' : language === 'en' ? 'Avoid outdoor activities if possible' : 'Hindari kagiatan luar rohangan upami mungkin', color: 'text-red-600' },
        { icon: Wind, text: language === 'id' ? 'Tutup jendela dan gunakan AC dengan filter' : language === 'en' ? 'Close windows and use AC with filter' : 'Tutup jandela sareng anggo AC kalawan filter', color: 'text-blue-600' },
        { icon: Droplets, text: language === 'id' ? 'Gunakan masker N95 saat keluar rumah' : language === 'en' ? 'Use N95 mask when going outside' : 'Anggo masker N95 nalika kaluar imah', color: 'text-orange-600' },
        { icon: Bell, text: language === 'id' ? 'Aktifkan notifikasi untuk update real-time' : language === 'en' ? 'Enable notifications for real-time updates' : 'Aktipkeun notifikasi pikeun update real-time', color: 'text-purple-600' }
      ];
    }
  };

  // Reset animasi saat komponen mount
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const animatedElements = container.querySelectorAll('[class*="animate-"]');
      animatedElements.forEach((el) => {
        const element = el;
        element.style.animation = 'none';
        void element.offsetHeight;
        element.style.animation = '';
      });
    }
  }, []);

  // Simulate data update
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => ({
        ...prev,
        timestamp: new Date().toLocaleString('id-ID'),
        pm2_5_density: prev.pm2_5_density + (Math.random() * 2 - 1),
        pm10_density: prev.pm10_density + (Math.random() * 2 - 1),
        temperature: prev.temperature + (Math.random() * 0.5 - 0.25)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const recommendations = getAIRecommendations();

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 flex">
      {/* User Sidebar */}
      <UserSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar - Sticky */}
        <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden text-gray-700 hover:text-blue-600 transition-colors duration-300 p-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu size={24} />
                </button>
                <div className="flex items-center space-x-2">
                  <LayoutDashboard className="text-blue-600 hidden sm:block" size={20} />
                  <h1 className="text-xl font-black text-gray-900 hidden sm:block">{t.title}</h1>
                </div>
              </div>

              {/* Language Dropdown */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => (window.location.hash = '#profile')}
                  className="hidden sm:inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all shadow-sm"
                >
                  <span>Profile</span>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                    className="px-4 py-1.5 pr-8 rounded-full bg-gray-50 text-sm text-gray-700 border border-gray-200 font-medium hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 cursor-pointer shadow-sm flex items-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    <span>{language.toUpperCase()}</span>
                    <svg 
                      className={`w-4 h-4 text-gray-600 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isLangDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsLangDropdownOpen(false)}
                      ></div>
                      <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
                        <button
                          onClick={() => { setLanguage('id'); setIsLangDropdownOpen(false); }}
                          className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-all ${
                            language === 'id' 
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          ID
                        </button>
                        <button
                          onClick={() => { setLanguage('en'); setIsLangDropdownOpen(false); }}
                          className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-all ${
                            language === 'en' 
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          EN
                        </button>
                        <button
                          onClick={() => { setLanguage('su'); setIsLangDropdownOpen(false); }}
                          className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-all ${
                            language === 'su' 
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          SU
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-md">
                  <Activity className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900">
                    {t.title}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    {t.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Air Quality Status Card */}
            <div className="mb-6 sm:mb-8">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                      <Wind className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{t.airQuality}</h2>
                      <p className="text-sm text-gray-600 flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{t.currentStatus}</span>
                      </p>
                    </div>
                  </div>
                  <div className={`mt-4 sm:mt-0 px-6 py-3 rounded-xl ${getAirQualityColor(sensorData.airQualityLevel)} text-white font-bold text-lg sm:text-xl shadow-lg flex items-center space-x-2`}>
                    <Shield size={20} />
                    <span>{getAirQualityLevel(sensorData.airQualityLevel)}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs sm:text-sm text-gray-600 font-medium">{t.pm2_5}</div>
                      <Cloud className="text-blue-600" size={16} />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-blue-600">{Math.round(sensorData.pm2_5_density)}</div>
                    <div className="text-xs text-gray-500 mt-1">μg/m³</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs sm:text-sm text-gray-600 font-medium">{t.pm10}</div>
                      <Cloud className="text-orange-600" size={16} />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-orange-600">{Math.round(sensorData.pm10_density)}</div>
                    <div className="text-xs text-gray-500 mt-1">μg/m³</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs sm:text-sm text-gray-600 font-medium">{t.temperature}</div>
                      <Thermometer className="text-red-600" size={16} />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-red-600">{sensorData.temperature.toFixed(1)}</div>
                    <div className="text-xs text-gray-500 mt-1">{t.celsius}</div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-4 border border-cyan-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs sm:text-sm text-gray-600 font-medium">{t.humidity}</div>
                      <Droplets className="text-cyan-600" size={16} />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-cyan-600">{sensorData.humidity}</div>
                    <div className="text-xs text-gray-500 mt-1">{t.percent}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Sensor Data Cards */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">{t.sensorData}</h2>
            </div>
            
            {/* Device Info */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                    <MapPin className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block">{t.device}</span>
                    <span className="text-xs text-gray-500 flex items-center space-x-1 mt-1">
                      <Zap className="text-yellow-500" size={12} />
                      <span>Online</span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">{sensorData.deviceId}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 pt-3 border-t border-gray-200">
                <Clock size={14} />
                <span>{t.lastUpdate}: {sensorData.timestamp}</span>
              </div>
            </div>

            {/* PM Data */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Cloud className="text-gray-700" size={20} />
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Particulate Matter</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-600 font-medium">{t.pm1_0} {t.raw}</div>
                    <Activity className="text-gray-600" size={16} />
                  </div>
                  <div className="text-xl font-black text-gray-900">{sensorData.pm1_0_raw}</div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-600 font-medium">{t.pm2_5} {t.raw}</div>
                    <Activity className="text-gray-600" size={16} />
                  </div>
                  <div className="text-xl font-black text-gray-900">{sensorData.pm2_5_raw}</div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-600 font-medium">{t.pm10} {t.raw}</div>
                    <Activity className="text-gray-600" size={16} />
                  </div>
                  <div className="text-xl font-black text-gray-900">{sensorData.pm10_raw}</div>
                </div>
              </div>
            </div>

            {/* Environmental Data */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="text-blue-600" size={20} />
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Environmental Data</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200 hover:shadow-md transition-shadow">
                  <div className="p-2 bg-indigo-200 rounded-lg">
                    <Gauge className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">{t.pressure}</div>
                    <div className="text-lg font-bold text-gray-900">{sensorData.pressure} <span className="text-sm text-gray-500">{t.hpa}</span></div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-4 border border-violet-200 hover:shadow-md transition-shadow">
                  <div className="p-2 bg-violet-200 rounded-lg">
                    <MapPin className="text-violet-600" size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">{t.altitude}</div>
                    <div className="text-lg font-bold text-gray-900">{sensorData.altitude} <span className="text-sm text-gray-500">{t.meter}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-2xl shadow-xl p-6 sm:p-8 text-white sticky top-24 border border-blue-400">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Brain className="text-white" size={24} />
                </div>
                <h2 className="text-xl font-bold">{t.aiRecommendation}</h2>
              </div>
              <p className="text-sm text-white/90 mb-6 flex items-center space-x-2">
                <Sparkles size={14} />
                <span>{t.aiSubtitle}</span>
              </p>
              
              <div className="space-y-4">
                {recommendations.map((rec, idx) => {
                  const Icon = rec.icon;
                  return (
                    <div key={idx} className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 hover:bg-white/30 transition-all shadow-lg">
                      <div className="flex items-start space-x-3">
                        <div className="p-1.5 bg-white/30 rounded-lg flex-shrink-0">
                          <Icon className="text-white" size={18} />
                        </div>
                        <p className="text-sm text-white/95 leading-relaxed">{rec.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


