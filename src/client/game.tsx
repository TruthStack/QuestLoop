import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useEffect, useRef, useState } from 'react';
import { createGameConfig } from './phaser';
import type { InitResponse } from '../shared/api';

export const App = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [initData, setInitData] = useState<InitResponse | null>(null);

  useEffect(() => {
    fetch('/api/init')
      .then(res => res.json())
      .then(data => {
        if (data.type === 'init') {
          setInitData(data);
        }
      })
      .catch(err => console.error('Failed to init', err));
  }, []);

  useEffect(() => {
    if (gameContainerRef.current && !gameRef.current && initData) {
      const config = createGameConfig('phaser-game');
      gameRef.current = new Phaser.Game(config);
      gameRef.current.scene.start('MainScene', {
        completedQuests: initData.completedQuests,
        totalScore: 0
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [initData]);

  if (!initData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-[#ff4500] font-bold">
        LOADING QUEST...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4 font-sans select-none">
      {/* Header with Streak & Countdown */}
      <div className="w-[400px] flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-2 bg-[#1a1a1b] px-3 py-1.5 rounded-full border border-[#343536]">
          <span className="text-xl">🔥</span>
          <span className="text-[#ff4500] font-bold tracking-tight">{initData.streak} DAY STREAK</span>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Next Quest In</div>
          <div className="text-gray-300 font-mono text-sm">
            {Math.floor(initData.nextQuestIn / 3600)}h {Math.floor((initData.nextQuestIn % 3600) / 60)}m
          </div>
        </div>
      </div>

      <div id="phaser-game" ref={gameContainerRef} className="w-[400px] h-[600px] shadow-[0_0_50px_rgba(255,69,0,0.2)] border-4 border-[#ff4500] rounded-2xl overflow-hidden" />

      <div className="mt-6 w-[400px] bg-[#1a1a1b] rounded-2xl p-6 border border-[#343536] shadow-xl">
        <h2 className="text-[#ff4500] font-black mb-4 uppercase tracking-tighter text-xl italic text-center underline decoration-2 underline-offset-4">Subreddit Rankings</h2>
        <div className="space-y-3">
          {initData.leaderboard.length > 0 ? (
            initData.leaderboard.map((entry, i) => (
              <div key={i} className={`flex justify-between items-center p-2 rounded-lg ${i === 0 ? 'bg-[rgba(255,69,0,0.1)] border border-[rgba(255,69,0,0.2)]' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-[#ff4500] text-black' : 'text-gray-500'}`}>
                    {i + 1}
                  </span>
                  <span className={`text-sm tracking-tight ${i === 0 ? 'text-[#ff4500] font-bold' : 'text-gray-300'}`}>
                    u/{entry.username}
                  </span>
                </div>
                <span className="font-mono text-[#ff4500] font-bold">{entry.score} pts</span>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center text-sm py-4 italic">No entries yet today. Be the first!</div>
          )}
        </div>
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
