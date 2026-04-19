interface ScoreInput {
  correct: boolean;
  attempts: number;
  timeSeconds: number;
}

export function calculatePhaseScore(input: ScoreInput): number {
  if (!input.correct) {
    return 0;
  }

  const base = 100;
  const timeBonus = Math.max(0, 50 - Math.floor(input.timeSeconds / 2));
  const firstAttemptBonus = input.attempts === 1 ? 25 : 0;
  const penalties = Math.max(0, input.attempts - 1) * 10;
  return Math.max(0, base + timeBonus + firstAttemptBonus - penalties);
}
