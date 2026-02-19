'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/services/api/client';
import { useToastStore } from '@/stores/toastStore';
import { logger } from '@/utils/logger';

type ExportStatus = 'idle' | 'requesting' | 'processing' | 'ready' | 'error';

/**
 * Gap #74: Data Export (GDPR)
 * "Export My Data" button, processing state, download when ready.
 */
export function DataExport() {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const addToast = useToastStore(s => s.addToast);

  const requestExport = useCallback(async () => {
    setStatus('requesting');
    setErrorMsg(null);
    try {
      const { data } = await apiClient.post<{
        status?: string;
        downloadUrl?: string;
        message?: string;
      }>('/users/request-data-export');

      if (data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
        setStatus('ready');
        addToast('Your data export is ready!', 'success');
      } else {
        setStatus('processing');
        addToast(data.message || 'Export requested. We will email you when ready.', 'info');
      }
    } catch (err) {
      logger.error('Data export failed:', err);
      // Try alternate endpoint
      try {
        const { data } = await apiClient.get<{
          status?: string;
          downloadUrl?: string;
        }>('/users/export-data');
        if (data.downloadUrl) {
          setDownloadUrl(data.downloadUrl);
          setStatus('ready');
        } else {
          setStatus('processing');
        }
      } catch {
        setStatus('error');
        setErrorMsg('Failed to request data export. Please try again later.');
      }
    }
  }, [addToast]);

  const handleDownload = useCallback(() => {
    if (!downloadUrl) return;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'vib3-data-export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [downloadUrl]);

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-white font-medium mb-1">Export Your Data</h3>
      <p className="text-white/40 text-sm mb-4">
        Download a copy of your VIB3 data including your profile, videos, comments, and activity.
      </p>

      {status === 'idle' && (
        <button onClick={requestExport}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-xl text-sm font-medium hover:opacity-90 transition">
          Request Data Export
        </button>
      )}

      {status === 'requesting' && (
        <div className="flex items-center gap-2 text-white/60">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Requesting export...</span>
        </div>
      )}

      {status === 'processing' && (
        <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-blue-300 text-sm font-medium">Processing your export</p>
            <p className="text-blue-300/60 text-xs">We&apos;ll email you when your data is ready to download.</p>
          </div>
        </div>
      )}

      {status === 'ready' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
            <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-300 text-sm font-medium">Your data export is ready!</p>
          </div>
          <button onClick={handleDownload}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-xl text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Export
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-300 text-sm">{errorMsg}</p>
          </div>
          <button onClick={() => { setStatus('idle'); setErrorMsg(null); }}
            className="text-purple-400 text-sm hover:underline">Try again</button>
        </div>
      )}
    </div>
  );
}
