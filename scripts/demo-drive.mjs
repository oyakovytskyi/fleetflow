/**
 * Demo driver that claims/starts a Prague delivery and posts a moving GPS trail.
 * Use with admin live map open at http://localhost:3000/live
 *
 * Usage (from repo root, API must be up):
 *   node scripts/demo-drive.mjs
 */
const API = process.env.API_URL ?? 'http://localhost:8000';

const DRIVER = {
  email: process.env.DEMO_DRIVER_EMAIL ?? 'driver.demo@fleetflow.dev',
  password: process.env.DEMO_DRIVER_PASSWORD ?? 'password123',
  name: 'Demo Driver',
};

const STEPS = Number(process.env.DEMO_STEPS ?? 24);
const INTERVAL_MS = Number(process.env.DEMO_INTERVAL_MS ?? 1500);

async function request(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const detail = data?.detail ?? res.statusText;
    throw new Error(`${method} ${path} → ${res.status}: ${detail}`);
  }
  return data;
}

async function ensureDriver() {
  try {
    return await request('/auth/login', {
      method: 'POST',
      body: { email: DRIVER.email, password: DRIVER.password },
    });
  } catch {
    return request('/auth/register', {
      method: 'POST',
      body: { ...DRIVER, role: 'DRIVER' },
    });
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

async function main() {
  console.log(`API ${API}`);
  const auth = await ensureDriver();
  const token = auth.tokens.accessToken;
  console.log(`Driver ${auth.user.email} (${auth.user.id})`);

  let deliveries = await request('/deliveries', { token });
  let job =
    deliveries.find((d) => d.status === 'IN_PROGRESS' && d.driverId === auth.user.id) ??
    deliveries.find((d) => d.status === 'ASSIGNED' && d.driverId === auth.user.id) ??
    deliveries.find((d) => d.status === 'PENDING');

  if (!job) {
    console.log('No open delivery — create one from admin Deliveries, then re-run.');
    process.exit(1);
  }

  if (job.status === 'PENDING') {
    job = await request(`/deliveries/${job.id}/claim`, { method: 'POST', token });
    console.log(`Claimed ${job.title}`);
  }
  if (job.status === 'ASSIGNED') {
    job = await request(`/deliveries/${job.id}/start`, { method: 'POST', token });
    console.log(`Started ${job.title}`);
  }

  const start = { lat: job.pickupLatitude, lng: job.pickupLongitude };
  const end = { lat: job.destinationLatitude, lng: job.destinationLongitude };

  console.log(`Posting ${STEPS} GPS points along the route…`);
  for (let i = 0; i <= STEPS; i += 1) {
    const t = i / STEPS;
    const lat = lerp(start.lat, end.lat, t);
    const lng = lerp(start.lng, end.lng, t);
    await request('/tracking/location', {
      method: 'POST',
      token,
      body: {
        deliveryId: job.id,
        lat,
        lng,
        accuracy: 12,
        speed: 8,
        heading: 45,
        timestamp: Date.now(),
      },
    });
    process.stdout.write(`  ${i}/${STEPS} (${lat.toFixed(5)}, ${lng.toFixed(5)})\r`);
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }
  console.log('\nDone — check the admin live map for the moving marker + trail.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
