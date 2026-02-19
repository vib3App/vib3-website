export interface LiveBattle {
  id: string;
  streamId: string;
  status: 'pending' | 'active' | 'voting' | 'completed';
  participant1: BattleParticipant;
  participant2: BattleParticipant;
  duration: number;
  startedAt?: string;
  endedAt?: string;
  winnerId?: string;
}

export interface BattleParticipant {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  giftValue: number;
}

export interface BattleVote {
  odience: string;
  odientId: string;
  participantId: string;
}
