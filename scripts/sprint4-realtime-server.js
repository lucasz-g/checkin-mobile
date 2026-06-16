const http = require('http');
const { Server } = require('socket.io');

const PORT = Number(process.env.SPRINT4_PORT || 3001);
const CLIENT_ORIGIN = process.env.SPRINT4_CLIENT_ORIGIN || '*';

const server = http.createServer((request, response) => {
  handleHttpRequest(request, response).catch((error) => {
    sendJson(response, 500, {
      message: 'Erro interno no simulador Sprint 4',
      detail: error.message,
    });
  });
});
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
  },
});

function getStatus(hydrationPercent) {
  if (hydrationPercent < 55) {
    return 'critical';
  }

  if (hydrationPercent < 70) {
    return 'warning';
  }

  return 'ok';
}

function buildReading(source = 'socket-simulator') {
  const hydrationPercent = Math.floor(58 + Math.random() * 38);
  const temperatureC = Number((23 + Math.random() * 6).toFixed(1));
  const movementCount = Math.floor(1500 + Math.random() * 5000);

  return {
    deviceId: 'simulador-checkin-01',
    hydrationPercent,
    temperatureC,
    movementCount,
    status: getStatus(hydrationPercent),
    timestamp: new Date().toISOString(),
    source,
  };
}

function buildEvent(type, message) {
  const timestamp = new Date().toISOString();

  return {
    id: `${type}-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    message,
    timestamp,
  };
}

let latestReading = buildReading('http-simulator');

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Origin': CLIENT_ORIGIN,
    'Content-Type': 'application/json',
  });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;

      if (body.length > 1_000_000) {
        reject(new Error('Payload muito grande'));
        request.destroy();
      }
    });

    request.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

async function handleHttpRequest(request, response) {
  const url = new URL(request.url || '/', `http://${request.headers.host}`);

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === 'GET' && url.pathname === '/health') {
    sendJson(response, 200, { status: 'ok', timestamp: new Date().toISOString() });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/iot/latest') {
    sendJson(response, 200, latestReading);
    return;
  }

  if (request.method === 'POST' && url.pathname === '/iot/readings') {
    const payload = await readJsonBody(request);
    latestReading = {
      ...buildReading('http-post'),
      ...payload,
      timestamp: payload.timestamp || new Date().toISOString(),
    };

    io.emit('iot:reading', latestReading);
    sendJson(response, 201, latestReading);
    return;
  }

  sendJson(response, 404, { message: 'Endpoint não encontrado' });
}

io.on('connection', (socket) => {
  socket.emit(
    'notification:new',
    buildEvent('notification:new', 'Cliente conectado ao simulador Sprint 4')
  );
  socket.emit('iot:reading', latestReading);

  socket.on('client:hello', (payload) => {
    socket.emit(
      'notification:new',
      buildEvent('notification:new', `Usuário ${payload.userId} registrado no socket`)
    );
  });

  socket.on('habit:created', (event) => {
    io.emit('habit:sync', event);
  });

  socket.on('habit:deleted', (event) => {
    io.emit('habit:sync', event);
  });

  socket.on('location:shared', (payload) => {
    io.emit(
      'notification:new',
      buildEvent(
        'location:shared',
        `Localização recebida do usuário ${payload.userId}`
      )
    );
  });
});

setInterval(() => {
  latestReading = buildReading();
  io.emit('iot:reading', latestReading);
}, 7000);

server.listen(PORT, () => {
  console.log(`Servidor Sprint 4 em tempo real ativo em http://localhost:${PORT}`);
  console.log(`Endpoint IoT: http://localhost:${PORT}/iot/latest`);
});
