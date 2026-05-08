import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Habito } from '../types';

interface HabitoItemProps {
  habito: Habito;
  onDelete?: (id: number) => void;
}

/**
 * Renderiza um único hábito em uma lista. Exibe o nome e a meta e
 * fornece um botão de exclusão. A exclusão é opcional; se onDelete
 * estiver indefinido, o botão não será exibido.
 */
export default function HabitoItem({ habito, onDelete }: HabitoItemProps): JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.title}>{habito.nome}</Text>
        <Text style={styles.meta}>{habito.meta}</Text>
        {habito.descricao ? (
          <Text style={styles.description}>{habito.descricao}</Text>
        ) : null}
      </View>
      {onDelete && (
        <TouchableOpacity onPress={() => onDelete(habito.id)} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Excluir</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: '#ddd',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 4,
  },
  deleteText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
