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
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div id="phaser-game" ref={gameContainerRef} className="w-[400px] h-[600px] shadow-2xl border-4 border-[#ff4500] rounded-lg overflow-hidden" />

      <div className="mt-6 w-[400px] bg-[#1a1a1b] rounded-lg p-4 border border-[#343536]">
        <h2 className="text-[#ff4500] font-bold mb-3 uppercase tracking-wider text-center">Daily Leaderboard</h2>
        <div className="space-y-2">
          {initData.leaderboard.length > 0 ? (
            initData.leaderboard.map((entry, i) => (
              <div key={i} className="flex justify-between text-gray-300 text-sm">
                <span>{i + 1}. {entry.username}</span>
                <span className="font-mono text-[#ff4500]">{entry.score} pts</span>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center text-xs italic">No entries yet today. Be the first!</div>
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
