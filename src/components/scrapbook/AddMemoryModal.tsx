import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../theme/theme';
import { ScrapbookPerson, ScrapbookPhoto, ScrapbookVoice, CreateMemoryPayload } from '../../types/scrapbook';
import { scrapbookApi } from '../../api/scrapbookApi';
import { VoiceRecorderModal } from './VoiceRecorderModal';

interface AddMemoryModalProps {
  visible: boolean;
  onClose: () => void;
  onMemoryCreated: () => void;
}

// Cultural default photo choices for convenience
const SAMPLE_CULTURAL_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    caption: 'Traditional Bihu family gathering',
  },
  {
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&auto=format&fit=crop&q=80',
    caption: 'Afternoon tea garden picnic in Assam',
  },
  {
    url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&auto=format&fit=crop&q=80',
    caption: 'Grandchildren playing at home',
  },
  {
    url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=80',
    caption: 'Family dinner celebration',
  },
];

export const AddMemoryModal: React.FC<AddMemoryModalProps> = ({
  visible,
  onClose,
  onMemoryCreated,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [occasion, setOccasion] = useState<string>('');

  // Photos
  const [photos, setPhotos] = useState<ScrapbookPhoto[]>([]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');

  // People
  const [people, setPeople] = useState<ScrapbookPerson[]>([]);
  const [newPersonName, setNewPersonName] = useState<string>('');
  const [newPersonRelation, setNewPersonRelation] = useState<string>('');

  // Voice
  const [voice, setVoice] = useState<ScrapbookVoice | undefined>(undefined);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  // Status
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setStep(1);
    setTitle('');
    setDescription('');
    setDate('');
    setLocation('');
    setOccasion('');
    setPhotos([]);
    setCustomPhotoUrl('');
    setPeople([]);
    setNewPersonName('');
    setNewPersonRelation('');
    setVoice(undefined);
    setIsSaving(false);
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Step 1: Photo selection
  const handleAddSamplePhoto = (sampleUrl: string, sampleCaption: string) => {
    if (photos.some((p) => p.url === sampleUrl)) return;
    const newPhoto: ScrapbookPhoto = {
      url: sampleUrl,
      order: photos.length + 1,
      caption: sampleCaption,
    };
    setPhotos([...photos, newPhoto]);
  };

  const handleAddCustomPhoto = () => {
    if (!customPhotoUrl.trim()) return;
    const newPhoto: ScrapbookPhoto = {
      url: customPhotoUrl.trim(),
      order: photos.length + 1,
      caption: '',
    };
    setPhotos([...photos, newPhoto]);
    setCustomPhotoUrl('');
  };

  const handleFileUpload = (event: any) => {
    const files = event.target?.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setPhotos((prev) => [
            ...prev,
            {
              url: reader.result as string,
              order: prev.length + 1,
              caption: file.name.replace(/\.[^/.]+$/, ''),
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    const updated = photos.filter((_, idx) => idx !== index);
    setPhotos(updated.map((p, idx) => ({ ...p, order: idx + 1 })));
  };

  const handleUpdateCaption = (index: number, newCaption: string) => {
    const updated = [...photos];
    updated[index].caption = newCaption;
    setPhotos(updated);
  };

  // Step 3: People tagging
  const handleAddPerson = () => {
    if (!newPersonName.trim()) return;
    setPeople([
      ...people,
      {
        name: newPersonName.trim(),
        relation: newPersonRelation.trim() || 'Family',
      },
    ]);
    setNewPersonName('');
    setNewPersonRelation('');
  };

  const handleRemovePerson = (index: number) => {
    setPeople(people.filter((_, idx) => idx !== index));
  };

  // Step 5: Save
  const handleSaveMemory = async () => {
    if (!title.trim()) {
      setErrorMessage('Please provide a title for this family memory.');
      setStep(2);
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const payload: CreateMemoryPayload = {
        title: title.trim(),
        description: description.trim(),
        date: date.trim(),
        location: location.trim(),
        occasion: occasion.trim(),
        people,
        photos: photos.length > 0 ? photos : [
          {
            url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
            order: 1,
            caption: title.trim(),
          },
        ],
        coverPhotoUrl: photos[0]?.url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
        voice,
      };

      await scrapbookApi.createMemory(payload);
      onMemoryCreated();
      handleClose();
    } catch (err: any) {
      console.warn('Error creating memory:', err);
      setErrorMessage(err.message || 'Failed to save memory. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Header with Step Indicator */}
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerSuperTitle}>FAMILY SCRAPBOOK</Text>
                <Text style={styles.headerTitle}>
                  {step === 1 && 'Step 1: Select Photos'}
                  {step === 2 && 'Step 2: Memory Details'}
                  {step === 3 && 'Step 3: Tag People'}
                  {step === 4 && 'Step 4: Voice Story'}
                  {step === 5 && 'Step 5: Review & Save'}
                </Text>
              </View>

              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Step Progress Dots */}
            <View style={styles.stepDotsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <View
                  key={s}
                  style={[
                    styles.stepDot,
                    s === step && styles.stepDotActive,
                    s < step && styles.stepDotCompleted,
                  ]}
                />
              ))}
            </View>

            {errorMessage && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* STEP 1: PHOTOS */}
              {step === 1 && (
                <View style={styles.stepSection}>
                  <Text style={styles.stepInstruction}>
                    Add one or more photos. The first photo will be your scrapbook cover!
                  </Text>

                  {/* Selected Photos Gallery */}
                  {photos.length > 0 && (
                    <View style={styles.photosGrid}>
                      {photos.map((p, idx) => (
                        <View key={idx} style={styles.photoItemCard}>
                          <Image source={{ uri: p.url }} style={styles.photoThumb} resizeMode="cover" />
                          <View style={styles.photoMetaRow}>
                            <View style={styles.coverBadge}>
                              <Text style={styles.coverBadgeText}>{idx === 0 ? 'COVER' : `#${idx + 1}`}</Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => handleRemovePhoto(idx)}
                              style={styles.photoRemoveBtn}
                            >
                              <Ionicons name="trash" size={14} color="#DC2626" />
                            </TouchableOpacity>
                          </View>
                          <TextInput
                            style={styles.captionInput}
                            placeholder="Add photo caption..."
                            value={p.caption || ''}
                            onChangeText={(text) => handleUpdateCaption(idx, text)}
                          />
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Upload / Add Photo Options */}
                  <View style={styles.addPhotoOptions}>
                    {Platform.OS === 'web' && (
                      <label style={styles.fileUploadLabel as any}>
                        <Ionicons name="images-outline" size={22} color={COLORS.primary} />
                        <Text style={styles.fileUploadLabelText}>Upload from Device</Text>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}

                    <View style={styles.urlInputRow}>
                      <TextInput
                        style={styles.urlInput}
                        placeholder="Paste photo image URL..."
                        value={customPhotoUrl}
                        onChangeText={setCustomPhotoUrl}
                      />
                      <TouchableOpacity style={styles.addUrlBtn} onPress={handleAddCustomPhoto}>
                        <Text style={styles.addUrlBtnText}>Add URL</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Suggested Cultural Photos */}
                  <Text style={styles.sampleHeader}>Or choose a sample family moment:</Text>
                  <View style={styles.samplePhotosRow}>
                    {SAMPLE_CULTURAL_PHOTOS.map((sample, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.samplePhotoBtn}
                        onPress={() => handleAddSamplePhoto(sample.url, sample.caption)}
                      >
                        <Image source={{ uri: sample.url }} style={styles.samplePhotoImg} />
                        <Text style={styles.samplePhotoCaption} numberOfLines={1}>
                          {sample.caption}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* STEP 2: DETAILS */}
              {step === 2 && (
                <View style={styles.stepSection}>
                  <Text style={styles.stepInstruction}>
                    Give this memory a special title, date, location, and written story.
                  </Text>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Memory Title *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Bihu Celebration at Home"
                      value={title}
                      onChangeText={setTitle}
                    />
                  </View>

                  <View style={styles.twoColRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>📅 Date / Year</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g. April 2018"
                        value={date}
                        onChangeText={setDate}
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>📍 Location</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g. Guwahati, Assam"
                        value={location}
                        onChangeText={setLocation}
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>🌸 Occasion / Gathering</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Rongali Bihu, Birthday, Family Picnic"
                      value={occasion}
                      onChangeText={setOccasion}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>📖 The Story</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      placeholder="Write what happened that day, how everyone felt, food prepared, and memories shared..."
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      numberOfLines={4}
                    />
                  </View>
                </View>
              )}

              {/* STEP 3: PEOPLE */}
              {step === 3 && (
                <View style={styles.stepSection}>
                  <Text style={styles.stepInstruction}>
                    Tag the loved ones and family members who were present in this memory.
                  </Text>

                  {/* Added people tags */}
                  <View style={styles.peopleTagsContainer}>
                    {people.length === 0 ? (
                      <Text style={styles.noPeopleText}>No people tagged yet. Add below!</Text>
                    ) : (
                      people.map((person, idx) => (
                        <View key={idx} style={styles.personTag}>
                          <Text style={styles.personTagEmoji}>❤️</Text>
                          <Text style={styles.personTagName}>{person.name}</Text>
                          {Boolean(person.relation) && (
                            <Text style={styles.personTagRelation}>({person.relation})</Text>
                          )}
                          <TouchableOpacity
                            onPress={() => handleRemovePerson(idx)}
                            style={styles.removePersonBtn}
                          >
                            <Ionicons name="close" size={14} color="#64748B" />
                          </TouchableOpacity>
                        </View>
                      ))
                    )}
                  </View>

                  {/* Add person form */}
                  <View style={styles.addPersonBox}>
                    <Text style={styles.addPersonHeader}>Add a Family Member</Text>
                    <View style={styles.twoColRow}>
                      <TextInput
                        style={[styles.textInput, { flex: 1 }]}
                        placeholder="Person's Name (e.g. Riya)"
                        value={newPersonName}
                        onChangeText={setNewPersonName}
                      />
                      <TextInput
                        style={[styles.textInput, { flex: 1 }]}
                        placeholder="Relationship (e.g. Daughter)"
                        value={newPersonRelation}
                        onChangeText={setNewPersonRelation}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.addPersonBtn}
                      activeOpacity={0.8}
                      onPress={handleAddPerson}
                    >
                      <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                      <Text style={styles.addPersonBtnText}>Tag Person</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* STEP 4: VOICE STORY */}
              {step === 4 && (
                <View style={styles.stepSection}>
                  <Text style={styles.stepInstruction}>
                    Optionally record a voice story speaking in your native language about this moment!
                  </Text>

                  <View style={styles.voiceCard}>
                    {voice ? (
                      <View style={styles.voiceAttachedBox}>
                        <Ionicons name="checkmark-circle" size={32} color="#16A34A" />
                        <Text style={styles.voiceAttachedTitle}>Voice Story Attached ✓</Text>
                        <Text style={styles.voiceAttachedSub}>
                          Duration: {Math.round(voice.durationMs / 1000)} seconds
                        </Text>
                        <TouchableOpacity
                          style={styles.reRecordBtn}
                          activeOpacity={0.8}
                          onPress={() => setIsVoiceModalOpen(true)}
                        >
                          <Ionicons name="mic" size={18} color={COLORS.primary} />
                          <Text style={styles.reRecordBtnText}>Change / Re-record</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.voiceEmptyBox}>
                        <View style={styles.voiceMicIcon}>
                          <Ionicons name="mic-outline" size={36} color={COLORS.primary} />
                        </View>
                        <Text style={styles.voiceEmptyTitle}>No Voice Story Added Yet</Text>
                        <Text style={styles.voiceEmptySub}>
                          Voice recording is optional. You can record now or add later.
                        </Text>
                        <TouchableOpacity
                          style={styles.openRecorderBtn}
                          activeOpacity={0.85}
                          onPress={() => setIsVoiceModalOpen(true)}
                        >
                          <Ionicons name="mic" size={20} color="#FFFFFF" />
                          <Text style={styles.openRecorderBtnText}>🎙️ Record Voice Story</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* STEP 5: REVIEW & SAVE */}
              {step === 5 && (
                <View style={styles.stepSection}>
                  <Text style={styles.stepInstruction}>
                    Review your memory before saving it permanently to your Family Scrapbook.
                  </Text>

                  <View style={styles.previewCard}>
                    {photos.length > 0 && (
                      <Image
                        source={{ uri: photos[0].url }}
                        style={styles.previewCoverPhoto}
                        resizeMode="cover"
                      />
                    )}

                    <View style={styles.previewContent}>
                      <Text style={styles.previewTitle}>{title || 'Untitled Memory'}</Text>

                      <View style={styles.previewBadgeRow}>
                        {Boolean(date) && (
                          <View style={styles.previewBadge}>
                            <Text style={styles.previewBadgeText}>📅 {date}</Text>
                          </View>
                        )}
                        {Boolean(location) && (
                          <View style={styles.previewBadge}>
                            <Text style={styles.previewBadgeText}>📍 {location}</Text>
                          </View>
                        )}
                        {Boolean(occasion) && (
                          <View style={styles.previewBadge}>
                            <Text style={styles.previewBadgeText}>🌸 {occasion}</Text>
                          </View>
                        )}
                      </View>

                      {Boolean(description) && (
                        <Text style={styles.previewStory} numberOfLines={4}>
                          "{description}"
                        </Text>
                      )}

                      {people.length > 0 && (
                        <View style={styles.previewPeopleRow}>
                          <Text style={styles.previewPeopleLabel}>People:</Text>
                          {people.map((p, idx) => (
                            <Text key={idx} style={styles.previewPersonItem}>
                              • {p.name}
                            </Text>
                          ))}
                        </View>
                      )}

                      <View style={styles.previewFooterRow}>
                        <Text style={styles.previewCount}>
                          📷 {photos.length} Photo{photos.length !== 1 ? 's' : ''}
                        </Text>
                        <Text style={styles.previewVoiceStatus}>
                          {voice ? '🔊 Voice Included' : '🔇 No Voice'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Step Navigation Controls */}
            <View style={styles.modalFooter}>
              {step > 1 ? (
                <TouchableOpacity
                  style={styles.prevStepBtn}
                  activeOpacity={0.8}
                  onPress={() => setStep((s) => s - 1)}
                >
                  <Ionicons name="arrow-back" size={18} color="#475569" />
                  <Text style={styles.prevStepBtnText}>Back</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.prevStepBtn} activeOpacity={0.8} onPress={handleClose}>
                  <Text style={styles.prevStepBtnText}>Cancel</Text>
                </TouchableOpacity>
              )}

              {step < 5 ? (
                <TouchableOpacity
                  style={styles.nextStepBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (step === 1 && photos.length === 0) {
                      // Automatically add first sample photo if none selected
                      handleAddSamplePhoto(SAMPLE_CULTURAL_PHOTOS[0].url, SAMPLE_CULTURAL_PHOTOS[0].caption);
                    }
                    if (step === 2 && !title.trim()) {
                      setErrorMessage('Please enter a memory title.');
                      return;
                    }
                    setErrorMessage(null);
                    setStep((s) => s + 1);
                  }}
                >
                  <Text style={styles.nextStepBtnText}>Next Step</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.saveMemoryBtn, isSaving && { opacity: 0.7 }]}
                  activeOpacity={0.85}
                  disabled={isSaving}
                  onPress={handleSaveMemory}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.saveMemoryBtnText}>Save Memory to Album</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Embedded Voice Recorder Submodal */}
      <VoiceRecorderModal
        visible={isVoiceModalOpen}
        initialVoice={voice}
        onClose={() => setIsVoiceModalOpen(false)}
        onSaveVoice={(v) => {
          setVoice(v);
          setIsVoiceModalOpen(false);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 580,
    maxHeight: '90%',
    padding: 20,
    ...SHADOWS.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerSuperTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  closeBtn: {
    padding: 6,
  },
  stepDotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  stepDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.primaryDark,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  stepSection: {
    width: '100%',
  },
  stepInstruction: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  photoItemCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  photoThumb: {
    width: '100%',
    height: 110,
    borderRadius: 12,
    marginBottom: 6,
  },
  photoMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  coverBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  coverBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  photoRemoveBtn: {
    padding: 4,
  },
  captionInput: {
    fontSize: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  addPhotoOptions: {
    gap: 10,
    marginBottom: 16,
  },
  fileUploadLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    cursor: 'pointer',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#A5B4FC',
  },
  fileUploadLabelText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  urlInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urlInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 13,
  },
  addUrlBtn: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addUrlBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sampleHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  samplePhotosRow: {
    flexDirection: 'row',
    gap: 8,
    overflow: 'scroll',
  },
  samplePhotoBtn: {
    width: 100,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  samplePhotoImg: {
    width: '100%',
    height: 60,
  },
  samplePhotoCaption: {
    fontSize: 10,
    color: '#475569',
    padding: 4,
    backgroundColor: '#F8FAFC',
  },
  formGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    fontSize: 15,
    color: COLORS.textDark,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  peopleTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    minHeight: 60,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noPeopleText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  personTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  personTagEmoji: {
    fontSize: 12,
  },
  personTagName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  personTagRelation: {
    fontSize: 11,
    color: '#6366F1',
  },
  removePersonBtn: {
    marginLeft: 2,
  },
  addPersonBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addPersonHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  addPersonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    marginTop: 10,
  },
  addPersonBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  voiceCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  voiceEmptyBox: {
    alignItems: 'center',
  },
  voiceMicIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  voiceEmptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  voiceEmptySub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  openRecorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
  },
  openRecorderBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  voiceAttachedBox: {
    alignItems: 'center',
  },
  voiceAttachedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#15803D',
    marginTop: 6,
  },
  voiceAttachedSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 14,
  },
  reRecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  reRecordBtnText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },
  previewCard: {
    backgroundColor: '#FAF5EE',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E7DFD3',
  },
  previewCoverPhoto: {
    width: '100%',
    height: 180,
  },
  previewContent: {
    padding: 16,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 8,
  },
  previewBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  previewBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  previewStory: {
    fontSize: 14,
    color: '#334155',
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 10,
  },
  previewPeopleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  previewPeopleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  previewPersonItem: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  previewFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  previewCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  previewVoiceStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
    marginTop: 6,
  },
  prevStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  prevStepBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  nextStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    gap: 6,
  },
  nextStepBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  saveMemoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: '#15803D',
    gap: 8,
  },
  saveMemoryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
