import type { Page } from '@playwright/test';

/**
 * Clicks a FullCalendar timeGrid slot by day + hour. FullCalendar's dateClick hit-testing is
 * coordinate-driven rather than exposing one discrete element per (day, hour) cell, so we
 * intersect the day column's bounding box with the hour row's bounding box and click the
 * resulting point (confirmed against the actual rendered DOM: `.fc-timegrid-col[data-date]`
 * spans a whole day column, `.fc-timegrid-slot-lane[data-time]` spans a whole hour row).
 */
export async function clickCalendarSlot(page: Page, date: Date): Promise<void> {
  const isoDate = toLocalIsoDate(date);
  const time = `${String(date.getHours()).padStart(2, '0')}:00:00`;

  const column = page.locator(`.fc-timegrid-col[data-date="${isoDate}"]`);
  const lane = page.locator(`.fc-timegrid-slot-lane[data-time="${time}"]`);

  const [columnBox, laneBox] = await Promise.all([column.boundingBox(), lane.boundingBox()]);
  if (!columnBox || !laneBox) {
    throw new Error(`Could not locate calendar slot for ${isoDate} ${time}`);
  }

  await page.mouse.click(columnBox.x + columnBox.width / 2, laneBox.y + laneBox.height / 2);
}

/** A slot a few days out, at a fixed hour, comfortably inside the calendar's 09:00-20:00 window. */
export function pickSlot(daysFromNow = 3, hour = 14): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
