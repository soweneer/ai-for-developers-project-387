import { useEffect, useState } from 'react';
import { ActionIcon, Button, Container, Group, Paper, Stack, Table, Text, Title } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { bookingsApi } from '../api';
import type { Booking } from '../types';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function OwnerPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  async function refresh() {
    setBookings(await bookingsApi.listUpcoming());
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <Container size="md" py="xl">
      <Group align="flex-start" gap="md" wrap="nowrap">
        <ActionIcon component={Link} to="/guest" variant="default" size="lg" aria-label="Сменить роль">
          <IconUser size={18} />
        </ActionIcon>

        <Stack gap="xl" style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between">
            <Title order={2}>Кабинет владельца</Title>
            <Button component={Link} to="/owner/event-types" variant="light">
              Типы событий
            </Button>
          </Group>

          <Paper withBorder shadow="sm" radius="md" p="lg">
            <Title order={4} mb="sm">
              Назначенные встречи
            </Title>
            {bookings.length === 0 ? (
              <Text c="dimmed">Пока нет назначенных встреч</Text>
            ) : (
              <Table.ScrollContainer minWidth={500}>
                <Table striped highlightOnHover verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Гость</Table.Th>
                      <Table.Th>Тип события</Table.Th>
                      <Table.Th>Время</Table.Th>
                      <Table.Th>Email</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {bookings.map((booking) => (
                      <Table.Tr key={booking.id}>
                        <Table.Td>{booking.guestName}</Table.Td>
                        <Table.Td>{booking.eventType.name}</Table.Td>
                        <Table.Td>
                          {formatDateTime(booking.startTime)} – {formatDateTime(booking.endTime)}
                        </Table.Td>
                        <Table.Td>{booking.guestEmail}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Paper>
        </Stack>
      </Group>
    </Container>
  );
}

export default OwnerPage;
