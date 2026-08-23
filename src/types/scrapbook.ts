export interface ScrapbookPhoto {
  url: string;
  order: number;
  caption?: string;
}

export interface ScrapbookPerson {
  name: string;
  relation?: string;
}

export interface ScrapbookVoice {
  url: string;
  durationMs: number;
}

export interface FamilyMemory {
  _id: string;
  id?: string;
  userId: string;
  title: string;
  description?: string;
  date?: string;
  location?: string;
  occasion?: string;
  people: ScrapbookPerson[];
  photos: ScrapbookPhoto[];
  coverPhotoUrl: string;
  voice?: ScrapbookVoice;
  createdBy?: 'patient' | 'caregiver';
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemoryPayload {
  title: string;
  description?: string;
  date?: string;
  location?: string;
  occasion?: string;
  people?: ScrapbookPerson[];
  photos?: ScrapbookPhoto[];
  coverPhotoUrl?: string;
  voice?: ScrapbookVoice;
  patientId?: string;
}

export type UpdateMemoryPayload = Partial<CreateMemoryPayload>;

export interface ScrapbookResponse {
  success: boolean;
  count?: number;
  memories?: FamilyMemory[];
  memory?: FamilyMemory;
  message?: string;
}
