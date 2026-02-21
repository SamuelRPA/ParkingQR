import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  Dimensions, Platform, StatusBar, Animated, Pressable, Image 
} from 'react-native';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const MAX_WIDTH = 1200;

const COLORS = {
  primary: '#0055FF',
  dark: '#1E293B',
  success: '#10B981',
  warning: '#F59E0B',
  white: '#FFFFFF',
  bgLight: '#F8FAFC',
  border: '#E2E8F0',
  text: '#475569',
  iconBg: '#F1F5F9'
};

// --- COMPONENTE DE TARJETA CON HOVER ---
const HoverCard = ({ children, style }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(0)).current;

  const handleIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.02, friction: 7, useNativeDriver: true }),
      Animated.timing(lift, { toValue: -10, duration: 200, useNativeDriver: true })
    ]).start();
  };

  const handleOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 200, useNativeDriver: true })
    ]).start();
  };

  return (
    <Pressable 
      onHoverIn={isWeb ? handleIn : undefined} 
      onHoverOut={isWeb ? handleOut : undefined}
      style={{ flex: 1 }}
    >
      <Animated.View style={[style, { 
        transform: [{ scale }, { translateY: lift }],
        shadowOpacity: lift.interpolate({ inputRange: [-10, 0], outputRange: [0.1, 0.03] }) 
      }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function LandingScreen({ onStart }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* --- HERO SECTION --- */}
        <View style={styles.heroSection}>
          <Animated.View style={[styles.maxWidth, styles.heroContent, { opacity: fadeAnim }]}>
            <View style={styles.heroTextSide}>
              <View style={styles.pill}><Text style={styles.pillText}>🚀 QR-PARK LIVE</Text></View>
              <Text style={styles.heroTitle}>Cada plaza de parqueo{"\n"}<Text style={{color: COLORS.primary}}>ahora es inteligente.</Text></Text>
              <Text style={styles.heroSubtitle}>Digitalizamos cada espacio individualmente con códigos QR únicos. Controla la ocupación exacta y tiempos de uso.</Text>
              <TouchableOpacity style={styles.btnMain} onPress={onStart}><Text style={styles.btnMainText}>Empezar a Escanear</Text></TouchableOpacity>
            </View>
            <View style={styles.imageContainer}>
              <Image source={require('../../assets/images/image.png')} style={styles.heroImage} resizeMode="contain" />
            </View>
          </Animated.View>
        </View>

        {/* --- STATS --- */}
        <View style={styles.statsWrapper}>
          <View style={[styles.maxWidth, styles.statsRow]}>
            <StatItem label="Plazas Libres" value="65" color={COLORS.success} />
            <StatItem label="Ocupación" value="35" color={COLORS.warning} />
            <StatItem label="Tiempo Promedio" value="85 min" color={COLORS.primary} />
          </View>
        </View>

        {/* --- SECCIÓN BENEFICIOS (UBI, REPORTE, COSTOS) --- */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>¿POR QUÉ QR-PARK?</Text>
          <View style={[styles.maxWidth, styles.grid]}>
            
            <HoverCard style={styles.benefitCard}>
              <View style={styles.benefitIconContainer}>
                <Image source={require('../../assets/images/ubi.png')} style={styles.benefitIcon} resizeMode="contain" />
              </View>
              <Text style={styles.cardTitle}>Gestión por Celda</Text>
              <Text style={styles.cardDesc}>Sabrás exactamente qué lugar está ocupado y en qué momento fue liberado.</Text>
            </HoverCard>

            <HoverCard style={styles.benefitCard}>
              <View style={styles.benefitIconContainer}>
                <Image source={require('../../assets/images/reporte.png')} style={styles.benefitIcon} resizeMode="contain" />
              </View>
              <Text style={styles.cardTitle}>Reportes MIS</Text>
              <Text style={styles.cardDesc}>Datos precisos de rotación y horas pico para optimizar tu rentabilidad.</Text>
            </HoverCard>

            <HoverCard style={styles.benefitCard}>
              <View style={styles.benefitIconContainer}>
                <Image source={require('../../assets/images/costos.png')} style={styles.benefitIcon} resizeMode="contain" />
              </View>
              <Text style={styles.cardTitle}>Bajo Costo</Text>
              <Text style={styles.cardDesc}>Sin sensores costosos. Un simple QR serializado transforma tu estacionamiento.</Text>
            </HoverCard>

          </View>
        </View>

        {/* --- PASOS DE IMPLEMENTACIÓN (PASO 1 AL 4) --- */}
        <View style={styles.stepsBg}>
          <View style={[styles.maxWidth, { alignItems: 'center' }]}>
            <Text style={styles.sectionLabel}>PASOS DE IMPLEMENTACIÓN</Text>
            <View style={styles.stepsGrid}>
              <StepCard 
                num="1" 
                title="Vinculación Digital" 
                desc="Asignamos un ID único a cada plaza física mediante QR." 
                img={require('../../assets/images/paso1.png')}
              />
              <StepCard 
                num="2" 
                title="Check-in Usuario" 
                desc="El cliente escanea al llegar para marcar ocupación." 
                img={require('../../assets/images/paso2.png')}
              />
              <StepCard 
                num="3" 
                title="Monitoreo MIS" 
                desc="Controla todo el flujo desde tu panel administrativo." 
                img={require('../../assets/images/paso3.png')}
              />
              <StepCard 
                num="4" 
                title="Liberación" 
                desc="El espacio se libera automáticamente al salir." 
                img={require('../../assets/images/paso4.png')}
              />
            </View>
            <TouchableOpacity style={styles.btnContact}><Text style={styles.btnContactText}>Contactar con un experto</Text></TouchableOpacity>
          </View>
        </View>

        {/* --- FOOTER --- */}
        <View style={styles.footer}><Text style={styles.footerText}>© 2026 QR-Park System • Gestión Inteligente</Text></View>
      </ScrollView>
    </View>
  );
}

// --- SUB-COMPONENTES ---
const StatItem = ({ label, value, color }: any) => (
  <View style={styles.statBox}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const StepCard = ({ num, title, desc, img }: any) => (
  <HoverCard style={styles.stepCard}>
    <Image source={img} style={styles.stepImage} resizeMode="cover" />
    <View style={styles.stepContent}>
      <View style={styles.stepBadge}><Text style={styles.stepNum}>{num}</Text></View>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDesc}>{desc}</Text>
    </View>
  </HoverCard>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  maxWidth: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: 20 },
  
  // HERO
  heroSection: { backgroundColor: '#F1F5F9', paddingVertical: 80 },
  heroContent: { flexDirection: isWeb ? 'row' : 'column', alignItems: 'center' },
  heroTextSide: { flex: 1, alignItems: isWeb ? 'flex-start' : 'center' },
  pill: { backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  pillText: { fontSize: 11, fontWeight: '800', color: COLORS.primary },
  heroTitle: { fontSize: isWeb ? 48 : 32, fontWeight: '900', color: COLORS.dark, textAlign: isWeb ? 'left' : 'center' },
  heroSubtitle: { fontSize: 18, color: COLORS.text, marginTop: 20, maxWidth: 500, textAlign: isWeb ? 'left' : 'center' },
  btnMain: { backgroundColor: COLORS.primary, paddingVertical: 18, paddingHorizontal: 35, borderRadius: 12, marginTop: 35 },
  btnMainText: { color: 'white', fontWeight: 'bold' },
  imageContainer: { flex: 1, alignItems: 'center' },
  heroImage: { width: isWeb ? 500 : 300, height: 300 },
  
  // STATS
  statsWrapper: { marginTop: -40, zIndex: 10 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, flexWrap: 'wrap' },
  statBox: { backgroundColor: COLORS.white, width: isWeb ? 250 : '45%', padding: 25, borderRadius: 20, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowRadius: 15, borderWidth: 1, borderColor: COLORS.border },
  statValue: { fontSize: 32, fontWeight: '900' },
  statLabel: { color: '#94A3B8', fontWeight: '700', fontSize: 11, marginTop: 5 },

  // BENEFICIOS
  section: { paddingVertical: 100 },
  sectionLabel: { textAlign: 'center', fontWeight: '900', color: COLORS.primary, letterSpacing: 2, marginBottom: 50, fontSize: 12 },
  grid: { flexDirection: isWeb ? 'row' : 'column', gap: 25 },
  benefitCard: { backgroundColor: COLORS.white, padding: 30, borderRadius: 25, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  benefitIconContainer: { width: 80, height: 80, marginBottom: 20, justifyContent: 'center', alignItems: 'center' },
  benefitIcon: { width: '100%', height: '100%' },
  cardTitle: { fontSize: 19, fontWeight: 'bold', color: COLORS.dark, marginBottom: 10, textAlign: 'center' },
  cardDesc: { color: COLORS.text, lineHeight: 22, fontSize: 14, textAlign: 'center' },

  // PASOS
  stepsBg: { backgroundColor: '#F8FAFC', paddingVertical: 100 },
  stepsGrid: { flexDirection: isWeb ? 'row' : 'column', gap: 20, width: '100%' },
  stepCard: { backgroundColor: COLORS.white, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', marginBottom: isWeb ? 0 : 20 },
  stepImage: { width: '100%', height: 180, backgroundColor: '#EEF2FF' },
  stepContent: { padding: 20 },
  stepBadge: { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  stepNum: { color: 'white', fontWeight: 'bold' },
  stepTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.dark, marginBottom: 8 },
  stepDesc: { color: COLORS.text, fontSize: 13, lineHeight: 18 },

  // OTROS
  btnContact: { backgroundColor: COLORS.dark, paddingVertical: 18, paddingHorizontal: 40, borderRadius: 12, marginTop: 50 },
  btnContactText: { color: 'white', fontWeight: 'bold' },
  footer: { padding: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border },
  footerText: { color: '#94A3B8', fontSize: 12 }
});