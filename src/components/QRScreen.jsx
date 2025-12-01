import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from 'react-router-dom';

const QRScreen = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState('prompt'); // 'granted' | 'denied' | 'prompt'
  const [facingMode, setFacingMode] = useState('environment'); // 'user' | 'environment'
  const [torch, setTorch] = useState(false);

  const onScan = useCallback((results) => {
    if (!results || results.length === 0) return;
    
    const text = results[0].rawValue;
    setResult(text);
    
    // Check if it's a claim URL
    if (text && text.includes('/app/claim/')) {
        // Extract the path if it's a full URL
        const parts = text.split('/app/claim/');
        if (parts.length > 1) {
            const path = parts[1];
            navigate(`/app/claim/${path}`);
        }
    }
  }, [navigate]);

  const onError = useCallback((err) => {
    // Suppress noisy NotFound errors during scanning, show others
    if (err?.name === 'NotFoundException') return;
    setError(err?.message || String(err));
  }, []);

  // Check camera permissions (best-effort)
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
    // Some Android devices support torch via advanced constraints
    ...(torch ? { advanced: [{ torch: true }] } : {}),
  }), [facingMode, torch]);

  return (
    <main className="flex-1 flex flex-col items-center text-center p-6 gap-4">
      <h1 className="text-3xl font-bold text-gray-900">Scan to Earn</h1>
      <p className="max-w-md text-gray-600">
        Use your device camera to scan the QR code at the your receipt.
      </p>

      <div className="w-full max-w-sm">
        <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden">
          <Scanner
            constraints={constraints}
            onScan={onScan}
            onError={onError}
            containerStyle={{ width: '100%', height: '100%' }}
            videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Overlay */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
            <div className="border-t-4 border-l-4 border-emerald-500 rounded-tl-2xl" />
            <div />
            <div className="border-t-4 border-r-4 border-emerald-500 rounded-tr-2xl" />
            <div />
            <div className="border-2 border-dashed border-white/30" />
            <div />
            <div className="border-b-4 border-l-4 border-emerald-500 rounded-bl-2xl" />
            <div />
            <div className="border-b-4 border-r-4 border-emerald-500 rounded-br-2xl" />
          </div>
        </div>

        {/* Controls */}
        <div className="mt-3 flex justify-between items-center text-left">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))}
              className="px-3 py-1.5 rounded-md bg-neutral-900 text-white hover:bg-neutral-800"
            >
              Flip Camera
            </button>
            <button
              type="button"
              onClick={() => setTorch ((currentTorchStatus) => !currentTorchStatus)}
              className={`px-3 py-1.5 rounded-md ${torch ? 'bg-amber-500 hover:bg-amber-600' : 'bg-neutral-900 hover:bg-neutral-800'} text-white`}
            >
              {torch ? 'Torch ON' : 'Torch OFF'}
            </button>
          </div>
          <span className="text-xs text-gray-500">Permission: {permission}</span>
        </div>
      </div>

      {/* Result / Error */}
      {result && (
        <div className="w-full max-w-sm bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md p-3 break-all">
          <div className="font-semibold">Scanned:</div>
          <div className="text-sm mt-1">{result}</div>
          <div className="mt-2 flex gap-2">
            <a href={result} target="_blank" rel="noreferrer" className="text-emerald-700 underline text-sm">Open</a>
            <button
              type="button"
              className="text-emerald-700 underline text-sm"
              onClick={() => navigator.clipboard?.writeText(result)}
            >
              Copy
            </button>
            <button
              type="button"
              className="text-emerald-700 underline text-sm"
              onClick={() => setResult(null)}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="w-full max-w-sm bg-rose-50 border border-rose-200 text-rose-800 rounded-md p-3">
          <div className="font-semibold">Camera error</div>
          <div className="text-sm mt-1">{error}</div>
        </div>
      )}

      <p className="text-sm text-gray-500">
        Earn points by scanning the QR Code in your recipt if you ordered in the store
      </p>
    </main>
  );
};

export default QRScreen;