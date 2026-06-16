import { io, Socket } from 'socket.io-client';
import { REALTIME_SERVER_URL } from '../constants';
import {
  HabitSyncEvent,
  Habito,
  IotReading,
  NativeLocation,
  RealtimeEvent,
} from '../types';

interface ServerToClientEvents {
  'notification:new': (event: RealtimeEvent) => void;
  'iot:reading': (reading: IotReading) => void;
  'habit:sync': (event: HabitSyncEvent) => void;
}

interface ClientToServerEvents {
  'client:hello': (payload: { userId: number; timestamp: string }) => void;
  'habit:created': (event: HabitSyncEvent) => void;
  'habit:deleted': (event: HabitSyncEvent) => void;
  'location:shared': (payload: {
    userId: number;
    location: NativeLocation;
    timestamp: string;
  }) => void;
}

type RealtimeSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface RealtimeHandlers {
  userId: number;
  onStatusChange?: (connected: boolean) => void;
  onEvent?: (event: RealtimeEvent) => void;
  onIotReading?: (reading: IotReading) => void;
  onHabitSync?: (event: HabitSyncEvent) => void;
}

export interface RealtimeClient {
  disconnect: () => void;
  emitHabitCreated: (habit: Habito) => void;
  emitHabitDeleted: (habitId: number) => void;
  emitLocation: (location: NativeLocation) => void;
}

function buildEvent(type: RealtimeEvent['type'], message: string): RealtimeEvent {
  const timestamp = new Date().toISOString();

  return {
    id: `${type}-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    message,
    timestamp,
  };
}

export function connectRealtime({
  userId,
  onStatusChange,
  onEvent,
  onIotReading,
  onHabitSync,
}: RealtimeHandlers): RealtimeClient {
  const socket: RealtimeSocket = io(REALTIME_SERVER_URL, {
    transports: ['websocket'],
    autoConnect: false,
    reconnectionAttempts: 5,
    timeout: 5000,
  });

  function handleConnect(): void {
    onStatusChange?.(true);
    onEvent?.(buildEvent('connect', 'Conectado ao servidor em tempo real'));
    socket.emit('client:hello', { userId, timestamp: new Date().toISOString() });
  }

  function handleDisconnect(): void {
    onStatusChange?.(false);
    onEvent?.(buildEvent('disconnect', 'Conexão em tempo real encerrada'));
  }

  function handleConnectError(): void {
    onStatusChange?.(false);
    onEvent?.(
      buildEvent(
        'connect_error',
        'Servidor em tempo real indisponível; o app continua com fallback local'
      )
    );
  }

  function handleNotification(event: RealtimeEvent): void {
    onEvent?.(event);
  }

  function handleIotReading(reading: IotReading): void {
    onIotReading?.(reading);
    onEvent?.(buildEvent('iot:reading', `Nova leitura recebida de ${reading.deviceId}`));
  }

  function handleHabitSync(event: HabitSyncEvent): void {
    onHabitSync?.(event);
    onEvent?.(buildEvent('habit:sync', 'Lista de hábitos sincronizada'));
  }

  socket.on('connect', handleConnect);
  socket.on('disconnect', handleDisconnect);
  socket.on('connect_error', handleConnectError);
  socket.on('notification:new', handleNotification);
  socket.on('iot:reading', handleIotReading);
  socket.on('habit:sync', handleHabitSync);
  socket.connect();

  return {
    disconnect: () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('notification:new', handleNotification);
      socket.off('iot:reading', handleIotReading);
      socket.off('habit:sync', handleHabitSync);
      socket.disconnect();
    },
    emitHabitCreated: (habit: Habito) => {
      socket.emit('habit:created', {
        action: 'created',
        userId,
        habit,
        timestamp: new Date().toISOString(),
      });
    },
    emitHabitDeleted: (habitId: number) => {
      socket.emit('habit:deleted', {
        action: 'deleted',
        userId,
        habitId,
        timestamp: new Date().toISOString(),
      });
    },
    emitLocation: (location: NativeLocation) => {
      socket.emit('location:shared', {
        userId,
        location,
        timestamp: new Date().toISOString(),
      });
      onEvent?.(buildEvent('location:shared', 'Localização enviada ao servidor'));
    },
  };
}
