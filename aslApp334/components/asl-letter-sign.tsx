import { useEvent } from 'expo';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useMemo } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { LETTER_A_VIDEO, letterImages, practiceLetterImages } from '@/constants/asl-lessons';

export type AslLetterVariant = 'teach' | 'practice';

type Props = {
  letter: string;
  variant: AslLetterVariant;
  style: StyleProp<ViewStyle>;
};

function LetterAVideo({ style }: { style: StyleProp<ViewStyle> }) {
  const { width, height, boxStyle } = useMemo(() => {
    const f = StyleSheet.flatten(style) as ViewStyle;
    const w = typeof f.width === 'number' ? f.width : 190;
    const h = typeof f.height === 'number' ? f.height : 190;
    return {
      width: w,
      height: h,
      boxStyle: [style, { width: w, height: h, alignSelf: 'center' as const }],
    };
  }, [style]);

  const player = useVideoPlayer(LETTER_A_VIDEO, (p) => {
    p.loop = true;
    p.muted = true;
  });

  const { status } = useEvent(player, 'statusChange', {
    status: player.status,
  });

  useEffect(() => {
    if (status === 'readyToPlay') {
      player.loop = true;
      player.muted = true;
      player.play();
    }
  }, [status, player]);

  return (
    <View style={boxStyle}>
      <VideoView
        player={player}
        style={{ width, height }}
        nativeControls={false}
        contentFit="contain"
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        onFirstFrameRender={() => {
          player.loop = true;
          player.muted = true;
          player.play();
        }}
        {...(Platform.OS === 'android' ? { surfaceType: 'textureView' as const } : {})}
      />
    </View>
  );
}

/**
 * Renders the ASL graphic for a letter; letter A uses a looping bundled video instead of PNGs.
 */
export function AslLetterSign({ letter, variant, style }: Props) {
  const L = letter.toUpperCase();
  if (L === 'A') {
    return <LetterAVideo style={style} />;
  }
  const map = variant === 'teach' ? letterImages : practiceLetterImages;
  const source = map[L];
  if (!source) {
    return null;
  }
  return (
    <View style={style}>
      <Image source={source} style={styles.imageFill} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  imageFill: {
    width: '100%',
    height: '100%',
  },
});
