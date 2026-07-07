import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Badge,
  Button,
  Container,
  Divider,
  Group,
  NumberInput,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import { eventTypesApi } from '../api';
import type { EventType } from '../types';

function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | string>(30);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setEventTypes(await eventTypesApi.list());
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleCreateEventType(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Укажите название типа события');
      return;
    }
    const duration = Number(durationMinutes);
    if (!duration || duration <= 0) {
      setError('Длительность должна быть больше 0');
      return;
    }
    if (duration % 15 !== 0) {
      setError('Длительность должна быть кратна 15 минутам');
      return;
    }

    try {
      await eventTypesApi.create({ name: name.trim(), description, durationMinutes: duration });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать тип события');
      return;
    }
    setName('');
    setDescription('');
    setDurationMinutes(30);
    await refresh();
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={2}>Типы событий</Title>
          <Button component={Link} to="/owner" variant="subtle">
            Назад в кабинет
          </Button>
        </Group>

        <Paper withBorder shadow="sm" radius="md" p="lg">
          <Stack gap="lg">
            <Group gap="xs">
              {eventTypes.length === 0 && <Text c="dimmed">Типы событий ещё не созданы</Text>}
              {eventTypes.map((eventType) => (
                <Badge key={eventType.id} size="lg" variant="light">
                  {eventType.name} · {eventType.durationMinutes} мин
                </Badge>
              ))}
            </Group>

            <Divider label="Новый тип события" labelPosition="left" />

            <form onSubmit={handleCreateEventType}>
              <Stack gap="sm">
                <TextInput
                  label="Название"
                  placeholder="Например, консультация"
                  value={name}
                  onChange={(event) => setName(event.currentTarget.value)}
                />
                <Textarea
                  label="Описание"
                  placeholder="О чём эта встреча"
                  value={description}
                  onChange={(event) => setDescription(event.currentTarget.value)}
                />
                <NumberInput
                  label="Длительность (мин.)"
                  description="Кратно 15 минутам"
                  min={15}
                  step={15}
                  value={durationMinutes}
                  onChange={setDurationMinutes}
                />
                {error && (
                  <Text c="red" size="sm">
                    {error}
                  </Text>
                )}
                <Group justify="flex-end">
                  <Button type="submit">Добавить тип события</Button>
                </Group>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}

export default EventTypesPage;
