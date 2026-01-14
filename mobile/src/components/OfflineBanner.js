import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetwork } from '../context/NetworkContext';

export const OfflineBanner = () => {
  const { isConnected } = useNetwork();

  if (isConnected) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>⚠️ Bağlantı Yok - Veriler Cihazda Saklanıyor</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F59E0B', // Orange/Amber
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
