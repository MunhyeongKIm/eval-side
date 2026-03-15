interface ScoreBarProps {
  label: string;
  score: number;
  maxScore: number;
}

function getBarGradient(percentage: number): string {
  if (percentage >= 80) return 'from-green-500 to-emerald-400';
  if (percentage >= 60) return 'from-yellow-500 to-green-500';
  if (percentage >= 40) return 'from-orange-500 to-yellow-500';
  return 'from-red-500 to-orange-500';
}

export default function ScoreBar({ label, score, maxScore }: ScoreBarProps) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const gradient = getBarGradient(percentage);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-400">{score}/{maxScore}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
