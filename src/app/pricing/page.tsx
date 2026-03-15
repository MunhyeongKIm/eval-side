import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | EvalSide',
  description: 'Choose a plan that fits your needs. Evaluate your side projects with AI-powered analysis.',
};

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    description: 'Get started with basic project evaluation.',
    cta: 'Get Started',
    ctaHref: '/',
    highlighted: false,
    features: [
      '3 evaluations per month',
      'Basic scoring (6 dimensions)',
      'Comparable case matching',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/mo',
    description: 'For builders who evaluate frequently.',
    cta: 'Start Pro Trial',
    ctaHref: '/',
    highlighted: true,
    badge: 'Most Popular',
    features: [
      'Unlimited evaluations',
      'Detailed AI analysis',
      'Priority API access (20 req/min)',
      'Export reports as PDF',
      'Email support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Tailored for teams and organizations.',
    cta: 'Contact Sales',
    ctaHref: 'mailto:sales@example.com',
    highlighted: false,
    features: [
      'Everything in Pro',
      'Custom evaluation criteria',
      'Team workspace',
      'API integration support',
      'Dedicated account manager',
      'SLA guarantee',
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="space-y-12">
      <section className="text-center pt-8 pb-4 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-white">Simple, transparent pricing</h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Choose a plan that fits your workflow. Upgrade or downgrade at any time.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start animate-fade-in-delay-1">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={[
              'relative flex flex-col rounded-xl border p-7 transition-all',
              plan.highlighted
                ? 'border-blue-500/50 bg-gray-900 glow-blue'
                : 'border-gray-800 bg-gray-900 hover:border-gray-700',
            ].join(' ')}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                {plan.badge}
              </span>
            )}

            <div className="mb-5">
              <h2 className="text-lg font-bold text-white mb-1">{plan.name}</h2>
              <p className="text-gray-500 text-sm">{plan.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-extrabold text-white">{plan.price}</span>
              {plan.period && (
                <span className="text-gray-500 text-sm ml-1">{plan.period}</span>
              )}
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href={plan.ctaHref}
              className={[
                'block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition',
                plan.highlighted
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
              ].join(' ')}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>

      <section className="text-center text-gray-600 text-xs pb-8">
        All plans include access to the public leaderboard and community reports.
      </section>
    </div>
  );
}
