import { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { isRTL } from '@/lib/localization/i18n';

export function DirectionProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const rtl = isRTL(i18n.language);

  return (
    <View style={[styles.root, { direction: rtl ? 'rtl' : 'ltr' }]} key={i18n.language}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
