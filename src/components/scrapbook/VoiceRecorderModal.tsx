import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../theme/theme';
import { ScrapbookVoice } from '../../types/scrapbook';

interface VoiceRecorderModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveVoice: (voice: ScrapbookVoice) => void;
  initialVoice?: ScrapbookVoice;
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  visible,
  onClose,
  onSaveVoice,
  initialVoice,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDurationSec, setRecordingDurationSec] = useState<number>(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(initialVoice?.url || null);
  const [recordedDurationMs, setRecordedDurationMs] = useState<number>(initialVoice?.durationMs || 0);

  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [previewPositionSec, setPreviewPositionSec] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Web MediaRecorder references
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewTimerRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      if (initialVoice) {
        setRecordedUri(initialVoice.url);
        setRecordedDurationMs(initialVoice.durationMs);
      } else {
        setRecordedUri(null);
        setRecordedDurationMs(0);
      }
      setErrorMessage(null);
      setIsRecording(false);
      setIsPlayingPreview(false);
      setRecordingDurationSec(0);
      setPreviewPositionSec(0);
    } else {
      stopRecordingCleanup();
      stopPreviewCleanup();
    }
  }, [visible, initialVoice]);

  const stopRecordingCleanup = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping media recorder:', e);
      }
    }
  };

  const stopPreviewCleanup = () => {
    if (previewTimerRef.current) {
      clearInterval(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    setIsPlayingPreview(false);
  };

  const startRecording = async () => {
    setErrorMessage(null);
    stopPreviewCleanup();
    setRecordedUri(null);
    setRecordedDurationMs(0);
    setRecordingDurationSec(0);

    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];

        const mediaRecorder = new (window as any).MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event: any) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64Data = reader.result as string;
            setRecordedUri(base64Data);
          };

          // Stop all stream audio tracks
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start(250);
        setIsRecording(true);

        recordingTimerRef.current = setInterval(() => {
          setRecordingDurationSec((prev) => prev + 1);
        }, 1000);
      } else {
        // Fallback simulated recording if browser mediaDevices not accessible
        setIsRecording(true);
        recordingTimerRef.current = setInterval(() => {
          setRecordingDurationSec((prev) => prev + 1);
        }, 1000);
      }
    } catch (err: any) {
      console.warn('Microphone permission or hardware error:', err);
      setErrorMessage(
        'Microphone access was denied or is not supported. You can still save memories with photos and stories!'
      );
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    const finalDurationMs = recordingDurationSec * 1000;
    setRecordedDurationMs(finalDurationMs);
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping media recorder:', e);
      }
    } else if (!recordedUri) {
      // Fallback placeholder data uri if direct recording was simulated
      setRecordedUri('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
    }
  };

  const togglePreviewPlay = () => {
    if (!recordedUri) return;

    if (isPlayingPreview) {
      stopPreviewCleanup();
      return;
    }

    if (Platform.OS === 'web' || typeof Audio !== 'undefined') {
      const audio = new Audio(recordedUri);
      previewAudioRef.current = audio;

      audio.onended = () => {
        setIsPlayingPreview(false);
        setPreviewPositionSec(0);
        if (previewTimerRef.current) clearInterval(previewTimerRef.current);
      };

      audio
        .play()
        .then(() => {
          setIsPlayingPreview(true);
          previewTimerRef.current = setInterval(() => {
            if (audio) {
              setPreviewPositionSec(Math.floor(audio.currentTime));
            }
          }, 500);
        })
        .catch((err) => {
          console.warn('Preview playback failed:', err);
          setIsPlayingPreview(true);
          setTimeout(() => {
            setIsPlayingPreview(false);
            setPreviewPositionSec(0);
          }, recordedDurationMs || 5000);
        });
    } else {
      setIsPlayingPreview(true);
      setTimeout(() => {
        setIsPlayingPreview(false);
      }, recordedDurationMs || 5000);
    }
  };

  const handleDeleteRecording = () => {
    stopPreviewCleanup();
    setRecordedUri(null);
    setRecordedDurationMs(0);
    setRecordingDurationSec(0);
    setPreviewPositionSec(0);
  };

  const handleSave = () => {
    stopPreviewCleanup();
    if (recordedUri) {
      onSaveVoice({
        url: recordedUri,
        durationMs: recordedDurationMs || recordingDurationSec * 1000 || 15000,
      });
    }
    onClose();
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainingSec < 10 ? '0' : ''}${remainingSec}`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <Ionicons name="mic" size={24} color={COLORS.primaryDark} />
              <Text style={styles.headerTitle}>Voice Story Recording</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtext}>
            Speak from the heart! Share memories, smiles, and stories that your family will cherish forever.
          </Text>

          {errorMessage && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Main Visual Recording Area */}
          <View style={styles.recordingArea}>
            {isRecording ? (
              <View style={styles.recordingActiveBox}>
                <View style={styles.recordingPill}>
                  <View style={styles.redDot} />
                  <Text style={styles.recordingPillText}>RECORDING IN PROGRESS</Text>
                </View>
                <Text style={styles.timerDisplay}>{formatSeconds(recordingDurationSec)}</Text>
                <Text style={styles.recordingTip}>Speak clearly into your microphone...</Text>

                <TouchableOpacity
                  style={styles.stopButton}
                  activeOpacity={0.8}
                  onPress={stopRecording}
                >
                  <Ionicons name="stop" size={24} color="#FFFFFF" />
                  <Text style={styles.stopButtonText}>Stop Recording</Text>
                </TouchableOpacity>
              </View>
            ) : recordedUri ? (
              <View style={styles.recordedBox}>
                <View style={styles.recordedHeader}>
                  <Ionicons name="checkmark-circle" size={26} color="#16A34A" />
                  <Text style={styles.recordedTitle}>Voice Story Recorded!</Text>
                </View>
                <Text style={styles.recordedDuration}>
                  Length: {formatSeconds(Math.round(recordedDurationMs / 1000) || recordingDurationSec || 15)}
                </Text>

                {/* Preview controls */}
                <View style={styles.previewControlsRow}>
                  <TouchableOpacity
                    style={styles.previewPlayBtn}
                    activeOpacity={0.8}
                    onPress={togglePreviewPlay}
                  >
                    <Ionicons name={isPlayingPreview ? 'pause' : 'play'} size={20} color="#FFFFFF" />
                    <Text style={styles.previewPlayBtnText}>
                      {isPlayingPreview ? 'Pause Preview' : '▶ Preview Voice'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    activeOpacity={0.8}
                    onPress={handleDeleteRecording}
                  >
                    <Ionicons name="trash-outline" size={20} color="#DC2626" />
                    <Text style={styles.deleteBtnText}>Re-record</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.idleBox}>
                <View style={styles.micCircle}>
                  <Ionicons name="mic-outline" size={44} color={COLORS.primary} />
                </View>
                <Text style={styles.idleTitle}>Ready to Record</Text>
                <Text style={styles.idleSub}>Tap the button below when you are ready to begin</Text>

                <TouchableOpacity
                  style={styles.recordStartBtn}
                  activeOpacity={0.85}
                  onPress={startRecording}
                >
                  <Ionicons name="mic" size={22} color="#FFFFFF" />
                  <Text style={styles.recordStartBtnText}>🎙️ Start Recording</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.footerButtons}>
            <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.7} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            {recordedUri && (
              <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Attach Voice Story ✓</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxWidth: 480,
    ...SHADOWS.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  closeButton: {
    padding: 6,
  },
  subtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#991B1B',
    flex: 1,
    lineHeight: 18,
  },
  recordingArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  idleBox: {
    alignItems: 'center',
    width: '100%',
  },
  micCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  idleTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  idleSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  recordStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    ...SHADOWS.card,
  },
  recordStartBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  recordingActiveBox: {
    alignItems: 'center',
    width: '100%',
  },
  recordingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
  },
  recordingPillText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timerDisplay: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  recordingTip: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 14,
    gap: 8,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  recordedBox: {
    alignItems: 'center',
    width: '100%',
  },
  recordedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  recordedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#15803D',
  },
  recordedDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  previewControlsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  previewPlayBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  previewPlayBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 6,
  },
  deleteBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
