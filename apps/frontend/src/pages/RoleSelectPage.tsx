import { Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

function RoleSelectPage() {
  const navigate = useNavigate();

  return (
    <Stack align="center" justify="center" mih="100vh" p="md">
      <Paper withBorder shadow="md" radius="lg" p="xl" maw={420} w="100%">
        <Stack align="center" gap="xl">
          <Stack align="center" gap={4}>
            <Title order={1} ta="center">
              Вы кто?
            </Title>
            <Text c="dimmed">Выберите роль, чтобы продолжить</Text>
          </Stack>
          <Group grow w="100%">
            <Button size="lg" onClick={() => navigate('/owner')}>
              Владелец
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/guest')}>
              Гость
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}

export default RoleSelectPage;
