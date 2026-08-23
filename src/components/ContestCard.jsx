import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  Bookmark, 
  Bell, 
  BellRing, 
  Download, 
  Radio, 
  Check, 
  Share2,
  AlertCircle
} from 'lucide-react';
import { 
  formatDateInTimezone, 
  getGoogleCalendarUrl, 
  downloadIcsFile,
  requestNotificationPermission,
  sendDesktopNotification
} from '../services/api';

export default function ContestCard({ 
  contest, 
  timezone, 
  isBookmarked, 
  onToggleBookmark 
}) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(contest));
  const [hasReminder, setHasReminder] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Live countdown timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(contest));
    }, 1000);
    return () => clearInterval(timer);
  }, [contest]);

  function calculateTimeLeft(c) {
    const now = Date.now();
    const start = c.startTimeMs;
    const end = c.endTimeMs;

    if (now >= start && now <= end) {
      const remainingSeconds = Math.max(0, Math.floor((end - now) / 1000));
      return {
        status: 'LIVE',
        secondsLeft: remainingSeconds,
        days: Math.floor(remainingSeconds / 86400),
        hours: Math.floor((remainingSeconds % 86400) / 3600),
        minutes: Math.floor((remainingSeconds % 3600) / 60),
        seconds: remainingSeconds % 60,
      };
    } else if (now < start) {
      const diffSeconds = Math.max(0, Math.floor((start - now) / 1000));
      return {
        status: 'UPCOMING',
        secondsLeft: diffSeconds,
        days: Math.floor(diffSeconds / 86400),
        hours: Math.floor((diffSeconds % 86400) / 3600),
        minutes: Math.floor((diffSeconds % 3600) / 60),
        seconds: diffSeconds % 60,
      };
    } else {
      return {
        status: 'ENDED',
        secondsLeft: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }
  }

  // Handle setting 30-min browser notification reminder
  const handleToggleReminder = async () => {
    if (!hasReminder) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setHasReminder(true);
        sendDesktopNotification(`Reminder Set: ${contest.name}`, {
          body: `You will be alerted 30 minutes before ${contest.platform} contest starts!`,
        });
        
        // Schedule timeout for 30m before
        const timeUntilStart = contest.startTimeMs - Date.now();
        const thirtyMins = 30 * 60 * 1000;
        const alertDelay = timeUntilStart - thirtyMins;

        if (alertDelay > 0) {
          setTimeout(() => {
            sendDesktopNotification(`🚨 CONTEST REMINDER (30m)`, {
              body: `${contest.name} on ${contest.platform} starts in 30 minutes!\nClick to join: ${contest.url}`,
            });
          }, alertDelay);
        }
      }
    } else {
      setHasReminder(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(contest.url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getPlatformBadgeClass = (key) => {
    switch (key) {
      case 'codeforces': return 'badge-codeforces';
      case 'leetcode': return 'badge-leetcode';
      case 'codechef': return 'badge-codechef';
      case 'atcoder': return 'badge-atcoder';
      case 'hackerrank': return 'badge-hackerrank';
      default: return 'badge-default';
    }
  };

  const isLive = timeLeft.status === 'LIVE';
  const isEnded = timeLeft.status === 'ENDED';

  return (
    <div className={`glass-panel p-5 relative flex flex-col justify-between transition-all duration-300 ${
      isLive ? 'border-red-500/50 bg-red-950/10 shadow-lg shadow-red-500/10' : ''
    }`}>
      
      {/* Top Header: Platform Badge, Status Indicator & Bookmark */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider ${getPlatformBadgeClass(contest.platformKey)}`}>
              {contest.platform}
            </span>

            {isLive && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold animate-pulse">
                <Radio className="w-3.5 h-3.5 text-red-400" /> LIVE NOW
              </span>
            )}
          </div>

          <button
            onClick={() => onToggleBookmark(contest.id)}
            className={`p-2 rounded-xl transition-all ${
              isBookmarked 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Contest Name */}
        <h3 className="font-heading text-lg font-bold text-white mb-2 leading-snug line-clamp-2 hover:text-cyan-400 transition-colors">
          <a href={contest.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 group">
            <span>{contest.name}</span>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0 inline" />
          </a>
        </h3>

        {/* Time Info */}
        <div className="space-y-1.5 text-xs text-slate-300 my-3 font-sans">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              <strong className="text-slate-400">Starts:</strong> {formatDateInTimezone(contest.startTime, timezone)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              <strong className="text-slate-400">Duration:</strong> {contest.durationFormatted}
            </span>
          </div>
        </div>
      </div>

      {/* Middle T-minus Dynamic Countdown Clock */}
      <div className="my-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-mono text-slate-300">
            {isLive ? 'TIME REMAINING:' : isEnded ? 'STATUS:' : 'STARTS IN:'}
          </span>
          <span className="font-mono text-[10px] text-cyan-400">
            {timezone}
          </span>
        </div>

        {isEnded ? (
          <div className="text-center py-1 text-slate-500 font-mono text-sm font-semibold">
            CONTEST CONCLUDED
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1 text-center font-mono">
            <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
              <span className="text-lg font-bold text-cyan-400">{String(timeLeft.days).padStart(2, '0')}</span>
              <span className="block text-[9px] text-slate-500 uppercase">Days</span>
            </div>
            <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
              <span className="text-lg font-bold text-cyan-400">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="block text-[9px] text-slate-500 uppercase">Hrs</span>
            </div>
            <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
              <span className="text-lg font-bold text-cyan-400">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="block text-[9px] text-slate-500 uppercase">Mins</span>
            </div>
            <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
              <span className={`text-lg font-bold ${isLive ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="block text-[9px] text-slate-500 uppercase">Secs</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons: Add to Google Calendar, .ics, Remind Me */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        
        {/* Google Calendar 1-Click Link Button */}
        <a
          href={getGoogleCalendarUrl(contest)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl btn-primary text-xs font-semibold cursor-pointer text-white hover:opacity-90 transition-opacity"
        >
          <Calendar className="w-4 h-4 text-white" />
          <span>Add to Google Calendar (30m Alarm)</span>
        </a>

        {/* Secondary Row: .ics Export, Remind Me, Share */}
        <div className="grid grid-cols-3 gap-2">
          
          {/* Download .ics Button */}
          <button
            onClick={() => downloadIcsFile(contest)}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-medium transition-all"
            title="Download .ics Calendar Event"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>.ICS File</span>
          </button>

          {/* 30m Browser Notification Toggle */}
          <button
            onClick={handleToggleReminder}
            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-medium transition-all ${
              hasReminder 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title={hasReminder ? "Reminder set for 30m before" : "Set 30m browser alert"}
          >
            {hasReminder ? <BellRing className="w-3.5 h-3.5 text-emerald-400" /> : <Bell className="w-3.5 h-3.5 text-amber-400" />}
            <span>{hasReminder ? '30m Active' : '30m Alert'}</span>
          </button>

          {/* Share / Copy Link Button */}
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-medium transition-all"
            title="Copy Contest Link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-purple-400" />}
            <span>{copiedLink ? 'Copied!' : 'Share'}</span>
          </button>

        </div>
      </div>

    </div>
  );
}
