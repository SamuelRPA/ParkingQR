import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

type EstadoParqueo = 'libre' | 'ocupado' | 'mantenimiento';
interface Parqueo { idQR: string; nombre: string; estado: EstadoParqueo; }

// 🔴🔴🔴 CAMBIA ESTA IP POR LA IPv4 DE TU COMPUTADORA 🔴🔴🔴
const API_URL = 'http://192.168.0.36:3000/api/parqueos'; 

export default function InicioScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [currentView, setCurrentView] = useState<'dashboard' | 'scanner'>('dashboard');
  const [scanned, setScanned] = useState(false);
  const [parqueos, setParqueos] = useState<Parqueo[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. CARGAR DATOS DESDE MONGODB
  const cargarParqueos = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setParqueos(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo conectar a la base de datos.");
    }
    setLoading(false);
  };

  // Cargar al iniciar y cada vez que entramos al dashboard
  useEffect(() => {
    if (currentView === 'dashboard') {
      cargarParqueos();
    }
  }, [currentView]);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ textAlign: 'center', marginBottom: 10 }}>Necesitamos permiso para la cámara</Text>
        <Button onPress={requestPermission} title="Otorgar permiso" />
      </View>
    );
  }

  // 2. LÓGICA DEL ESCÁNER (Conectada a la BD)
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);

    const parqueoEncontrado = parqueos.find(p => p.idQR === data);

    if (!parqueoEncontrado) {
      Alert.alert("Error", "Este QR no existe en la Base de Datos.", [{ text: "OK", onPress: () => setScanned(false) }]);
      return;
    }

    if (parqueoEncontrado.estado === 'mantenimiento') {
      Alert.alert("Mantenimiento", `El ${parqueoEncontrado.nombre} está deshabilitado.`, [{ text: "OK", onPress: () => setScanned(false) }]);
    } else if (parqueoEncontrado.estado === 'libre') {
      Alert.alert("Parqueo Libre", `¿Deseas ocupar el ${parqueoEncontrado.nombre}?`, [
        { text: "Cancelar", style: "cancel", onPress: () => setScanned(false) },
        { text: "Ocupar", onPress: () => actualizarEstadoBD(parqueoEncontrado.idQR, 'ocupado') }
      ]);
    } else if (parqueoEncontrado.estado === 'ocupado') {
      Alert.alert("Parqueo Ocupado", `¿Deseas liberar el ${parqueoEncontrado.nombre}?`, [
        { text: "Cancelar", style: "cancel", onPress: () => setScanned(false) },
        { text: "Liberar", onPress: () => actualizarEstadoBD(parqueoEncontrado.idQR, 'libre') }
      ]);
    }
  };

  // 3. ACTUALIZAR ESTADO EN MONGODB
  const actualizarEstadoBD = async (idQR: string, nuevoEstado: EstadoParqueo) => {
    try {
      await fetch(`${API_URL}/${idQR}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      Alert.alert("Éxito", `Registrado en la Base de Datos como: ${nuevoEstado.toUpperCase()}`);
      setScanned(false);
      setCurrentView('dashboard'); // Vuelve al inicio y se recarga automáticamente
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar en la base de datos.");
      setScanned(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => setCurrentView('dashboard')}>
          <Text style={styles.navText}>Monitor BD</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => setCurrentView('scanner')}>
          <Text style={styles.navText}>Escanear QR</Text>
        </TouchableOpacity>
      </View>

      {currentView === 'dashboard' && (
        <View style={styles.content}>
          <Text style={styles.title}>Estado en Vivo</Text>
          <Button title="↻ Actualizar" onPress={cargarParqueos} />
          
          {loading ? (
            <ActivityIndicator size="large" color="#0a7ea4" style={{marginTop: 20}} />
          ) : (
            <FlatList
              data={parqueos}
              keyExtractor={item => item.idQR}
              style={{marginTop: 15}}
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
          )}
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
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#333' },
  card: { padding: 20, borderRadius: 10, marginBottom: 15, elevation: 3 },
  cardTitle: { fontSize: 18, color: 'white', fontWeight: 'bold' },
  cardStatus: { fontSize: 14, color: 'white', marginTop: 5 },
  cameraContainer: { flex: 1, overflow: 'hidden', borderRadius: 20, marginBottom: 20, minHeight: 400 },
});