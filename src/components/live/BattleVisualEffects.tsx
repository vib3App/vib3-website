'use client';

import { useEffect, useState, useCallback } from 'react';

export type BattleEvent = 'entrance' | 'fire_border' | 'fireworks' | 'ko' | 'victory' | 'score' | null;

interface BattleVisualEffectsProps {
  event: BattleEvent;
  participant1Name?: string;
  participant2Name?: string;
  winnerId?: string;
  participant1Id?: string;
}

export function BattleVisualEffects({
  event,
  participant1Name = 'Player 1',
  participant2Name = 'Player 2',
  winnerId,
  participant1Id,
}: BattleVisualEffectsProps) {
  const [visible, setVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<BattleEvent>(null);

  useEffect(() => {
    if (event) {
      setCurrentEvent(event);
      setVisible(true);
      const timeout = event === 'ko' || event === 'victory' ? 3000 : 2000;
      const timer = setTimeout(() => setVisible(false), timeout);
      return () => clearTimeout(timer);
    }
  }, [event]);

  if (!visible || !currentEvent) return null;

  return (
    <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
      {currentEvent === 'entrance' && <EntranceAnimation name1={participant1Name} name2={participant2Name} />}
      {currentEvent === 'fire_border' && <FireBorderEffect />}
      {currentEvent === 'fireworks' && <FireworksEffect />}
      {currentEvent === 'score' && <ScoreFlashEffect />}
      {currentEvent === 'ko' && <KOAnimation />}
      {currentEvent === 'victory' && (
        <VictoryLapEffect winnerName={winnerId === participant1Id ? participant1Name : participant2Name} />
      )}
    </div>
  );
}

function EntranceAnimation({ name1, name2 }: { name1: string; name2: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex items-center gap-8 animate-entrance-zoom">
        <div className="text-right animate-slide-in-left">
          <span className="text-4xl font-black text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]">
            {name1}
          </span>
        </div>
        <div className="animate-pulse-fast">
          <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-red-500">
            VS
          </span>
        </div>
        <div className="text-left animate-slide-in-right">
          <span className="text-4xl font-black text-white drop-shadow-[0_0_20px_rgba(20,184,166,0.8)]">
            {name2}
          </span>
        </div>
      </div>
      <style jsx>{`
        @keyframes entrance-zoom { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slide-in-left { 0% { transform: translateX(-200px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        @keyframes slide-in-right { 0% { transform: translateX(200px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-entrance-zoom { animation: entrance-zoom 0.8s ease-out; }
        .animate-slide-in-left { animation: slide-in-left 0.6s ease-out 0.2s both; }
        .animate-slide-in-right { animation: slide-in-right 0.6s ease-out 0.2s both; }
        .animate-pulse-fast { animation: pulse-fast 0.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function FireBorderEffect() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 border-4 border-orange-500 rounded-lg animate-fire-glow" />
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-orange-400 to-red-600 animate-fire-shimmer" />
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-orange-400 to-red-600 animate-fire-shimmer" />
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-red-600 via-orange-400 to-red-600 animate-fire-shimmer" />
      <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-red-600 via-orange-400 to-red-600 animate-fire-shimmer" />
      <style jsx>{`
        @keyframes fire-glow { 0%, 100% { box-shadow: inset 0 0 20px rgba(249,115,22,0.3); } 50% { box-shadow: inset 0 0 40px rgba(249,115,22,0.6); } }
        @keyframes fire-shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
        .animate-fire-glow { animation: fire-glow 1s ease-in-out infinite; }
        .animate-fire-shimmer { animation: fire-shimmer 0.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function FireworksEffect() {
  const sparks = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 60 + 10,
    delay: Math.random() * 0.5,
    color: ['#A855F7', '#14B8A6', '#F59E0B', '#EF4444', '#3B82F6'][i % 5],
  }));

  return (
    <div className="absolute inset-0">
      {sparks.map((s) => (
        <div
          key={s.id}
          className="absolute w-2 h-2 rounded-full animate-firework"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            backgroundColor: s.color,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes firework {
          0% { transform: scale(0); opacity: 1; }
          50% { transform: scale(3); opacity: 0.8; }
          100% { transform: scale(0); opacity: 0; }
        }
        .animate-firework { animation: firework 1s ease-out forwards; }
      `}</style>
    </div>
  );
}

function ScoreFlashEffect() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="animate-score-flash text-6xl font-black text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]">
        +1
      </div>
      <style jsx>{`
        @keyframes score-flash { 0% { transform: scale(0.5) translateY(20px); opacity: 0; } 30% { transform: scale(1.2) translateY(0); opacity: 1; } 100% { transform: scale(1) translateY(-40px); opacity: 0; } }
        .animate-score-flash { animation: score-flash 1s ease-out forwards; }
      `}</style>
    </div>
  );
}

function KOAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
      <div className="animate-ko-slam">
        <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-400 via-red-600 to-red-900 drop-shadow-[0_0_40px_rgba(239,68,68,0.8)]">
          K.O.
        </span>
      </div>
      <style jsx>{`
        @keyframes ko-slam { 0% { transform: scale(5) rotate(-10deg); opacity: 0; } 30% { transform: scale(1) rotate(0deg); opacity: 1; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
        .animate-ko-slam { animation: ko-slam 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
}

function VictoryLapEffect({ winnerName }: { winnerName: string }) {
  const confetti = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1,
    duration: 1.5 + Math.random(),
    color: ['#A855F7', '#14B8A6', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'][i % 6],
    size: 4 + Math.random() * 8,
  }));

  return (
    <div className="absolute inset-0">
      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${c.x}%`,
            top: '-10px',
            width: `${c.size}px`,
            height: `${c.size}px`,
            backgroundColor: c.color,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center animate-victory-appear">
          <div className="text-6xl mb-2">&#x1F3C6;</div>
          <span className="text-3xl font-black text-yellow-400 drop-shadow-lg">
            {winnerName} Wins!
          </span>
        </div>
      </div>
      <style jsx>{`
        @keyframes confetti-fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        @keyframes victory-appear { 0% { transform: scale(0) rotate(-180deg); opacity: 0; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
        .animate-confetti-fall { animation: confetti-fall linear forwards; }
        .animate-victory-appear { animation: victory-appear 0.6s ease-out 0.3s both; }
      `}</style>
    </div>
  );
}
