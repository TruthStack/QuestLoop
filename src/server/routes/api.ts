import { Hono } from 'hono';
import { context, redis, reddit } from '@devvit/web/server';
import { getDailySeed } from '../../shared/utils';
import type {
  InitResponse,
  SubmitScoreRequest,
  SubmitScoreResponse,
} from '../../shared/api';

type ErrorResponse = {
  status: 'error';
  message: string;
};

export const api = new Hono();

api.get('/init', async (c) => {
  const { postId } = context;

  if (!postId) {
    return c.json<ErrorResponse>({ status: 'error', message: 'postId is required' }, 400);
  }

  try {
    const dailySeed = getDailySeed();
    const username = await reddit.getCurrentUsername() || 'anonymous';
    
    // Calculate countdown to next UTC midnight
    const now = new Date();
    const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const nextQuestIn = Math.floor((tomorrow.getTime() - now.getTime()) / 1000);

    // Fetch streak
    const streakKey = `user:${username}:streak`;
    const lastDayKey = `user:${username}:last_day`;
    let streak = parseInt(await redis.get(streakKey) || '0');
    const lastActiveDay = await redis.get(lastDayKey);

    // Reset streak if more than 1 day missed
    if (lastActiveDay) {
        const lastDate = new Date(lastActiveDay);
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays > 1) {
            streak = 0;
            await redis.set(streakKey, '0');
        }
    }

    // Fetch completed quests for this user today
    const userKey = `user:${username}:${dailySeed}:completed`;
    const completedQuestsJson = await redis.get(userKey);
    const completedQuests = completedQuestsJson ? JSON.parse(completedQuestsJson) : [];

    // Fetch leaderboard
    const leaderboardKey = `leaderboard:${dailySeed}`;
    const leaderboardRaw = await redis.zRange(leaderboardKey, 0, 9, { by: 'rank', reverse: true });
    const leaderboard = leaderboardRaw.map(entry => ({
      username: entry.member,
      score: entry.score
    }));

    return c.json<InitResponse>({
      type: 'init',
      postId,
      username,
      dailySeed,
      completedQuests,
      leaderboard,
      streak,
      nextQuestIn
    });
  } catch (error) {
    console.error('API Init Error:', error);
    return c.json<ErrorResponse>({ status: 'error', message: 'Initialization failed' }, 400);
  }
});

api.post('/submit-score', async (c) => {
  const username = await reddit.getCurrentUsername() || 'anonymous';
  const dailySeed = getDailySeed();
  const now = new Date();
  const todayStr = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}`;
  
  const body = (await c.req.json()) as SubmitScoreRequest;
  
  try {
    const userKey = `user:${username}:${dailySeed}:completed`;
    const completedQuestsJson = await redis.get(userKey);
    const completedQuests = completedQuestsJson ? JSON.parse(completedQuestsJson) : [];
    
    if (!completedQuests.includes(body.questId)) {
      completedQuests.push(body.questId);
      await redis.set(userKey, JSON.stringify(completedQuests));
      
      // Update global score for the day
      const scoreKey = `user:${username}:${dailySeed}:total_score`;
      await redis.incrBy(scoreKey, body.score);
      
      // Update leaderboard
      const totalScore = await redis.get(scoreKey);
      const leaderboardKey = `leaderboard:${dailySeed}`;
      await redis.zAdd(leaderboardKey, { member: username, score: parseInt(totalScore || '0') });

      // Update Streak on first quest completion of the day
      const lastDayKey = `user:${username}:last_day`;
      const lastActiveDay = await redis.get(lastDayKey);
      if (lastActiveDay !== todayStr) {
          const streakKey = `user:${username}:streak`;
          await redis.incrBy(streakKey, 1);
          await redis.set(lastDayKey, todayStr);
      }
    }

    return c.json<SubmitScoreResponse>({ status: 'success' });
  } catch (error) {
    console.error('Submit Score Error:', error);
    return c.json<SubmitScoreResponse>({ status: 'error', message: 'Failed to submit score' });
  }
});
