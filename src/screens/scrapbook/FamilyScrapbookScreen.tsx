import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../theme/theme';
import { FamilyMemory } from '../../types/scrapbook';
import { scrapbookApi } from '../../api/scrapbookApi';
import { useTranslation } from '../../hooks/useTranslation';
import { MemoryDetailModal } from '../../components/scrapbook/MemoryDetailModal';
import { AddMemoryModal } from '../../components/scrapbook/AddMemoryModal';
import { SpeakerButton } from '../../components/SpeakerButton';

interface FamilyScrapbookScreenProps {
  patientIdOverride?: string;
  onBack?: () => void;
}

export const FamilyScrapbookScreen: React.FC<FamilyScrapbookScreenProps> = ({
  patientIdOverride,
  onBack,
}) => {
  const { t, language } = useTranslation();

  const [memories, setMemories] = useState<FamilyMemory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [selectedMemory, setSelectedMemory] = useState<FamilyMemory | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const loadMemories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await scrapbookApi.getMemories(patientIdOverride);
      setMemories(data);
    } catch (err) {
      console.warn('Error loading family scrapbook memories:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [patientIdOverride]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadMemories();
  };

  const handleOpenMemory = (memory: FamilyMemory) => {
    setSelectedMemory(memory);
    setIsDetailModalOpen(true);
  };

  // Identify Featured Memory (first memory or latest with voice)
  const featuredMemory = memories.find((m) => Boolean(m.voice?.url)) || memories[0] || null;

  // Identify "On This Day" anniversary memory
  const today = new Date();
  const currentMonthName = today.toLocaleString('default', { month: 'short' }).toLowerCase();
  const onThisDayMemory = memories.find(
    (m) => m !== featuredMemory && m.date && m.date.toLowerCase().includes(currentMonthName)
  );

  return (
    <View style={styles.screenWrapper}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header Section */}
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            {Boolean(onBack) && (
              <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            <View style={{ flex: 1 }}>
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>📖 DIGITAL FAMILY ALBUM</Text>
              </View>
              <Text style={styles.headerTitle}>Family Scrapbook</Text>
            </View>

            <TouchableOpacity
              style={styles.addHeaderBtn}
              activeOpacity={0.85}
              onPress={() => setIsAddModalOpen(true)}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.addHeaderBtnText}>+ Add Memory</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.headerSub}>
            Warm photographs, cherished family stories, and spoken memories preserved forever in your family album.
          </Text>
        </View>

        {/* Loading State */}
        {isLoading && !isRefreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Opening your Family Scrapbook...</Text>
          </View>
        ) : memories.length === 0 ? (
          /* Warm Elderly Empty State */
          <View style={styles.emptyStateCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="book-outline" size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Your Scrapbook Awaits</Text>
            <Text style={styles.emptyDescription}>
              Your family scrapbook is waiting for its first memory. Add pictures of family gatherings, Bihu festivals, tea garden visits, and heartfelt voice stories.
            </Text>

            <TouchableOpacity
              style={styles.emptyAddBtn}
              activeOpacity={0.85}
              onPress={() => setIsAddModalOpen(true)}
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.emptyAddBtnText}>+ Add First Memory</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* FEATURED MEMORY HERO BANNER */}
            {featuredMemory && (
              <View style={styles.featuredSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>🌟 Featured Memory</Text>
                  <SpeakerButton
                    text={`Featured Memory: ${featuredMemory.title}. ${featuredMemory.description || ''}`}
                    language={language}
                    size="small"
                  />
                </View>

                <TouchableOpacity
                  style={styles.featuredCard}
                  activeOpacity={0.88}
                  onPress={() => handleOpenMemory(featuredMemory)}
                >
                  <Image
                    source={{ uri: featuredMemory.coverPhotoUrl || featuredMemory.photos?.[0]?.url }}
                    style={styles.featuredImage}
                    resizeMode="cover"
                  />

                  <View style={styles.featuredOverlay}>
                    <View style={styles.featuredMetaRow}>
                      {Boolean(featuredMemory.date) && (
                        <View style={styles.featuredTag}>
                          <Text style={styles.featuredTagText}>📅 {featuredMemory.date}</Text>
                        </View>
                      )}
                      {Boolean(featuredMemory.location) && (
                        <View style={styles.featuredTag}>
                          <Text style={styles.featuredTagText}>📍 {featuredMemory.location}</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.featuredTitle} numberOfLines={2}>
                      {featuredMemory.title}
                    </Text>

                    {Boolean(featuredMemory.description) && (
                      <Text style={styles.featuredDescription} numberOfLines={2}>
                        "{featuredMemory.description}"
                      </Text>
                    )}

                    <View style={styles.featuredActionRow}>
                      <View style={styles.listenPill}>
                        <Ionicons
                          name={featuredMemory.voice?.url ? 'volume-high' : 'images'}
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.listenPillText}>
                          {featuredMemory.voice?.url ? '🔊 Listen & View' : '📷 Open Album'}
                        </Text>
                      </View>

                      <Text style={styles.photoCountText}>
                        {featuredMemory.photos?.length || 1} Photo{(featuredMemory.photos?.length || 1) !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* "ON THIS DAY" ANNIVERSARY HIGHLIGHT */}
            {onThisDayMemory && (
              <TouchableOpacity
                style={styles.onThisDayCard}
                activeOpacity={0.85}
                onPress={() => handleOpenMemory(onThisDayMemory)}
              >
                <View style={styles.onThisDayIcon}>
                  <Text style={styles.onThisDayEmoji}>❤️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.onThisDaySuper}>ON THIS DAY IN MEMORY</Text>
                  <Text style={styles.onThisDayTitle}>{onThisDayMemory.title}</Text>
                  <Text style={styles.onThisDaySub}>
                    {onThisDayMemory.date} {onThisDayMemory.location ? `• ${onThisDayMemory.location}` : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.primaryDark} />
              </TouchableOpacity>
            )}

            {/* FAMILY MEMORIES GRID */}
            <View style={styles.allMemoriesSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Family Memories ({memories.length})</Text>
                <Text style={styles.sectionSub}>Tap any card to open full album</Text>
              </View>

              <View style={styles.memoriesGrid}>
                {memories.map((memory) => {
                  const cover = memory.coverPhotoUrl || memory.photos?.[0]?.url;
                  const hasVoice = Boolean(memory.voice?.url);

                  return (
                    <TouchableOpacity
                      key={memory._id || (memory as any).id}
                      style={styles.memoryCard}
                      activeOpacity={0.85}
                      onPress={() => handleOpenMemory(memory)}
                    >
                      {/* Photo Thumbnail */}
                      <View style={styles.cardImageFrame}>
                        {cover ? (
                          <Image source={{ uri: cover }} style={styles.cardThumb} resizeMode="cover" />
                        ) : (
                          <View style={styles.cardNoPhoto}>
                            <Ionicons name="image-outline" size={32} color="#94A3B8" />
                          </View>
                        )}

                        {hasVoice && (
                          <View style={styles.voiceBadge}>
                            <Ionicons name="volume-high" size={14} color="#FFFFFF" />
                          </View>
                        )}
                      </View>

                      {/* Card Content */}
                      <View style={styles.cardBody}>
                        <Text style={styles.cardTitle} numberOfLines={2}>
                          {memory.title}
                        </Text>

                        <View style={styles.cardMetaRow}>
                          {Boolean(memory.date) && (
                            <Text style={styles.cardMetaText}>{memory.date}</Text>
                          )}
                          {Boolean(memory.location) && (
                            <Text style={styles.cardMetaText} numberOfLines={1}>
                              📍 {memory.location}
                            </Text>
                          )}
                        </View>

                        {hasVoice && (
                          <View style={styles.cardVoiceTag}>
                            <Text style={styles.cardVoiceTagText}>🔊 Voice Story</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Floating Bottom "+ ADD MEMORY" Action Button */}
      {memories.length > 0 && (
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity
            style={styles.floatingAddBtn}
            activeOpacity={0.88}
            onPress={() => setIsAddModalOpen(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.floatingAddBtnText}>+ Add New Memory</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Memory Detail Modal (Viewing & Slideshow) */}
      <MemoryDetailModal
        memory={selectedMemory}
        visible={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedMemory(null);
        }}
        onMemoryDeleted={() => {
          setIsDetailModalOpen(false);
          setSelectedMemory(null);
          loadMemories();
        }}
      />

      {/* Add Memory Modal Wizard */}
      <AddMemoryModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onMemoryCreated={loadMemories}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
  },
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  headerCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.card,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    marginRight: 10,
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  headerBadgeText: {
    color: '#E0E7FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 14,
    color: '#C7D2FE',
    lineHeight: 20,
  },
  addHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
  },
  addHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    textAlign: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...SHADOWS.card,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 16,
    gap: 8,
    ...SHADOWS.card,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  featuredSection: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  featuredCard: {
    position: 'relative',
    height: 240,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...SHADOWS.card,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    padding: 16,
  },
  featuredMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  featuredTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  featuredTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
    marginBottom: 10,
  },
  featuredActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  listenPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  photoCountText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  onThisDayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    gap: 12,
    ...SHADOWS.card,
  },
  onThisDayIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onThisDayEmoji: {
    fontSize: 22,
  },
  onThisDaySuper: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  onThisDayTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  onThisDaySub: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  allMemoriesSection: {
    marginBottom: 20,
  },
  memoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  memoryCard: {
    width: '47.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E7DFD3',
    ...SHADOWS.card,
  },
  cardImageFrame: {
    position: 'relative',
    height: 125,
    backgroundColor: '#F1F5F9',
  },
  cardThumb: {
    width: '100%',
    height: '100%',
  },
  cardNoPhoto: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: COLORS.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  cardBody: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
    lineHeight: 20,
  },
  cardMetaRow: {
    flexDirection: 'column',
    gap: 2,
    marginBottom: 6,
  },
  cardMetaText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  cardVoiceTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  cardVoiceTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  floatingAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
    gap: 8,
    ...SHADOWS.card,
  },
  floatingAddBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
