const DAILY_LIMIT = 100;

interface DailyUsage {
  date: string;
  count: number;
}

let usage: DailyUsage = { date: '', count: 0 };

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function checkDailyLimit(): { allowed: boolean; remaining: number } {
  const today = getToday();
  if (usage.date !== today) {
    usage = { date: today, count: 0 };
  }
  return {
    allowed: usage.count < DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - usage.count),
  };
}

export function recordUsage(): void {
  const today = getToday();
  if (usage.date !== today) {
    usage = { date: today, count: 1 };
  } else {
    usage.count++;
  }
}

export function getUsageStats(): { date: string; count: number; limit: number } {
  const today = getToday();
  if (usage.date !== today) {
    return { date: today, count: 0, limit: DAILY_LIMIT };
  }
  return { date: usage.date, count: usage.count, limit: DAILY_LIMIT };
}
