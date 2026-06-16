import { IOT_SENSOR_URL, USE_MOCK_API_FALLBACK } from '../constants';
import { IotReading, IotReadingStatus } from '../types';

function getStatus(hydrationPercent: number): IotReadingStatus {
  if (hydrationPercent < 55) {
    return 'critical';
  }

  if (hydrationPercent < 70) {
    return 'warning';
  }

  return 'ok';
}

function buildMockReading(): IotReading {
  const hydrationPercent = Math.floor(60 + Math.random() * 35);
  const temperatureC = Number((24 + Math.random() * 5).toFixed(1));
  const movementCount = Math.floor(1800 + Math.random() * 4200);

  return {
    deviceId: 'simulador-checkin-01',
    hydrationPercent,
    temperatureC,
    movementCount,
    status: getStatus(hydrationPercent),
    timestamp: new Date().toISOString(),
    source: 'mock-mobile',
  };
}

function normalizeReading(data: Partial<IotReading>): IotReading {
  const hydrationPercent = Number(data.hydrationPercent);
  const temperatureC = Number(data.temperatureC);
  const movementCount = Number(data.movementCount);

  if (
    !Number.isFinite(hydrationPercent) ||
    !Number.isFinite(temperatureC) ||
    !Number.isFinite(movementCount)
  ) {
    throw new Error('Payload IoT inválido');
  }

  return {
    deviceId: data.deviceId || 'sensor-desconhecido',
    hydrationPercent,
    temperatureC,
    movementCount,
    status: data.status || getStatus(hydrationPercent),
    timestamp: data.timestamp || new Date().toISOString(),
    source: data.source || 'http',
  };
}

export async function getLatestIotReading(): Promise<IotReading> {
  try {
    const response = await fetch(IOT_SENSOR_URL);

    if (!response.ok) {
      throw new Error('Erro ao carregar dados do sensor IoT');
    }

    const data = (await response.json()) as Partial<IotReading>;
    return normalizeReading(data);
  } catch (err) {
    if (USE_MOCK_API_FALLBACK) {
      return buildMockReading();
    }

    throw err;
  }
}
