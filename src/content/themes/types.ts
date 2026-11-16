import type { LocalizedText, OutfitId } from '../types';

export type ThemeStatus = 'ready' | 'coming_soon';

export type ActivityType = 'story' | 'lantern' | 'puzzle' | 'zongzi' | 'race';

export type ActivityConfig = {
  id: string;
  type: ActivityType;
  title: LocalizedText;
  /** Extra config consumed by activity components in later phases. */
  config?: Record<string, unknown>;
};

export type Theme = {
  id: string;
  status: ThemeStatus;
  title: LocalizedText;
  guide: 'puff' | 'dongdong';
  outfit: OutfitId;
  mapPin: string;
  sticker: { id: string; name: LocalizedText };
  welcomeLine: string;
  completeLine: string;
  activities: ActivityConfig[];
};
