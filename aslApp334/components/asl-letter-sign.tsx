import { useEvent, useEventListener } from 'expo';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useMemo } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { usePreferences } from '@/contexts/preferences-context';
import { LETTER_VIDEO_SOURCES, letterImages } from '@/constants/asl-lessons';

export type AslLetterVariant = 'teach' | 'practice';

type Props = {
  letter: string;
  variant: AslLetterVariant;
  style: StyleProp<ViewStyle>;
  /**
   * When false, the letter video plays once (no loop). Defaults to true.
   * Used by Practice follow-along when auto-advance is on.
   */
  loopVideo?: boolean;
  /** Fired when a non-looping letter video reaches the end. */
  onVideoPlayToEnd?: () => void;
};

type LetterVideoProps = {
  videoSource: number;
  playbackRate: number;
  style: StyleProp<ViewStyle>;
  mirror: boolean;
  loopVideo: boolean;
  onPlayToEnd?: () => void;
};

function LetterSignVideo({ videoSource, playbackRate, style, mirror, loopVideo, onPlayToEnd }: LetterVideoProps) {
  const { width, height, boxStyle } = useMemo(() => {
    const f = StyleSheet.flatten(style) as ViewStyle;
    const w = typeof f.width === 'number' ? f.width : 190;
    const h = typeof f.height === 'number' ? f.height : 190;
    return {
      width: w,
      height: h,
      boxStyle: [
        style,
        {
          width: w,
          height: h,
          alignSelf: 'center' as const,
          overflow: 'hidden' as const,
          transform: mirror ? [{ scaleX: -1 }] : undefined,
        },
      ],
    };
  }, [style, mirror]);

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = loopVideo;
    p.muted = true;
    p.preservesPitch = true;
    p.playbackRate = playbackRate;
    if (Platform.OS === 'ios') {
      p.allowsExternalPlayback = false;
    }
  });

  const { status } = useEvent(player, 'statusChange', {
    status: player.status,
  });

  useEffect(() => {
    player.loop = loopVideo;
  }, [player, loopVideo]);

  useEventListener(player, 'playToEnd', () => {
    if (!loopVideo) {
      onPlayToEnd?.();
    }
  });

  useEffect(() => {
    if (status === 'readyToPlay') {
      player.loop = loopVideo;
      player.muted = true;
      player.preservesPitch = true;
      player.playbackRate = playbackRate;
      if (Platform.OS === 'ios') {
        player.allowsExternalPlayback = false;
      }
      player.play();
    }
  }, [status, player, playbackRate, loopVideo]);

  useEffect(() => {
    player.playbackRate = playbackRate;
  }, [player, playbackRate]);

  return (
    <View style={boxStyle}>
      <VideoView
        player={player}
        style={{ width, height }}
        nativeControls={false}
        contentFit="contain"
        allowsFullscreen={false}
        fullscreenOptions={{ enable: false }}
        showsTimecodes={false}
        requiresLinearPlayback
        allowsPictureInPicture={false}
        startsPictureInPictureAutomatically={false}
        pointerEvents="none"
        playsInline
        onFirstFrameRender={() => {
          player.loop = loopVideo;
          player.muted = true;
          player.playbackRate = playbackRate;
          if (Platform.OS === 'ios') {
            player.allowsExternalPlayback = false;
          }
          player.play();
        }}
        {...(Platform.OS === 'android' ? { surfaceType: 'textureView' as const } : {})}
      />
    </View>
  );
}

type LetterImageProps = {
  source: number;
  style: StyleProp<ViewStyle>;
  mirror: boolean;
};

function LetterSignImage({ source, style, mirror }: LetterImageProps) {
  const boxStyle = useMemo(() => {
    const f = StyleSheet.flatten(style) as ViewStyle;
    const w = typeof f.width === 'number' ? f.width : 190;
    const h = typeof f.height === 'number' ? f.height : 190;
    return [
      style,
      {
        width: w,
        height: h,
        alignSelf: 'center' as const,
        transform: mirror ? [{ scaleX: -1 }] : undefined,
      },
    ];
  }, [style, mirror]);

  return (
    <View style={boxStyle}>
      <Image source={source} style={styles.imageFill} contentFit="contain" />
    </View>
  );
}

/**
 * Renders an ASL letter using user preferences (video vs image, speed, handedness mirror).
 */
export function AslLetterSign({ letter, variant: _variant, style, loopVideo = true, onVideoPlayToEnd }: Props) {
  const { preferences } = usePreferences();
  const L = letter.toUpperCase();
  const mirror = preferences.handedness === 'righty';

  if (preferences.letterDisplay === 'video') {
    const src = LETTER_VIDEO_SOURCES[L];
    if (src === undefined) {
      return null;
    }
    return (
      <LetterSignVideo
        key={L}
        videoSource={src}
        playbackRate={preferences.videoSpeed}
        style={style}
        mirror={mirror}
        loopVideo={loopVideo}
        onPlayToEnd={onVideoPlayToEnd}
      />
    );
  }

  const img = letterImages[L];
  if (img === undefined) {
    return null;
  }
  return <LetterSignImage key={L} source={img} style={style} mirror={mirror} />;
}

const styles = StyleSheet.create({
  imageFill: {
    width: '100%',
    height: '100%',
  },
});
