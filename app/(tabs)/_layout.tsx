import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { useTheme } from '@/components/common/ThemeProvider';

export default function TabLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('app.name'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t('map.title'),
          tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="species"
        options={{
          title: t('species.title'),
          tabBarIcon: ({ color, size }) => <Ionicons name="fish-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile.title'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
