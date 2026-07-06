import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTheme } from '@/components/common/ThemeProvider';
import { getFishPreviewHeight } from '@/features/fishRecognition/imagePreview';
import { spacing } from '@/constants/theme';

interface Props {
  uri: string;
  width?: number;
  height?: number;
  horizontalPadding?: number;
}

export function FishImagePreview({ uri, width, height, horizontalPadding = spacing.md }: Props) {
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = windowWidth - horizontalPadding * 2;
  const previewHeight = getFishPreviewHeight(width ?? 3, height ?? 4, containerWidth);

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.background, height: previewHeight },
      ]}
    >
      <Image
        source={{ uri }}
        style={styles.image}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
