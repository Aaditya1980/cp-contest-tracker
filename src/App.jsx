import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import StatsBanner from './components/StatsBanner';
import ContestCard from './components/ContestCard';
import GoogleCalendarModal from './components/GoogleCalendarModal';
import ReminderModal from './components/ReminderModal';
import { 
  fetchContests, 
  TIMEZONES, 
  getBookmarks, 
  toggleBookmark 
} from './services/api';
import { Filter, Sparkles, Layers, SearchX } from 'lucide-react';

const PLATFORMS = [
  { id: 'all', label: 'All Platforms' },
  { id: 'codeforces', label: 'Codeforces' },
  { id: 'leetcode', label: 'LeetCode' },
  { id: 'codechef', label: 'CodeChef' },
  { id: 'atcoder', label: 'AtCoder' },
  { id: 'hackerrank', label: 'HackerRank' },
];

export default function App() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all, live, upcoming
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState(() => {
    return (TIMEZONES && TIMEZONES[0] && TIMEZONES[0].value) ? TIMEZONES[0].value : 'UTC';
  });
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      return getBookmarks() || [];
    } catch (e) {
      return [];
    }
  });
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modal states
  const [isGCalModalOpen, setIsGCalModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // Load contest data
  const loadContests = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setIsRefreshing(true);
    try {
      const data = await fetchContests();
      setContests(data || []);
    } catch (err) {
      console.error('Failed to load contests:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadContests();
    // Auto-refresh contest data every 3 minutes
    const interval = setInterval(() => {
      loadContests();
    }, 180000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleBookmark = (id) => {
    const updated = toggleBookmark(id);
    setBookmarkedIds(updated);
  };

  // Filter contests based on platform, status, search query, and bookmarks
  const filteredContests = useMemo(() => {
    const now = Date.now();
    return contests.filter(c => {
      // Exclude ended contests
      if (c.endTimeMs <= now) return false;

      // Realtime status check
      const isLive = now >= c.startTimeMs && now <= c.endTimeMs;
      const isUpcoming = now < c.startTimeMs;

      // Platform filter
      if (selectedPlatform !== 'all' && c.platformKey !== selectedPlatform) {
        return false;
      }
      // Status filter
      if (statusFilter === 'live' && !isLive) return false;
      if (statusFilter === 'upcoming' && !isUpcoming) return false;

      // Bookmarks filter
      if (showBookmarksOnly && !bookmarkedIds.includes(c.id)) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesPlatform = c.platform.toLowerCase().includes(query);
        if (!matchesName && !matchesPlatform) return false;
      }

      return true;
    });
  }, [contests, selectedPlatform, statusFilter, searchQuery, showBookmarksOnly, bookmarkedIds]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-950 text-slate-100">
      
      {/* Header / Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTimezone={selectedTimezone}
        setSelectedTimezone={setSelectedTimezone}
        showBookmarksOnly={showBookmarksOnly}
        setShowBookmarksOnly={setShowBookmarksOnly}
        bookmarkCount={bookmarkedIds.length}
        onRefresh={() => loadContests(true)}
        isRefreshing={isRefreshing}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenGCalModal={() => setIsGCalModalOpen(true)}
        onOpenReminderModal={() => setIsReminderModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Overview Metric Banner */}
        <StatsBanner contests={contests} bookmarkedCount={bookmarkedIds.length} />

        {/* Filter Controls & Platform Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          
          {/* Platform Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedPlatform === p.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'all' ? 'bg-slate-800 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'live' ? 'bg-red-500/20 text-red-400 font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Only
            </button>
            <button
              onClick={() => setStatusFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'upcoming' ? 'bg-cyan-500/20 text-cyan-400 font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upcoming
            </button>
          </div>

        </div>

        {/* Loading Spinner State */}
        {loading ? (
          <div className="glass-panel p-12 text-center my-8">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-medium text-sm">Fetching upcoming contests from Codeforces, LeetCode & CodeChef...</p>
          </div>
        ) : filteredContests.length === 0 ? (
          
          /* Empty State */
          <div className="glass-panel p-12 text-center my-8 max-w-md mx-auto">
            <SearchX className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="font-heading text-lg font-bold text-white mb-1">No Contests Found</h3>
            <p className="text-xs text-slate-400 mb-4">
              {showBookmarksOnly 
                ? "You haven't saved any bookmarked contests yet." 
                : "No contests match your selected platform or search filters."}
            </p>
            <button
              onClick={() => {
                setSelectedPlatform('all');
                setStatusFilter('all');
                setSearchQuery('');
                setShowBookmarksOnly(false);
              }}
              className="btn-secondary text-xs"
            >
              Reset Filters
            </button>
          </div>

        ) : (

          /* Contest Grid Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map(contest => (
              <ContestCard
                key={contest.id}
                contest={contest}
                timezone={selectedTimezone}
                isBookmarked={bookmarkedIds.includes(contest.id)}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
          </div>

        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p className="flex items-center justify-center gap-1">
            Built with <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> for Competitive Programmers worldwide.
          </p>
          <p className="mt-1 text-[11px] text-slate-600">
            Supports Codeforces API, LeetCode, CodeChef, AtCoder, HackerRank & Google Calendar Integration.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <GoogleCalendarModal
        isOpen={isGCalModalOpen}
        onClose={() => setIsGCalModalOpen(false)}
        contests={contests}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
      />

    </div>
  );
}
