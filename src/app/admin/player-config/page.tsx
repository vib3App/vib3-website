'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api/client';
import { logger } from '@/utils/logger';

interface PlayerConfig {
  version: number;
  updatedAt: string | null;
  params: Record<string, number | number[]>;
}

const PARAM_GROUPS = [
  {
    label: 'Preload Window',
    params: [
      { key: 'forwardWindow', label: 'Forward window', description: 'Videos to preload ahead' },
      { key: 'backwardWindow', label: 'Backward window', description: 'Videos to keep behind' },
      { key: 'fastScrollThreshold', label: 'Fast scroll threshold', description: 'Velocity threshold for aggressive preload' },
    ],
  },
  {
    label: 'Controller Limits',
    params: [
      { key: 'maxControllersAndroid', label: 'Max controllers (Android)', description: 'Active controller limit' },
      { key: 'maxControllersIos', label: 'Max controllers (iOS)', description: 'Active controller limit' },
      { key: 'maxPreloadedAndroid', label: 'Max preloaded (Android)', description: 'Preload pool size' },
      { key: 'maxPreloadedIos', label: 'Max preloaded (iOS)', description: 'Preload pool size' },
      { key: 'maxTotalAndroid', label: 'Max total (Android)', description: 'Hard ceiling for all controllers' },
      { key: 'maxTotalIos', label: 'Max total (iOS)', description: 'Hard ceiling for all controllers' },
    ],
  },
  {
    label: 'Background',
    params: [
      { key: 'backgroundThresholdIos', label: 'Background threshold iOS (s)', description: 'Seconds before marking dead' },
      { key: 'backgroundThresholdAndroid', label: 'Background threshold Android (s)', description: 'Seconds before marking dead' },
    ],
  },
  {
    label: 'Bitrate Controller',
    params: [
      { key: 'rampIntervalSeconds', label: 'Ramp interval (s)', description: 'Seconds between quality checks' },
    ],
  },
  {
    label: 'Buffer Duration (iOS, seconds)',
    params: [
      { key: 'bufferPoorNetwork', label: 'Poor network', description: '<1.5 Mbps' },
      { key: 'bufferFairNetwork', label: 'Fair network', description: '1.5-3 Mbps' },
      { key: 'bufferGoodNetwork', label: 'Good network', description: '3-5 Mbps' },
      { key: 'bufferExcellentNetwork', label: 'Excellent network', description: '>5 Mbps' },
      { key: 'nativeBufferDuration', label: 'Native init buffer', description: 'preferredForwardBufferDuration at init' },
    ],
  },
  {
    label: 'Timeouts (ms)',
    params: [
      { key: 'preloadTimeoutCellular', label: 'Preload timeout (cellular)', description: 'ms' },
      { key: 'preloadTimeoutWifi', label: 'Preload timeout (WiFi)', description: 'ms' },
      { key: 'firstVideoTimeout', label: 'First video timeout', description: 'ms' },
    ],
  },
  {
    label: 'GC Thresholds',
    params: [
      { key: 'maxDisposedControllers', label: 'Max disposed controllers', description: 'Trigger prune above this' },
      { key: 'pruneDisposedTo', label: 'Prune disposed to', description: 'Remove oldest down to this' },
      { key: 'maxFailedUrls', label: 'Max failed URLs', description: 'Trigger prune above this' },
      { key: 'pruneFailedTo', label: 'Prune failed to', description: 'Remove oldest down to this' },
    ],
  },
];

export default function PlayerConfigPage() {
  const [config, setConfig] = useState<PlayerConfig | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<PlayerConfig>('/config/player');
      setConfig(data);
      // Initialize edits with current values
      const initial: Record<string, string> = {};
      for (const group of PARAM_GROUPS) {
        for (const param of group.params) {
          const val = data.params[param.key];
          initial[param.key] = val !== undefined ? String(val) : '';
        }
      }
      setEdits(initial);
    } catch (err) {
      logger.error('Failed to fetch config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setMessage(null);

    // Build params object with only changed values
    const changes: Record<string, number> = {};
    for (const [key, strVal] of Object.entries(edits)) {
      const num = Number(strVal);
      if (!isNaN(num) && num !== config.params[key]) {
        changes[key] = num;
      }
    }

    if (Object.keys(changes).length === 0) {
      setMessage({ type: 'error', text: 'No changes to save' });
      setSaving(false);
      return;
    }

    try {
      await apiClient.put('/config/player', { params: changes });
      setMessage({ type: 'success', text: `Saved ${Object.keys(changes).length} changes (v${config.version + 1}). App picks up on next launch.` });
      await fetchConfig();
    } catch (err) {
      logger.error('Failed to save config:', err);
      setMessage({ type: 'error', text: 'Failed to save config' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white text-xl">Loading player config...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Player Config</h1>
          <p className="text-neutral-400 mt-1">
            Server-controlled player parameters (v{config?.version ?? 0})
            {config?.updatedAt && (
              <span className="ml-2 text-neutral-500">
                Last updated: {new Date(config.updatedAt).toLocaleString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {PARAM_GROUPS.map((group) => (
        <div key={group.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{group.label}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.params.map((param) => {
              const currentVal = config?.params[param.key];
              const editVal = edits[param.key] ?? '';
              const isChanged = editVal !== '' && Number(editVal) !== currentVal;

              return (
                <div key={param.key} className="space-y-1">
                  <label className="text-sm text-neutral-300 font-medium">
                    {param.label}
                    {isChanged && <span className="ml-2 text-yellow-400 text-xs">modified</span>}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editVal}
                    onChange={(e) => setEdits((prev) => ({ ...prev, [param.key]: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-white text-sm ${
                      isChanged
                        ? 'bg-yellow-500/10 border border-yellow-500/30'
                        : 'bg-neutral-800 border border-neutral-700'
                    } focus:outline-none focus:border-purple-500`}
                  />
                  <p className="text-xs text-neutral-500">{param.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
