import React from 'react';
import { Radio, CalendarDays, Clock, Zap, BookmarkCheck } from 'lucide-react';

export default function StatsBanner({ contests, bookmarkedCount }) {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const liveContests = contests.filter(c => c.status === 'LIVE' || (now >= c.startTimeMs && now <= c.endTimeMs));
  const startingToday = contests.filter(c => c.startTimeMs > now && c.startTimeMs <= (now + DAY));
  const upcomingTotal = contests.filter(c => c.startTimeMs > now);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Live Now Card */}
      <div className="glass-panel p-4 flex items-center gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all" />
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
          <Radio className="w-6 h-6 text-red-400 animate-pulse" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Live Now</p>
          <p className="text-2xl font-bold font-heading text-white">
            {liveContests.length} <span className="text-xs font-normal text-red-400 font-sans">Active</span>
          </p>
        </div>
      </div>

      {/* Starting Today Card */}
      <div className="glass-panel p-4 flex items-center gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Zap className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Starting Next 24h</p>
          <p className="text-2xl font-bold font-heading text-white">
            {startingToday.length} <span className="text-xs font-normal text-amber-400 font-sans">Contests</span>
          </p>
        </div>
      </div>

      {/* Total Upcoming Card */}
      <div className="glass-panel p-4 flex items-center gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
          <CalendarDays className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Total Tracked</p>
          <p className="text-2xl font-bold font-heading text-white">
            {upcomingTotal.length} <span className="text-xs font-normal text-cyan-400 font-sans">Upcoming</span>
          </p>
        </div>
      </div>

      {/* Saved Bookmarks Card */}
      <div className="glass-panel p-4 flex items-center gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
          <BookmarkCheck className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Saved Contests</p>
          <p className="text-2xl font-bold font-heading text-white">
            {bookmarkedCount} <span className="text-xs font-normal text-purple-400 font-sans">Bookmarks</span>
          </p>
        </div>
      </div>
    </div>
  );
}
