'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { useAuthStore } from '@/stores/authStore';
import { qaApi } from '@/services/api';
import type { Question } from '@/services/api/qa';
import { logger } from '@/utils/logger';

export default function QAPage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = params.creatorId as string;
  const { isAuthenticated } = useAuthStore();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadQuestions = useCallback(async (pageNum: number, append = false) => {
    try {
      setLoading(true);
      const result = await qaApi.getQuestions(creatorId, pageNum);
      if (append) {
        setQuestions(prev => [...prev, ...result.questions]);
      } else {
        setQuestions(result.questions);
      }
      setHasMore(result.hasMore);
    } catch (err) {
      logger.error('Failed to load Q&A:', err);
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    loadQuestions(1);
  }, [loadQuestions]);

  const handleSubmit = async () => {
    if (!newQuestion.trim() || !isAuthenticated) return;
    setSubmitting(true);
    try {
      const question = await qaApi.submitQuestion(creatorId, newQuestion.trim());
      if (question) {
        setQuestions(prev => [question, ...prev]);
        setNewQuestion('');
      }
    } catch (err) {
      logger.error('Failed to submit question:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (questionId: string) => {
    const success = await qaApi.likeQuestion(questionId);
    if (success) {
      setQuestions(prev => prev.map(q =>
        q.id === questionId
          ? { ...q, likesCount: q.isLiked ? q.likesCount - 1 : q.likesCount + 1, isLiked: !q.isLiked }
          : q
      ));
    }
  };

  const handleLikeAnswer = async (questionId: string, answerId: string) => {
    const success = await qaApi.likeAnswer(answerId);
    if (success) {
      setQuestions(prev => prev.map(q =>
        q.id === questionId && q.answer
          ? { ...q, answer: { ...q.answer, likesCount: q.answer.isLiked ? q.answer.likesCount - 1 : q.answer.likesCount + 1, isLiked: !q.answer.isLiked } }
          : q
      ));
    }
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadQuestions(next, true);
  };

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        <header className="sticky top-0 z-40 glass-heavy mx-4 rounded-2xl mb-4">
          <div className="flex items-center gap-3 px-4 h-14">
            <button onClick={() => router.back()} className="text-white/50 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white">Q&A</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4">
          {/* Submit question */}
          {isAuthenticated && (
            <div className="glass-card rounded-2xl p-4 mb-6">
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask a question..."
                maxLength={500}
                rows={3}
                className="w-full bg-white/10 text-white placeholder:text-white/40 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-purple-500/50 resize-none mb-3 transition"
              />
              <div className="flex items-center justify-between">
                <span className="text-white/30 text-xs">{newQuestion.length}/500</span>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !newQuestion.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
                >
                  {submitting ? 'Submitting...' : 'Ask'}
                </button>
              </div>
            </div>
          )}

          {/* Questions list */}
          {loading && questions.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-white/50">No questions yet. Be the first to ask!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  onLike={() => handleLike(q.id)}
                  onLikeAnswer={q.answer ? () => handleLikeAnswer(q.id, q.answer!.id) : undefined}
                />
              ))}
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="w-full py-3 text-purple-400 text-sm font-medium hover:text-purple-300 transition disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function QuestionCard({ question, onLike, onLikeAnswer }: { question: Question; onLike: () => void; onLikeAnswer?: () => void }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-teal-400 p-0.5">
            <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900">
              {question.userAvatar ? (
                <Image src={question.userAvatar} alt={question.username} width={32} height={32} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                  {question.username[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <span className="text-white text-sm font-medium">{question.username}</span>
          <span className="text-white/30 text-xs">{new Date(question.createdAt).toLocaleDateString()}</span>
        </div>
        <p className="text-white text-sm mb-3">{question.text}</p>
        <button onClick={onLike} className="flex items-center gap-1 text-xs transition hover:opacity-80">
          <svg className={`w-4 h-4 ${question.isLiked ? 'text-red-500 fill-red-500' : 'text-white/50'}`} fill={question.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className={question.isLiked ? 'text-red-400' : 'text-white/50'}>{question.likesCount}</span>
        </button>
      </div>

      {question.answer && (
        <div className="bg-purple-500/10 border-t border-purple-500/20 p-4">
          <div className="text-purple-400 text-xs font-medium mb-2">Creator Answer</div>
          {question.answer.text && <p className="text-white text-sm mb-2">{question.answer.text}</p>}
          {question.answer.videoUrl && (
            <video src={question.answer.videoUrl} controls className="w-full rounded-lg max-h-48 mb-2" />
          )}
          {onLikeAnswer && (
            <button onClick={onLikeAnswer} className="flex items-center gap-1 text-xs transition hover:opacity-80">
              <svg className={`w-4 h-4 ${question.answer.isLiked ? 'text-red-500 fill-red-500' : 'text-white/50'}`} fill={question.answer.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className={question.answer.isLiked ? 'text-red-400' : 'text-white/50'}>{question.answer.likesCount}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
