const verdictStyles: Record<string, string> = {
  PASS: 'bg-green-500/20 text-green-400 border-green-500/30',
  CONDITIONAL_PASS: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  NEEDS_WORK: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  FAIL: 'bg-red-500/20 text-red-400 border-red-500/30',
  pending: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  evaluating: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const verdictLabels: Record<string, string> = {
  PASS: 'Pass',
  CONDITIONAL_PASS: 'Conditional Pass',
  NEEDS_WORK: 'Needs Work',
  FAIL: 'Needs Review',
  pending: 'Pending',
  evaluating: 'Evaluating',
  completed: 'Completed',
  failed: 'Failed',
};

export default function Badge({ value }: { value: string }) {
  const style = verdictStyles[value] || verdictStyles.pending;
  const label = verdictLabels[value] || value;
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${style}`}>
      {label}
    </span>
  );
}
