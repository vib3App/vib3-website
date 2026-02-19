'use client';

import { use, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import {
  GauntletHeader, GauntletResults,
  BracketView, RoundDetail, SubmitVideo,
  VotingPanel, SubmissionVote, Leaderboard,
} from '@/components/gauntlets';
import { useGauntlet } from '@/hooks/useGauntlet';
import type { GauntletRound, GauntletMatch } from '@/types/gauntlet';

type TabId = 'bracket' | 'leaderboard';

export default function GauntletDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { gauntlet, rounds, results, isLoading, loadGauntlet, join, leave, vote } = useGauntlet(id);

  const [activeTab, setActiveTab] = useState<TabId>('bracket');
  const [selectedRound, setSelectedRound] = useState<GauntletRound | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<GauntletMatch | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const showSubmitButton = gauntlet?.isJoined && gauntlet?.pendingMatchId && gauntlet?.status === 'active';

  const handleSelectMatch = useCallback((match: GauntletMatch) => {
    if (match.status === 'active') {
      router.push(`/gauntlets/${id}/match/${match.id}`);
    } else {
      setSelectedMatch(match);
    }
  }, [id, router]);

  const handleSubmitComplete = useCallback(() => {
    setShowSubmitModal(false);
    loadGauntlet();
  }, [loadGauntlet]);

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        <div className="max-w-3xl mx-auto px-4">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-48 bg-white/5 rounded-2xl" />
              <div className="h-6 bg-white/10 rounded w-1/2" />
              <div className="h-4 bg-white/5 rounded w-3/4" />
            </div>
          ) : !gauntlet ? (
            <div className="text-center py-20">
              <p className="text-white/40 text-lg">Gauntlet not found</p>
            </div>
          ) : (
            <>
              <GauntletHeader gauntlet={gauntlet} onJoin={join} onLeave={leave} />
              {showSubmitButton && (
                <Link
                  href={`/gauntlets/${id}/submit`}
                  className="block w-full text-center py-3 mb-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition"
                >
                  Submit Video for Current Match
                </Link>
              )}
              {gauntlet.isJoined && gauntlet.status !== 'completed' && (
                <Link
                  href={`/gauntlets/${id}/team`}
                  className="block w-full text-center py-3 mb-4 glass text-white/70 font-medium rounded-xl hover:bg-white/10 transition"
                >
                  Manage Team
                </Link>
              )}

              {/* Tabs: Bracket | Leaderboard */}
              <div className="flex gap-2 mb-6">
                {(['bracket', 'leaderboard'] as TabId[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setSelectedRound(null); setSelectedMatch(null); }}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition ${
                      activeTab === tab
                        ? 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30'
                        : 'glass text-white/50 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab === 'bracket' ? 'Bracket' : 'Leaderboard'}
                  </button>
                ))}
              </div>

              {results && activeTab === 'bracket' && (
                <GauntletResults results={results} gauntletName={gauntlet.title} />
              )}

              {activeTab === 'bracket' && !results && (
                <>
                  {/* Round detail overlay */}
                  {selectedRound && (
                    <div className="mb-4">
                      <RoundDetail
                        round={selectedRound}
                        gauntletId={id}
                        onClose={() => setSelectedRound(null)}
                        onSelectMatch={handleSelectMatch}
                        onSubmitVideo={() => setShowSubmitModal(true)}
                        canSubmit={gauntlet.isJoined && selectedRound.status === 'active'}
                      />
                      {/* Pool vote for round submissions */}
                      {selectedRound.submissions && selectedRound.submissions.length > 0 && (
                        <div className="mt-4">
                          <SubmissionVote
                            submissions={selectedRound.submissions}
                            gauntletId={id}
                            roundNumber={selectedRound.roundNumber}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Match detail with voting panel */}
                  {selectedMatch && !selectedRound && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold text-sm">
                          {selectedMatch.participant1.username} vs {selectedMatch.participant2.username}
                        </h3>
                        <button onClick={() => setSelectedMatch(null)} className="text-white/40 hover:text-white text-sm">
                          Close
                        </button>
                      </div>
                      <VotingPanel
                        match={selectedMatch}
                        gauntletId={id}
                        roundNumber={rounds.find(r => r.matches.some(m => m.id === selectedMatch.id))?.roundNumber || 1}
                      />
                    </div>
                  )}

                  {/* Bracket visualization */}
                  <BracketView
                    rounds={rounds}
                    gauntletId={id}
                    onSelectRound={setSelectedRound}
                    onSelectMatch={handleSelectMatch}
                  />
                </>
              )}

              {activeTab === 'leaderboard' && (
                <Leaderboard gauntletId={id} />
              )}

              {/* Submit video modal */}
              {showSubmitModal && selectedRound && (
                <SubmitVideo
                  gauntletId={id}
                  roundNumber={selectedRound.roundNumber}
                  isOpen={showSubmitModal}
                  onClose={() => setShowSubmitModal(false)}
                  onSubmitted={handleSubmitComplete}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
