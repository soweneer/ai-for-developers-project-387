const BACKEND_URL = 'http://localhost:5163';
const TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 1_000;

async function globalSetup(): Promise<void> {
  const deadline = Date.now() + TIMEOUT_MS;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BACKEND_URL}/event-types`);
      if (response.ok) {
        return;
      }
    } catch {
      // backend not ready yet, keep polling
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(`Backend at ${BACKEND_URL} did not become ready within ${TIMEOUT_MS}ms`);
}

export default globalSetup;
