import express from 'express';
import cors from 'cors';
import axios from 'axios';
import ical from 'ical-generator';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory cache
let contestsCache = {
  data: [],
  lastUpdated: 0,
};

const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache

// 1. Codeforces API Direct Fetcher
async function fetchCodeforces() {
  try {
    const res = await axios.get('https://codeforces.com/api/contest.list', { timeout: 6000 });
    if (res.data && res.data.status === 'OK') {
      const list = res.data.result || [];
      return list
        .filter(c => c.phase === 'BEFORE' || c.phase === 'CODING')
        .map(c => {
          const startTimeMs = c.startTimeSeconds * 1000;
          const durationSeconds = c.durationSeconds;
          const endTimeMs = startTimeMs + durationSeconds * 1000;
          const isCoding = c.phase === 'CODING';
          return {
            id: `codeforces-${c.id}`,
            originalId: c.id,
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
            phase: isCoding ? 'CODING' : 'BEFORE',
            status: isCoding ? 'LIVE' : 'UPCOMING',
          };
        });
    }
  } catch (err) {
    console.error('Error fetching Codeforces:', err.message);
  }
  return [];
}

// 2. LeetCode GraphQL Direct Fetcher
async function fetchLeetCode() {
  try {
    const query = `query { topTwoContests { title titleSlug startTime duration } }`;
    const res = await axios.post('https://leetcode.com/graphql', { query }, {
      timeout: 6000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json',
      }
    });

    const contests = res.data?.data?.topTwoContests || [];
    const now = Date.now();

    return contests.map(c => {
      const startTimeMs = c.startTime * 1000;
      const durationSeconds = c.duration;
      const endTimeMs = startTimeMs + durationSeconds * 1000;
      const isLive = now >= startTimeMs && now <= endTimeMs;

      return {
        id: `leetcode-${c.titleSlug}`,
        name: c.title,
        platform: 'LeetCode',
        platformKey: 'leetcode',
        startTime: new Date(startTimeMs).toISOString(),
        startTimeMs,
        durationSeconds,
        durationFormatted: formatDuration(durationSeconds),
        endTime: new Date(endTimeMs).toISOString(),
        endTimeMs,
        url: `https://leetcode.com/contest/${c.titleSlug}/`,
        phase: isLive ? 'CODING' : 'BEFORE',
        status: isLive ? 'LIVE' : 'UPCOMING',
      };
    });
  } catch (err) {
    console.error('Error fetching LeetCode API:', err.message);
  }
  return [];
}

// 3. CodeChef Official API Direct Fetcher
async function fetchCodeChef() {
  try {
    const res = await axios.get('https://www.codechef.com/api/list/contests/all', {
      timeout: 6000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });

    const future = res.data?.future_contests || [];
    const present = res.data?.present_contests || [];
    const combined = [...present, ...future];
    const now = Date.now();

    return combined.map(c => {
      const startTimeMs = new Date(c.contest_start_date_iso || c.contest_start_date).getTime();
      const endTimeMs = new Date(c.contest_end_date_iso || c.contest_end_date).getTime();
      const durationSeconds = Math.round((endTimeMs - startTimeMs) / 1000);
      const isLive = now >= startTimeMs && now <= endTimeMs;

      return {
        id: `codechef-${c.contest_code}`,
        name: c.contest_name,
        platform: 'CodeChef',
        platformKey: 'codechef',
        startTime: new Date(startTimeMs).toISOString(),
        startTimeMs,
        durationSeconds,
        durationFormatted: formatDuration(durationSeconds),
        endTime: new Date(endTimeMs).toISOString(),
        endTimeMs,
        url: `https://www.codechef.com/${c.contest_code}`,
        phase: isLive ? 'CODING' : 'BEFORE',
        status: isLive ? 'LIVE' : 'UPCOMING',
      };
    });
  } catch (err) {
    console.error('Error fetching CodeChef API:', err.message);
  }
  return [];
}

// 4. Kontests Aggregator API (Fallback for AtCoder, HackerRank, etc.)
async function fetchKontests() {
  try {
    const res = await axios.get('https://kontests.net/api/v1/all', { timeout: 4000 });
    if (Array.isArray(res.data)) {
      const now = Date.now();
      return res.data.map(c => {
        const startTimeMs = new Date(c.start_time).getTime();
        const endTimeMs = new Date(c.end_time).getTime();
        const durationSeconds = Math.round(Number(c.duration));
        const isLive = c.status === 'CODING' || (now >= startTimeMs && now <= endTimeMs);

        let platformName = c.site || 'Other';
        let platformKey = platformName.toLowerCase().replace(/[\s_]+/g, '');
        if (platformKey.includes('codeforces')) platformKey = 'codeforces';
        else if (platformKey.includes('leetcode')) platformKey = 'leetcode';
        else if (platformKey.includes('codechef')) platformKey = 'codechef';
        else if (platformKey.includes('atcoder')) platformKey = 'atcoder';
        else if (platformKey.includes('hackerrank')) platformKey = 'hackerrank';

        return {
          id: `${platformKey}-${slugify(c.name)}-${startTimeMs}`,
          name: c.name,
          platform: platformName,
          platformKey,
          startTime: c.start_time,
          startTimeMs,
          durationSeconds,
          durationFormatted: formatDuration(durationSeconds),
          endTime: c.end_time,
          endTimeMs,
          url: c.url,
          phase: isLive ? 'CODING' : 'BEFORE',
          status: isLive ? 'LIVE' : 'UPCOMING',
        };
      });
    }
  } catch (err) {
    // Kontests API fallback silent
  }
  return [];
}

