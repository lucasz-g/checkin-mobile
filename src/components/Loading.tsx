import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * Exibe um indicador de carregamento centralizado. Use este componente
 * para dar feedback quando dados estiverem sendo buscados no backend
 * ou quando qualquer outra operação assíncrona estiver em andamento.
 */
export default function Loading(): JSX.Element {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
