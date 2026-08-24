'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { ImportRunLog } from '@/types/reference';

export function ImporterControls() {
  const [status, setStatus] = useState<ImportRunLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [startUrl, setStartUrl] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/importer/status');
      const data = await res.json();
      if (data.run) setStatus(data.run);
    } catch (e) {}
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action: 'start' | 'pause' | 'resume' | 'stop') => {
    setLoading(true);
    try {
      let runId = status?.runId;
      
      const res = await fetch('/api/admin/importer/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, runId }),
      });
      const data = await res.json();
      
      if (action === 'start') {
        runId = data.run.runId;
        setStatus(data.run);
        // Start the background batch processing loop
        if (runId) runBatchLoop(runId, startUrl);
      } else {
        fetchStatus();
      }
    } finally {
      setLoading(false);
    }
  };

  const runBatchLoop = async (runId: string, pageUrl?: string) => {
    let currentUrl = pageUrl;
    while (true) {
      try {
        // Check if stopped/paused
        const statusRes = await fetch('/api/admin/importer/status');
        const statusData = await statusRes.json();
        if (statusData.run?.status !== 'running' || statusData.run?.runId !== runId) {
          break; // Stop loop if paused/stopped
        }

        const res = await fetch('/api/admin/importer/run-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ runId, pageUrl: currentUrl }),
        });
        const data = await res.json();
        
        if (!data.success || !data.nextPageUrl) {
          break; // Finished or error
        }
        
        currentUrl = data.nextPageUrl;
        
        // Delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 3000));
      } catch (e) {
        console.error('Batch error:', e);
        break;
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-6 shadow-sm mb-8 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">FragranceNet Importer</h2>
          <p className="text-xs text-gray-500">Automated reference database scraper.</p>
        </div>
        
        <div className="flex gap-2">
          {(!status || status.status === 'completed' || status.status === 'failed') ? (
            <button
              onClick={() => handleAction('start')}
              disabled={loading}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-wider"
            >
              <Play className="w-3.5 h-3.5" /> Start Import
            </button>
          ) : status.status === 'paused' ? (
            <button
              onClick={() => handleAction('resume')}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider"
            >
              <Play className="w-3.5 h-3.5" /> Resume
            </button>
          ) : (
            <button
              onClick={() => handleAction('pause')}
              disabled={loading}
              className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider"
            >
              <Pause className="w-3.5 h-3.5" /> Pause
            </button>
          )}

          {status && (status.status === 'running' || status.status === 'paused') && (
            <button
              onClick={() => handleAction('stop')}
              disabled={loading}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider"
            >
              <Square className="w-3.5 h-3.5" /> Stop
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 items-center pt-2">
        <input 
          type="text" 
          value={startUrl} 
          onChange={e => setStartUrl(e.target.value)} 
          placeholder="Optional starting URL..."
          className="text-xs p-2 border border-gray-200 flex-1 max-w-md focus:outline-none focus:border-black"
        />
      </div>

      {status && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 text-center">
          <div className="bg-gray-50 p-3 border border-gray-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</div>
            <div className={`text-sm font-semibold mt-1 capitalize ${status.status === 'running' ? 'text-emerald-600' : 'text-gray-900'}`}>
              {status.status}
            </div>
          </div>
          <div className="bg-gray-50 p-3 border border-gray-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Discovered</div>
            <div className="text-sm font-semibold text-gray-900 mt-1">{status.productsDiscovered}</div>
          </div>
          <div className="bg-gray-50 p-3 border border-gray-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Created</div>
            <div className="text-sm font-semibold text-gray-900 mt-1">{status.productsCreated}</div>
          </div>
          <div className="bg-gray-50 p-3 border border-gray-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Images Uploaded</div>
            <div className="text-sm font-semibold text-gray-900 mt-1">{status.imagesUploaded}</div>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-gray-50 p-3 border border-gray-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Pages Processed</div>
            <div className="text-sm font-semibold text-gray-900 mt-1">{status.lastProcessedPage || 0}</div>
          </div>
        </div>
      )}
    </div>
  );
}