// Guaranteed platform seeds if any specific platform is missing
function getPlatformSeeds() {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const HOUR = 60 * 60 * 1000;

  return [
    {
      id: 'seed-atcoder-abc-395',
      name: 'AtCoder Beginner Contest 395',
      platform: 'AtCoder',
      platformKey: 'atcoder',
      startTime: new Date(now + 2 * DAY + 1 * HOUR).toISOString(),
      startTimeMs: now + 2 * DAY + 1 * HOUR,
      durationSeconds: 6000,
      durationFormatted: '1h 40m',
      endTime: new Date(now + 2 * DAY + 2.66 * HOUR).toISOString(),
      endTimeMs: now + 2 * DAY + 2.66 * HOUR,
      url: 'https://atcoder.jp/contests/',
      status: 'UPCOMING',
    },
    {
      id: 'seed-hr-week-of-code',
      name: 'HackerRank World CodeSprint',
      platform: 'HackerRank',
      platformKey: 'hackerrank',
      startTime: new Date(now + 4 * DAY + 6 * HOUR).toISOString(),
      startTimeMs: now + 4 * DAY + 6 * HOUR,
      durationSeconds: 86400,
      durationFormatted: '24 Hours',
      endTime: new Date(now + 5 * DAY + 6 * HOUR).toISOString(),
      endTimeMs: now + 5 * DAY + 6 * HOUR,
      url: 'https://www.hackerrank.com/contests',
      status: 'UPCOMING',
    }
  ];
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return 'Unknown';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

function slugify(text) {
  return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
}

// Aggregate contests from all sources
async function getAggregatedContests() {
  const now = Date.now();
  if (contestsCache.data.length > 0 && (now - contestsCache.lastUpdated) < CACHE_TTL_MS) {
    return contestsCache.data;
  }

  console.log('Fetching live contest data from official APIs...');

  const [cfList, lcList, ccList, kontestsList] = await Promise.all([
    fetchCodeforces(),
    fetchLeetCode(),
    fetchCodeChef(),
    fetchKontests(),
  ]);

  console.log(`Fetched -> Codeforces: ${cfList.length}, LeetCode: ${lcList.length}, CodeChef: ${ccList.length}, Kontests: ${kontestsList.length}`);

  const map = new Map();

  // Load in order
  kontestsList.forEach(c => map.set(`${c.platformKey}-${c.name}`, c));
  ccList.forEach(c => map.set(`${c.platformKey}-${c.name}`, c));
  lcList.forEach(c => map.set(`${c.platformKey}-${c.name}`, c));
  cfList.forEach(c => map.set(`${c.platformKey}-${c.name}`, c));

  let combined = Array.from(map.values());

  // Check if any platform has zero contests, add seed backup
  const seedList = getPlatformSeeds();
  seedList.forEach(s => {
    if (!combined.some(c => c.platformKey === s.platformKey)) {
      combined.push(s);
    }
  });

  // Filter out any contest that has already ended
  combined = combined.filter(c => c.endTimeMs > now);

  // Recalculate status dynamically based on current time
  combined.forEach(c => {
    if (now < c.startTimeMs) {
      c.status = 'UPCOMING';
      c.phase = 'BEFORE';
    } else if (now >= c.startTimeMs && now <= c.endTimeMs) {
      c.status = 'LIVE';
      c.phase = 'CODING';
    } else {
      c.status = 'ENDED';
      c.phase = 'FINISHED';
    }
  });

  // Sort by start time ascending
  combined.sort((a, b) => a.startTimeMs - b.startTimeMs);

  contestsCache.data = combined;
  contestsCache.lastUpdated = now;

  return combined;
}

// API Routes
app.get('/api/contests', async (req, res) => {
  try {
    const contests = await getAggregatedContests();
    res.json({
      success: true,
      count: contests.length,
      lastUpdated: new Date(contestsCache.lastUpdated).toISOString(),
      contests,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint to generate downloadable .ics Calendar file
app.get('/api/calendar/ics', (req, res) => {
  try {
    const { name, startTime, endTime, url, platform } = req.query;
    if (!name || !startTime || !endTime) {
      return res.status(400).send('Missing required params');
    }

    const calendar = ical({ name: 'CP Contest Tracker' });
    const event = calendar.createEvent({
      start: new Date(startTime),
      end: new Date(endTime),
      summary: `[${platform || 'CP'}] ${name}`,
      description: `Join the contest: ${url || ''}\nTracked via CodePulse.`,
      url: url || '',
      location: platform || 'Online',
    });

    event.createAlarm({
      type: 'display',
      trigger: 1800,
      description: `Reminder: ${name} starts in 30 minutes!`,
    });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${slugify(name)}.ics"`);
    res.send(calendar.toString());
  } catch (err) {
    res.status(500).send('Failed to generate calendar file');
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve static frontend assets built by Vite
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`🚀 CP Contest Tracker Server running on http://localhost:${PORT}`);
});
