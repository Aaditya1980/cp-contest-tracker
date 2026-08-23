import axios from 'axios';

let contestsCache = {
  data: [],
  lastUpdated: 0,
};

const CACHE_TTL_MS = 3 * 60 * 1000;

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
  } catch (err) {}
  return [];
}

async function fetchLeetCode() {
  try {
    const query = `query { topTwoContests { title titleSlug startTime duration } }`;
    const res = await axios.post('https://leetcode.com/graphql', { query }, {
      timeout: 6000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
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
  } catch (err) {}
  return [];
}

async function fetchCodeChef() {
  try {
    const res = await axios.get('https://www.codechef.com/api/list/contests/all', {
      timeout: 6000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
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
  } catch (err) {}
  return [];
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return 'Unknown';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

export default async function handler(req, res) {
  const now = Date.now();
  if (contestsCache.data.length > 0 && (now - contestsCache.lastUpdated) < CACHE_TTL_MS) {
    return res.status(200).json({ success: true, count: contestsCache.data.length, contests: contestsCache.data });
  }

  const [cfList, lcList, ccList] = await Promise.all([
    fetchCodeforces(),
    fetchLeetCode(),
    fetchCodeChef(),
  ]);

  const map = new Map();
  ccList.forEach(c => map.set(`${c.platformKey}-${c.name}`, c));
  lcList.forEach(c => map.set(`${c.platformKey}-${c.name}`, c));
  cfList.forEach(c => map.set(`${c.platformKey}-${c.name}`, c));

  let combined = Array.from(map.values());
  combined = combined.filter(c => c.endTimeMs > now);

  combined.forEach(c => {
    if (now < c.startTimeMs) {
      c.status = 'UPCOMING';
      c.phase = 'BEFORE';
    } else if (now >= c.startTimeMs && now <= c.endTimeMs) {
      c.status = 'LIVE';
      c.phase = 'CODING';
    }
  });

  combined.sort((a, b) => a.startTimeMs - b.startTimeMs);

  contestsCache.data = combined;
  contestsCache.lastUpdated = now;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    success: true,
    count: combined.length,
    lastUpdated: new Date(now).toISOString(),
    contests: combined,
  });
}
