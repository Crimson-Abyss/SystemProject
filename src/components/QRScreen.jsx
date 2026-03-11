import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from 'react-router-dom';
import { FiCamera, FiZap, FiCopy, FiExternalLink, FiX } from 'react-icons/fi';

const QRScreen = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState('prompt');
  const [facingMode, setFacingMode] = useState('environment');
  const [torch, setTorch] = useState(false);

  const onScan = useCallback((results) => {
    if (!results || results.length === 0) return;
    
    const text = results[0].rawValue;
    setResult(text);
    
    if (text && text.includes('/app/claim/')) {
      const parts = text.split('/app/claim/');
      if (parts.length > 1) {
        const path = parts[1];
        navigate(`/app/claim/${path}`);
      }
    }
  }, [navigate]);

  const onError = useCallback((err) => {
    if (err?.name === 'NotFoundException') return;
    setError(err?.message || String(err));
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (navigator?.permissions?.query) {
      navigator.permissions.query({ name: 'camera' }).then((status) => {
        if (!cancelled) setPermission(status.state);
      }).catch(() => {});
    }
    return () => { cancelled = true; };
  }, []);

  const constraints = useMemo(() => ({
    facingMode,
    ...(torch ? { advanced: [{ torch: true }] } : {}),
  }), [facingMode, torch]);

  return (
    <main className="flex-1 flex flex-col items-center text-center p-6 gap-5 bg-gray-50 dark:bg-[#0a0e18]">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-[Outfit]">Scan to Earn</h1>
        <p className="max-w-md text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
          Use your device camera to scan the QR code on your receipt.
        </p>
      </div>

      <div className="w-full max-w-sm animate-fade-in-up delay-200">
        <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/10">
          <Scanner
            constraints={constraints}
            onScan={onScan}
            onError={onError}
            containerStyle={{ width: '100%', height: '100%' }}
            videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Corner overlay with animated scan line */}
          <div className="pointer-events-none absolute inset-0">
            {/* Scan line animation */}
            <div className="absolute left-[15%] right-[15%] h-0.5 bg-linear-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400/50" style={{ animation: 'scan-line 3s ease-in-out infinite' }} />
            
            {/* Corners */}
            <div className="absolute top-3 left-3 w-12 h-12 border-t-3 border-l-3 border-emerald-400 rounded-tl-xl" />
            <div className="absolute top-3 right-3 w-12 h-12 border-t-3 border-r-3 border-emerald-400 rounded-tr-xl" />
            <div className="absolute bottom-3 left-3 w-12 h-12 border-b-3 border-l-3 border-emerald-400 rounded-bl-xl" />
            <div className="absolute bottom-3 right-3 w-12 h-12 border-b-3 border-r-3 border-emerald-400 rounded-br-xl" />
            
            {/* Dark overlay outside scan area */}
            <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/30" />
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))}
              className="btn-ghost text-sm flex items-center gap-1.5 px-3 py-2 rounded-xl dark:border-white/10 dark:text-gray-300"
            >
              <FiCamera className="w-4 h-4" /> Flip
            </button>
            <button
              type="button"
              onClick={() => setTorch((currentTorchStatus) => !currentTorchStatus)}
              className={`text-sm flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium transition-all ${torch ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' : 'btn-ghost dark:border-white/10 dark:text-gray-300'}`}
            >
              <FiZap className="w-4 h-4" /> {torch ? 'ON' : 'OFF'}
            </button>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-full">{permission}</span>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="w-full max-w-sm glass dark:glass bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-xl p-4 break-all animate-scale-in">
          <div className="font-semibold flex items-center gap-2">✅ Scanned:</div>
          <div className="text-sm mt-1.5 bg-white/50 dark:bg-black/20 rounded-lg p-2 font-mono">{result}</div>
          <div className="mt-3 flex gap-3">
            <a href={result} target="_blank" rel="noreferrer" className="text-emerald-600 dark:text-emerald-400 font-medium text-sm flex items-center gap-1 hover:underline">
              <FiExternalLink className="w-3.5 h-3.5" /> Open
            </a>
            <button
              type="button"
              className="text-emerald-600 dark:text-emerald-400 font-medium text-sm flex items-center gap-1 hover:underline"
              onClick={() => navigator.clipboard?.writeText(result)}
            >
              <FiCopy className="w-3.5 h-3.5" /> Copy
            </button>
            <button
              type="button"
              className="text-emerald-600 dark:text-emerald-400 font-medium text-sm flex items-center gap-1 hover:underline"
              onClick={() => setResult(null)}
            >
              <FiX className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="w-full max-w-sm glass dark:glass bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300 rounded-xl p-4 animate-scale-in">
          <div className="font-semibold">⚠️ Camera error</div>
          <div className="text-sm mt-1">{error}</div>
        </div>
      )}

      <p className="text-sm text-gray-400 dark:text-gray-500 max-w-md">
        Earn points by scanning the QR Code on your receipt if you ordered in the store.
      </p>
    </main>
  );
};

export default QRScreen;