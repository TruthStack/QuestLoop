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
      leaderboard
    });
  } catch (error) {
    console.error('API Init Error:', error);
    return c.json<ErrorResponse>({ status: 'error', message: 'Initialization failed' }, 400);
  }
});

api.post('/submit-score', async (c) => {
  const username = await reddit.getCurrentUsername() || 'anonymous';
  const dailySeed = getDailySeed();
  
  const body = await c.req.json() as SubmitScoreRequest;
  
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
    }

    return c.json<SubmitScoreResponse>({ status: 'success' });
  } catch (error) {
    console.error('Submit Score Error:', error);
    return c.json<SubmitScoreResponse>({ status: 'error', message: 'Failed to submit score' });
  }
});
