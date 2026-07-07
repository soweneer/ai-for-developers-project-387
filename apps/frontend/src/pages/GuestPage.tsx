import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ActionIcon, Button, Container, Group, Modal, Paper, Stack, Text, Title } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import BookingCalendar from '../components/BookingCalendar';
import FloatingLabelInput from '../components/FloatingLabelInput';
import GradientSegmentedControl from '../components/GradientSegmentedControl';
import { bookingsApi, eventTypesApi } from '../api';
import type { BusyBooking, EventType } from '../types';

function formatSlot(startTime: string, durationMinutes: number): string {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const dateLabel = start.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const startLabel = start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const endLabel = end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return `${dateLabel}, ${startLabel} – ${endLabel}`;
}

function GuestPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [eventTypeId, setEventTypeId] = useState<string | null>(null);
  const [busyTimes, setBusyTimes] = useState<BusyBooking[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmedTime, setConfirmedTime] = useState<string | null>(null);
  const selectedEventType = eventTypes.find((eventType) => eventType.id === eventTypeId);

  useEffect(() => {
    void eventTypesApi.list().then((types) => {
      setEventTypes(types);
      setEventTypeId((current) => current ?? types[0]?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!eventTypeId) {
      setBusyTimes([]);
      return;
    }
    void eventTypesApi.listBusyTimes().then(setBusyTimes);
  }, [eventTypeId]);

  function closeBookingModal() {
    setSelectedSlot(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!eventTypeId || !selectedSlot) {
      setError('Выберите тип события и время встречи');
      return;
    }
    if (!guestName.trim() || !guestEmail.trim()) {
      setError('Укажите имя и email');
      return;
    }

    try {
      const booking = await bookingsApi.create({
        eventTypeId,
        startTime: selectedSlot,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
      });
      setConfirmedTime(booking.startTime);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось назначить встречу');
    }
  }

  if (confirmedTime) {
    return (
      <Stack align="center" justify="center" mih="100vh" p="md">
        <Paper withBorder shadow="md" radius="lg" p="xl" maw={420} w="100%">
          <Stack align="center" gap="md">
            <Title order={3}>Встреча назначена!</Title>
            <Text ta="center">
              Время встречи:{' '}
              {new Date(confirmedTime).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            <Button component={Link} to="/" variant="light">
              Вернуться на главную
            </Button>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  return (
    <Container size="lg" pt="md" pb="xl">
      <Group align="flex-start" gap="md" wrap="nowrap">
        <ActionIcon component={Link} to="/owner" variant="default" size="lg" aria-label="Сменить роль">
          <IconUser size={18} />
        </ActionIcon>

        <Stack gap="lg" style={{ flex: 1, minWidth: 0 }}>
          {eventTypes.length === 0 ? (
            <Text c="dimmed">Владелец ещё не создал ни одного типа события</Text>
          ) : (
            <Paper withBorder shadow="sm" radius="md" p="lg">
              <BookingCalendar
                busyTimes={busyTimes}
                durationMinutes={selectedEventType?.durationMinutes ?? 30}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
              />
            </Paper>
          )}
        </Stack>

        <Modal opened={selectedSlot !== null} onClose={closeBookingModal} title="Новая встреча" centered>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              {selectedSlot && (
                <Text size="sm" c="dimmed">
                  {formatSlot(selectedSlot, selectedEventType?.durationMinutes ?? 30)}
                </Text>
              )}

              <Stack gap={4}>
                <Text fw={500} size="sm">
                  Тип события
                </Text>
                <GradientSegmentedControl
                  fullWidth
                  data={eventTypes.map((eventType) => ({
                    value: eventType.id,
                    label: eventType.name,
                  }))}
                  value={eventTypeId ?? undefined}
                  onChange={setEventTypeId}
                />
                {selectedEventType && (
                  <Text size="xs" c="dimmed">
                    Длительность: {selectedEventType.durationMinutes} мин
                  </Text>
                )}
              </Stack>

              <FloatingLabelInput
                label="Ваше имя"
                placeholder="Иван Иванов"
                value={guestName}
                onChange={(event) => setGuestName(event.currentTarget.value)}
                mt="md"
              />
              <FloatingLabelInput
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={guestEmail}
                onChange={(event) => setGuestEmail(event.currentTarget.value)}
                mt="md"
              />

              {error && (
                <Text c="red" size="sm">
                  {error}
                </Text>
              )}

              <Group justify="flex-end">
                <Button type="submit">Назначить встречу</Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </Group>
    </Container>
  );
}

export default GuestPage;
