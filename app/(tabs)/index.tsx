import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

type EstadoParqueo = 'libre' | 'ocupado' | 'mantenimiento';
interface Parqueo { idQR: string; nombre: string; estado: EstadoParqueo; }

// 🔴🔴🔴 CAMBIA ESTA IP POR LA IPv4 DE TU COMPUTADORA 🔴🔴🔴
const API_URL = 'https://parkingqrback.onrender.com';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const SPOT_MARGIN = 8;
const SPOT_WIDTH = (SCREEN_WIDTH - 40 - SPOT_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

const getSpotConfig = (estado: EstadoParqueo) => {
  switch (estado) {
    case 'libre':
      return { bg: '#E8F5E9', border: '#4CAF50', icon: '✅', label: 'LIBRE', textColor: '#2E7D32' };
    case 'ocupado':
      return { bg: '#FFEBEE', border: '#E53935', icon: '🚗', label: 'OCUPADO', textColor: '#C62828' };
    case 'mantenimiento':
      return { bg: '#F5F5F5', border: '#9E9E9E', icon: '🔧', label: 'NO DISP.', textColor: '#616161' };
  }
};

export default function InicioScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [currentView, setCurrentView] = useState<'dashboard' | 'scanner'>('dashboard');
  const [scanned, setScanned] = useState(false);
  const [parqueos, setParqueos] = useState<Parqueo[]>([]);
  const [loading, setLoading] = useState(false);

  const cargarParqueos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/parqueos`);
      const data = await res.json();
      setParqueos(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo conectar a la base de datos.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentView === 'dashboard') {
      cargarParqueos();
    }
  }, [currentView]);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>Necesitamos permiso para la cámara</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Otorgar permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    const parqueoEncontrado = parqueos.find(p => p.idQR === data);

    if (!parqueoEncontrado) {
      Alert.alert('Error', 'Este QR no existe en la Base de Datos.', [{ text: 'OK', onPress: () => setScanned(false) }]);
      return;
    }

    if (parqueoEncontrado.estado === 'mantenimiento') {
      Alert.alert('Mantenimiento', `El ${parqueoEncontrado.nombre} está deshabilitado.`, [{ text: 'OK', onPress: () => setScanned(false) }]);
    } else if (parqueoEncontrado.estado === 'libre') {
      Alert.alert('Parqueo Libre', `¿Deseas ocupar el ${parqueoEncontrado.nombre}?`, [
        { text: 'Cancelar', style: 'cancel', onPress: () => setScanned(false) },
        { text: 'Ocupar', onPress: () => actualizarEstadoBD(parqueoEncontrado.idQR, 'ocupado') },
      ]);
    } else if (parqueoEncontrado.estado === 'ocupado') {
      Alert.alert('Parqueo Ocupado', `¿Deseas liberar el ${parqueoEncontrado.nombre}?`, [
        { text: 'Cancelar', style: 'cancel', onPress: () => setScanned(false) },
        { text: 'Liberar', onPress: () => actualizarEstadoBD(parqueoEncontrado.idQR, 'libre') },
      ]);
    }
  };

  const actualizarEstadoBD = async (idQR: string, nuevoEstado: EstadoParqueo) => {
    try {
      await fetch(`${API_URL}/api/parqueos/${idQR}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      Alert.alert('Éxito', `Registrado en la Base de Datos como: ${nuevoEstado.toUpperCase()}`);
      setScanned(false);
      setCurrentView('dashboard');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar en la base de datos.');
      setScanned(false);
    }
  };

  const libres = parqueos.filter(p => p.estado === 'libre').length;
  const ocupados = parqueos.filter(p => p.estado === 'ocupado').length;

  const renderSpot = ({ item }: { item: Parqueo }) => {
    const config = getSpotConfig(item.estado);
    return (
      <View style={[styles.spotWrapper, { width: SPOT_WIDTH }]}>
        <View style={[styles.spot, { backgroundColor: config.bg, borderColor: config.border }]}>
          <Text style={styles.spotIcon}>{config.icon}</Text>
          <Text style={[styles.spotName, { color: config.textColor }]}>{item.nombre}</Text>
          <View style={[styles.spotBadge, { backgroundColor: config.border }]}>
            <Text style={styles.spotBadgeText}>{config.label}</Text>
          </View>
        </View>
        {/* Líneas de estacionamiento */}
        <View style={styles.parkingLines}>
          <View style={styles.lineLeft} />
          <View style={styles.lineRight} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🅿️ ParkingQR</Text>
        <Text style={styles.headerSubtitle}>Sistema de Estacionamiento</Text>
      </View>

      {/* Nav tabs */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navBtn, currentView === 'dashboard' && styles.navBtnActive]}
          onPress={() => setCurrentView('dashboard')}
        >
          <Text style={[styles.navText, currentView === 'dashboard' && styles.navTextActive]}>
            📊 Monitor
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navBtn, currentView === 'scanner' && styles.navBtnActive]}
          onPress={() => setCurrentView('scanner')}
        >
          <Text style={[styles.navText, currentView === 'scanner' && styles.navTextActive]}>
            📷 Escanear QR
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dashboard */}
      {currentView === 'dashboard' && (
        <View style={styles.content}>
          {/* Stats bar */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.statNumber, { color: '#2E7D32' }]}>{libres}</Text>
              <Text style={[styles.statLabel, { color: '#388E3C' }]}>Libres</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
              <Text style={[styles.statNumber, { color: '#C62828' }]}>{ocupados}</Text>
              <Text style={[styles.statLabel, { color: '#E53935' }]}>Ocupados</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
              <Text style={[styles.statNumber, { color: '#1565C0' }]}>{parqueos.length}</Text>
              <Text style={[styles.statLabel, { color: '#1976D2' }]}>Total</Text>
            </View>
          </View>

          {/* Refresh button */}
          <TouchableOpacity style={styles.refreshBtn} onPress={cargarParqueos}>
            <Text style={styles.refreshBtnText}>↻ Actualizar mapa</Text>
          </TouchableOpacity>

          {/* Parking lot label */}
          <View style={styles.lotHeader}>
            <View style={styles.lotLine} />
            <Text style={styles.lotTitle}>ZONA DE ESTACIONAMIENTO</Text>
            <View style={styles.lotLine} />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0a7ea4" style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.parkingLot}>
              <FlatList
                data={parqueos}
                keyExtractor={item => item.idQR}
                numColumns={NUM_COLUMNS}
                columnWrapperStyle={styles.gridRow}
                contentContainerStyle={styles.gridContent}
                renderItem={renderSpot}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Libre</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E53935' }]} />
              <Text style={styles.legendText}>Ocupado</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#9E9E9E' }]} />
              <Text style={styles.legendText}>No disp.</Text>
            </View>
          </View>
        </View>
      )}

      {/* Scanner */}
      {currentView === 'scanner' && (
        <View style={styles.content}>
          <Text style={styles.scanTitle}>Apunta al código QR del parqueo</Text>
          <View style={styles.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            />
            {/* Scanner overlay */}
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerCornerTL} />
              <View style={styles.scannerCornerTR} />
              <View style={styles.scannerCornerBL} />
              <View style={styles.scannerCornerBR} />
            </View>
          </View>
          <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentView('dashboard')}>
            <Text style={styles.backBtnText}>← Volver al Monitor</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  permissionText: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20 },
  permissionBtn: { backgroundColor: '#0a7ea4', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12 },
  permissionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Header
  header: { backgroundColor: '#0a7ea4', paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  // Nav
  navBar: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 10, borderRadius: 14, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, overflow: 'hidden' },
  navBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  navBtnActive: { borderBottomWidth: 3, borderBottomColor: '#0a7ea4' },
  navText: { fontSize: 15, color: '#999', fontWeight: '600' },
  navTextActive: { color: '#0a7ea4' },

  // Content
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },

  // Stats
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  statCard: { flex: 1, marginHorizontal: 4, paddingVertical: 12, borderRadius: 12, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  statNumber: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },

  // Refresh
  refreshBtn: { backgroundColor: '#0a7ea4', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  refreshBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  // Lot header
  lotHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  lotLine: { flex: 1, height: 2, backgroundColor: '#bbb' },
  lotTitle: { fontSize: 11, fontWeight: 'bold', color: '#888', marginHorizontal: 10, letterSpacing: 1 },

  // Parking lot grid
  parkingLot: { flex: 1, backgroundColor: '#d6d6d6', borderRadius: 14, padding: SPOT_MARGIN, overflow: 'hidden' },
  gridRow: { justifyContent: 'space-evenly' },
  gridContent: { paddingBottom: 10 },

  // Spot
  spotWrapper: { marginBottom: 10, alignItems: 'center' },
  spot: { width: '100%', aspectRatio: 1, borderRadius: 12, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
  spotIcon: { fontSize: 36, marginBottom: 4 },
  spotName: { fontSize: 14, fontWeight: 'bold' },
  spotBadge: { marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  spotBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },

  // Parking lines (decorative)
  parkingLines: { position: 'absolute', bottom: -2, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between' },
  lineLeft: { width: 2, height: 10, backgroundColor: '#fff' },
  lineRight: { width: 2, height: 10, backgroundColor: '#fff' },

  // Legend
  legend: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 10, gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
  legendText: { fontSize: 12, color: '#666' },

  // Scanner
  scanTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#333', marginBottom: 12 },
  cameraContainer: { flex: 1, overflow: 'hidden', borderRadius: 20, marginBottom: 16, minHeight: 400 },
  scannerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scannerCornerTL: { position: 'absolute', top: '25%', left: '15%', width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#0a7ea4', borderTopLeftRadius: 8 },
  scannerCornerTR: { position: 'absolute', top: '25%', right: '15%', width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#0a7ea4', borderTopRightRadius: 8 },
  scannerCornerBL: { position: 'absolute', bottom: '25%', left: '15%', width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#0a7ea4', borderBottomLeftRadius: 8 },
  scannerCornerBR: { position: 'absolute', bottom: '25%', right: '15%', width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#0a7ea4', borderBottomRightRadius: 8 },

  // Back button
  backBtn: { backgroundColor: '#333', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  backBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});