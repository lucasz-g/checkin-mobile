import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Componente raiz da aplicação mobile. Renderiza a hierarquia de
 * navegação e configura a barra de status. Todas as telas ficam
 * dentro do componente AppNavigator.
 */
export default function App(): JSX.Element {
  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />
    </>
  );
}
