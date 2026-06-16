import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getLatestIotReading } from '../services/iot';
import { connectRealtime, RealtimeClient } from '../services/realtime';
import { IotReading, NativeLocation, RealtimeEvent } from '../types';

type MonitoringScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Monitoring'
>;
type MonitoringScreenRouteProp = RouteProp<RootStackParamList, 'Monitoring'>;

interface Props {
  navigation: MonitoringScreenNavigationProp;
  route: MonitoringScreenRouteProp;
}

export default function MonitoringScreen({ route }: Props): JSX.Element {
  const { userId } = route.params;
  const [reading, setReading] = useState<IotReading | null>(null);
  const [loadingReading, setLoadingReading] = useState<boolean>(false);
  const [readingError, setReadingError] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(false);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [location, setLocation] = useState<NativeLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const realtimeClientRef = useRef<RealtimeClient | null>(null);

  useEffect(() => {
    loadIotReading();

    const client = connectRealtime({
      userId,
      onStatusChange: setRealtimeConnected,
      onEvent: addEvent,
      onIotReading: setReading,
    });

    realtimeClientRef.current = client;

    return () => {
      client.disconnect();
      realtimeClientRef.current = null;
    };
  }, [userId]);

  function addEvent(event: RealtimeEvent): void {
    setEvents((prev) => [event, ...prev].slice(0, 6));
  }

  async function loadIotReading(): Promise<void> {
    setLoadingReading(true);
    setReadingError(null);

    try {
      const latestReading = await getLatestIotReading();
      setReading(latestReading);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar sensor IoT';
      setReadingError(message);
    } finally {
      setLoadingReading(false);
    }
  }

  async function handleShareLocation(): Promise<void> {
    setLocationLoading(true);
    setLocationMessage(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationMessage(
          'Permissão de localização recusada. O monitoramento continua sem coordenadas.'
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const nextLocation: NativeLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp).toISOString(),
      };

      setLocation(nextLocation);
      setLocationMessage('Localização capturada e enviada ao servidor.');
      realtimeClientRef.current?.emitLocation(nextLocation);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao capturar localização';
      setLocationMessage(message);
    } finally {
      setLocationLoading(false);
    }
  }

  function formatDate(value: string): string {
    return new Date(value).toLocaleString('pt-BR');
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Monitoramento Sprint 4</Text>
        <Text style={styles.subtitle}>
          Dados IoT, Socket.IO e localização em uma única tela.
        </Text>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Socket.IO</Text>
          <Text
            style={[
              styles.statusValue,
              realtimeConnected ? styles.onlineText : styles.offlineText,
            ]}
          >
            {realtimeConnected ? 'Conectado' : 'Offline'}
          </Text>
        </View>
        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Sensor</Text>
          <Text style={styles.statusValue}>
            {reading ? reading.deviceId : 'Aguardando'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leitura IoT</Text>
        {loadingReading ? (
          <View style={styles.loadingArea}>
            <ActivityIndicator color="#007AFF" />
            <Text style={styles.loadingText}>Buscando dados do sensor...</Text>
          </View>
        ) : null}
        {readingError ? <Text style={styles.error}>{readingError}</Text> : null}
        {!loadingReading && !reading ? (
          <Text style={styles.emptyText}>Nenhuma leitura recebida ainda.</Text>
        ) : null}
        {reading ? (
          <View style={styles.readingBox}>
            <View style={styles.readingLine}>
              <Text style={styles.readingLabel}>Hidratação</Text>
              <Text style={styles.readingValue}>{reading.hydrationPercent}%</Text>
            </View>
            <View style={styles.readingLine}>
              <Text style={styles.readingLabel}>Temperatura</Text>
              <Text style={styles.readingValue}>{reading.temperatureC} °C</Text>
            </View>
            <View style={styles.readingLine}>
              <Text style={styles.readingLabel}>Movimentos</Text>
              <Text style={styles.readingValue}>{reading.movementCount}</Text>
            </View>
            <View style={styles.readingLine}>
              <Text style={styles.readingLabel}>Status</Text>
              <Text style={[styles.readingValue, styles.statusText]}>
                {reading.status}
              </Text>
            </View>
            <Text style={styles.timestamp}>
              Atualizado em {formatDate(reading.timestamp)} via {reading.source}
            </Text>
          </View>
        ) : null}
        <TouchableOpacity style={styles.primaryButton} onPress={loadIotReading}>
          <Text style={styles.buttonText}>Atualizar sensor HTTP</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API nativa do dispositivo</Text>
        <Text style={styles.sectionDescription}>
          A localização é solicitada em tempo de uso e a recusa é tratada sem
          bloquear o restante do app.
        </Text>
        <TouchableOpacity
          style={[styles.primaryButton, styles.locationButton]}
          onPress={handleShareLocation}
          disabled={locationLoading}
        >
          <Text style={styles.buttonText}>
            {locationLoading ? 'Capturando...' : 'Enviar localização'}
          </Text>
        </TouchableOpacity>
        {locationMessage ? (
          <Text style={styles.permissionText}>{locationMessage}</Text>
        ) : null}
        {location ? (
          <View style={styles.locationBox}>
            <Text style={styles.locationText}>
              Latitude: {location.latitude.toFixed(5)}
            </Text>
            <Text style={styles.locationText}>
              Longitude: {location.longitude.toFixed(5)}
            </Text>
            <Text style={styles.locationText}>
              Precisão: {location.accuracy ?? 'indisponível'} m
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Eventos recentes</Text>
        {events.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum evento recebido ainda.</Text>
        ) : (
          events.map((event) => (
            <View key={event.id} style={styles.eventItem}>
              <Text style={styles.eventType}>{event.type}</Text>
              <Text style={styles.eventMessage}>{event.message}</Text>
              <Text style={styles.timestamp}>{formatDate(event.timestamp)}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    lineHeight: 21,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statusBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 15,
    color: '#222',
    fontWeight: '700',
  },
  onlineText: {
    color: '#34A853',
  },
  offlineText: {
    color: '#777',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#222',
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDescription: {
    color: '#555',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  loadingArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  loadingText: {
    color: '#555',
  },
  error: {
    color: '#FF3B30',
    marginBottom: 8,
  },
  emptyText: {
    color: '#777',
    marginVertical: 8,
  },
  readingBox: {
    marginTop: 4,
  },
  readingLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  readingLabel: {
    color: '#555',
    fontSize: 14,
  },
  readingValue: {
    color: '#222',
    fontSize: 15,
    fontWeight: '700',
  },
  statusText: {
    textTransform: 'uppercase',
  },
  timestamp: {
    color: '#777',
    fontSize: 12,
    marginTop: 6,
  },
  primaryButton: {
    height: 44,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  locationButton: {
    backgroundColor: '#5856D6',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  permissionText: {
    color: '#555',
    marginTop: 10,
    lineHeight: 20,
  },
  locationBox: {
    backgroundColor: '#F4F6F8',
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
  },
  locationText: {
    color: '#333',
    marginBottom: 3,
  },
  eventItem: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e5e5',
    paddingTop: 10,
    marginTop: 10,
  },
  eventType: {
    color: '#5856D6',
    fontWeight: '700',
    marginBottom: 2,
  },
  eventMessage: {
    color: '#333',
    lineHeight: 20,
  },
});
