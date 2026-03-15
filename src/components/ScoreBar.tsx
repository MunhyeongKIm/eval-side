interface ScoreBarProps {
  label: string;
  score: number;
  maxScore: number;
}

export default function ScoreBar({ label, score, maxScore }: ScoreBarProps) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const color =
    percentage >= 80 ? 'bg-green-500' :
    percentage >= 60 ? 'bg-yellow-500' :
    percentage >= 40 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-400">{score}/{maxScore}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
