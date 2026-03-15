const dealTypeStyles: Record<string, string> = {
  acquisition: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'acqui-hire': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ipo: 'bg-green-500/20 text-green-400 border-green-500/30',
  revenue: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  funding: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  portfolio: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const dealTypeLabels: Record<string, string> = {
  acquisition: 'Acquisition',
  'acqui-hire': 'Acqui-hire',
  ipo: 'IPO',
  revenue: 'Revenue',
  funding: 'Funding',
  portfolio: 'Portfolio',
};

export default function DealTypeBadge({ dealType }: { dealType: string }) {
  const style = dealTypeStyles[dealType] || dealTypeStyles.portfolio;
  const label = dealTypeLabels[dealType] || dealType;
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${style}`}>
      {label}
    </span>
  );
}
