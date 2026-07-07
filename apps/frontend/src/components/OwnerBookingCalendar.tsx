import { useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventDropArg, EventInput } from '@fullcalendar/core';
import ruLocale from '@fullcalendar/core/locales/ru';
import { Alert } from '@mantine/core';
import { bookingsApi } from '../api';
import type { Booking } from '../types';
import classes from './BookingCalendar.module.css';

interface OwnerBookingCalendarProps {
  bookings: Booking[];
  onBookingRescheduled: (updated: Booking) => void;
}

function getLastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] || fullName;
}

function OwnerBookingCalendar({ bookings, onBookingRescheduled }: OwnerBookingCalendarProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dragging = useRef(false);

  const events = useMemo<EventInput[]>(() =>
    bookings.map((booking) => ({
      id: booking.id,
      start: booking.startTime,
      end: booking.endTime,
      title: getLastName(booking.guestName),
      backgroundColor: 'var(--mantine-color-gray-4)',
      borderColor: 'var(--mantine-color-gray-4)',
      textColor: 'var(--mantine-color-gray-7)',
      classNames: [classes.booked],
      extendedProps: { booking },
    })),
    [bookings],
  );

  const initialDate = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  async function handleEventDrop(dropInfo: EventDropArg) {
    if (dragging.current) return;
    dragging.current = true;
    setErrorMessage(null);

    const booking = dropInfo.event.extendedProps.booking as Booking;
    const newStart = dropInfo.event.start;

    if (!newStart) {
      dropInfo.revert();
      dragging.current = false;
      return;
    }

    try {
      const updated = await bookingsApi.reschedule(booking.id, newStart.toISOString());
      onBookingRescheduled(updated);
    } catch (err) {
      dropInfo.revert();
      setErrorMessage(
        err instanceof Error ? err.message : 'Слот недоступен или вне рабочих часов',
      );
    } finally {
      dragging.current = false;
    }
  }

  return (
    <div className={classes.wrapper}>
      {errorMessage && (
        <Alert color="red" title="Не удалось перенести встречу" mb="sm" withCloseButton onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}
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
        editable={true}
        events={events}
        eventDrop={handleEventDrop}
      />
    </div>
  );
}

export default OwnerBookingCalendar;
