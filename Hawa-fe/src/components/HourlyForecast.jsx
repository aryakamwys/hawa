import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

export default function HourlyForecast({ apiUrl, token, city = 'Bandung', language = 'id' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const baseUrl = useMemo(() => apiUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', [apiUrl]);

  const uiText = {
    id: {
      loading: 'Memuat data...',
      error: 'Gagal memuat data',
      title: 'Prakiraan Per Jam',
      precipitation: 'Curah Hujan',
      clouds: 'Awan',
      wind: 'Angin',
      percent: '%',
      ms: 'm/s',
      mm: 'mm'
    },
    en: {
      loading: 'Loading...',
      error: 'Failed to load data',
      title: 'Hourly Forecast',
      precipitation: 'Precipitation',
      clouds: 'Clouds',
      wind: 'Wind',
      percent: '%',
      ms: 'm/s',
      mm: 'mm'
    },
    su: {
      loading: 'Ngamuat data...',
      error: 'Gagal ngamuat data',
      title: 'Prakiraan Per Jam',
      precipitation: 'Curah Hujan',
      clouds: 'Awan',
      wind: 'Angin',
      percent: '%',
      ms: 'm/s',
      mm: 'mm'
    }
  };

  const t = uiText[language] || uiText.id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${baseUrl}/weather/analytics/hourly?city=${city}&hours=24`, { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        setData(json.data);
      } catch (err) {
        setError(err.message || t.error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseUrl, token, city, t.error]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
        <div className="p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h3 className="text-sm font-bold text-gray-900">{t.title}</h3>
        </div>
        <div className="p-4 text-center text-xs text-gray-600 flex-1">{t.loading}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
        <div className="p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h3 className="text-sm font-bold text-gray-900">{t.title}</h3>
        </div>
        <div className="bg-red-50 border-t border-red-200 p-4 text-red-700 text-xs flex-1">{error}</div>
      </div>
    );
  }

  if (!data || !data.hourly) return null;

  const hourlyData = data.hourly.slice(0, 8);
  const temps = hourlyData.map(h => h.temperature || 0);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = maxTemp - minTemp || 1;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <h3 className="text-sm font-bold text-gray-900">{t.title}</h3>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden p-3">
        <div className="mb-3 flex-shrink-0" style={{ height: '80px', position: 'relative' }}>
          <svg width="100%" height="100%" className="overflow-visible">
            <polyline
              points={hourlyData.map((h, idx) => {
                const x = (idx / (hourlyData.length - 1)) * 100;
                const y = 100 - (((h.temperature || minTemp) - minTemp) / tempRange) * 80;
                return `${x}%,${y}%`;
              }).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {hourlyData.map((h, idx) => {
              const x = (idx / (hourlyData.length - 1)) * 100;
              const y = 100 - (((h.temperature || minTemp) - minTemp) / tempRange) * 80;
              return (
                <circle
                  key={idx}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="3"
                  fill="#3b82f6"
                />
              );
            })}
          </svg>
          <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
            <span>{minTemp.toFixed(0)}°</span>
            <span>{maxTemp.toFixed(0)}°</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {hourlyData.map((hour, idx) => {
            let date;
            if (typeof hour.datetime === 'string') {
              date = new Date(hour.datetime);
            } else {
              date = new Date();
            }
            
            const timeStr = date.toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
            
            const nowLabel = language === 'id' ? 'Sekarang' : language === 'en' ? 'Now' : 'Ayeuna';

            return (
              <div key={idx} className="flex items-center justify-between py-2 px-2 rounded hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-900">
                    {idx === 0 ? nowLabel : timeStr}
                  </div>
                  <div className="text-[10px] text-gray-600 mt-0.5 truncate">
                    {hour.weather?.description || hour.weather?.main || 'N/A'}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] ml-2">
                  <div className="bg-blue-50 px-1.5 py-0.5 rounded">
                    <span className="text-gray-600">{t.precipitation}: </span>
                    <span className="font-semibold text-blue-700">{hour.precipitation_probability || 0}{t.percent}</span>
                  </div>
                  <div className="bg-green-50 px-1.5 py-0.5 rounded">
                    <span className="text-gray-600">{t.wind}: </span>
                    <span className="font-semibold text-green-700">{(hour.wind_speed || 0).toFixed(1)}{t.ms}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

HourlyForecast.propTypes = {
  apiUrl: PropTypes.string,
  token: PropTypes.string,
  city: PropTypes.string,
  language: PropTypes.string
};
