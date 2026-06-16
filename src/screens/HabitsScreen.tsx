import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Habito, HabitSyncEvent } from '../types';
import { getHabitos, createHabito, deleteHabito } from '../services/api';
import { connectRealtime, RealtimeClient } from '../services/realtime';
import HabitoItem from '../components/HabitoItem';
import Loading from '../components/Loading';

type HabitsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Habits'>;
type HabitsScreenRouteProp = RouteProp<RootStackParamList, 'Habits'>;

interface Props {
  navigation: HabitsScreenNavigationProp;
  route: HabitsScreenRouteProp;
}

/**
 * Exibe a lista de hábitos associados a um usuário. Fornece campos
 * para criar um novo hábito e permite excluir hábitos existentes.
 */
export default function HabitsScreen({ route }: Props): JSX.Element {
  const { userId } = route.params;
  const [habitos, setHabitos] = useState<Habito[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nome, setNome] = useState<string>('');
  const [meta, setMeta] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(false);
  const realtimeClientRef = useRef<RealtimeClient | null>(null);

  // Busca os hábitos ao montar a tela.
  useEffect(() => {
    loadHabitos();
  }, []);

  useEffect(() => {
    const client = connectRealtime({
      userId,
      onStatusChange: setRealtimeConnected,
      onHabitSync: handleHabitSync,
    });

    realtimeClientRef.current = client;

    return () => {
      client.disconnect();
      realtimeClientRef.current = null;
    };
  }, [userId]);

  function handleHabitSync(event: HabitSyncEvent): void {
    if (event.userId !== userId) {
      return;
    }

    if (event.action === 'created' && event.habit) {
      const incomingHabit = event.habit;

      setHabitos((prev) => {
        const habitExists = prev.some((habito) => habito.id === incomingHabit.id);

        if (habitExists) {
          return prev.map((habito) =>
            habito.id === incomingHabit.id ? incomingHabit : habito
          );
        }

        return [...prev, incomingHabit];
      });
      return;
    }

    if (event.action === 'deleted' && event.habitId) {
      setHabitos((prev) => prev.filter((habito) => habito.id !== event.habitId));
    }
  }

  async function loadHabitos(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const data = await getHabitos(userId);
      setHabitos(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar hábitos';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(): Promise<void> {
    if (!nome || !meta) {
      setError('Informe nome e meta');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const newHabit = await createHabito(userId, { nome, meta, descricao });
      setHabitos((prev) => [...prev, newHabit]);
      realtimeClientRef.current?.emitHabitCreated(newHabit);
      // Limpa os campos do formulário.
      setNome('');
      setMeta('');
      setDescricao('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar hábito';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number): Promise<void> {
    try {
      await deleteHabito(id);
      setHabitos((prev) => prev.filter((h) => h.id !== id));
      realtimeClientRef.current?.emitHabitDeleted(id);
    } catch (err) {
      // Opcionalmente, trate erros de exclusão de forma silenciosa ou exiba feedback.
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.formTitle}>Adicionar novo hábito</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do hábito"
          placeholderTextColor="#888"
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={styles.input}
          placeholder="Meta"
          placeholderTextColor="#888"
          value={meta}
          onChangeText={setMeta}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descrição (opcional)"
          placeholderTextColor="#888"
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={3}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity
          style={styles.button}
          onPress={handleCreate}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Meus hábitos</Text>
        <Text
          style={[
            styles.realtimeStatus,
            realtimeConnected ? styles.realtimeOnline : styles.realtimeOffline,
          ]}
        >
          Tempo real: {realtimeConnected ? 'conectado' : 'offline'}
        </Text>
        {loading ? (
          <Loading />
        ) : (
          <FlatList
            data={habitos}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <HabitoItem habito={item} onDelete={handleDelete} />
            )}
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>Nenhum hábito cadastrado</Text>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  form: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomColor: '#ddd',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#222',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
    fontSize: 14,
    color: '#222',
  },
  textArea: {
    height: 80,
    paddingTop: 8,
  },
  button: {
    height: 44,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#FF3B30',
    marginVertical: 4,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#222',
  },
  realtimeStatus: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  realtimeOnline: {
    color: '#34A853',
  },
  realtimeOffline: {
    color: '#777',
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 32,
  },
});
