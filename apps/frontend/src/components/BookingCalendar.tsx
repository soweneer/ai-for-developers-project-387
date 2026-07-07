import { useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateClickArg } from '@fullcalendar/interaction';
import type { EventClickArg, EventContentArg, EventInput } from '@fullcalendar/core';
import ruLocale from '@fullcalendar/core/locales/ru';
import { Modal, Stack, Text, Title } from '@mantine/core';
import type { BusyBooking } from '../types';
import classes from './BookingCalendar.module.css';

interface BookingCalendarProps {
  busyTimes: BusyBooking[];
  durationMinutes: number;
  selectedSlot: string | null;
  onSelectSlot: (startTime: string) => void;
}

function getLastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] || fullName;
}

function formatRange(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const dateLabel = start.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const startLabel = start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const endLabel = end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return `${dateLabel}, ${startLabel} – ${endLabel}`;
}

function BookingCalendar({ busyTimes, durationMinutes, selectedSlot, onSelectSlot }: BookingCalendarProps) {
  const [selectedBooking, setSelectedBooking] = useState<BusyBooking | null>(null);

  const busyIntervals = useMemo(
    () =>
      busyTimes.map((busy) => ({
        start: new Date(busy.startTime).getTime(),
        end: new Date(busy.endTime).getTime(),
      })),
    [busyTimes],
  );

  const events = useMemo<EventInput[]>(() => {
    const items: EventInput[] = busyTimes.map((busy) => ({
      start: busy.startTime,
      end: busy.endTime,
      title: getLastName(busy.guestName),
      backgroundColor: 'var(--mantine-color-gray-4)',
      borderColor: 'var(--mantine-color-gray-4)',
      textColor: 'var(--mantine-color-gray-7)',
      classNames: [classes.booked],
      extendedProps: { booking: busy },
    }));

    if (selectedSlot) {
      const start = new Date(selectedSlot);
      const end = new Date(start.getTime() + durationMinutes * 60_000);
      items.push({
        start: start.toISOString(),
        end: end.toISOString(),
        title: 'Выбрано',
        backgroundColor: 'var(--mantine-color-violet-8)',
        borderColor: 'var(--mantine-color-violet-8)',
        textColor: '#fff',
        classNames: [classes.selected],
      });
    }

    return items;
  }, [busyTimes, selectedSlot, durationMinutes]);

  const initialDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  return (
    <div className={classes.wrapper}>
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridFourteenDay"
        views={{ timeGridFourteenDay: { type: 'timeGrid', duration: { days: 14 } } }}
        initialDate={initialDate}
        headerToolbar={false}
        locale={ruLocale}
        allDaySlot={false}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        slotDuration="01:00:00"
        slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        height="auto"
        events={events}
        eventContent={(arg: EventContentArg) => {
          const booking = arg.event.extendedProps.booking as BusyBooking | undefined;
          if (booking) {
            const eventDurationMinutes =
              arg.event.start && arg.event.end
                ? (arg.event.end.getTime() - arg.event.start.getTime()) / 60_000
                : durationMinutes;
            const sizeClass = eventDurationMinutes <= 15 ? classes.eventLabelShort : classes.eventLabelCentered;
            return <span className={`${classes.eventLabel} ${sizeClass}`}>{arg.event.title}</span>;
          }
          return true;
        }}
        dateClick={(info: DateClickArg) => {
          const start = info.date.getTime();
          const end = start + durationMinutes * 60_000;
          const overlapsBusyTime = busyIntervals.some((busy) => start < busy.end && end > busy.start);
          if (!overlapsBusyTime) {
            onSelectSlot(info.date.toISOString());
          }
        }}
        eventClick={(info: EventClickArg) => {
          const booking = info.event.extendedProps.booking as BusyBooking | undefined;
          if (booking) {
            setSelectedBooking(booking);
          }
        }}
      />

      <Modal opened={selectedBooking !== null} onClose={() => setSelectedBooking(null)} title="Занятое время" centered>
        {selectedBooking && (
          <Stack gap="xs">
            <Title order={4}>{selectedBooking.eventTypeName}</Title>
            <Text size="sm">{formatRange(selectedBooking.startTime, selectedBooking.endTime)}</Text>
            <Text size="sm">
              <Text span fw={500}>
                Участник:
              </Text>{' '}
              {selectedBooking.guestName}
            </Text>
            <Text size="sm">
              <Text span fw={500}>
                Email:
              </Text>{' '}
              {selectedBooking.guestEmail}
            </Text>
          </Stack>
        )}
      </Modal>
    </div>
  );
}

export default BookingCalendar;
