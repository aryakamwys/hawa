import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

export default function HeatmapTips({
  apiUrl,
  token,
  pm25,
  pm10,
  airQuality,
  riskLevel,
  location,
  language = 'id',
  autoLoad = false
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef(null);

  const baseUrl = useMemo(() => apiUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', [apiUrl]);

  const fetchTips = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError('');
      setData(null);

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const params = new URLSearchParams();
      if (pm25 !== undefined) params.append('pm25', pm25);
      if (pm10 !== undefined) params.append('pm10', pm10);
      if (airQuality) params.append('air_quality', airQuality);
      if (riskLevel) params.append('risk_level', riskLevel);
      if (location) params.append('location', location);
      if (language) params.append('language', language);

      const tryGet = async () => {
        const res = await fetch(`${baseUrl}/weather/heatmap/tips?${params.toString()}`, {
          method: 'GET',
          headers,
          signal: controller.signal
        });
        if (!res.ok) {
          const err = new Error(res.status.toString());
          err.status = res.status;
          throw err;
        }
        return res.json();
      };

      const tryPost = async () => {
        const res = await fetch(`${baseUrl}/weather/heatmap/tips`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            pm25,
            pm10,
            risk_level: riskLevel,
            location
          }),
          signal: controller.signal
        });
        if (!res.ok) {
          const err = new Error(res.status.toString());
          err.status = res.status;
          throw err;
        }
        return res.json();
      };

      let json = null;
      try {
        json = await tryGet();
      } catch (err) {
        if (err.status === 404 || err.status === 405 || err.status === 500) {
          // fallback ke POST jika GET tidak tersedia
          json = await tryPost();
        } else {
          throw err;
        }
      }

      // Normalisasi payload supaya render konsisten
      const tipsArray = json?.data?.tips || json?.tips || [];
      const header = json?.data || json || {};
      const normalized = {
        tips: Array.isArray(tipsArray) ? tipsArray : [],
        title: header.title,
        explanation: header.explanation,
        healthImpact: header.health_impact || header.healthImpact,
        prevention: header.prevention,
        meta: json?.meta || header.meta || {},
        source: json?.source,
        location: header.location || location,
        riskLevel: header.risk_level || riskLevel,
        pm25: header.pm25 ?? pm25,
        pm10: header.pm10 ?? pm10
      };
      setData(normalized);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Gagal memuat tips');
    } finally {
      setLoading(false);
    }
  }, [baseUrl, token, pm25, pm10, airQuality, riskLevel, location, language]);

  useEffect(() => {
    if (autoLoad && (pm25 !== undefined || pm10 !== undefined || riskLevel)) {
      fetchTips();
    }
    // rerun when apiUrl/token/language/airQuality change to avoid stale requests
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [autoLoad, pm25, pm10, riskLevel, location, apiUrl, token, language, airQuality, fetchTips]);

  const tips = data?.tips || [];
  const meta = data?.meta || {};

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Rekomendasi</p>
          <h3 className="text-lg font-bold text-gray-900">Tips Kesehatan & Pencegahan</h3>
          <p className="text-sm text-gray-600 mt-1">
            Berdasarkan lokasi/polutan terpilih. Klik titik di peta untuk memperbarui.
          </p>
        </div>
        <button
          onClick={fetchTips}
          disabled={loading}
          className="px-3 py-2 text-sm font-semibold rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50"
        >
          {loading ? 'Memuat...' : 'Refresh'}
        </button>
      </div>

      <div className="text-sm text-gray-700 space-y-1">
        <div>
          <span className="font-semibold text-gray-900">Lokasi:</span>{' '}
          {data?.location || location || meta.location || 'Belum dipilih'}
        </div>
        <div>
          <span className="font-semibold text-gray-900">Risk Level:</span>{' '}
          {data?.riskLevel || riskLevel || meta.risk_level || '-'}
        </div>
        <div className="flex gap-3">
          <span>
            <span className="font-semibold text-gray-900">PM2.5:</span>{' '}
            {data?.pm25 ?? pm25 ?? meta.pm25 ?? '-'}
          </span>
          <span>
            <span className="font-semibold text-gray-900">PM10:</span>{' '}
            {data?.pm10 ?? pm10 ?? meta.pm10 ?? '-'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
          {error}
        </div>
      )}

      {loading && !tips?.length && (
        <div className="text-sm text-gray-600">Menyiapkan tips...</div>
      )}

      {!loading && tips && tips.length > 0 && (
        <div className="space-y-3">
          {tips.map((tip, idx) => (
            <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              {tip.title && <div className="text-sm font-semibold text-gray-900 mb-1">{tip.title}</div>}
              {tip.description && <div className="text-sm text-gray-700">{tip.description}</div>}
              {tip.items && Array.isArray(tip.items) && (
                <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
                  {tip.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !tips?.length && !error && (
        <div className="text-sm text-gray-600">Belum ada tips. Pilih titik di peta lalu refresh.</div>
      )}
    </div>
  );
}

HeatmapTips.propTypes = {
  apiUrl: PropTypes.string,
  token: PropTypes.string,
  pm25: PropTypes.number,
  pm10: PropTypes.number,
  airQuality: PropTypes.string,
  riskLevel: PropTypes.string,
  location: PropTypes.string,
  language: PropTypes.string,
  autoLoad: PropTypes.bool
};

