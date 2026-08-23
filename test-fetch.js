import axios from 'axios';

async function testFetchers() {
  console.log('Testing APIs...');

  // 1. Codeforces
  try {
    const cf = await axios.get('https://codeforces.com/api/contest.list', { timeout: 5000 });
    const upcoming = cf.data.result.filter(c => c.phase === 'BEFORE' || c.phase === 'CODING');
    console.log(`Codeforces: Found ${upcoming.length} contests`);
  } catch (e) {
    console.log('Codeforces error:', e.message);
  }

  // 2. LeetCode GraphQL
  try {
    const lc = await axios.post('https://leetcode.com/graphql', {
      query: `query { topTwoContests { title titleSlug startTime duration cardImg } }`
    }, { 
      timeout: 5000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } 
    });
    console.log('LeetCode topTwoContests:', lc.data?.data);
  } catch (e) {
    console.log('LeetCode error:', e.message);
  }

  // 3. CodeChef API
  try {
    const cc = await axios.get('https://www.codechef.com/api/list/contests/all', {
      timeout: 5000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    console.log(`CodeChef upcoming:`, cc.data?.future_contests?.length || 0);
  } catch (e) {
    console.log('CodeChef error:', e.message);
  }
}

testFetchers();
