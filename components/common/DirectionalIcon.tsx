import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { isRTL } from '@/lib/localization/i18n';

type IoniconName = keyof typeof Ionicons.glyphMap;

/** Directional icons that must mirror in RTL. Non-directional icons are unaffected. */
const RTL_MIRROR: Partial<Record<IoniconName, IoniconName>> = {
  'chevron-forward': 'chevron-back',
  'chevron-back': 'chevron-forward',
  'arrow-forward': 'arrow-back',
  'arrow-back': 'arrow-forward',
  'chevron-forward-outline': 'chevron-back-outline',
  'chevron-back-outline': 'chevron-forward-outline',
  'arrow-forward-outline': 'arrow-back-outline',
  'arrow-back-outline': 'arrow-forward-outline',
  'return-up-forward': 'return-up-back',
  'return-up-back': 'return-up-forward',
};

interface DirectionalIconProps {
  name: IoniconName;
  size?: number;
  color?: string;
}

/**
 * Renders an Ionicons icon, automatically mirroring directional icons
 * (chevrons, arrows) when the app is in RTL (Hebrew) mode.
 */
export function DirectionalIcon({ name, size = 16, color }: DirectionalIconProps) {
  const { i18n } = useTranslation();
  const resolved = isRTL(i18n.language) ? (RTL_MIRROR[name] ?? name) : name;
  return <Ionicons name={resolved} size={size} color={color} />;
}
