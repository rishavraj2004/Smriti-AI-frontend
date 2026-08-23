import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../theme/theme';
import { FamilyMemory } from '../../types/scrapbook';
import { VoiceStoryPlayer } from './VoiceStoryPlayer';
import { scrapbookApi } from '../../api/scrapbookApi';

interface MemoryDetailModalProps {
  memory: FamilyMemory | null;
  visible: boolean;
  onClose: () => void;
  onMemoryDeleted?: () => void;
}

export const MemoryDetailModal: React.FC<MemoryDetailModalProps> = ({
  memory,
  visible,
  onClose,
  onMemoryDeleted,
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [isSlideshowRunning, setIsSlideshowRunning] = useState<boolean>(false);
  const [isVoicePlayingForSlideshow, setIsVoicePlayingForSlideshow] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const slideshowIntervalRef = useRef<any>(null);

  // Reset state when opening a memory
  useEffect(() => {
    if (visible && memory) {
      setCurrentPhotoIndex(0);
      setIsSlideshowRunning(false);
      setIsVoicePlayingForSlideshow(false);
    } else {
      stopSlideshow();
    }
  }, [visible, memory]);

  const photos = memory?.photos && memory.photos.length > 0
    ? memory.photos
    : memory?.coverPhotoUrl
    ? [{ url: memory.coverPhotoUrl, order: 1, caption: memory.title }]
    : [];

  const totalPhotos = photos.length;
  const currentPhoto = photos[currentPhotoIndex] || null;

  // Slideshow timer effect (4.5s per photo)
  useEffect(() => {
    if (isSlideshowRunning && totalPhotos > 1) {
      slideshowIntervalRef.current = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % totalPhotos);
      }, 4500);
    } else {
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
        slideshowIntervalRef.current = null;
      }
    }

    return () => {
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
        slideshowIntervalRef.current = null;
      }
    };
  }, [isSlideshowRunning, totalPhotos]);

  const startSlideshow = () => {
    setIsSlideshowRunning(true);
    // If voice story exists, trigger audio playback continuously without restart
    if (memory?.voice?.url) {
      setIsVoicePlayingForSlideshow(true);
    }
  };

  const stopSlideshow = () => {
    setIsSlideshowRunning(false);
    setIsVoicePlayingForSlideshow(false);
    if (slideshowIntervalRef.current) {
      clearInterval(slideshowIntervalRef.current);
      slideshowIntervalRef.current = null;
    }
  };

  const handleNextPhoto = () => {
    if (totalPhotos <= 1) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % totalPhotos);
  };

  const handlePrevPhoto = () => {
    if (totalPhotos <= 1) return;
    setCurrentPhotoIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  };

  const handleDelete = async () => {
    if (!memory) return;
    try {
      setIsDeleting(true);
      await scrapbookApi.deleteMemory(memory._id || (memory as any).id);
      if (onMemoryDeleted) onMemoryDeleted();
      onClose();
    } catch (err) {
      console.warn('Error deleting memory:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!memory) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <View style={styles.headerLeftGroup}>
              <View style={styles.albumBadge}>
                <Ionicons name="book" size={14} color={COLORS.primaryDark} />
                <Text style={styles.albumBadgeText}>SCRAPBOOK ENTRY</Text>
              </View>
              <Text style={styles.memoryTitle} numberOfLines={2}>
                {memory.title}
              </Text>
            </View>

            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={styles.deleteMemoryBtn}
                activeOpacity={0.7}
                onPress={handleDelete}
                disabled={isDeleting}
              >
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeBtn} activeOpacity={0.7} onPress={onClose}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* LARGE PHOTO VIEWPORT */}
            {currentPhoto && (
              <View style={styles.photoContainer}>
                <View style={styles.photoFrame}>
                  <Image
                    source={{ uri: currentPhoto.url }}
                    style={styles.largePhoto}
                    resizeMode="cover"
                  />

                  {/* Slideshow Running Badge */}
                  {isSlideshowRunning && (
                    <View style={styles.slideshowActiveBadge}>
                      <Ionicons name="play-circle" size={16} color="#FFFFFF" />
                      <Text style={styles.slideshowActiveBadgeText}>SLIDESHOW ACTIVE</Text>
                    </View>
                  )}

                  {/* Left / Right manual overlay buttons */}
                  {totalPhotos > 1 && (
                    <>
                      <TouchableOpacity
                        style={[styles.navArrowBtn, styles.navArrowLeft]}
                        activeOpacity={0.8}
                        onPress={handlePrevPhoto}
                      >
                        <Ionicons name="chevron-back" size={24} color="#0F172A" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.navArrowBtn, styles.navArrowRight]}
                        activeOpacity={0.8}
                        onPress={handleNextPhoto}
                      >
                        <Ionicons name="chevron-forward" size={24} color="#0F172A" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                {/* Photo Pagination & Caption */}
                <View style={styles.photoMetaRow}>
                  <Text style={styles.paginationText}>
                    Photo {currentPhotoIndex + 1} of {totalPhotos}
                  </Text>

                  {Boolean(currentPhoto.caption) && (
                    <Text style={styles.photoCaptionText} numberOfLines={2}>
                      "{currentPhoto.caption}"
                    </Text>
                  )}
                </View>

                {/* Slideshow Control Button */}
                {totalPhotos > 1 && (
                  <View style={styles.slideshowBtnRow}>
                    {isSlideshowRunning ? (
                      <TouchableOpacity
                        style={styles.slideshowStopBtn}
                        activeOpacity={0.85}
                        onPress={stopSlideshow}
                      >
                        <Ionicons name="pause" size={20} color="#FFFFFF" />
                        <Text style={styles.slideshowBtnText}>Pause Slideshow</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.slideshowStartBtn}
                        activeOpacity={0.85}
                        onPress={startSlideshow}
                      >
                        <Ionicons name="play" size={20} color="#FFFFFF" />
                        <Text style={styles.slideshowBtnText}>▶️ Start Photo Slideshow</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* METADATA BADGES (Date, Location, Occasion) */}
            <View style={styles.metadataSection}>
              {Boolean(memory.date) && (
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillEmoji}>📅</Text>
                  <Text style={styles.metaPillText}>{memory.date}</Text>
                </View>
              )}

              {Boolean(memory.location) && (
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillEmoji}>📍</Text>
                  <Text style={styles.metaPillText}>{memory.location}</Text>
                </View>
              )}

              {Boolean(memory.occasion) && (
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillEmoji}>🌸</Text>
                  <Text style={styles.metaPillText}>{memory.occasion}</Text>
                </View>
              )}
            </View>

            {/* STORY NARRATIVE */}
            {Boolean(memory.description) && (
              <View style={styles.storyCard}>
                <Text style={styles.storyHeader}>The Story</Text>
                <Text style={styles.storyBody}>{memory.description}</Text>
              </View>
            )}

            {/* VOICE STORY PLAYER */}
            <View style={styles.voiceSection}>
              <VoiceStoryPlayer
                voiceUrl={memory.voice?.url}
                durationMs={memory.voice?.durationMs}
                isPlayingExternal={isVoicePlayingForSlideshow}
              />
            </View>

            {/* PEOPLE IN THIS MEMORY */}
            {memory.people && memory.people.length > 0 && (
              <View style={styles.peopleSection}>
                <Text style={styles.sectionHeader}>People in This Memory</Text>
                <View style={styles.peopleList}>
                  {memory.people.map((person, idx) => (
                    <View key={idx} style={styles.personCard}>
                      <View style={styles.personAvatar}>
                        <Text style={styles.personAvatarEmoji}>
                          {person.relation?.toLowerCase().includes('mom') || person.relation?.toLowerCase().includes('mother')
                            ? '👩'
                            : person.relation?.toLowerCase().includes('dad') || person.relation?.toLowerCase().includes('father')
                            ? '👨'
                            : person.relation?.toLowerCase().includes('daughter') || person.relation?.toLowerCase().includes('sister')
                            ? '👧'
                            : person.relation?.toLowerCase().includes('son') || person.relation?.toLowerCase().includes('brother')
                            ? '👦'
                            : '❤️'}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.personName}>{person.name}</Text>
                        {Boolean(person.relation) && (
                          <Text style={styles.personRelation}>{person.relation}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FDFBF7',
    borderRadius: 26,
    width: '100%',
    maxWidth: 620,
    maxHeight: '92%',
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#E7DFD3',
    ...SHADOWS.card,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1.5,
    borderBottomColor: '#EFEBE4',
    paddingBottom: 14,
    marginBottom: 16,
  },
  headerLeftGroup: {
    flex: 1,
    marginRight: 10,
  },
  albumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 6,
  },
  albumBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  memoryTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E1B4B',
    lineHeight: 28,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteMemoryBtn: {
    padding: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  scrollBody: {
    paddingBottom: 24,
  },
  photoContainer: {
    width: '100%',
    marginBottom: 16,
  },
  photoFrame: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...SHADOWS.card,
  },
  largePhoto: {
    width: '100%',
    height: 280,
  },
  slideshowActiveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  slideshowActiveBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  navArrowBtn: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  navArrowLeft: {
    left: 10,
  },
  navArrowRight: {
    right: 10,
  },
  photoMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  paginationText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  photoCaptionText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  slideshowBtnRow: {
    marginTop: 10,
  },
  slideshowStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    ...SHADOWS.card,
  },
  slideshowStopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  slideshowBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  metadataSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    ...SHADOWS.card,
  },
  metaPillEmoji: {
    fontSize: 14,
  },
  metaPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  storyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEBE4',
    ...SHADOWS.card,
  },
  storyHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  storyBody: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
  },
  voiceSection: {
    marginBottom: 16,
  },
  peopleSection: {
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  peopleList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  personAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personAvatarEmoji: {
    fontSize: 16,
  },
  personName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  personRelation: {
    fontSize: 11,
    color: '#64748B',
  },
});
