import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Alert, FlatList, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

// 1. Tipos de TypeScript para nuestra estructura de datos
type EstadoParqueo = 'libre' | 'ocupado' | 'mantenimiento';

interface Parqueo {
  id: string;
  nombre: string;
  estado: EstadoParqueo;
}

export default function InicioScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [currentView, setCurrentView] = useState<'dashboard' | 'scanner'>('dashboard');
  const [scanned, setScanned] = useState(false);

  // 2. Estado inicial (Nuestra base de datos simulada)
  const [parqueos, setParqueos] = useState<Parqueo[]>([
    { id: 'QR-A1', nombre: 'Parqueo A1', estado: 'libre' },
    { id: 'QR-A2', nombre: 'Parqueo A2', estado: 'ocupado' },
    { id: 'QR-A3', nombre: 'Parqueo A3', estado: 'mantenimiento' },
    { id: 'QR-B1', nombre: 'Parqueo B1', estado: 'libre' },
  ]);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ textAlign: 'center', marginBottom: 10 }}>Necesitamos permiso para usar la cámara</Text>
        <Button onPress={requestPermission} title="Otorgar permiso" />
      </View>
    );
  }

  // 3. Lógica del Escáner
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);

    const parqueoEncontrado = parqueos.find(p => p.id === data);

    if (!parqueoEncontrado) {
      Alert.alert("Error", "Este QR no pertenece a un parqueo registrado.", [
        { text: "OK", onPress: () => setScanned(false) }
      ]);
      return;
    }

    if (parqueoEncontrado.estado === 'mantenimiento') {
      Alert.alert("Mantenimiento", `El ${parqueoEncontrado.nombre} está deshabilitado.`, [
        { text: "Entendido", onPress: () => setScanned(false) }
      ]);
    } else if (parqueoEncontrado.estado === 'libre') {
      Alert.alert("Parqueo Libre", `¿Deseas ocupar el ${parqueoEncontrado.nombre}?`, [
        { text: "Cancelar", style: "cancel", onPress: () => setScanned(false) },
        { text: "Ocupar", onPress: () => cambiarEstadoParqueo(parqueoEncontrado.id, 'ocupado') }
      ]);
    } else if (parqueoEncontrado.estado === 'ocupado') {
      Alert.alert("Parqueo Ocupado", `¿Deseas liberar el ${parqueoEncontrado.nombre}?`, [
        { text: "Cancelar", style: "cancel", onPress: () => setScanned(false) },
        { text: "Liberar", onPress: () => cambiarEstadoParqueo(parqueoEncontrado.id, 'libre') }
      ]);
    }
  };

  const cambiarEstadoParqueo = (id: string, nuevoEstado: EstadoParqueo) => {
    setParqueos(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
    setScanned(false);
    setCurrentView('dashboard');
    Alert.alert("Éxito", `El estado se actualizó a: ${nuevoEstado.toUpperCase()}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => setCurrentView('dashboard')}>
          <Text style={styles.navText}>Monitor</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => setCurrentView('scanner')}>
          <Text style={styles.navText}>Escanear QR</Text>
        </TouchableOpacity>
      </View>

      {currentView === 'dashboard' && (
        <View style={styles.content}>
          <Text style={styles.title}>Estado de Parqueos</Text>
          <FlatList
            data={parqueos}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              let colorFondo = '#4CAF50'; 
              if (item.estado === 'ocupado') colorFondo = '#F44336'; 
              if (item.estado === 'mantenimiento') colorFondo = '#9E9E9E'; 

              return (
                <View style={[styles.card, { backgroundColor: colorFondo }]}>
                  <Text style={styles.cardTitle}>{item.nombre}</Text>
                  <Text style={styles.cardStatus}>Estado: {item.estado.toUpperCase()}</Text>
                </View>
              );
            }}
          />
        </View>
      )}

      {currentView === 'scanner' && (
        <View style={styles.content}>
          <Text style={styles.title}>Escanea el código del sitio</Text>
          <View style={styles.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            />
          </View>
          <Button title="Volver al Monitor" onPress={() => setCurrentView('dashboard')} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navBar: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#0a7ea4', padding: 15, paddingTop: 50 },
  navBtn: { padding: 10 },
  navText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  card: { padding: 20, borderRadius: 10, marginBottom: 15, elevation: 3 },
  cardTitle: { fontSize: 18, color: 'white', fontWeight: 'bold' },
  cardStatus: { fontSize: 14, color: 'white', marginTop: 5 },
  cameraContainer: { flex: 1, overflow: 'hidden', borderRadius: 20, marginBottom: 20, minHeight: 400 },
});