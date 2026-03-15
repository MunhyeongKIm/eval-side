interface ScoreBarProps {
  label: string;
  score: number;
  maxScore: number;
}

function getBarColor(percentage: number): { gradient: string; bg: string } {
  if (percentage >= 80) return { gradient: 'from-green-500 to-emerald-400', bg: 'bg-green-500/10' };
  if (percentage >= 60) return { gradient: 'from-yellow-500 to-green-500', bg: 'bg-yellow-500/10' };
  if (percentage >= 40) return { gradient: 'from-orange-500 to-yellow-500', bg: 'bg-orange-500/10' };
  return { gradient: 'from-red-500 to-orange-500', bg: 'bg-red-500/10' };
}

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-400';
  if (percentage >= 60) return 'text-yellow-400';
  if (percentage >= 40) return 'text-orange-400';
  return 'text-red-400';
}

export default function ScoreBar({ label, score, maxScore }: ScoreBarProps) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const { gradient } = getBarColor(percentage);
  const scoreColor = getScoreColor(percentage);

  return (
    <div className="group space-y-1.5">
      <div className="flex justify-between items-baseline text-sm">
        <span className="text-gray-400 group-hover:text-gray-300 transition text-xs">{label}</span>
        <span className={`font-medium text-xs tabular-nums ${scoreColor}`}>
          {score}<span className="text-gray-600">/{maxScore}</span>
        </span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
