import React, { useState } from 'react';
import { X, Bell, Volume2, Check, ShieldAlert, Sparkles } from 'lucide-react';
import { requestNotificationPermission, sendDesktopNotification } from '../services/api';

export default function ReminderModal({ isOpen, onClose }) {
  const [leadTime, setLeadTime] = useState(
    localStorage.getItem('cp_reminder_lead_time') || '30'
  );
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem('cp_sound_enabled') !== 'false'
  );
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const handleLeadTimeChange = (val) => {
    setLeadTime(val);
    localStorage.setItem('cp_reminder_lead_time', val);
  };

  const handleSoundToggle = (val) => {
    setSoundEnabled(val);
    localStorage.setItem('cp_sound_enabled', String(val));
  };

  const handleTestNotification = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      sendDesktopNotification('🏆 Test Alert from CodePulse', {
        body: `Your ${leadTime}-minute contest reminder is working perfectly!`,
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 2500);
    } else {
      alert('Please enable desktop notification permissions in your browser bar.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-white">
              Reminder & Alert Settings
            </h2>
            <p className="text-xs text-slate-400">
              Customize notification timing & sound alerts
            </p>
          </div>
        </div>

        <div className="space-y-4">
          
          {/* Lead Time Selection */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Default Lead Time Before Contest Start:
            </label>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { label: '5m', val: '5' },
                { label: '15m', val: '15' },
                { label: '30m', val: '30' },
                { label: '1h', val: '60' },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => handleLeadTimeChange(opt.val)}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                    leadTime === opt.val
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Alert Toggle */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="text-xs font-semibold text-white">Audio Alert Tone</p>
                <p className="text-[11px] text-slate-400">Play audio chime on notification</p>
              </div>
            </div>

            <button
              onClick={() => handleSoundToggle(!soundEnabled)}
              className={`w-12 h-6 rounded-full p-1 transition-colors relative ${
                soundEnabled ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Test Notification Trigger */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Test Browser Permissions</p>
              <p className="text-[11px] text-slate-400">Send immediate test notification</p>
            </div>

            <button
              onClick={handleTestNotification}
              className="btn-secondary text-xs flex items-center gap-1 shrink-0"
            >
              {testSent ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              <span>{testSent ? 'Sent!' : 'Test Alert'}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary text-xs"
          >
            Save & Close
          </button>
        </div>

      </div>
    </div>
  );
}
