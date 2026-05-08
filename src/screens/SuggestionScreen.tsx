import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getSugestao } from '../services/api';
import Loading from '../components/Loading';

type SuggestionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Suggestion'>;
type SuggestionScreenRouteProp = RouteProp<RootStackParamList, 'Suggestion'>;

interface Props {
  navigation: SuggestionScreenNavigationProp;
  route: SuggestionScreenRouteProp;
}

/**
 * Tela responsável por exibir uma sugestão de hábito saudável. Ela
 * consome o endpoint /api/sugestoes/habito por meio da camada de
 * serviço da API e exibe feedback claro de carregamento, erro ou
 * sucesso.
 */
export default function SuggestionScreen({ navigation }: Props): JSX.Element {
  const [sugestao, setSugestao] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSugestao();
  }, []);

  async function loadSugestao(): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const resposta = await getSugestao();
      setSugestao(resposta);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar sugestão';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        style={styles.image}
        source={{
          uri: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
        }}
      />

      <View style={styles.card}>
        <Text style={styles.title}>Sugestão de bem-estar</Text>
        <Text style={styles.subtitle}>
          Use esta sugestão como ponto de partida para criar um hábito simples e sustentável.
        </Text>

        {loading ? (
          <Loading />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <Text style={styles.suggestion}>{sugestao}</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={loadSugestao} disabled={loading}>
          <Text style={styles.buttonText}>Buscar nova sugestão</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9F9F9',
    padding: 16,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: '#E5E5E5',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    lineHeight: 21,
    marginBottom: 20,
  },
  suggestion: {
    fontSize: 18,
    color: '#222',
    lineHeight: 26,
    backgroundColor: '#F2F8FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  error: {
    color: '#FF3B30',
    fontSize: 15,
    marginBottom: 20,
  },
  button: {
    height: 46,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});
