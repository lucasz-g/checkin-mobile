import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import HabitsScreen from '../screens/HabitsScreen';
import SuggestionScreen from '../screens/SuggestionScreen';
import MonitoringScreen from '../screens/MonitoringScreen';

// Define a lista de parâmetros de cada tela da pilha. Ao especificar
// os parâmetros explicitamente, erros de navegação são capturados em
// tempo de compilação quando um componente tenta acessar parâmetros
// que não existem.
export type RootStackParamList = {
  Login: undefined;
  Home: { userId: number } | undefined;
  Habits: { userId: number };
  Suggestion: undefined;
  Monitoring: { userId: number };
};

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Envolve as telas da aplicação em um NavigationContainer. O
 * navegador em pilha é configurado com as telas de login, início,
 * hábitos e sugestão.
 */
export default function AppNavigator(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Início' }}
        />
        <Stack.Screen
          name="Habits"
          component={HabitsScreen}
          options={{ title: 'Hábitos' }}
        />
        <Stack.Screen
          name="Suggestion"
          component={SuggestionScreen}
          options={{ title: 'Sugestão' }}
        />
        <Stack.Screen
          name="Monitoring"
          component={MonitoringScreen}
          options={{ title: 'Monitoramento' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
