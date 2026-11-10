// src\worker\pacing.ts
import type { Page } from 'playwright';

export interface DelayRange {
  min: number;
  max: number;
}

/** Waits `ms` milliseconds. */
export const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Random integer in [min, max]. */
const randomBetween = (min: number, max: number): number => Math.floor(min + Math.random() * (max - min + 1));

/** Waits a random time within the range — human-like pacing between actions. */
export const randomDelay = ({ min, max }: DelayRange): Promise<void> => sleep(randomBetween(min, max));

/** Scrolls down the page in a few uneven steps, like a person skimming results. */
export const humanScroll = async (page: Page): Promise<void> => {
  const steps = randomBetween(3, 6);
  for (let i = 0; i < steps; i += 1) {
    await page.mouse.wheel(0, randomBetween(300, 700));
    await sleep(randomBetween(250, 900));
  }
};
