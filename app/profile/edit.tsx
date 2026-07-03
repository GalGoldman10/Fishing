import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/common/ThemeProvider';
import { Button } from '@/components/common/Button';
import { useProfileStore } from '@/stores/profileStore';
import { saveProfile } from '@/features/profile/profileService';
import { DEMO_SPOTS } from '@/lib/mock/demoData';
import { ExperienceLevel } from '@/types/fishing';
import { borderRadius, spacing } from '@/constants/theme';

const EXPERIENCE_LEVELS: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];

export default function EditProfileScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const profile = useProfileStore();
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [avatarUri, setAvatarUri] = useState(profile.avatarUri);
  const [experienceLevel, setExperienceLevel] = useState(profile.experienceLevel);
  const [favoriteSpotId, setFavoriteSpotId] = useState(profile.favoriteSpotId);
  const [setup, setSetup] = useState(profile.fishingSetup);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), t('profile.photoPermission'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProfile({
        displayName: displayName.trim(),
        avatarUri,
        experienceLevel,
        favoriteSpotId,
        fishingSetup: setup,
      });
      router.back();
    } catch {
      Alert.alert(t('common.error'), t('profile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable style={styles.avatarBlock} onPress={pickImage}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
            <Ionicons name="person" size={48} color="#fff" />
          </View>
        )}
        <Text style={[styles.changePhoto, { color: colors.primary }]}>{t('profile.changePhoto')}</Text>
      </Pressable>

      <Field label={t('auth.displayName')} colors={colors}>
        <TextInput
          style={inputStyle}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder={t('auth.displayName')}
          placeholderTextColor={colors.textMuted}
        />
      </Field>

      <Field label={t('profile.experience')} colors={colors}>
        <View style={styles.chipRow}>
          {EXPERIENCE_LEVELS.map((level) => (
            <Pressable
              key={level}
              onPress={() => setExperienceLevel(level)}
              style={[
                styles.chip,
                {
                  backgroundColor: experienceLevel === level ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={{ color: experienceLevel === level ? '#fff' : colors.text, fontWeight: '600' }}>
                {t(`profile.${level}`)}
              </Text>
            </Pressable>
          ))}
        </View>
      </Field>

      <Field label={t('profile.favoritePlace')} colors={colors}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.spotScroll}>
          {DEMO_SPOTS.map((spot) => {
            const name = spot.localizedNames?.[i18n.language] ?? spot.name;
            const selected = favoriteSpotId === spot.id;
            return (
              <Pressable
                key={spot.id}
                onPress={() => setFavoriteSpotId(selected ? null : spot.id)}
                style={[
                  styles.spotChip,
                  {
                    backgroundColor: selected ? colors.accentSoft : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={{ color: selected ? colors.primary : colors.text, fontWeight: selected ? '700' : '500' }}
                  numberOfLines={2}
                >
                  {name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Field>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.mySetup')}</Text>

      {(
        [
          ['rod', t('profile.setupRod')],
          ['reel', t('profile.setupReel')],
          ['mainLine', t('profile.setupLine')],
          ['leader', t('profile.setupLeader')],
          ['hooks', t('profile.setupHooks')],
          ['bait', t('profile.setupBait')],
          ['notes', t('profile.setupNotes')],
        ] as const
      ).map(([key, label]) => (
        <Field key={key} label={label} colors={colors}>
          <TextInput
            style={[inputStyle, key === 'notes' && styles.notesInput]}
            value={setup[key]}
            onChangeText={(text) => setSetup((s) => ({ ...s, [key]: text }))}
            placeholder={label}
            placeholderTextColor={colors.textMuted}
            multiline={key === 'notes'}
          />
        </Field>
      ))}

      <View style={styles.actions}>
        <Button title={t('profile.save')} onPress={handleSave} disabled={saving} />
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  children,
  colors,
}: {
  label: string;
  children: React.ReactNode;
  colors: { text: string };
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  avatarBlock: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhoto: { marginTop: spacing.sm, fontWeight: '600' },
  field: { marginBottom: spacing.md },
  label: { fontSize: 15, fontWeight: '600', marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 16,
  },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  spotScroll: { flexGrow: 0 },
  spotChip: {
    width: 140,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginEnd: spacing.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.sm },
  actions: { marginTop: spacing.lg, marginBottom: spacing.xxl },
});
