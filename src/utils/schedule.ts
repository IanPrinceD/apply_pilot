// src\utils\schedule.ts

/** Today's occurrence of a local "HH:mm" time, relative to `now`. */
export const todayAt = (time: string, now: Date): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const at = new Date(now);
  at.setHours(hours, minutes, 0, 0);
  return at;
};

/** True once today's scheduled time has passed and no scheduled run happened since then. */
export const isRunDue = (time: string, lastRunAt: Date | null, now: Date): boolean => {
  const scheduled = todayAt(time, now);
  if (now < scheduled) return false;
  return !lastRunAt || lastRunAt < scheduled;
};
