import React from 'react';
import { 
  Trophy, 
  Search, 
  Globe, 
  Bookmark, 
  Bell, 
  RotateCw, 
  Volume2, 
  VolumeX,
  Calendar,
  Sparkles
} from 'lucide-react';
import { TIMEZONES } from '../services/api';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  selectedTimezone, 
  setSelectedTimezone, 
  showBookmarksOnly, 
  setShowBookmarksOnly,
  bookmarkCount,
  onRefresh,
  isRefreshing,
  soundEnabled,
  setSoundEnabled,
  onOpenGCalModal,
  onOpenReminderModal
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Live Indicator */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
            <Trophy className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                CodePulse <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-medium">LIVE</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-sans hidden sm:block">
              CP Contest Tracker & Calendar Sync
            </p>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="flex-1 max-w-md hidden md:block relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contests (e.g. Codeforces, LeetCode 438, Div 2)..."
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-cyan-500/20"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Action Controls & Selectors */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Timezone Selector Dropdown */}
          <div className="relative flex items-center">
            <Globe className="absolute left-3 w-4 h-4 text-cyan-400 pointer-events-none hidden sm:block" />
            <select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs sm:text-sm text-slate-200 rounded-xl pl-2 sm:pl-9 pr-7 py-2 text-ellipsis outline-none transition-colors cursor-pointer appearance-none"
            >
              {TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value} className="bg-slate-900 text-slate-200">
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bookmarks Toggle Button */}
          <button
            onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              showBookmarksOnly 
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title="Toggle Saved Bookmarks"
          >
            <Bookmark className={`w-4 h-4 ${showBookmarksOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Saved</span>
            {bookmarkCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-xs">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Google Calendar Quick Sync Modal Trigger */}
          <button
            onClick={onOpenGCalModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 text-xs sm:text-sm font-medium transition-all"
            title="Google Calendar Integration"
          >
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="hidden lg:inline">Google Calendar</span>
          </button>

          {/* Reminder Preferences Modal */}
          <button
            onClick={onOpenReminderModal}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/30 transition-all"
            title="Reminder Settings"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all hidden sm:flex"
            title={soundEnabled ? "Mute alert sounds" : "Enable alert sounds"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all disabled:opacity-50"
            title="Refresh contest listings"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contests..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 outline-none"
          />
        </div>
      </div>
    </header>
  );
}
