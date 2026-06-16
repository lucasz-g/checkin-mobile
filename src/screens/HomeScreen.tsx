import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { logout } from '../services/api';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
}

/**
 * A tela inicial funciona como ponto de entrada após a autenticação.
 * Permite navegar para a lista de hábitos e para a tela de sugestão,
 * além de fornecer um botão de logout que limpa as credenciais
 * armazenadas.
 */
export default function HomeScreen({ navigation, route }: Props): JSX.Element {
  const userId = route.params?.userId ?? 1;

  async function handleLogout(): Promise<void> {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá!</Text>
      <Text style={styles.subtitle}>Escolha uma opção abaixo:</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Habits', { userId })}
      >
        <Text style={styles.buttonText}>Meus hábitos</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.suggestionButton]}
        onPress={() => navigation.navigate('Suggestion')}
      >
        <Text style={styles.buttonText}>Sugestão de bem-estar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.monitoringButton]}
        onPress={() => navigation.navigate('Monitoring', { userId })}
      >
        <Text style={styles.buttonText}>Monitoramento Sprint 4</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#222',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
  suggestionButton: {
    backgroundColor: '#34A853',
  },
  monitoringButton: {
    backgroundColor: '#5856D6',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
