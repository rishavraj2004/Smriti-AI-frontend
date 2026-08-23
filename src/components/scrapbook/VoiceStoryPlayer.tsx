import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../theme/theme';

interface VoiceStoryPlayerProps {
  voiceUrl?: string;
  durationMs?: number;
  isPlayingExternal?: boolean;
  onPlaybackEnd?: () => void;
  showCardStyle?: boolean;
}

export const VoiceStoryPlayer: React.FC<VoiceStoryPlayerProps> = ({
  voiceUrl,
  durationMs = 0,
  isPlayingExternal,
  onPlaybackEnd,
  showCardStyle = true,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(0);
  const [totalDurationMs, setTotalDurationMs] = useState<number>(durationMs || 0);

  // Cross-platform Audio reference
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Initialize or update audio instance
  useEffect(() => {
    if (!voiceUrl) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    if (Platform.OS === 'web' || typeof Audio !== 'undefined') {
      const audio = new Audio(voiceUrl);
      audioElementRef.current = audio;

      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setTotalDurationMs(Math.round(audio.duration * 1000));
        }
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTimeMs(0);
        if (onPlaybackEnd) onPlaybackEnd();
      };

      audio.onerror = (e) => {
        console.warn('Audio playback error:', e);
        setIsPlaying(false);
      };

      return () => {
        audio.pause();
        audio.src = '';
        audioElementRef.current = null;
      };
    }
  }, [voiceUrl, onPlaybackEnd]);

  // Sync external playing state if controlled by slideshow
  useEffect(() => {
    if (isPlayingExternal !== undefined && voiceUrl) {
      if (isPlayingExternal && !isPlaying) {
        handlePlay();
      } else if (!isPlayingExternal && isPlaying) {
        handlePause();
      }
    }
  }, [isPlayingExternal]);

  // Progress timer for playback
  useEffect(() => {
    if (isPlaying) {
      timerIntervalRef.current = setInterval(() => {
        if (audioElementRef.current) {
          const current = Math.round(audioElementRef.current.currentTime * 1000);
          setCurrentTimeMs(current);
          if (audioElementRef.current.duration && !isNaN(audioElementRef.current.duration)) {
            setTotalDurationMs(Math.round(audioElementRef.current.duration * 1000));
          }
        } else {
          setCurrentTimeMs((prev) => {
            const next = prev + 250;
            if (totalDurationMs > 0 && next >= totalDurationMs) {
              setIsPlaying(false);
              if (onPlaybackEnd) onPlaybackEnd();
              return 0;
            }
            return next;
          });
        }
      }, 250);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPlaying, totalDurationMs, onPlaybackEnd]);

  const handlePlay = () => {
    if (!voiceUrl) return;
    if (audioElementRef.current) {
      audioElementRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Playback play failed:', err);
          // Fallback simulation
          setIsPlaying(true);
        });
    } else {
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setIsPlaying(false);
  };

  const handleRestart = () => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = 0;
      audioElementRef.current.play().catch(console.warn);
    }
    setCurrentTimeMs(0);
    setIsPlaying(true);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPercent = totalDurationMs > 0 ? Math.min(100, (currentTimeMs / totalDurationMs) * 100) : 0;

  if (!voiceUrl) {
    return (
      <View style={[styles.container, showCardStyle && styles.cardContainer, styles.emptyContainer]}>
        <Ionicons name="mic-off-outline" size={24} color="#94A3B8" />
        <Text style={styles.emptyText}>Voice story not added</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, showCardStyle && styles.cardContainer]}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={styles.iconCircle}>
            <Ionicons name="volume-high" size={20} color={COLORS.primaryDark} />
          </View>
          <Text style={styles.titleText}>Voice Story</Text>
        </View>
        <Text style={styles.timeText}>
          {formatTime(currentTimeMs)} / {formatTime(totalDurationMs || 30000)}
        </Text>
      </View>

      {/* Progress Track */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* Controls */}
      <View style={styles.controlsRow}>
        {isPlaying ? (
          <TouchableOpacity style={styles.primaryControlBtn} activeOpacity={0.8} onPress={handlePause}>
            <Ionicons name="pause" size={22} color="#FFFFFF" />
            <Text style={styles.primaryControlBtnText}>Pause Story</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryControlBtn} activeOpacity={0.8} onPress={handlePlay}>
            <Ionicons name="play" size={22} color="#FFFFFF" />
            <Text style={styles.primaryControlBtnText}>
              {currentTimeMs > 0 ? 'Resume Story' : 'Listen to Story'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryControlBtn} activeOpacity={0.8} onPress={handleRestart}>
          <Ionicons name="refresh" size={20} color={COLORS.primaryDark} />
          <Text style={styles.secondaryControlBtnText}>Restart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  cardContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...SHADOWS.card,
  },
  emptyContainer: {
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#CBD5E1',
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryControlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 8,
  },
  primaryControlBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryControlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  secondaryControlBtnText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },
});
