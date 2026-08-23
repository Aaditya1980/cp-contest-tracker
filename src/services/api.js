import axios from 'axios';

const BACKEND_URL = '/api';

let userTz = 'UTC';
try {
  userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
} catch (e) {
  userTz = 'UTC';
}

export const TIMEZONES = [
  { label: 'Local Timezone', value: userTz },
  { label: 'IST (India - UTC+5:30)', value: 'Asia/Kolkata' },
  { label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
  { label: 'EST (US Eastern - UTC-5)', value: 'America/New_York' },
  { label: 'PST (US Pacific - UTC-8)', value: 'America/Los_Angeles' },
  { label: 'CET (Central European - UTC+1)', value: 'Europe/Paris' },
  { label: 'JST (Japan - UTC+9)', value: 'Asia/Tokyo' },
];

// Client-side fallback fetcher if server is unreachable
export async function fetchContests() {
  try {
    const response = await axios.get(`${BACKEND_URL}/contests`, { timeout: 5000 });
    if (response.data && response.data.contests) {
      return response.data.contests;
    }
  } catch (err) {
    console.warn('Backend API request failed, falling back to direct browser APIs...', err.message);
  }

  // Direct client-side fetch fallback to Codeforces & Kontests API
  try {
    const [cfRes, kontestsRes] = await Promise.allSettled([
      axios.get('https://codeforces.com/api/contest.list', { timeout: 6000 }),
      axios.get('https://kontests.net/api/v1/all', { timeout: 6000 }),
    ]);

    let list = [];

    if (cfRes.status === 'fulfilled' && cfRes.value.data?.result) {
      const cfList = cfRes.value.data.result
        .filter(c => c.phase === 'BEFORE' || c.phase === 'CODING')
        .map(c => {
          const startTimeMs = c.startTimeSeconds * 1000;
          const durationSeconds = c.durationSeconds;
          const endTimeMs = startTimeMs + durationSeconds * 1000;
          const isCoding = c.phase === 'CODING';
          return {
            id: `codeforces-${c.id}`,
            name: c.name,
            platform: 'Codeforces',
            platformKey: 'codeforces',
            startTime: new Date(startTimeMs).toISOString(),
            startTimeMs,
            durationSeconds,
            durationFormatted: formatDuration(durationSeconds),
            endTime: new Date(endTimeMs).toISOString(),
            endTimeMs,
            url: `https://codeforces.com/contests/${c.id}`,
            status: isCoding ? 'LIVE' : 'UPCOMING',
          };
        });
      list.push(...cfList);
    }

    if (kontestsRes.status === 'fulfilled' && Array.isArray(kontestsRes.value.data)) {
      const kList = kontestsRes.value.data.map(c => {
        const startTime = new Date(c.start_time).getTime();
        const endTime = new Date(c.end_time).getTime();
        const durationSeconds = Math.round(Number(c.duration));
        const now = Date.now();
        let status = 'UPCOMING';
        if (c.status === 'CODING' || (now >= startTime && now <= endTime)) {
          status = 'LIVE';
        }
        let platformName = c.site || 'Other';
        let platformKey = platformName.toLowerCase().replace(/[\s_]+/g, '');
        if (platformKey.includes('codeforces')) platformKey = 'codeforces';
        else if (platformKey.includes('leetcode')) platformKey = 'leetcode';
        else if (platformKey.includes('codechef')) platformKey = 'codechef';
        else if (platformKey.includes('atcoder')) platformKey = 'atcoder';

        return {
          id: `${platformKey}-${c.name}-${startTime}`,
          name: c.name,
          platform: platformName,
          platformKey,
          startTime: c.start_time,
          startTimeMs: startTime,
          durationSeconds,
          durationFormatted: formatDuration(durationSeconds),
          endTime: c.end_time,
          endTimeMs: endTime,
          url: c.url,
          status,
        };
      });
      list.push(...kList);
    }

    // Deduplicate
    const map = new Map();
    list.forEach(c => map.set(`${c.platformKey}-${c.name}`, c));
    const result = Array.from(map.values());
    result.sort((a, b) => a.startTimeMs - b.startTimeMs);
    
    if (result.length > 0) return result;
  } catch (e) {
    console.error('Client fallback failed:', e);
  }

  // Guaranteed fallback data
  return generateMockContests();
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return 'Unknown';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

function generateMockContests() {
  const now = Date.now();
  const DAY = 86400000;
  const HOUR = 3600000;
  return [
    {
      id: 'mock-cf-1',
      name: 'Codeforces Round 998 (Div. 2)',
      platform: 'Codeforces',
      platformKey: 'codeforces',
      startTime: new Date(now + 1 * DAY).toISOString(),
      startTimeMs: now + 1 * DAY,
      durationSeconds: 7200,
      durationFormatted: '2 Hours',
      endTime: new Date(now + 1 * DAY + 2 * HOUR).toISOString(),
      endTimeMs: now + 1 * DAY + 2 * HOUR,
      url: 'https://codeforces.com/contests',
      status: 'UPCOMING',
    },
    {
      id: 'mock-lc-1',
      name: 'LeetCode Weekly Contest 438',
      platform: 'LeetCode',
      platformKey: 'leetcode',
      startTime: new Date(now + 2 * DAY + 3 * HOUR).toISOString(),
      startTimeMs: now + 2 * DAY + 3 * HOUR,
      durationSeconds: 5400,
      durationFormatted: '1.5 Hours',
      endTime: new Date(now + 2 * DAY + 4.5 * HOUR).toISOString(),
      endTimeMs: now + 2 * DAY + 4.5 * HOUR,
      url: 'https://leetcode.com/contest/',
      status: 'UPCOMING',
    },
    {
      id: 'mock-cc-1',
      name: 'CodeChef Starters 175',
      platform: 'CodeChef',
      platformKey: 'codechef',
      startTime: new Date(now + 3 * DAY + 5 * HOUR).toISOString(),
      startTimeMs: now + 3 * DAY + 5 * HOUR,
      durationSeconds: 7200,
      durationFormatted: '2 Hours',
      endTime: new Date(now + 3 * DAY + 7 * HOUR).toISOString(),
      endTimeMs: now + 3 * DAY + 7 * HOUR,
      url: 'https://www.codechef.com/contests',
      status: 'UPCOMING',
    },
    {
      id: 'mock-ac-1',
      name: 'AtCoder Beginner Contest 395',
      platform: 'AtCoder',
      platformKey: 'atcoder',
      startTime: new Date(now + 4 * DAY).toISOString(),
      startTimeMs: now + 4 * DAY,
      durationSeconds: 6000,
      durationFormatted: '1h 40m',
      endTime: new Date(now + 4 * DAY + 1.66 * HOUR).toISOString(),
      endTimeMs: now + 4 * DAY + 1.66 * HOUR,
      url: 'https://atcoder.jp/contests/',
      status: 'UPCOMING',
    }
  ];
}

// 1-Click Google Calendar Link Generator
export function getGoogleCalendarUrl(contest) {
  const formatIsoForGCal = (date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const startIso = formatIsoForGCal(new Date(contest.startTimeMs));
  const endIso = formatIsoForGCal(new Date(contest.endTimeMs));

  const title = encodeURIComponent(`[${contest.platform}] ${contest.name}`);
  const details = encodeURIComponent(
    `🏆 Contest: ${contest.name}\n` +
    `🌐 Platform: ${contest.platform}\n` +
    `🔗 Link: ${contest.url}\n\n` +
    `⏰ Set up with CodePulse CP Contest Tracker.`
  );
  const location = encodeURIComponent(contest.url || contest.platform);

  // Google Calendar TEMPLATE URL
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
}

// Client-side .ics generator fallback
export function downloadIcsFile(contest) {
  const formatIsoForIcs = (date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const startIso = formatIsoForIcs(new Date(contest.startTimeMs));
  const endIso = formatIsoForIcs(new Date(contest.endTimeMs));
  const nowIso = formatIsoForIcs(new Date());

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CodePulse//Contest Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:contest-${contest.id}@codepulse.app`,
    `DTSTAMP:${nowIso}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:[${contest.platform}] ${contest.name}`,
    `DESCRIPTION:Contest Link: ${contest.url}\\nTracked via CodePulse.`,
    `URL:${contest.url}`,
    `LOCATION:${contest.platform}`,
    'STATUS:CONFIRMED',
    // 30 Minute VALARM Notification
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${contest.name} starts in 30 minutes!`,
    'END:VALARM',
    // 15 Minute Audio VALARM Notification
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:AUDIO',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${slugify(contest.name)}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function slugify(text) {
  return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
}

// Date Formatting for Timezone
export function formatDateInTimezone(dateIsoOrMs, timeZoneName) {
  if (!dateIsoOrMs) return '';
  const date = new Date(dateIsoOrMs);
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timeZoneName,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch (e) {
    return date.toLocaleString();
  }
}

// Browser Notification Service
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    alert('This browser does not support desktop notifications.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendDesktopNotification(title, options = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notif = new Notification(title, {
      icon: '🏆',
      badge: '🏆',
      ...options,
    });
    
    // Play alert sound if audio is available
    playBeepSound();
    
    return notif;
  }
}

export function playBeepSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Audio Context restricted or unavailable
  }
}

// Local Storage Bookmark Management
export function getBookmarks() {
  try {
    const stored = localStorage.getItem('cp_bookmarked_contests');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

export function toggleBookmark(contestId) {
  const bookmarks = getBookmarks();
  let updated;
  if (bookmarks.includes(contestId)) {
    updated = bookmarks.filter(id => id !== contestId);
  } else {
    updated = [...bookmarks, contestId];
  }
  localStorage.setItem('cp_bookmarked_contests', JSON.stringify(updated));
  return updated;
}
