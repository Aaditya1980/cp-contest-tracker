import React, { useState } from 'react';
import { X, Calendar, Check, ExternalLink, ShieldCheck, Key, RefreshCw } from 'lucide-react';
import { getGoogleCalendarUrl, downloadIcsFile } from '../services/api';

export default function GoogleCalendarModal({ isOpen, onClose, contests }) {
  const [googleClientId, setGoogleClientId] = useState(
    localStorage.getItem('cp_gcal_client_id') || ''
  );
  const [savedStatus, setSavedStatus] = useState(false);

  if (!isOpen) return null;

  const handleSaveClientId = () => {
    localStorage.setItem('cp_gcal_client_id', googleClientId);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleBatchExportIcs = () => {
    contests.forEach((contest, index) => {
      setTimeout(() => {
        downloadIcsFile(contest);
      }, index * 300);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-white">
              Google Calendar & iCal Synchronization
            </h2>
            <p className="text-xs text-slate-400">
              Never miss a contest with automated calendar events & 30-min reminders
            </p>
          </div>
        </div>

        {/* Direct 1-Click Sync Info */}
        <div className="space-y-4">
          
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Method 1: Instant 1-Click Google Calendar Links
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every contest card includes a direct <strong>"Add to Google Calendar"</strong> button. Clicking it instantly opens Google Calendar on desktop or mobile with pre-filled title, dates, duration, contest URL, and default 30-minute reminder alarms. No setup required!
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" /> Method 2: Google Calendar API OAuth Client ID (Optional)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              If you have a Google Developer Client ID, enter it below to enable direct background API insertion into your Google Calendar account.
            </p>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={googleClientId}
                onChange={(e) => setGoogleClientId(e.target.value)}
                placeholder="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
              />
              <button
                onClick={handleSaveClientId}
                className="btn-primary text-xs flex items-center gap-1 shrink-0"
              >
                {savedStatus ? <Check className="w-4 h-4 text-white" /> : 'Save Key'}
              </button>
            </div>
          </div>

          {/* Batch Export All Upcoming Contests as .ics */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Batch Export iCal (.ics)</h3>
              <p className="text-xs text-slate-400">
                Export all {contests.length} upcoming contests to Apple Calendar / Outlook
              </p>
            </div>

            <button
              onClick={handleBatchExportIcs}
              className="btn-secondary text-xs flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export All</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="btn-secondary text-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
