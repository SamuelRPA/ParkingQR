import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Oculta el título superior por defecto
        tabBarStyle: { display: 'none' }, // ¡Esto desaparece la barra de abajo!
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
        }}
      />
    </Tabs>
  );
}
